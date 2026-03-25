import supabase from '../config/supabase.js';
import { logAuditAction } from '../utils/auditLogger.js';

export const createUpdate = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const adminId = req.user.admin_db_id;
        const district = req.user.district; // From requireAdmin middleware

        if (!title || !content || !category) {
            return res.status(400).json({ success: false, error: "Title, content, and category are required" });
        }

        const { data, error } = await supabase
            .from('gov_updates')
            .insert([{
                title,
                content,
                category,
                district, // Tag with admin's district
                admin_id: adminId
            }])
            .select()
            .single();

        if (error) throw error;

        await logAuditAction(adminId, null, 'Gov Update Published', `Published update: ${title}`, req);

        res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('createUpdate error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getUpdates = async (req, res) => {
    try {
        let district = req.user.district;
        let isSuperAdmin = req.user.role === 'super_admin';

        // If district is not on req.user, we need to fetch it from either admins or users table
        if (!district && !isSuperAdmin) {
            // 1. Try to see if it's an admin
            const { data: admin } = await supabase
                .from('admins')
                .select('district, roles(name)')
                .eq('auth_id', req.user.id)
                .single();
            
            if (admin) {
                district = admin.district;
                isSuperAdmin = admin.roles?.name === 'super_admin';
            } else {
                // 2. If not admin, try user table
                const { data: user } = await supabase
                    .from('users')
                    .select('district')
                    .eq('auth_id', req.user.id)
                    .single();
                district = user?.district;
            }
        }

        console.log(`--- Fetching Gov Updates for District: ${district || 'Statewide'} ---`);

        let query = supabase.from('gov_updates').select('*').order('created_at', { ascending: false });

        if (!isSuperAdmin) {
            if (district) {
                // Fetch updates for this district OR statewide updates (district is null)
                query = query.or(`district.ilike.${district.trim()},district.is.null`);
            } else {
                // If no district set, only show statewide updates
                query = query.is('district', null);
            }
        }

        const { data: updates, error } = await query;
        
        if (error) throw error;

        res.status(200).json({ success: true, updates });
    } catch (error) {
        console.error('getUpdates error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.admin_db_id;
        const isSuperAdmin = req.user.role === 'super_admin';

        let query = supabase.from('gov_updates').delete().eq('id', id);

        // Security: District admins can only delete their own updates unless super admin
        if (!isSuperAdmin) {
            query = query.eq('admin_id', adminId);
        }

        const { error } = await query;

        if (error) throw error;

        await logAuditAction(adminId, null, 'Gov Update Deleted', `Deleted update ID: ${id}`, req);

        res.status(200).json({ success: true, message: "Update deleted successfully" });
    } catch (error) {
        console.error('deleteUpdate error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
