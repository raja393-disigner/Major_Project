import supabase from '../config/supabase.js';

/**
 * Extract the real client IP from the request object.
 * Checks x-forwarded-for (for proxies/load balancers), 
 * x-real-ip, and falls back to req.socket.remoteAddress.
 */
const getClientIp = (req) => {
    if (!req) return null;

    // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
    const forwarded = req.headers?.['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    // Some proxies use x-real-ip
    const realIp = req.headers?.['x-real-ip'];
    if (realIp) return realIp.trim();

    // Direct connection IP
    const remoteAddress = req.socket?.remoteAddress || req.connection?.remoteAddress || req.ip;
    
    // Convert IPv6 localhost (::1 or ::ffff:127.0.0.1) to readable format
    if (remoteAddress === '::1' || remoteAddress === '::ffff:127.0.0.1') {
        return '127.0.0.1';
    }

    // Strip ::ffff: prefix from IPv4-mapped IPv6 addresses
    if (remoteAddress?.startsWith('::ffff:')) {
        return remoteAddress.replace('::ffff:', '');
    }

    return remoteAddress || null;
};

export const logAuditAction = async (adminId, userId, action, details, req = null) => {
    try {
        const ipAddress = getClientIp(req);

        await supabase.from('audit_logs').insert([{
            admin_id: adminId || null,
            user_id: userId || null,
            action,
            details: typeof details === 'string' ? { description: details } : details,
            ip_address: ipAddress,
            created_at: new Date().toISOString()
        }]);
    } catch (err) {
        console.error('Audit log failed:', err);
    }
};
