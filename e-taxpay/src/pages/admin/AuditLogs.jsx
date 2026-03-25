import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiActivity, FiShield, FiCreditCard, FiTrash2, FiLogIn, FiPlusCircle, FiFilter, FiSearch, FiArrowDown } from 'react-icons/fi'
import api from '../../lib/api'

const actionColors = {
    'User Login': '#4285F4',
    'Admin Login': '#821D30',
    'Payment Made': '#5B9A59',
    'Notice Generated': '#E8863A',
    'Complaint Updated': '#D4712A',
    'User Registration': '#4285F4',
    'Gov Update Posted': '#5B9A59',
    'Gov Update Deleted': '#dc3545',
    'Auto Penalty': '#821D30',
    'Auto Tax Created': '#E8863A',
}

const getActionIcon = (action) => {
    if (action.includes('Login')) return <FiLogIn />;
    if (action.includes('Payment')) return <FiCreditCard />;
    if (action.includes('Delete')) return <FiTrash2 />;
    if (action.includes('Update') || action.includes('Posted')) return <FiPlusCircle />;
    return <FiActivity />;
};

export default function AuditLogs() {
    const { t } = useTranslation()
    const [logs, setLogs] = useState([])
    const [filteredLogs, setFilteredLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('All')
    const [stats, setStats] = useState({ total: 0, critical: 0, financial: 0 })

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/admin/audit-logs')
                if (res.data.success) {
                    const rawLogs = res.data.logs || []
                    setLogs(rawLogs)
                    setFilteredLogs(rawLogs)
                    
                    // Calc stats
                    setStats({
                        total: rawLogs.length,
                        critical: rawLogs.filter(l => l.action.includes('Delete') || l.action.includes('Penalty')).length,
                        financial: rawLogs.filter(l => l.action.includes('Payment')).length
                    })
                }
            } catch (err) {
                console.error("Failed to fetch audit logs", err)
            } finally {
                setLoading(false)
            }
        }
        fetchLogs()
    }, [])

    useEffect(() => {
        if (filter === 'All') {
            setFilteredLogs(logs)
        } else if (filter === 'Security') {
            setFilteredLogs(logs.filter(l => l.action.includes('Login') || l.action.includes('Delete')))
        } else if (filter === 'Finance') {
            setFilteredLogs(logs.filter(l => l.action.includes('Payment') || l.action.includes('Tax')))
        } else if (filter === 'Updates') {
            setFilteredLogs(logs.filter(l => l.action.includes('Gov Update') || l.action.includes('Notice')))
        }
    }, [filter, logs])

    return (
        <div className="anim-fade">
            <div className="page-header" style={{ marginBottom: 30 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <div style={{ background: 'var(--color-maroon)15', color: 'var(--color-maroon)', padding: 12, borderRadius: 14 }}>
                        <FiShield size={24} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>System Surveillance Hub</h2>
                        <p style={{ margin: 0, color: '#666' }}>Immutable audit records of all administrative actions</p>
                    </div>
                </div>
            </div>

            {/* Quick Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 30 }}>
                <div className="card anim-slide-up" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 15, borderBottom: '4px solid var(--color-saffron)' }}>
                    <div style={{ background: 'var(--color-saffron)15', color: 'var(--color-saffron)', padding: 10, borderRadius: 10 }}><FiActivity size={20}/></div>
                    <div><div style={{fontSize: '0.8rem', color: '#888'}}>Total Logs Today</div><div style={{fontSize: '1.2rem', fontWeight: 800}}>{stats.total}</div></div>
                </div>
                <div className="card anim-slide-up delay-1" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 15, borderBottom: '4px solid #dc3545' }}>
                    <div style={{ background: 'rgba(220, 53, 69, 0.1)', color: '#dc3545', padding: 10, borderRadius: 10 }}><FiTrash2 size={20}/></div>
                    <div><div style={{fontSize: '0.8rem', color: '#888'}}>Critical Deletions</div><div style={{fontSize: '1.2rem', fontWeight: 800}}>{stats.critical}</div></div>
                </div>
                <div className="card anim-slide-up delay-2" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 15, borderBottom: '4px solid var(--color-green)' }}>
                    <div style={{ background: 'var(--color-green)15', color: 'var(--color-green)', padding: 10, borderRadius: 10 }}><FiCreditCard size={20}/></div>
                    <div><div style={{fontSize: '0.8rem', color: '#888'}}>Finance Actions</div><div style={{fontSize: '1.2rem', fontWeight: 800}}>{stats.financial}</div></div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 10, background: '#eee', padding: 4, borderRadius: 12 }}>
                    {['All', 'Security', 'Finance', 'Updates'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{ 
                                padding: '8px 16px', 
                                border: 'none', 
                                borderRadius: '10px', 
                                background: filter === f ? 'white' : 'transparent',
                                color: filter === f ? 'var(--color-maroon)' : '#666',
                                fontWeight: filter === f ? 700 : 500,
                                cursor: 'pointer',
                                transition: '0.3s',
                                fontSize: '0.85rem'
                            }}
                        >
                            {f} Activity
                        </button>
                    ))}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#888' }}>
                    <FiFilter style={{ verticalAlign: 'middle', marginRight: 5 }} /> Showing {filteredLogs.length} recent trails
                </div>
            </div>

            <div className="data-table-wrapper" style={{ border: 'none', boxShadow: 'var(--shadow-md)', borderRadius: 20 }}>
                <table className="data-table" style={{ background: 'white' }}>
                    <thead style={{ background: 'var(--bg-secondary)', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                        <tr>
                            <th style={{ paddingLeft: 25 }}>Activity</th>
                            <th>Identity</th>
                            <th>IP Trace</th>
                            <th style={{ paddingRight: 25 }}>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: 50 }}><FiActivity className="spin" /> Checking trails...</td></tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: 50, color: '#999' }}>No trails found for this category.</td></tr>
                        ) : (
                            filteredLogs.map((log, index) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                                    <td style={{ paddingLeft: 25, py: 15 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ 
                                                width: 32, height: 32, 
                                                borderRadius: '8px', 
                                                background: `${actionColors[log.action] || '#666'}15`,
                                                color: actionColors[log.action] || '#666',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
                                            }}>
                                                {getActionIcon(log.action)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{log.action}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#888' }}>{new Date(log.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 700, color: 'var(--color-maroon)' }}>{log.performedBy}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#999' }}>Admin Session</div>
                                    </td>
                                    <td>
                                        <code style={{ background: '#f8f9fa', padding: '2px 6px', borderRadius: 4, fontSize: '0.75rem', color: '#666' }}>{log.ip_address || 'Internal System'}</code>
                                    </td>
                                    <td style={{ paddingRight: 25, maxWidth: 300 }}>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {typeof log.details === 'string' ? log.details : (log.details?.description || JSON.stringify(log.details))}
                                        </p>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
