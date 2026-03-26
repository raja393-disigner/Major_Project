import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiSearch, FiDownload, FiEye, FiUsers, FiCheckCircle, FiActivity, FiMapPin, FiFilter, FiBriefcase, FiRotateCcw, FiTag, FiUser } from 'react-icons/fi'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import api from '../../lib/api'

export default function AllUsers() {
    const { t } = useTranslation()
    const [allUsers, setAllUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [blockFilter, setBlockFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [selectedUser, setSelectedUser] = useState(null)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/admin/users');
                if (response.data.success) {
                    setAllUsers(response.data.users || []);
                }
            } catch (error) { console.error("Failed to fetch users:", error); } finally { setLoading(false); }
        };
        fetchUsers();
    }, []);

    const filtered = allUsers.filter(u => {
        if (search && !(u.username || u.name)?.toLowerCase().includes(search.toLowerCase()) && !(u.gst_id || u.gst)?.toLowerCase().includes(search.toLowerCase())) return false
        if (blockFilter && u.block !== blockFilter) return false
        if (statusFilter && (u.status || 'unpaid') !== statusFilter) return false
        if (typeFilter && (u.business_type || u.type) !== typeFilter) return false
        return true
    })

    const blocks = [...new Set(allUsers.map(u => u.block).filter(Boolean))]
    const types = [...new Set(allUsers.map(u => u.business_type || u.type).filter(Boolean))]

    const stats = {
        total: allUsers.length,
        active: allUsers.filter(u => u.status === 'paid').length,
        new: allUsers.filter(u => {
            const date = new Date(u.created_at || u.date);
            return date.getMonth() === new Date().getMonth();
        }).length
    }

    const exportPDF = () => {
        const doc = new jsPDF('landscape')
        doc.setFontSize(14)
        doc.text('E-TaxPay — Registered Taxpayers List', 14, 15)
        doc.autoTable({
            startY: 22,
            head: [['S.No', 'Name', 'GST ID', 'Block', 'Status', 'Date']],
            body: filtered.map((u, i) => [i + 1, u.username || u.name, u.gst_id || u.gst, u.block, (u.status || 'UNPAID').toUpperCase(), u.date]),
            theme: 'grid', headStyles: { fillColor: [130, 29, 48] }, styles: { fontSize: 8 }
        })
        doc.save('registered-users.pdf')
    }

    return (
        <div className="anim-fade">
            <div className="page-header-actions" style={{ marginBottom: 30 }}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ padding: 10, background: 'var(--color-maroon)15', color: 'var(--color-maroon)', borderRadius: 12 }}>
                            <FiUsers size={24} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0 }}>Registered Taxpayers</h2>
                            <p style={{ margin: 0, color: '#666' }}>Managing {allUsers.length} business profiles across districts</p>
                        </div>
                    </div>
                </div>
                <button className="btn btn-secondary btn-sm anim-zoom" onClick={exportPDF}>
                    <FiDownload style={{ marginRight: 6 }} /> Download Directory
                </button>
            </div>

            {/* Quick Stats Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 30 }}>
                {[
                    { label: 'Total Registrations', val: stats.total, icon: <FiUsers />, color: 'var(--color-maroon)' },
                    { label: 'Verified (Paid)', val: stats.active, icon: <FiCheckCircle />, color: 'var(--color-green)' },
                    { label: 'New This Month', val: stats.new, icon: <FiActivity />, color: 'var(--color-saffron)' }
                ].map((s, i) => (
                    <div key={i} className="card anim-slide-up" style={{ padding: 25, borderRadius: 24, display: 'flex', alignItems: 'center', gap: 20, animationDelay: `${i * 0.1}s` }}>
                        <div style={{ width: 50, height: 50, borderRadius: 14, background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {s.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{s.val}</div>
                            <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Elite Filter Bar */}
            <div className="card anim-fade" style={{ padding: 20, borderRadius: 24, marginBottom: 30, display: 'flex', flexDirection: 'column', gap: 15 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', color: 'var(--color-maroon)', fontWeight: 700 }}>
                    <FiFilter /> Smart Filtering Engine
                </div>
                <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1.5', minWidth: 250 }}>
                        <FiSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                        <input type="text" className="form-control" style={{ paddingLeft: 46, height: 48, borderRadius: 14, border: '1px solid #eee' }}
                            placeholder="Search by Name or GST Identification..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="form-control" style={{ flex: 1, height: 48, borderRadius: 14 }} value={blockFilter} onChange={e => setBlockFilter(e.target.value)}>
                        <option value="">Specific Block</option>
                        {blocks.map(b => <option key={b} value={b}>{String(b).toUpperCase()}</option>)}
                    </select>
                    <select className="form-control" style={{ flex: 1, height: 48, borderRadius: 14 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">Payment Status</option>
                        <option value="paid">✓ Verified (Paid)</option>
                        <option value="unpaid">✗ Pending (Unpaid)</option>
                    </select>
                    <select className="form-control" style={{ flex: 1, height: 48, borderRadius: 14 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                        <option value="">Business Type</option>
                        {types.map(tp => <option key={tp} value={tp}>{String(tp).toUpperCase()}</option>)}
                    </select>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '0 20px', borderRadius: 14 }} 
                        onClick={() => { setSearch(''); setBlockFilter(''); setStatusFilter(''); setTypeFilter('') }}>
                        <FiRotateCcw />
                    </button>
                </div>
            </div>

            {/* Professional Table */}
            <div className="data-table-wrapper" style={{ borderRadius: 28, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <table className="data-table">
                    <thead style={{ background: '#f8f9fa' }}>
                        <tr>
                            <th style={{ paddingLeft: 25 }}>Profile</th>
                            <th>GST Identification</th>
                            <th>Jurisdiction</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right', paddingRight: 25 }}>Control</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '100px 0' }}><div className="loader">Analyzing Central Database...</div></td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '100px 0', opacity: 0.5 }}>No records found matching current criteria.</td></tr>
                        ) : (
                            filtered.map((u, i) => (
                                <tr key={u.id || i} className="anim-slide-right" style={{ animationDelay: `${i * 0.05}s` }}>
                                    <td style={{ paddingLeft: 25 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div style={{ 
                                                width: 42, height: 42, background: 'var(--color-maroon)', 
                                                color: 'white', borderRadius: 12, display: 'flex', 
                                                alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem'
                                            }}>
                                                {(u.username || u.name || 'U')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, color: '#333' }}>{u.username || u.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#999', display: 'flex', alignItems: 'center', gap: 4 }}><FiActivity size={10} /> Member since {u.year || '2026'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#666' }}>{u.gst_id || u.gst || 'N/A'}</td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{u.block}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#aaa', display: 'flex', alignItems: 'center', gap: 3 }}><FiMapPin size={10} /> {u.district}</div>
                                    </td>
                                    <td><span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: 8, background: '#f0f0f0', color: '#555', textTransform: 'uppercase' }}>{u.business_type || u.type}</span></td>
                                    <td>
                                        <div style={{ 
                                            padding: '6px 14px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 800,
                                            display: 'inline-flex', alignItems: 'center', gap: 6,
                                            background: u.status === 'paid' ? '#5B9A5915' : '#821D3015',
                                            color: u.status === 'paid' ? 'var(--color-green)' : 'var(--color-maroon)'
                                        }}>
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></div>
                                            {u.status === 'paid' ? 'ACTIVE' : 'OVERDUE'}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right', paddingRight: 25 }}>
                                        <button className="btn btn-secondary btn-sm anim-zoom" style={{ borderRadius: 10, padding: '8px 12px' }} onClick={() => setSelectedUser(u)}>
                                            <FiEye style={{ marginRight: 6 }} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Profile Experience Modal */}
            {selectedUser && (
                <div className="modal-overlay" onClick={() => setSelectedUser(null)} style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <div className="modal-content anim-zoom" onClick={e => e.stopPropagation()} style={{ 
                        maxWidth: 720, borderRadius: 24, overflow: 'hidden', border: 'none', 
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', background: '#fff', 
                        maxHeight: '90vh', display: 'flex', flexDirection: 'column'
                    }}>
                        {/* Compact Header */}
                        <div style={{ 
                            height: 120, background: 'linear-gradient(135deg, var(--color-maroon), #4d0b17)', 
                            position: 'relative', padding: '20px 30px', display: 'flex', alignItems: 'center', gap: 20
                        }}>
                            <button onClick={() => setSelectedUser(null)} style={{ 
                                position: 'absolute', top: 15, right: 15, background: 'rgba(255,255,255,0.1)', 
                                border: 'none', color: 'white', borderRadius: '50%', width: 30, height: 30, 
                                cursor: 'pointer', zIndex: 10
                            }}>&times;</button>
                            
                            <div style={{ 
                                width: 90, height: 90, borderRadius: 20, background: 'white', border: '4px solid white', 
                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', 
                                justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-maroon)'
                            }}>
                                {(selectedUser.username || selectedUser.name || 'U')[0].toUpperCase()}
                            </div>
                            
                            <div style={{ flex: 1 }}>
                                <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'white' }}>{selectedUser.username || selectedUser.name}</h2>
                                <div style={{ display: 'flex', gap: 8, marginTop: 5 }}>
                                    <span style={{ 
                                        padding: '2px 10px', background: 'rgba(255,255,255,0.15)', color: 'white', 
                                        borderRadius: 6, fontSize: '0.65rem', fontWeight: 600
                                    }}>ID: {selectedUser.id?.substring(0, 8)}...</span>
                                    <span style={{ 
                                        padding: '2px 10px', background: 'var(--color-saffron)', color: 'white', 
                                        borderRadius: 6, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase'
                                    }}>{selectedUser.business_type || selectedUser.type}</span>
                                </div>
                            </div>
                        </div>

                        {/* Content Area - Scrollable if needed but optimized for one-page */}
                        <div style={{ padding: '25px 30px', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 25 }}>
                                {/* Info Cards */}
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <FiTag /> Professional Data
                                    </div>
                                    <div style={{ display: 'grid', gap: 10 }}>
                                        {[
                                            { label: 'GST Identification', val: selectedUser.gst_id || selectedUser.gst },
                                            { label: 'Contact Number', val: `+91 ${selectedUser.mobile || 'N/A'}` },
                                            { label: "Father's Name", val: selectedUser.father_name || 'N/A' },
                                            { label: "Email Address", val: selectedUser.email || 'N/A' }
                                        ].map((item, idx) => (
                                            <div key={idx} style={{ 
                                                background: '#f8f9fa', padding: '10px 15px', borderRadius: 12, 
                                                border: '1px solid #eee'
                                            }}>
                                                <div style={{ fontSize: '0.6rem', color: '#999', fontWeight: 700 }}>{item.label}</div>
                                                <div style={{ fontWeight: 700, color: '#333', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.val}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Status & Assignment */}
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <FiMapPin /> Administrative Assignment
                                    </div>
                                    <div style={{ 
                                        padding: 20, borderRadius: 20, background: 'var(--color-maroon)05', 
                                        border: '1px solid var(--color-maroon)15', marginBottom: 20
                                    }}>
                                        <div style={{ marginBottom: 12 }}>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--color-maroon)', fontWeight: 700, opacity: 0.5 }}>DISTRICT JURISDICTION</div>
                                            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{selectedUser.district}</div>
                                        </div>
                                        <div style={{ marginBottom: 15 }}>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--color-maroon)', fontWeight: 700, opacity: 0.5 }}>ASSIGNED BLOCK</div>
                                            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{selectedUser.block}</div>
                                        </div>
                                        <div style={{ 
                                            background: '#5B9A5915', color: 'var(--color-green)', 
                                            padding: '8px 12px', borderRadius: 10, fontSize: '0.7rem', 
                                            fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8
                                        }}>
                                            <FiCheckCircle /> Compliance Verified
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gap: 10 }}>
                                        <button className="btn btn-primary" style={{ height: 44, borderRadius: 12, fontWeight: 700, fontSize: '0.85rem' }} onClick={() => setSelectedUser(null)}>
                                            Return to Directory
                                        </button>
                                        <button className="btn btn-secondary" style={{ height: 44, borderRadius: 12, fontWeight: 700, fontSize: '0.85rem', background: 'transparent', border: '1px solid #eee', color: '#888' }} onClick={() => setSelectedUser(null)}>
                                            Update Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.85rem', color: '#aaa', fontWeight: 600 }}>
                Displaying {filtered.length} matching entities • Managed by Zila Panchayat Uttarakhand
            </div>
        </div>
    )
}
