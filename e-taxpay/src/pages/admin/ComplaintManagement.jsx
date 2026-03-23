import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiEye, FiCheck, FiRefreshCw } from 'react-icons/fi'
import api from '../../lib/api'

const statusColors = {
    pending: { bg: 'rgba(232,134,58,0.15)', color: 'var(--color-saffron)' },
    verified: { bg: 'rgba(66,133,244,0.1)', color: '#4285F4' },
    action_taken: { bg: 'var(--color-green-light)', color: 'var(--color-green)' },
}

export default function ComplaintManagement() {
    const { t } = useTranslation()
    const [complaints, setComplaints] = useState([])
    const [selectedComplaint, setSelectedComplaint] = useState(null)
    const [statusFilter, setStatusFilter] = useState('')
    const [loading, setLoading] = useState(true)

    const fetchComplaints = async () => {
        try {
            setLoading(true)
            const response = await api.get('/complaints/admin/all')
            if (response.data.success) {
                setComplaints(response.data.complaints || [])
            }
        } catch (error) {
            console.error("Fetch complaints error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchComplaints()
    }, [])

    const filtered = statusFilter ? complaints.filter(c => c.status === statusFilter) : complaints

    const updateStatus = async (id, newStatus) => {
        try {
            const response = await api.patch(`/complaints/admin/${id}/status`, { status: newStatus })
            if (response.data.success) {
                setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
                if (selectedComplaint?.id === id) {
                    setSelectedComplaint(prev => ({ ...prev, status: newStatus }))
                }
            }
        } catch (error) {
            console.error("Update status error:", error)
            alert("Failed to update status")
        }
    }

    return (
        <div>
            <div className="page-header">
                <h2>{t('admin.complaints')}</h2>
                <p>Review and manage shop tax related complaints</p>
            </div>

            <div className="filter-bar" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="pending">{t('admin.pending')}</option>
                        <option value="verified">{t('admin.verified')}</option>
                        <option value="action_taken">{t('admin.action_taken')}</option>
                    </select>
                    <button className="btn btn-secondary btn-sm" onClick={fetchComplaints}>
                        <FiRefreshCw />
                    </button>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {filtered.length} complaints
                </div>
            </div>

            <div className="grid-2">
                {/* List */}
                <div>
                    {filtered.map(c => (
                        <div key={c.id} className="card" style={{
                            marginBottom: 12, cursor: 'pointer',
                            borderLeft: selectedComplaint?.id === c.id ? '3px solid var(--color-maroon)' : undefined
                        }} onClick={() => setSelectedComplaint(c)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <strong style={{ fontSize: '0.9rem' }}>{c.shop_name || c.shop}</strong>
                                <span className="badge" style={{
                                    background: statusColors[c.status]?.bg || 'rgba(0,0,0,0.05)',
                                    color: statusColors[c.status]?.color || '#666'
                                }}>
                                    {t(`admin.${c.status}`)}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                {c.reason} — by {c.customer_name || c.user}
                            </p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                {new Date(c.created_at || c.date).toLocaleDateString('en-IN')}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Detail */}
                <div>
                    {selectedComplaint ? (
                        <div className="card">
                            <h4 style={{ marginBottom: 16 }}>Complaint #{selectedComplaint.id}</h4>

                            <div style={{ display: 'grid', gap: 12 }}>
                                {[
                                    ['Shop Name', selectedComplaint.shop_name || selectedComplaint.shop],
                                    ['Filed By', selectedComplaint.customer_name || selectedComplaint.user],
                                    ['Mobile', selectedComplaint.customer_mobile || 'N/A'],
                                    ['Location', selectedComplaint.location],
                                    ['Reason', selectedComplaint.reason],
                                    ['Date Filed', new Date(selectedComplaint.created_at || selectedComplaint.date).toLocaleDateString('en-IN')],
                                ].map(([label, value]) => (
                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</span>
                                        <strong style={{ fontSize: '0.85rem' }}>{value}</strong>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: 6 }}>Description</p>
                                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selectedComplaint.description}</p>
                            </div>

                            <div style={{ marginTop: 16 }}>
                                <p style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: 8 }}>{t('admin.markAs')}</p>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {['pending', 'verified', 'action_taken'].map(s => (
                                        <button key={s}
                                            className={`btn btn-sm ${selectedComplaint.status === s ? 'btn-maroon' : 'btn-secondary'}`}
                                            onClick={() => updateStatus(selectedComplaint.id, s)}>
                                            {selectedComplaint.status === s && <FiCheck size={14} />}
                                            {t(`admin.${s}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="empty-state">
                                <div className="icon"><FiEye size={36} /></div>
                                <p style={{ color: 'var(--text-muted)' }}>Select a complaint to view details</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
