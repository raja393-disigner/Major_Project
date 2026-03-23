import supabase from '../config/supabase.js'

export const loginUser = async (req, res) => {
    try {
        const { mobile, password } = req.body;

        if (!mobile || !password) {
            return res.status(400).json({
                success: false,
                error: "Mobile and password are required"
            });
        }

        // 🔥 1. Convert mobile → email (same as your design)
        const email = `${mobile}@shop.com`;

        console.log("LOGIN EMAIL:", email);

        // 🔥 2. Login with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        const user = data.user;

        if (!user) {
            return res.status(400).json({
                success: false,
                error: "User not found"
            });
        }

        // 🔥 3. Fetch user profile from users table
        const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("auth_id", user.id)
            .single();

        if (profileError) {
            console.log("⚠ Profile fetch error:", profileError.message);
        }

        return res.json({
            success: true,
            message: "Login successful",
            user,
            profile: profile || null
        });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

export const getNotices = async (req, res) => {
  try {
    const userId = req.user.db_id; // Internal users.id

    if (!userId) {
      console.error('getNotices internal ID error: User db_id is missing on req.user');
      return res.status(400).json({ success: false, error: "Internal user ID missing" });
    }

    const { data: notices, error } = await supabase
      .from('notices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, notices: notices || [] });
  } catch (err) {
    console.error("GET NOTICES ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};