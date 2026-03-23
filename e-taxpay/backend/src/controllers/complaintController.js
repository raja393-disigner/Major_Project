import supabase from '../config/supabase.js';

export const submitComplaint = async (req, res) => {
    try {
        const { shop_name, customer_name, customer_mobile, reason, description, location } = req.body;
        const userId = req.user?.db_id || null; // If logged in, link it

        const { data, error } = await supabase
            .from('complaints')
            .insert([{
                user_id: userId,
                shop_name,
                customer_name,
                customer_mobile,
                reason,
                description,
                location: location || 'Uttarakhand',
                status: 'pending'
            }]);

        if (error) {
            console.error('Complaint submission error:', error);
            throw error;
        }

        res.status(201).json({ success: true, message: 'Complaint submitted successfully' });
    } catch (error) {
        console.error('submitComplaint error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getAllComplaints = async (req, res) => {
    try {
        const isSuperAdmin = req.user.role === 'super_admin';
        const district = req.user.district;

        let query = supabase.from('complaints').select('*').order('created_at', { ascending: false });

        // If district admin, only show complaints from their district?
        // Wait, 'location' in complaints is free text. This might be tricky.
        // For now, let's fetch all.
        
        const { data: complaints, error } = await query;

        if (error) throw error;

        res.status(200).json({ success: true, complaints });
    } catch (error) {
        console.error('getAllComplaints error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body;
        const adminId = req.user.admin_db_id;

        const { data, error } = await supabase
            .from('complaints')
            .update({ 
                status, 
                admin_notes,
                resolved_by: adminId,
                resolved_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        res.status(200).json({ success: true, message: 'Complaint updated successfully' });
    } catch (error) {
        console.error('updateComplaintStatus error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
