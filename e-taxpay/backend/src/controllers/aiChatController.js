import supabase from '../config/supabase.js';

/**
 * AI Chatbot Controller for Taxpayers
 * Provides contextual answers based on user's tax history and profile
 */
export const getAIChatResponse = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;
        const username = req.user.username;

        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        // --- 1. Fetch User Data for Context ---
        const { data: taxes, error: taxError } = await supabase
            .from('taxes')
            .select('*')
            .eq('user_id', userId)
            .order('year', { ascending: false })
            .order('month', { ascending: false });

        if (taxError) throw taxError;

        const { data: notices } = await supabase
            .from('notices')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        // --- 2. Simple Rule-Based AI Logic (Mocking LLM behavior for speed/cost) ---
        const msg = message.toLowerCase();
        let response = "";

        // Context Preparation
        const pendingTaxes = taxes.filter(t => t.status !== 'paid');
        const latestTax = taxes[0];
        const totalPendingAmount = pendingTaxes.reduce((sum, t) => sum + (t.amount + (t.penalty || 0)), 0);
        const hasPenalty = pendingTaxes.some(t => (t.penalty || 0) > 0);

        // Intent Detection & Response Generation
        if (msg.includes("hello") || msg.includes("hi") || msg.includes("namaste")) {
            response = `Namaste ${username}! I am your E-TaxPay Assistant. How can I help you today with your tax records or payments?`;
        } 
        else if (msg.includes("penalty") || msg.includes("fine")) {
            if (hasPenalty) {
                const penaltyMonths = pendingTaxes.filter(t => (t.penalty || 0) > 0).map(t => `${t.month}/${t.year}`);
                response = `I see that you have penalties for the following billing cycles: ${penaltyMonths.join(', ')}. Penalties are usually applied when the tax is not paid before the due date (usually the 15th of each month). Clearing these dues soon will prevent further late fees.`;
            } else {
                response = "Currently, you don't have any penalties on your active records. Great job on timely payments!";
            }
        }
        else if (msg.includes("pending") || msg.includes("due") || msg.includes("how much")) {
            if (pendingTaxes.length > 0) {
                response = `You have ${pendingTaxes.length} pending billing statements totaling ₹${totalPendingAmount.toLocaleString()}. The most recent pending one is for ${latestTax.month}/${latestTax.year}. You can pay these from the 'Payments' section.`;
            } else {
                response = "All your tax records are up to date! You have ₹0 pending dues. Thank you for being a responsible taxpayer.";
            }
        }
        else if (msg.includes("receipt") || msg.includes("download")) {
            response = "You can download your payment receipts from the 'Tax Records' section. Just click on the 'Receipt' button next to any paid transaction. You can also export your full history as a PDF or CSV.";
        }
        else if (msg.includes("next") || msg.includes("when")) {
            response = "Tax bills are generated on the 1st of every month. Your next bill will be available on the 1st of the coming month. The due date is typically the 15th of the same month.";
        }
        else if (msg.includes("notice")) {
            if (notices && notices.length > 0) {
                response = `You have ${notices.length} official notices in your account. The latest one is titled "${notices[0].title}". Please check the 'Notices' section for full details.`;
            } else {
                response = "You don't have any active notices or warnings from the Zila Panchayat office.";
            }
        }
        else {
            response = "I'm not sure I understand that specific question. You can ask me about your 'pending dues', 'penalties', 'receipts', or 'due dates'. Alternatively, you can contact the Zila Panchayat support desk at support@etaxpay.uk.gov.in.";
        }

        // --- 3. Return Response ---
        res.status(200).json({
            success: true,
            reply: response,
            botName: "E-Tax Assistant"
        });

    } catch (error) {
        console.error('AIChat Error:', error);
        res.status(500).json({ success: false, message: "Failed to process chat request" });
    }
};
