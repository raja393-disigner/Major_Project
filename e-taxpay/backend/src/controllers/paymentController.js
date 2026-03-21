import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Lazy initialize Razorpay so server doesn't crash on startup if keys are missing
function getRazorpay() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay keys not configured in .env');
    }
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

export const createOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        const razorpay = getRazorpay();

        const options = {
            amount: Math.round(amount * 100), // convert to paise
            currency,
            receipt: receipt || `rcpt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to create Razorpay order' });
    }
};

import supabase from '../config/supabase.js';

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, taxId } = req.body;

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Update the tax record in Supabase
            if (taxId) {
                console.log(`Updating tax record ${taxId} to paid status...`);
                
                // First get tax details to create payment record
                const { data: taxData, error: fetchError } = await supabase
                    .from('taxes')
                    .select('*')
                    .eq('id', taxId)
                    .single();

                if (fetchError || !taxData) {
                    console.error('Fetch Tax Error:', fetchError);
                    return res.status(404).json({ success: false, message: 'Tax record not found' });
                }

                // 1. Update the tax record status
                const { error: dbError } = await supabase
                    .from('taxes')
                    .update({ 
                        status: 'paid', 
                        paid_date: new Date().toISOString() // Fixed: changed from payment_date to paid_date
                    })
                    .eq('id', taxId);

                if (dbError) {
                    console.error('Database Update Error during payment verification:', dbError);
                    
                    if (dbError.code === '42501') {
                        return res.status(403).json({ 
                            success: false, 
                            message: 'Permission denied: Backend cannot update tax record. Please check Supabase RLS policies.',
                            error: dbError
                        });
                    }

                    return res.status(500).json({ 
                        success: false, 
                        message: 'Payment verified but failed to update status in database',
                        error: dbError 
                    });
                }

                // 2. Create a record in the payments table for the receipt/history
                const receiptNumber = `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                const totalPaid = Number(taxData.amount) + (Number(taxData.penalty) || 0);

                const { error: paymentError } = await supabase
                    .from('payments')
                    .insert({
                        tax_id: taxId,
                        user_id: taxData.user_id,
                        transaction_id: razorpay_payment_id,
                        receipt_number: receiptNumber,
                        amount: totalPaid,
                        status: 'success',
                        gateway_response: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
                    });

                if (paymentError) {
                    console.error('Payment Record Error:', paymentError);
                    // We don't return 500 here because the tax WAS marked as paid, 
                    // but we should log it.
                }
                
                console.log(`Successfully updated tax ${taxId} and created payment record.`);
            }

            res.status(200).json({
                success: true,
                message: 'Payment verified and recorded successfully',
                transactionId: razorpay_payment_id
            });
        } else {
            console.error('Invalid signature verification failed');
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Razorpay Verification Exception:', error);
        res.status(500).json({ success: false, message: 'Internal server error during payment verification', error: error.message });
    }
};
