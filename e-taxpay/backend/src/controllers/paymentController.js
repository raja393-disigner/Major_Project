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

                // 1. Calculate the real penalty paid (past months = ₹50)
                const CURRENT_MONTH = 3;
                let appliedPenalty = taxData.penalty || 0;
                if (taxData.month < CURRENT_MONTH && taxData.year === 2026 && taxData.status !== 'paid') {
                    appliedPenalty = 50;
                }

                // 2. Update the tax record status AND penalty
                const { error: dbError } = await supabase
                    .from('taxes')
                    .update({ 
                        status: 'paid', 
                        penalty: appliedPenalty,
                        paid_date: new Date().toISOString() 
                    })
                    .eq('id', taxId);

                if (dbError) {
                    console.error('Database Update Error during payment verification:', dbError);
                    return res.status(500).json({ success: false, message: 'Failed to update tax status', error: dbError });
                }

                // 3. Create a record in the payments table with the correct total (550)
                const receiptNumber = `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                const totalPaid = Number(taxData.amount) + appliedPenalty;

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
export const getPaymentReceipt = async (req, res) => {
    try {
        const { taxId } = req.params;

        // Fetch payment and joined tax data
        const { data: payment, error } = await supabase
            .from('payments')
            .select(`
                *,
                tax:taxes (*)
            `)
            .eq('tax_id', taxId)
            .single();

        if (error || !payment) {
            return res.status(404).json({ success: false, message: 'Receipt not found' });
        }

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        res.status(200).json({
            success: true,
            receipt: {
                receiptNo: payment.receipt_number,
                transactionId: payment.transaction_id,
                amount: payment.amount,
                month: monthNames[payment.tax.month - 1],
                year: payment.tax.year,
                paidAt: new Date(payment.paid_at).toLocaleString('en-IN')
            }
        });

    } catch (error) {
        console.error('Get Receipt Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
