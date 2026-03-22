import supabase from '../config/supabase.js';

export const loginUser = async (req, res) => {
  try {
    const { gstId, password } = req.body;

    // Create email from GST ID
   const email = `${gstId}@shop.com`;

    // Login via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ success: false, error: "Invalid GST ID or Password" });
    }

    // User role will be taken from auth metadata
    const userRole = data.user.user_metadata?.role || "user";

    return res.status(200).json({
      success: true,
      user: {
        id: data.user.id,
        gstId,
        email,
        role: userRole,
        token: data.session.access_token
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: "Login failed" });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { username, password, passkey } = req.body;
    console.log(`--- [DEBUG] Admin Login Attempt: ${username} ---`);

    // 1. Username lookup
    const { data: adminData, error: findError } = await supabase
      .from("admins")
      .select("*")
      .eq("username", username)
      .eq("is_active", true)
      .single();

    if (findError || !adminData) {
      console.warn(`[FAIL] Username not found in SQL: ${username}`);
      return res.status(401).json({ success: false, error: "Invalid Admin Username" });
    }

    // 2. Supabase Auth Login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: adminData.email,
      password: password
    });

    if (authError) {
      console.warn(`[FAIL] Auth Password Mismatch for: ${adminData.email}`);
      return res.status(400).json({ success: false, error: "Invalid Admin Password" });
    }

    // 3. Passkey Check (Safe string comparison)
    if (String(adminData.passkey_hash) !== String(passkey)) {
      console.warn(`[FAIL] Passkey Mismatch. DBSays: ${adminData.passkey_hash}, UserSays: ${passkey}`);
      await supabase.auth.signOut();
      return res.status(401).json({ success: false, error: "Invalid Admin Passkey" });
    }

    // 4. SELF-HEALING: Link auth_id if it's NULL
    if (!adminData.auth_id) {
       console.log(`[FIX] Linking missing auth_id for: ${username}`);
       await supabase.from("admins").update({ auth_id: authData.user.id }).eq("id", adminData.id);
    }

    // 5. Fetch Role Name
    const { data: roleData } = await supabase.from("roles").select("name").eq("id", adminData.role_id).single();

    console.log(`[SUCCESS] Admin Logged In: ${username}`);

    return res.status(200).json({
      success: true,
      user: {
        id: authData.user.id,
        username: adminData.username,
        email: adminData.email,
        role: roleData?.name || "district_admin",
        district: adminData.district,
        token: authData.session.access_token
      }
    });

  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    res.status(500).json({ success: false, error: "Server Error: Login failed" });
  }
};


export const registerUser = async (req, res) => {
  try {
    const { username, fatherName, gstId, mobile, password, district, block, businessType } = req.body;

    const email = `${gstId}@shop.com`;

    // 1. Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          role: 'user'
        }
      }
    });

    if (authError) {
      console.error("AUTH ERROR:", authError.message);
      return res.status(400).json({ success: false, error: authError.message });
    }

    // 2. Insert details into users table
    const { error: dbError } = await supabase
      .from("users")
      .insert([
        {
          auth_id: authData.user.id,
          username,
          father_name: fatherName,
          gst_id: gstId,
          mobile,
          district: district.trim(),
          block,
          business_type: businessType
        }
      ]);

    if (dbError) {
      console.error("DB ERROR AT INSERT:", dbError);
      return res.status(400).json({ success: false, error: dbError.message });
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful! You can now log in."
    });

  } catch (err) {
    console.error("REGISTRATION ERROR:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const setupAdmin = async (req, res) => {
  try {
    const email = "admin@admin.com";
    const password = "adminpassword123";
    const passkey = "0000";

    // 1. Auth user sign up (Ignore if already exists)
    const { data: userData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: 'super_admin' } }
    });

    if (authError && authError.message !== "User already registered") {
      return res.status(400).json({ error: authError.message });
    }

    // 2. Fetch super_admin role ID
    const { data: roleData } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'super_admin')
      .single();

    // 3. admins table mein upsert karein (Creating a Super Admin)
    const { error: dbError } = await supabase.from('admins').upsert({
      auth_id: userData?.user?.id,
      email: email,
      username: 'admin',
      passkey_hash: passkey,
      role_id: roleData?.id || 3, // Assuming 3 is super_admin for fresh setup
      is_active: true,
      district: 'All Districts'
    }, { onConflict: 'email' });

    if (dbError) {
      console.error("DB ERROR AT ADMIN SETUP:", dbError.message);
      return res.status(400).json({ error: dbError.message });
    }

    res.status(200).json({ 
      success: true, 
      message: "Root Admin Setup Successful! You can now log in.", 
      loginDetails: { email, password, passkey, username: "admin" } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};