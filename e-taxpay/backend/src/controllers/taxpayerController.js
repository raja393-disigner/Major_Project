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

    // API Key business rates
    const businessTypeToAmount = {
        'general store': 500,
        'medical store': 800,
        'clothing store': 700,
        'electronics shop': 1000,
        'restaurant': 1200,
        'restaurant / eatery': 1200,
        'hardware store': 900,
        'stationery shop': 400,
        'other': 600
    };

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized user" });
    }

    // 0. Fetch user's business type
    const { data: userRecord } = await supabase.from('users').select('business_type').eq('id', userId).single();
    const shopType = (userRecord?.business_type || 'general store').toLowerCase();
    const monthlyRate = businessTypeToAmount[shopType] || 500;

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
        console.log(`Seeding missing tax records for year 2026, User: ${userId}, Type: ${shopType}, Rate: ${monthlyRate}`);
        const currentMonths = taxes?.map(t => t.month) || [];
        const missingMonths = Array.from({ length: 12 }, (_, i) => i + 1)
            .filter(m => !currentMonths.includes(m));

        if (missingMonths.length > 0) {
            const newTaxes = missingMonths.map(m => ({
                user_id: userId,
                year: currentYear,
                month: m,
                amount: monthlyRate, 
                penalty: m < CURRENT_MONTH ? 50 : 0, 
                status: 'unpaid',
                due_date: new Date(currentYear, m, 10).toISOString()
            }));

            const { error: insertError } = await supabase.from('taxes').insert(newTaxes);
            if (insertError) console.error("Failed to seed taxes for user:", insertError);
            
            // Re-fetch
            const { data: updatedTaxes } = await supabase.from('taxes').select('*').eq('user_id', userId).eq('year', currentYear);
            
            // Fix existing unpaid amounts if they don't match monthlyRate
            const recordsToFix = (updatedTaxes || []).filter(t => t.status === 'unpaid' && Number(t.amount) !== monthlyRate);
            if (recordsToFix.length > 0) {
                await supabase.from('taxes').update({ amount: monthlyRate }).in('id', recordsToFix.map(r => r.id));
                // Re-fetch again to send back correct data
                const { data: finalTaxes } = await supabase.from('taxes').select('*').eq('user_id', userId).eq('year', currentYear);
                return res.status(200).json({ 
                    success: true, 
                    taxes: (finalTaxes || []).map(t => ({
                        ...t,
                        penalty: (t.status === 'unpaid' && t.month < CURRENT_MONTH) ? 50 : t.penalty
                    })).sort((a,b) => a.month - b.month)
                });
            }

            return res.status(200).json({ 
                success: true, 
                taxes: (updatedTaxes || []).map(t => ({
                    ...t,
                    penalty: (t.status === 'unpaid' && t.month < CURRENT_MONTH) ? 50 : t.penalty
                })).sort((a,b) => a.month - b.month)
            });
        }
    }

    // Process existing records and fix incorrect amounts for unpaid months
    const recordsToFixOutside = (taxes || []).filter(t => t.status === 'unpaid' && Number(t.amount) !== monthlyRate);
    if (recordsToFixOutside.length > 0) {
        await supabase.from('taxes').update({ amount: monthlyRate }).in('id', recordsToFixOutside.map(r => r.id));
        // Re-fetch to get fixed amounts
        const { data: fixedTaxes } = await supabase.from('taxes').select('*').eq('user_id', userId).eq('year', currentYear);
        return res.status(200).json({
            success: true,
            taxes: (fixedTaxes || []).map(t => ({
                ...t,
                penalty: (t.status === 'unpaid' && t.month < CURRENT_MONTH) ? 50 : t.penalty
            })).sort((a,b) => a.month - b.month)
        });
    }

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