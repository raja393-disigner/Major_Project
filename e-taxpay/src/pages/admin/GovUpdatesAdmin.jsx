import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiPlusCircle, FiTrash2, FiCheckCircle, FiLoader, FiGlobe, FiFileText, FiDownload, FiEye, FiX } from 'react-icons/fi'
import jsPDF from 'jspdf'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const categoryColors = {
    'Tax Update': '#e8863a',
    'Scheme': '#5b9a59',
    'Notice': '#821d30',
    'Announcement': '#4285F4',
}

const getAdminName = (dist) => {
    const admins = {
        'ALMORA': 'Raja',
        'DEHRADUN': 'Rahul',
        'HARIDWAR': 'Amit',
        'NAINITAL': 'Priya'
    };
    return admins[dist] || 'Raja';
};

export default function GovUpdatesAdmin() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [updates, setUpdates] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ title: '', content: '', category: 'Notice' })
    const [published, setPublished] = useState(false)
    const [selectedNotice, setSelectedNotice] = useState(null)

    const fetchUpdates = async () => {
        try {
            setLoading(true)
            const response = await api.get('/gov-updates')
            if (response.data.success) {
                setUpdates(response.data.updates)
            }
        } catch (error) {
            console.error('Error fetching updates:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUpdates()
    }, [])

    const handlePublish = async (e) => {
        e.preventDefault()
        try {
            const response = await api.post('/gov-updates', form)
            if (response.data.success) {
                setUpdates([response.data.data, ...updates])
                setForm({ title: '', content: '', category: 'Notice' })
                setShowForm(false)
                setPublished(true)
                setTimeout(() => setPublished(false), 3000)
            }
        } catch (error) {
            console.error('Error publishing update:', error)
            alert('Failed to publish update. Please try again.')
        }
    }

    const deleteUpdate = async (id, e) => {
        e.stopPropagation()
        if (!window.confirm('Are you sure you want to delete this broadcast?')) return
        try {
            const response = await api.delete(`/gov-updates/${id}`)
            if (response.data.success) {
                setUpdates(updates.filter(u => u.id !== id))
            }
        } catch (error) {
            console.error('Error deleting update:', error)
        }
    }

    const downloadPDF = (notice) => {
        const doc = new jsPDF()
        const district = (notice.district || user?.district || 'System').toUpperCase()
        const adminName = getAdminName(district)

        const title = notice.title || 'Government Update'
        const content = notice.content || ''
        const dateStr = new Date(notice.created_at || notice.date).toLocaleDateString('en-GB')
        const refNo = `UK-GOV/${new Date(notice.created_at || notice.date).getFullYear()}/CIRCULAR-${notice.id ? notice.id.toString().substring(0, 4) : 'GEN'}`

        // Watermark
        doc.setTextColor(245, 245, 245)
        doc.setFontSize(80)
        doc.setFont('helvetica', 'bold')
        doc.text('GOVT U.K.', 105, 150, { align: 'center', angle: -45 })

        // Header
        doc.setTextColor(130, 29, 48)
        doc.setFontSize(22)
        doc.text(`Zila Panchayat Office, ${district}`, 105, 30, { align: 'center' })
        
        doc.setTextColor(80, 80, 80)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        doc.text('Government of Uttarakhand | Directorate of Panchayati Raj', 105, 38, { align: 'center' })

        doc.setDrawColor(130, 29, 48)
        doc.setLineWidth(1)
        doc.line(20, 45, 190, 45)
        doc.setLineWidth(0.3)
        doc.line(20, 47, 190, 47)

        doc.setTextColor(30, 30, 30)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(`Ref No: ${refNo}`, 20, 58)
        doc.text(`Date: ${dateStr}`, 190, 58, { align: 'right' })

        // Subject / Title
        doc.setFontSize(14)
        doc.text(`Subject: ${title}`, 20, 75, { maxWidth: 170 })

        // Body
        doc.setFont('times', 'normal')
        doc.setFontSize(12)
        const splitText = doc.splitTextToSize(content, 170)
        doc.text(splitText, 20, 95)

        const yAfterMsg = 95 + (splitText.length * 7)
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(11)
        doc.text('This is an official public circular issued for citizen awareness.', 20, yAfterMsg + 15)

        // Seal outer ring
        const ySeal = Math.max(yAfterMsg + 40, 200)
        doc.setDrawColor(130, 29, 48)
        doc.setFillColor(255, 255, 255)
        doc.setLineWidth(1.5)
        doc.circle(50, ySeal, 20, 'SD')
        doc.setLineWidth(0.5)
        doc.circle(50, ySeal, 19, 'S')
        doc.circle(50, ySeal, 14, 'S')
        
        // Seal text
        doc.setTextColor(130, 29, 48)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.text('ZILA PANCHAYAT', 50, ySeal - 9, { align: 'center' })
        doc.setFontSize(6)
        doc.text('UTTARAKHAND', 50, ySeal + 12, { align: 'center' })
        doc.setFontSize(5)
        doc.text('OFFICIAL SEAL', 50, ySeal - 2, { align: 'center' })
        doc.setFontSize(8)
        doc.text(district, 50, ySeal + 4, { align: 'center' })

        // Admin Signature in PDF
        doc.setTextColor(0, 0, 128)
        doc.setFont('times', 'italic')
        doc.setFontSize(18)
        doc.text(adminName, 165, ySeal + 2, { align: 'center' })

        doc.setTextColor(30, 30, 30)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.line(135, ySeal + 4, 195, ySeal + 4)
        doc.text('Issuing Authority', 165, ySeal + 10, { align: 'center' })
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.text('Zila Panchayat Administration', 165, ySeal + 15, { align: 'center' })

        doc.save(`Circular_${district}_${dateStr.replace(/\//g, '-')}.pdf`)
    }

    const isNew = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24)); 
        return diffDays <= 7;
    };

    const totalUpdates = updates.length;
    const districtName = user?.district || 'Your District';

    return (
        <div className="anim-fade">
             <style>
                {`
                @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
                .blink-new { animation: blink 1.5s infinite; background: red; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 800; }
                
                .doc-table-header {
                    display: grid;
                    grid-template-columns: 120px 1fr 180px 140px;
                    padding: 15px 20px;
                    background: #f8f9fa;
                    border-bottom: 2px solid #ddd;
                    font-weight: 700;
                    color: #444;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                }
                .doc-table-row {
                    display: grid;
                    grid-template-columns: 120px 1fr 180px 140px;
                    padding: 20px;
                    border-bottom: 1px solid #eee;
                    align-items: center;
                    transition: 0.2s;
                    cursor: pointer;
                }
                .doc-table-row:hover {
                    background: #fdfdfd;
                    transform: scale(1.01);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    z-index: 10;
                    border-left: 4px solid var(--color-maroon);
                }
                `}
            </style>
            <div className="page-header-actions" style={{ marginBottom: 30 }}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ background: 'var(--color-maroon)', color: 'white', padding: 10, borderRadius: 12 }}>
                            <FiPlusCircle size={24} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0 }}>{t('admin.govUpdates')}</h2>
                            <p style={{ margin: 0, color: '#666' }}>Official Administration Broadcast Center</p>
                        </div>
                    </div>
                </div>
                <button 
                    className={`btn ${showForm ? 'btn-secondary' : 'btn-maroon'}`} 
                    onClick={() => setShowForm(!showForm)}
                    style={{ padding: '12px 24px', borderRadius: 14, fontWeight: 600 }}
                >
                    {showForm ? 'Close Form' : <><FiPlusCircle /> {t('admin.postUpdate')}</>}
                </button>
            </div>

            {published && (
                <div className="alert alert-success anim-slide-down" style={{ borderRadius: 12, marginBottom: 20 }}>
                    <FiCheckCircle /> New official circular broadcasted successfully!
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 30, alignItems: 'start' }}>
                {/* Left Side: Broadcast Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {showForm && (
                        <div className="card anim-slide-up" style={{ padding: 25, border: '2px solid var(--color-maroon)20', borderRadius: 20 }}>
                            <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <FiPlusCircle color="var(--color-maroon)" /> Create New Public Circular
                            </h3>
                            <form onSubmit={handlePublish}>
                                <div className="form-group">
                                    <label style={{ fontWeight: 600 }}>Subject Line / Circular Title</label>
                                    <input type="text" className="form-control" required value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        placeholder="e.g., New Property Tax Slab 2026" 
                                        style={{ padding: '12px 16px', fontSize: '1rem' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 600 }}>Urgency Category</label>
                                        <select className="form-control" value={form.category}
                                            onChange={e => setForm({ ...form, category: e.target.value })}
                                            style={{ padding: '12px 16px' }}>
                                            <option value="Tax Update">Tax Update (Gold)</option>
                                            <option value="Scheme">Scheme (Green)</option>
                                            <option value="Notice">Notice (Maroon)</option>
                                            <option value="Announcement">Announcement (Blue)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 600 }}>Target Audience</label>
                                        <input type="text" className="form-control" disabled value={districtName} style={{ background: '#f8f9fa' }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 600 }}>Details / Content</label>
                                    <textarea className="form-control" required value={form.content}
                                        onChange={e => setForm({ ...form, content: e.target.value })}
                                        placeholder="Type the official content to be issued..." rows={4}
                                        style={{ padding: '12px 16px', fontSize: '1rem' }}></textarea>
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                                    <button type="submit" className="btn btn-maroon" style={{ flex: 1, padding: '12px' }}>Publish Circular</button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 60 }}>
                            <FiLoader className="spin" size={40} color="var(--color-maroon)" />
                            <p style={{ marginTop: 15, color: '#888', fontWeight: 500 }}>Fetching registry records...</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {updates.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: 80, borderRadius: 20, borderStyle: 'dashed' }}>
                                    <FiFileText size={48} color="#ccc" style={{ marginBottom: 15 }} />
                                    <h4>No Circulars Found</h4>
                                    <p style={{ color: '#888', fontSize: '1rem' }}>You haven't issued any broadcasts for {districtName} yet.</p>
                                </div>
                            ) : (
                                <div className="card anim-slide-up" style={{ padding: 0, overflow: 'hidden', border: '1px solid #ddd', borderRadius: 20 }}>
                                    <div className="doc-table-header">
                                        <div>Ref Number</div>
                                        <div>Circular Detail</div>
                                        <div>Category</div>
                                        <div style={{ textAlign: 'right' }}>Manage</div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {updates.map((update, idx) => (
                                            <div key={update.id} className="doc-table-row anim-slide-right" 
                                                onClick={() => setSelectedNotice(update)}
                                                style={{ animationDelay: `${idx * 0.1}s` }}>
                                                <div style={{ fontWeight: 700, color: '#666', fontSize: '0.85rem' }}>
                                                    CIR-{update.id.toString().substring(0, 4)}
                                                    {isNew(update.created_at) && <span className="blink-new" style={{ marginLeft: 8 }}>NEW</span>}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#1a365d', marginBottom: 4 }}>{update.title}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
                                                        {update.content}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span style={{
                                                        padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800,
                                                        background: `${categoryColors[update.category] || '#888'}15`,
                                                        color: categoryColors[update.category] || '#888',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {update.category}
                                                    </span>
                                                </div>
                                                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
                                                    <div style={{ color: '#555', fontWeight: 600, fontSize: '0.85rem' }}>
                                                        {new Date(update.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </div>
                                                    <button 
                                                        onClick={(e) => deleteUpdate(update.id, e)}
                                                        className="btn-icon hover-lift" 
                                                        style={{ background: '#f8f9fa', color: '#dc3545', width: 32, height: 32, border: '1px solid #eee' }}
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Side: Quick Stats Column */}
                <div style={{ position: 'sticky', top: 100 }}>
                    <div className="card" style={{ padding: 24, borderRadius: 24, background: 'var(--color-sidebar)', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ marginBottom: 20, fontWeight: 700 }}>Communication Log</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                            <div style={{ background: 'white', padding: 15, borderRadius: 16, border: '1px solid #eee' }}>
                                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: 5 }}>Total Issued Circulars</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-maroon)' }}>{totalUpdates}</div>
                            </div>
                            <div style={{ background: 'white', padding: 15, borderRadius: 16, border: '1px solid #eee' }}>
                                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: 5 }}>Jurisdiction Area</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#333', textTransform: 'capitalize' }}>{districtName}</div>
                            </div>
                            <div style={{ marginTop: 10, padding: 15, borderRadius: 16, background: 'rgba(91, 154, 89, 0.05)', border: '1px solid rgba(91, 154, 89, 0.1)' }}>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-green)', lineHeight: 1.4 }}>
                                    <b>Admin Tip:</b> Public circulars appear on taxpayer dashboards instantly and notify active users.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card anim-fade" style={{ marginTop: 20, padding: 24, borderRadius: 24, background: 'linear-gradient(135deg, var(--color-maroon), var(--color-maroon-dark))', color: 'white' }}>
                        <h5 style={{ margin: '0 0 10px 0' }}>Preview Official File</h5>
                        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8, lineHeight: 1.5 }}>
                            Click on any row in the repository list to visualize how the generated PDF / Notice looks to the citizens.
                        </p>
                    </div>
                </div>
            </div>

            {/* View Official Document Modal for Admins */}
            {selectedNotice && (
                <div className="modal-overlay anim-fade" style={{ background: 'rgba(0,0,0,0.6)', padding: '20px', zIndex: 1000 }}>
                    <div className="modal-content anim-zoom" style={{ maxWidth: 800, width: '100%', background: '#f4f4f4', padding: 0, overflow: 'hidden', borderRadius: 12 }}>
                        {/* Modal Header */}
                        <div style={{ 
                            background: '#1a365d', color: 'white', padding: '15px 25px', 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                        }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.2rem' }}>
                                <FiEye /> Circular Output Layer <span style={{ opacity: 0.6, fontSize: '0.9rem', fontWeight: 400 }}>| Admin Preview</span>
                            </h3>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="btn btn-secondary" onClick={() => downloadPDF(selectedNotice)} 
                                        style={{ background: 'white', color: '#1a365d', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontWeight: 700 }}>
                                    <FiDownload /> Export Digital Copy
                                </button>
                                <button className="btn-icon" onClick={() => setSelectedNotice(null)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                                    <FiX size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Official Document Body */}
                        <div style={{ padding: '30px 40px', background: 'url("https://www.transparenttextures.com/patterns/rice-paper.png"), white', maxHeight: '75vh', overflowY: 'auto' }}>
                            <div className="card" style={{ 
                                padding: '40px 50px', 
                                borderRadius: 2, 
                                background: 'white', 
                                boxShadow: '0 5px 25px rgba(0,0,0,0.1)',
                                position: 'relative',
                                border: '1px solid #ddd'
                            }}>
                                {/* Header */}
                                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                        <div style={{ fontWeight: 900, fontSize: '1.6rem', color: 'var(--color-maroon)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                                            Zila Panchayat Office, {(selectedNotice.district || user?.district || 'System').toUpperCase()}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#555', marginTop: 4 }}>Government of Uttarakhand | Directorate of Panchayati Raj</div>
                                    </div>
                                </div>

                                <div style={{ borderBottom: '2px solid var(--color-maroon)', marginBottom: 2 }}></div>
                                <div style={{ borderBottom: '1px solid var(--color-maroon)', marginBottom: 20 }}></div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, marginBottom: 30, color: '#333' }}>
                                    <div><b>Ref No:</b> UK-GOV/{new Date(selectedNotice.created_at).getFullYear()}/CIRCULAR-{selectedNotice.id ? selectedNotice.id.toString().substring(0, 4) : 'GEN'}</div>
                                    <div><b>Date:</b> {new Date(selectedNotice.created_at).toLocaleDateString('en-GB')}</div>
                                </div>

                                {/* Body */}
                                <div style={{ fontSize: '1rem', color: '#222', lineHeight: 1.7, fontFamily: '"Times New Roman", Times, serif', position: 'relative', zIndex: 1, minHeight: 150 }}>
                                    <div style={{ fontWeight: 800, marginBottom: 25, textDecoration: 'underline', fontSize: '1.1rem' }}>Subject: {selectedNotice.title}</div>
                                    <p style={{ textIndent: 30, textAlign: 'justify', marginBottom: 25, whiteSpace: 'pre-line' }}>{selectedNotice.content}</p>
                                    <p style={{ textAlign: 'justify', fontWeight: 600, fontStyle: 'italic' }}>This is an official public circular issued for citizen awareness.</p>
                                </div>

                                {/* Stamp & Signature */}
                                <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
                                    <div style={{ 
                                        width: 110, height: 110, 
                                        opacity: 0.85, 
                                        transform: 'rotate(-5deg)',
                                        flexShrink: 0,
                                        mixBlendMode: 'multiply'
                                    }}>
                                        <svg viewBox="0 0 100 100" width="110" height="110">
                                            <circle cx="50" cy="50" r="48" fill="none" stroke="#a32020" strokeWidth="1.2" strokeDasharray="3 1"/>
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="#a32020" strokeWidth="2.5" />
                                            <circle cx="50" cy="50" r="28" fill="none" stroke="#a32020" strokeWidth="1.5" />
                                            <circle cx="50" cy="50" r="26" fill="none" stroke="#a32020" strokeWidth="0.8" />
                                            
                                            <path id="topCurve" d="M 16 50 A 34 34 0 0 1 84 50" fill="none" />
                                            <text fill="#a32020" fontSize="10" fontWeight="900" letterSpacing="1">
                                                <textPath href="#topCurve" startOffset="50%" textAnchor="middle">ZILA PANCHAYAT</textPath>
                                            </text>
                                            
                                            <path id="botCurve" d="M 16 50 A 34 34 0 0 0 84 50" fill="none" />
                                            <text fill="#a32020" fontSize="8" fontWeight="bold" letterSpacing="2">
                                                <textPath href="#botCurve" startOffset="50%" textAnchor="middle">UTTARAKHAND</textPath>
                                            </text>
                                            
                                            <text x="14" y="53" fill="#a32020" fontSize="10" textAnchor="middle">★</text>
                                            <text x="86" y="53" fill="#a32020" fontSize="10" textAnchor="middle">★</text>
                                            
                                            <text x="50" y="44" fill="#a32020" fontSize="6" fontWeight="bold" textAnchor="middle" letterSpacing="1">OFFICIAL</text>
                                            <text x="50" y="52" fill="#a32020" fontSize="6" fontWeight="bold" textAnchor="middle" letterSpacing="1">SEAL</text>
                                            <text x="50" y="62" fill="#a32020" fontSize="8" fontWeight="900" textAnchor="middle">{(selectedNotice.district || user?.district || 'System').toUpperCase()}</text>
                                        </svg>
                                    </div>
                                    <div style={{ textAlign: 'center', width: 220, flexShrink: 0 }}>
                                        <div style={{ 
                                            fontFamily: '"Brush Script MT", "Caveat", "Great Vibes", cursive', 
                                            fontSize: '2rem', 
                                            color: '#1a365d', 
                                            transform: 'rotate(-5deg)',
                                            marginBottom: -5,
                                            marginTop: 10
                                        }}>{getAdminName((selectedNotice.district || user?.district || 'Almora').toUpperCase())}</div>
                                        <div style={{ borderTop: '1px solid #333', paddingTop: 8, marginTop: 5 }}>
                                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#222' }}>Issuing Authority</div>
                                            <div style={{ fontSize: '0.8rem', color: '#555' }}>Zila Panchayat Administration</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
