import supabase from '../config/supabase.js';

export const getAllUsers = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'super_admin';
    const district = req.user.district;

    let query = supabase.from('users').select('*');

    if (!isSuperAdmin) {
      if (!district) return res.status(403).json({ success: false, error: "District admin has no assigned district" });
      query = query.ilike('district', district);
    }

    const { data: users, error } = await query;
    if (error) throw error;

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMetrics = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'super_admin';
    const district = req.user.district;

    // 1. Total Users
    let userQuery = supabase.from('users').select('id', { count: 'exact', head: true });
    if (!isSuperAdmin) userQuery = userQuery.ilike('district', district);
    const { count: totalUsers } = await userQuery;

    // 2. Paid vs Unpaid Taxes (for the current year usually, or total)
    let taxQuery = supabase.from('taxes').select('status, amount, penalty');
    if (!isSuperAdmin) {
      // Need to join with users to filter by district
      const { data: userData } = await supabase.from('users').select('id').ilike('district', district);
      const userIds = userData.map(u => u.id);
      taxQuery = taxQuery.in('user_id', userIds);
    }
    const { data: taxes } = await taxQuery;

    const paidTaxes = taxes?.filter(t => t.status === 'paid') || [];
    const unpaidTaxes = taxes?.filter(t => t.status !== 'paid') || [];

    // 3. Total Collection from payments table
    let paymentQuery = supabase.from('payments').select('amount');
    if (!isSuperAdmin) {
        const { data: userData } = await supabase.from('users').select('id').ilike('district', district);
        const userIds = userData.map(u => u.id);
        paymentQuery = paymentQuery.in('user_id', userIds);
    }
    const { data: payments } = await paymentQuery;
    const totalCollected = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    res.status(200).json({
      success: true,
      metrics: {
        totalUsers: totalUsers || 0,
        paidShops: paidTaxes.length,
        unpaidShops: unpaidTaxes.length,
        totalTaxesCollected: totalCollected,
        activeSessions: Math.floor(Math.random() * 20) + 5 // Dummy for now
      }
    });

  } catch (error) {
    console.error('getMetrics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
    try {
        const isSuperAdmin = req.user.role === 'super_admin';
        const district = req.user.district;

        // Fetch user data with their taxes to build charts
        let query = supabase
            .from('users')
            .select(`
                id,
                district,
                block,
                business_type,
                taxes (id, status, total, amount, penalty, created_at)
            `);

        if (!isSuperAdmin) {
            query = query.ilike('district', district);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Process Block-wise data
        const blockStats = {};
        const shopTypeStats = {};
        const monthlyStats = {};

        data.forEach(user => {
            // Block-wise
            if (!blockStats[user.block]) {
                blockStats[user.block] = { name: user.block, paid: 0, unpaid: 0 };
            }
            
            // Shop Type
            if (!shopTypeStats[user.business_type]) {
                shopTypeStats[user.business_type] = { name: user.business_type, value: 0 };
            }
            shopTypeStats[user.business_type].value++;

            user.taxes.forEach(tax => {
                const amount = Number(tax.total || (Number(tax.amount) + Number(tax.penalty || 0)));
                if (tax.status === 'paid') {
                    blockStats[user.block].paid += amount;
                } else {
                    blockStats[user.block].unpaid += amount;
                }

                // Monthly trend
                const date = new Date(tax.created_at);
                const month = date.toLocaleString('default', { month: 'short' });
                if (!monthlyStats[month]) {
                    monthlyStats[month] = { month, amount: 0 };
                }
                if (tax.status === 'paid') {
                    monthlyStats[month].amount += amount;
                }
            });
        });

        res.status(200).json({
            success: true,
            blockData: Object.values(blockStats),
            shopTypeData: Object.values(shopTypeStats).map((s, i) => ({
                ...s,
                color: ['#E8863A', '#5B9A59', '#821D30', '#4285F4', '#D4712A', '#8A8A8A'][i % 6]
            })),
            monthlyData: Object.values(monthlyStats).slice(-6), // last 6 months
            recentPayments: await getLatestPayments(isSuperAdmin, district)
        });

    } catch (error) {
        console.error('getDashboardStats error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

async function getLatestPayments(isSuperAdmin, district) {
    let query = supabase
        .from('payments')
        .select('amount, created_at, users(username, gst_id)')
        .order('created_at', { ascending: false })
        .limit(5);

    if (!isSuperAdmin) {
        const { data: users } = await supabase.from('users').select('id').ilike('district', district);
        query = query.in('user_id', users.map(u => u.id));
    }

    const { data } = await query;
    return data?.map(p => ({
        user: p.users.username,
        gst: p.users.gst_id,
        amount: p.amount,
        date: new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'paid'
    })) || [];
}