import supabase from '../config/supabase.js';

export const getAIInsights = async (req, res) => {
    try {
        const isSuperAdmin = req.user.role === 'super_admin';
        let district = req.user.district;
        
        // Get dynamic date
        const now = new Date();
        const CURRENT_YEAR = now.getFullYear();
        const CURRENT_MONTH = now.getMonth() + 1;

        // Ensure district is available for district admins
        if (!isSuperAdmin && !district) {
            const { data: admin } = await supabase
                .from('admins')
                .select('district')
                .eq('auth_id', req.user.id)
                .single();
            district = admin?.district;
        }

        // --- 1. Fetch Data ---
        let userQuery = supabase.from('users').select('id, username, gst_id, district, block');
        if (!isSuperAdmin && district) userQuery = userQuery.ilike('district', district.trim());
        const { data: users, error: userError } = await userQuery;
        if (userError) throw userError;

        const userIds = users.map(u => u.id);
        if (userIds.length === 0) {
            return res.status(200).json({ success: true, forecast: {}, suggestions: [] });
        }

        const { data: taxes, error: taxError } = await supabase
            .from('taxes')
            .select('*')
            .in('user_id', userIds)
            .lte('year', CURRENT_YEAR);
        if (taxError) throw taxError;

        // --- 2. Tax Forecasting Algorithm ---
        // Fetch collections for all months of 2026 to show in trend chart
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const trendData = monthNames.map((name, index) => {
            const mIdx = index + 1;
            const collection = taxes
                .filter(t => t.month === mIdx && t.year === CURRENT_YEAR && t.status === 'paid')
                .reduce((sum, t) => sum + (Number(t.amount) + (Number(t.penalty) || 0)), 0);
            
            return { month: name, collection, isForecast: mIdx > CURRENT_MONTH };
        });

        const currentMonthCollection = trendData[CURRENT_MONTH - 1].collection;
        const prevMonthCollection = trendData[CURRENT_MONTH - 2]?.collection || 0;

        // Basic Linear Trend Prediction
        const growthRate = prevMonthCollection > 0 ? (currentMonthCollection - prevMonthCollection) / prevMonthCollection : 0.05;
        const forecastedAmount = Math.max(currentMonthCollection * (1 + (growthRate || 0.05)), 1000);

        // Add forecast to trend data
        if (CURRENT_MONTH < 12) {
            trendData[CURRENT_MONTH].collection = Math.round(forecastedAmount);
            trendData[CURRENT_MONTH].isForecast = true;
        }

        // Probability Score
        const paidCount = taxes.filter(t => t.year === CURRENT_YEAR && t.month === CURRENT_MONTH && t.status === 'paid').length;
        const totalDueCount = taxes.filter(t => t.year === CURRENT_YEAR && t.month === CURRENT_MONTH).length;
        const unpaidCount = totalDueCount - paidCount;
        const collectionEfficiency = totalDueCount > 0 ? (paidCount / totalDueCount) * 100 : 0;

        // --- 3. Smart Suggestions ---
        const suggestions = users.map(user => {
            const unpaidMonths = taxes.filter(t => t.user_id === user.id && t.year === CURRENT_YEAR && t.status !== 'paid' && t.month < CURRENT_MONTH);
            return {
                userId: user.id,
                username: user.username,
                gst: user.gst_id,
                unpaidCount: unpaidMonths.length,
                totalPending: unpaidMonths.reduce((sum, t) => sum + Number(t.amount), 0)
            };
        }).filter(s => s.unpaidCount >= 1) 
        .sort((a, b) => b.totalPending - a.totalPending)
        .slice(0, 10);

        // --- 4. Smart Dynamic Recommendation Engine (Daily Refresh) ---
        const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
        let recommendation = "";
        
        const totalDefaulters = suggestions.length;
        const potentialRevenue = suggestions.reduce((s, u) => s + u.totalPending, 0);

        // Daily Rotation Logic to show different perspectives
        const templates = [
            // Sunday: Strategic Planning
            () => `Strategic Sunday: Overall compliance in ${district} is ${collectionEfficiency.toFixed(1)}%. We suggest planning a follow-up drive for the ${totalDefaulters} major defaulters starting tomorrow.`,
            
            // Monday: Recovery Focus
            () => `Monday Motivation: There is ₹${potentialRevenue.toLocaleString()} in pending dues. Generating notices for the top ${Math.min(5, totalDefaulters)} shops could recover a large portion of this by weekend.`,
            
            // Tuesday: Efficiency Analysis
            () => `Efficiency Tracker: Your collection rate is ${collectionEfficiency > 70 ? 'Optimal' : 'Needs Attention'}. Current data suggests ${paidCount} shops have cleared their dues for March.`,
            
            // Wednesday: Forecasting Focus
            () => `Mid-week Forecast: Based on current trends, we predict a ${growthRate > 0 ? 'growth' : 'dip'} next month. Estimated collection for April: ₹${Math.round(forecastedAmount).toLocaleString()}.`,
            
            // Thursday: Growth Tips
            () => `Growth Insight: Collection is ${Math.abs(Math.round(growthRate * 100))}% ${growthRate > 0 ? 'up' : 'down'} compared to February. Keeping this pace will help hit quarterly targets.`,
            
            // Friday: Action Alert
            () => `Action Friday: ${totalDefaulters > 0 ? `Final reminder: ${totalDefaulters} accounts are still flagged. Resolving these before Sunday will improve your monthly Audit Rating.` : 'All major accounts are cleared. Excellent coordination by the team this week!'}`,
            
            // Saturday: Weekly Review
            () => `Weekly Summary: Professional tax collection in ${district} has hit ₹${currentMonthCollection.toLocaleString()} so far. Great work maintaining ${forecast.confidence} data precision.`
        ];

        recommendation = templates[dayOfWeek]();
        
        // Fallback or overrides if critical
        if (collectionEfficiency < 30) {
            recommendation = `CRITICAL: Collection efficiency is very low (${collectionEfficiency.toFixed(1)}%). Consider an urgent administrative review to expedite tax payments.`;
        }

        // --- 5. Clean Block Leaderboard Logic ---
        // Enhanced to show even if block field is null
        const processedUsers = users.map(u => ({
            ...u,
            block: u.block || 'Other Blocks' 
        }));

        const blocks = [...new Set(processedUsers.map(u => u.block))];
        const leaderboard = blocks.map(blockName => {
            const blockUsers = processedUsers.filter(u => u.block === blockName);
            const totalShops = blockUsers.length;
            
            const paidInBlock = taxes.filter(t => {
                const isUserInBlock = blockUsers.some(bu => bu.id === t.user_id);
                return isUserInBlock && 
                       Number(t.month) === Number(CURRENT_MONTH) && 
                       Number(t.year) === Number(CURRENT_YEAR) && 
                       t.status === 'paid';
            }).length;

            const compliancePercentage = totalShops > 0 ? (paidInBlock / totalShops) * 100 : 0;

            return {
                blockName,
                totalShops,
                paidShops: paidInBlock,
                compliancePercentage: Math.round(compliancePercentage)
            };
        }).sort((a, b) => b.compliancePercentage - a.compliancePercentage);

        console.log(`Generated Leaderboard for ${leaderboard.length} blocks in ${district}`);

        res.status(200).json({
            success: true,
            forecast: {
                currentMonthCollection,
                predictedNextMonth: Math.round(forecastedAmount),
                growthTrend: growthRate.toFixed(2),
                efficiency: collectionEfficiency.toFixed(1),
                confidence: collectionEfficiency > 70 ? 'High' : (collectionEfficiency > 40 ? 'Medium' : 'Low'),
                paidCount,
                unpaidCount
            },
            trendData,
            suggestions,
            recommendation,
            leaderboard
        });

    } catch (error) {
        console.error('getAIInsights error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
