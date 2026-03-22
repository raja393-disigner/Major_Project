import supabase from '../config/supabase.js';

export const getAllUsers = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'super_admin';
    const district = req.user.district;

    console.log(`--- Fetching All Users for ${isSuperAdmin ? 'SuperAdmin' : 'District: ' + district} ---`);

    let query = supabase.from('users').select('*');

    if (!isSuperAdmin) {
      if (!district) return res.status(403).json({ success: false, error: "District admin has no assigned district" });
      query = query.ilike('district', district.trim());
    }

    const { data: users, error } = await query;
    if (error) {
      console.error('Supabase query error in getAllUsers:', error);
      throw error;
    }

    if (!users || users.length === 0) {
        console.log("No users found for this admin's district.");
        return res.status(200).json({ success: true, users: [] });
    }

    // Now fetch taxes for these users manually using their auth_ids or ids (Safety Match)
    const userIds = users.map(u => u.id);
    const authIds = users.filter(u => u.auth_id).map(u => u.auth_id);
    const allSearchIds = [...new Set([...userIds, ...authIds])];

    const { data: allTaxes, error: taxError } = await supabase
        .from('taxes')
        .select('*')
        .in('user_id', allSearchIds);

    if (taxError) {
        console.error('Error fetching taxes for users:', taxError);
    }

    // Process each user to determine a summary status
    const CURRENT_MONTH = 3;
    const CURRENT_YEAR = 2026;

    const processedUsers = users.map(user => {
      const userTaxes = allTaxes?.filter(t => t.user_id === user.id || t.user_id === user.auth_id) || [];
      
      // Determine overall status based on current and past months
      const unpaidPastOrCurrent = userTaxes.filter(t => 
        t.year <= CURRENT_YEAR && 
        t.month <= CURRENT_MONTH && 
        t.status !== 'paid'
      );

      const isPaidUpToDate = unpaidPastOrCurrent.length === 0;

      // Find tax record for the current month to show in the row
      const currentMonthTax = userTaxes.find(t => t.month === CURRENT_MONTH && t.year === CURRENT_YEAR);

      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      return {
        ...user,
        status: isPaidUpToDate ? 'paid' : 'unpaid',
        month: monthNames[CURRENT_MONTH - 1],
        year: CURRENT_YEAR,
        date: currentMonthTax?.paid_date ? new Date(currentMonthTax.paid_date).toLocaleDateString('en-IN') : '-',
        time: currentMonthTax?.paid_date ? new Date(currentMonthTax.paid_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'
      };
    });

    res.status(200).json({ success: true, users: processedUsers });
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
    if (!isSuperAdmin) userQuery = userQuery.ilike('district', district.trim());
    const { count: totalUsers } = await userQuery;

    // 2. Paid vs Unpaid Taxes
    let taxQuery = supabase.from('taxes').select('status, amount, penalty');
    if (!isSuperAdmin) {
      if (!district) throw new Error("District admin has no assigned district");
      const { data: userData, error: userError } = await supabase.from('users').select('id').ilike('district', district.trim());
      if (userError) throw userError;
      
      const userIds = userData?.map(u => u.id) || [];
      if (userIds.length > 0) {
        taxQuery = taxQuery.in('user_id', userIds);
      } else {
        // If no users in district, return early with 0 counts
        return res.status(200).json({
          success: true,
          metrics: {
            totalUsers: totalUsers || 0,
            paidShops: 0,
            unpaidShops: 0,
            totalTaxesCollected: 0,
            activeSessions: 5
          }
        });
      }
    }
    const { data: taxes, error: taxError } = await taxQuery;
    if (taxError) throw taxError;

    const paidTaxes = taxes?.filter(t => t.status === 'paid') || [];
    const unpaidTaxes = taxes?.filter(t => t.status !== 'paid') || [];

    // 3. Total Collection from payments table
    let totalCollected = 0;
    let paymentQuery = supabase.from('payments').select('amount');
    if (!isSuperAdmin) {
        const { data: userData } = await supabase.from('users').select('id').ilike('district', district.trim());
        const userIds = userData?.map(u => u.id) || [];
        if (userIds.length > 0) {
          paymentQuery = paymentQuery.in('user_id', userIds);
          const { data: payments, error: paymentError } = await paymentQuery;
          if (paymentError) throw paymentError;
          totalCollected = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
        }
    } else {
        const { data: payments, error: paymentError } = await paymentQuery;
        if (paymentError) throw paymentError;
        totalCollected = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    }

    res.status(200).json({
      success: true,
      metrics: {
        totalUsers: totalUsers || 0,
        paidShops: paidTaxes.length,
        unpaidShops: unpaidTaxes.length,
        totalTaxesCollected: totalCollected,
        activeSessions: 12
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

        // 1. Fetch Users
        let userQuery = supabase.from('users').select('id, district, block, business_type, username, gst_id');
        if (!isSuperAdmin) {
            userQuery = userQuery.ilike('district', district.trim());
        }
        const { data: users, error: userError } = await userQuery;
        if (userError) throw userError;

        if (!users || users.length === 0) {
            return res.status(200).json({ success: true, blockData: [], shopTypeData: [], monthlyData: [], recentPayments: [] });
        }

        // 2. Fetch Taxes for these users
        const userIds = users.map(u => u.id);
        const { data: taxes, error: taxError } = await supabase
            .from('taxes')
            .select('*')
            .in('user_id', userIds)
            .eq('year', 2026);
        
        if (taxError) throw taxError;

        // 3. Process Stats
        const blockStats = {};
        const shopTypeStats = {};
        const monthlyStats = {};

        // Initialize shop types from all users
        users.forEach(user => {
            if (!shopTypeStats[user.business_type]) {
                shopTypeStats[user.business_type] = { name: user.business_type || 'Other', value: 0 };
            }
            shopTypeStats[user.business_type].value++;

            if (!blockStats[user.block]) {
                blockStats[user.block] = { name: user.block || 'Unknown', paid: 0, unpaid: 0 };
            }
        });

        // Add tax data to blocks and monthly trend
        taxes?.forEach(tax => {
            const user = users.find(u => u.id === tax.user_id);
            if (!user) return;

            const total = Number(tax.amount) + (Number(tax.penalty) || 0);

            if (tax.status === 'paid') {
                blockStats[user.block].paid += total;
                
                // Monthly trend
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const mName = monthNames[tax.month - 1];
                if (!monthlyStats[mName]) monthlyStats[mName] = { month: mName, amount: 0 };
                monthlyStats[mName].amount += total;
            } else {
                blockStats[user.block].unpaid += total;
            }
        });

        // Ensure current month exists in monthly data for chart
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const finalMonthlyData = monthOrder.slice(0, 4).map(m => monthlyStats[m] || { month: m, amount: 0 });

        res.status(200).json({
            success: true,
            blockData: Object.values(blockStats),
            shopTypeData: Object.values(shopTypeStats).map((s, i) => ({
                ...s,
                color: ['#E8863A', '#5B9A59', '#821D30', '#4285F4', '#D4712A', '#8A8A8A'][i % 6]
            })),
            monthlyData: finalMonthlyData,
            recentPayments: await getLatestPayments(users, isSuperAdmin)
        });

    } catch (error) {
        console.error('getDashboardStats error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

async function getLatestPayments(users, isSuperAdmin) {
    try {
        const userIds = (users || []).map(u => u.id);
        if (userIds.length === 0) return [];

        let query = supabase
            .from('payments')
            .select('amount, created_at, user_id')
            .in('user_id', userIds)
            .order('created_at', { ascending: false })
            .limit(5);

        const { data: payments } = await query;
        
        return (payments || []).map(p => {
            const user = users.find(u => u.id === p.user_id);
            return {
                user: user?.username || 'Unknown',
                gst: user?.gst_id || 'N/A',
                amount: p.amount,
                date: new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                status: 'paid'
            };
        });
    } catch (err) {
        console.error("Latest payments error:", err);
        return [];
    }
}