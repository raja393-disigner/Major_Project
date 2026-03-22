import supabase from '../config/supabase.js';

// ----------------------------------------------------
// GET TAXPAYER PROFILE
// ----------------------------------------------------
export const getTaxpayerProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized user" });
    }

    // Fetch profile from Supabase (optional if you store profile data in DB)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.log("Profile fetch error:", error.message);
      return res.status(200).json({
        success: true,
        user: req.user, // fallback to req.user (JWT data)
        warning: "Profile not found in DB, returning basic auth details"
      });
    }

    return res.status(200).json({
      success: true,
      user: { ...req.user, profile }
    });

  } catch (error) {
    console.error('getTaxpayerProfile error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
};

// ----------------------------------------------------
// GET TAXES FOR A TAXPAYER
// ----------------------------------------------------
export const getTaxpayerTaxes = async (req, res) => {
  try {
    const userId = req.user?.db_id || req.user?.id; // Prefer internal ID
    const currentYear = 2026; // Fix for current project context

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized user" });
    }

    // 1. Fetch current taxes
    const { data: taxes, error } = await supabase
      .from('taxes')
      .select('*')
      .eq('user_id', userId)
      .eq('year', currentYear);

    if (error) throw error;

    const CURRENT_MONTH = 3;

    // 2. SELF-HEALING: If we don't have all 12 months, we should ensure they exist
    if (!taxes || taxes.length < 12) {
        console.log(`Seeding missing tax records for year 2026, User: ${userId}`);
        const currentMonths = taxes?.map(t => t.month) || [];
        const missingMonths = Array.from({ length: 12 }, (_, i) => i + 1)
            .filter(m => !currentMonths.includes(m));

        if (missingMonths.length > 0) {
            const newTaxes = missingMonths.map(m => ({
                user_id: userId,
                year: currentYear,
                month: m,
                amount: 500, // Fixed default for all
                penalty: m < CURRENT_MONTH ? 50 : 0, // Apply penalty for past months
                status: 'unpaid',
                due_date: new Date(currentYear, m, 10).toISOString()
            }));

            const { error: insertError } = await supabase.from('taxes').insert(newTaxes);
            if (insertError) console.error("Failed to seed taxes for user:", insertError);
            
            // Re-fetch to get real IDs and updated penalty data if needed
            const { data: updatedTaxes } = await supabase.from('taxes').select('*').eq('user_id', userId).eq('year', currentYear);
            return res.status(200).json({ 
                success: true, 
                taxes: (updatedTaxes || []).map(t => ({
                    ...t,
                    penalty: (t.status === 'unpaid' && t.month < CURRENT_MONTH) ? 50 : t.penalty
                })).sort((a,b) => a.month - b.month)
            });
        }
    }

    // Process existing records to apply dynamic penalty for unpaid past months
    const processedTaxes = (taxes || []).map(t => ({
        ...t,
        penalty: (t.status === 'unpaid' && t.month < CURRENT_MONTH) ? 50 : t.penalty
    })).sort((a,b) => a.month - b.month);

    return res.status(200).json({
      success: true,
      taxes: processedTaxes
    });

  } catch (error) {
    console.error('getTaxpayerTaxes error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch taxes' });
  }
};