import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiEye, FiCheck, FiRefreshCw, FiAlertCircle, FiSearch, FiMessageSquare, FiTrendingUp, FiUser, FiInfo } from 'react-icons/fi'
import api from '../../lib/api'

const statusColors = {
    pending: { bg: '#821D3015', color: 'var(--color-maroon)', icon: <FiAlertCircle /> },
    verified: { bg: '#E8863A15', color: 'var(--color-saffron)', icon: <FiInfo /> },
    action_taken: { bg: '#5B9A5915', color: 'var(--color-green)', icon: <FiCheck /> },
}

export default function ComplaintManagement() {
    const { t } = useTranslation()
    const [complaints, setComplaints] = useState([])
    const [selectedComplaint, setSelectedComplaint] = useState(null)
    const [statusFilter, setStatusFilter] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)

    const fetchComplaints = async () => {
        try {
            setLoading(true)
            const response = await api.get('/complaints/admin/all')
            if (response.data.success) {
                setComplaints(response.data.complaints || [])
            }
        } catch (error) { console.error("Fetch complaints error:", error) } finally { setLoading(false) }
    }

    useEffect(() => { fetchComplaints() }, [])

    const filtered = complaints.filter(c => {
        const matchesStatus = statusFilter ? c.status === statusFilter : true;
        const matchesSearch = (c.shop_name || c.shop || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (c.customer_name || c.user || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    })

    const stats = {
        pending: complaints.filter(c => c.status === 'pending').length,
        verified: complaints.filter(c => c.status === 'verified').length,
        resolved: complaints.filter(c => c.status === 'action_taken').length
    }

    const updateStatus = async (id, newStatus) => {
        try {
            const response = await api.patch(`/complaints/admin/${id}/status`, { status: newStatus })
            if (response.data.success) {
                setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
                if (selectedComplaint?.id === id) {
                    setSelectedComplaint(prev => ({ ...prev, status: newStatus }))
                }
            }
        } catch (error) { console.error(error); alert("Failed to update status"); }
    }

    return (
        <div className="anim-fade">
            <div className="page-header" style={{ marginBottom: 30 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <div style={{ background: 'var(--color-maroon)15', color: 'var(--color-maroon)', padding: 12, borderRadius: 14 }}>
                        <FiMessageSquare size={24} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>Grievance Action Center</h2>
                        <p style={{ margin: 0, color: '#666' }}>Track, audit and resolve shopkeeper & citizen complaints</p>
                    </div>
                </div>
            </div>

            {/* Status Pulse Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 30 }}>
                {[
                    { label: 'Unchecked', count: stats.pending, color: 'var(--color-maroon)', icon: <FiAlertCircle /> },
                    { label: 'Investigating', count: stats.verified, color: 'var(--color-saffron)', icon: <FiTrendingUp /> },
                    { label: 'Resolved', count: stats.resolved, color: 'var(--color-green)', icon: <FiCheck /> }
                ].map((s, idx) => (
                    <div key={s.label} className="card anim-slide-up" style={{ padding: 20, borderRadius: 20, display: 'flex', alignItems: 'center', gap: 20, animationDelay: `${idx * 0.1}s` }}>
                        <div style={{ width: 45, height: 45, borderRadius: 12, background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {s.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.count}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid-2" style={{ gridTemplateColumns: 'minmax(0, 420px) 1fr' }}>
                {/* List Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <div className="card" style={{ padding: 12, borderRadius: 18, background: '#f8f9fa' }}>
                        <div style={{ position: 'relative' }}>
                            <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                            <input 
                                type="text"
                                className="form-control"
                                placeholder="Search by Shop or User..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: 40, borderRadius: 12, border: 'none' }}
                            />
                        </div>
                        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                            {['', 'pending', 'verified', 'action_taken'].map(st => (
                                <button 
                                    key={st}
                                    onClick={() => setStatusFilter(st)}
                                    style={{ 
                                        flex: 1, padding: '6px 0', borderRadius: 8, fontSize: '0.7rem', fontWeight: 700,
                                        background: statusFilter === st ? 'var(--color-maroon)' : 'white',
                                        color: statusFilter === st ? 'white' : '#666',
                                        border: 'none', cursor: 'pointer', transition: '0.3s'
                                    }}
                                >
                                    {st ? st.replace('_', ' ').toUpperCase() : 'ALL'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: 5 }}>
                        {filtered.map((c, idx) => (
                            <div key={c.id} className="card anim-slide-right" style={{
                                marginBottom: 15, cursor: 'pointer', borderRadius: 20,
                                border: selectedComplaint?.id === c.id ? `2px solid ${statusColors[c.status].color}` : '2px solid transparent',
                                background: selectedComplaint?.id === c.id ? `${statusColors[c.status].color}05` : 'white',
                                animationDelay: `${idx * 0.05}s`,
                                padding: 20
                            }} onClick={() => setSelectedComplaint(c)}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#333' }}>{c.shop_name || c.shop}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#999', display: 'flex', alignItems: 'center', gap: 4 }}><FiUser size={10} /> {c.customer_name || c.user}</div>
                                    </div>
                                    <div style={{ 
                                        padding: '4px 10px', borderRadius: 8, fontSize: '0.65rem', fontWeight: 800,
                                        background: statusColors[c.status].bg, color: statusColors[c.status].color,
                                        display: 'flex', alignItems: 'center', gap: 5
                                    }}>
                                        {statusColors[c.status].icon} {c.status.replace('_', ' ').toUpperCase()}
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.82rem', color: '#666', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {c.reason}
                                </div>
                                <div style={{ marginTop: 10, fontSize: '0.7rem', color: '#bbb', textAlign: 'right' }}>
                                    {new Date(c.created_at || c.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail Panel */}
                <div style={{ position: 'sticky', top: 20 }}>
                    {selectedComplaint ? (
                        <div className="card anim-zoom" style={{ padding: 30, borderRadius: 28, boxShadow: 'var(--shadow-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 30 }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>Complaint Details</h3>
                                    <span style={{ fontSize: '0.8rem', color: '#aaa' }}>ID: #{selectedComplaint.id}</span>
                                </div>
                                <button className="btn btn-secondary btn-sm" onClick={fetchComplaints}><FiRefreshCw /></button>
                            </div>

                            {/* Timeline Flow */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40, position: 'relative' }}>
                                <div style={{ position: 'absolute', top: 15, left: '10%', right: '10%', height: 2, background: '#eee', zIndex: 0 }}>
                                    <div style={{ 
                                        width: selectedComplaint.status === 'pending' ? '0%' : (selectedComplaint.status === 'verified' ? '50%' : '100%'),
                                        height: '100%', background: 'var(--color-green)', transition: '1s'
                                    }}></div>
                                </div>
                                {[
                                    { s: 'pending', l: 'Reported', i: <FiAlertCircle /> },
                                    { s: 'verified', l: 'Reviewed', i: <FiTrendingUp /> },
                                    { s: 'action_taken', l: 'Resolved', i: <FiCheck /> }
                                ].map((step, i) => {
                                    const isDone = selectedComplaint.status === step.s || 
                                                   (i === 0 && selectedComplaint.status !== 'pending') ||
                                                   (i === 1 && selectedComplaint.status === 'action_taken');
                                    return (
                                        <div key={step.s} style={{ zIndex: 1, textAlign: 'center', width: 80 }}>
                                            <div style={{ 
                                                width: 32, height: 32, borderRadius: '50%', margin: '0 auto 8px',
                                                background: isDone ? 'var(--color-green)' : 'white',
                                                color: isDone ? 'white' : '#ccc',
                                                border: isDone ? 'none' : '2px solid #eee',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.5s'
                                            }}>
                                                {step.i}
                                            </div>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: isDone ? '#333' : '#ccc' }}>{step.l}</div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
                                <div style={{ background: '#f8f9fa', padding: 15, borderRadius: 16 }}>
                                    <div style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 700, marginBottom: 5 }}>SUBJECT SHOP</div>
                                    <div style={{ fontWeight: 800 }}>{selectedComplaint.shop_name || selectedComplaint.shop}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{selectedComplaint.location}</div>
                                </div>
                                <div style={{ background: '#f8f9fa', padding: 15, borderRadius: 16 }}>
                                    <div style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 700, marginBottom: 5 }}>FILED BY</div>
                                    <div style={{ fontWeight: 800 }}>{selectedComplaint.customer_name || selectedComplaint.user}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{selectedComplaint.customer_mobile || 'N/A'}</div>
                                </div>
                            </div>

                            <div style={{ border: '1px solid #eee', padding: 20, borderRadius: 16, marginBottom: 30 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-maroon)', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <FiAlertCircle /> COMPLAINT REASON: {selectedComplaint.reason}
                                </div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#555', lineHeight: 1.6 }}>{selectedComplaint.description}</p>
                            </div>

                            <div style={{ background: 'var(--bg-secondary)', padding: 25, borderRadius: 20 }}>
                                <h4 style={{ margin: '0 0 15px 0', fontSize: '0.95rem' }}>Update Case Status</h4>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {['pending', 'verified', 'action_taken'].map(st => (
                                        <button 
                                            key={st}
                                            onClick={() => updateStatus(selectedComplaint.id, st)}
                                            style={{ 
                                                flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer',
                                                background: selectedComplaint.status === st ? 'var(--color-maroon)' : 'white',
                                                color: selectedComplaint.status === st ? 'white' : '#666',
                                                boxShadow: selectedComplaint.status === st ? '0 4px 12px rgba(130, 29, 48, 0.2)' : 'none'
                                            }}
                                        >
                                            {st.replace('_', ' ').toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card anim-fade" style={{ 
                            height: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', 
                            justifyContent: 'center', background: '#f8f9fa', border: '2px dashed #ccc', borderRadius: 24 
                        }}>
                            <div style={{ fontSize: '4rem', opacity: 0.3, marginBottom: 20 }}>🛡️</div>
                            <h3 style={{ margin: 0, color: '#999' }}>Resolution Blueprint</h3>
                            <p style={{ color: '#aaa', textAlign: 'center' }}>Select a grievance from the list to<br/>begin investigation and resolution.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
