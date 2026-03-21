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