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
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized user" });
    }

    const { data: taxes, error } = await supabase
      .from('taxes')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error("Supabase error:", error.message);
      return res.status(400).json({ success: false, error: "Database query failed" });
    }

    return res.status(200).json({
      success: true,
      taxes: taxes || []
    });

  } catch (error) {
    console.error('getTaxpayerTaxes error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch taxes' });
  }
};