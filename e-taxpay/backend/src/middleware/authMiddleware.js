import supabase from '../config/supabase.js';

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = header.split(" ")[1];

    // 🔥 BACKEND SHOULD VERIFY TOKEN USING SERVICE ROLE KEY
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = data.user;

    // SELF-HEALING: Fetch and attach internal database ID (users.id)
    const { data: dbUser } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', data.user.id)
      .single();

    if (dbUser) {
        req.user.db_id = dbUser.id;
    }

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err);
    res.status(500).json({ error: "Authentication middleware error" });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    // Fetch admin profile and role name from the database
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*, roles(name)')
      .eq('auth_id', req.user.id)
      .eq('is_active', true)
      .single();

    if (error || !admin) {
      return res.status(403).json({ error: "Access denied: Not an active administrator" });
    }

    const roleName = admin.roles?.name;

    if (roleName !== "super_admin" && roleName !== "district_admin") {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    // Attach admin details to the request for use in controllers
    req.user.role = roleName;
    req.user.district = admin.district;
    
    next();
  } catch (err) {
    console.error("ADMIN AUTH ERROR:", err);
    res.status(500).json({ error: "Admin middleware error" });
  }
};