import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiSend, FiCheckCircle, FiUsers, FiFilter, FiMapPin, FiFileText, FiAlertCircle, FiSettings } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'

const districts = ['almora', 'bageshwar', 'chamoli', 'champawat', 'dehradun', 'haridwar', 'nainital', 'pauri', 'pithoragarh', 'rudraprayag', 'tehri', 'udhamsingh', 'uttarkashi']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const templates = {
    reminder: {
        title: 'Gentle Reminder',
        color: '#5B9A59',
        tone: 'Friendly',
        desc: 'Standard tax payment reminder for recent pendency.'
    },
    warning: {
        title: 'Strong Warning',
        color: '#E8863A',
        tone: 'Firm',
        desc: 'Escalated reminder for overdue taxes (more than 30 days).'
    },
    penalty: {
        title: 'Final Penalty Notice',
        color: '#821D30',
        tone: 'Strict',
        desc: 'Final notice before implementing penalty charges.'
    }
}

export default function NoticeGeneration() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [allUsers, setAllUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [district, setDistrict] = useState('')
    const [month, setMonth] = useState('')
    const [year, setYear] = useState('2026')
    const [status, setStatus] = useState('unpaid')
    const [templateId, setTemplateId] = useState('reminder')
    
    const [filteredUsers, setFilteredUsers] = useState([])
    const [preview, setPreview] = useState(null)
    const [sent, setSent] = useState(false)

    const isSuperAdmin = user?.role === 'super_admin'

    useEffect(() => {
        if (user?.district && !isSuperAdmin) {
            setDistrict(user.district.toLowerCase())
        }
    }, [user, isSuperAdmin])

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/admin/users');
                if (response.data.success) {
                    setAllUsers(response.data.users || []);
                }
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const findUsers = () => {
        if (!district || !month) return
        const filtered = allUsers.filter(u => {
            const matchesDistrict = u.district?.toLowerCase() === district.toLowerCase()
            const matchesStatus = (u.status || 'unpaid').toLowerCase() === status.toLowerCase()
            return matchesDistrict && matchesStatus
        })
        setFilteredUsers(filtered)
        
        const capDistrict = district.charAt(0).toUpperCase() + district.slice(1)
        const selectedTemplate = templates[templateId]
        
        setPreview({
            count: filtered.length,
            district: capDistrict,
            month,
            year,
            text: generateNoticeText(capDistrict, month, year, templateId)
        })
    }

    const generateNoticeText = (dist, mon, yr, tid) => {
        if (tid === 'penalty') {
            return `Subject: FINAL PENALTY NOTICE - MANDATORY TAX COMPLIANCE\n\nOur repeated reminders regarding your Trade Tax for ${mon} ${yr} have gone unanswered. Under the Uttarakhand Panchayati Raj Act, a penalty of 10% is now applicable. You are directed to clear all dues within 48 hours to avoid shop seizure.`
        } else if (tid === 'warning') {
            return `Subject: ESCALATION NOTICE - Outstanding Dues for ${mon} ${yr}\n\nThis is a formal warning indicating that your tax for ${dist} remains pending beyond the due date. Please fulfill your administrative responsibility immediately to maintain your active business status.`
        }
        return `Subject: Outstanding Tax Reminder - Month of ${mon} ${yr}\n\nOur records show that your tax for ${mon} ${yr} is currently unpaid. We request you to complete the payment via the E-TaxPay portal at your earliest convenience. Thank you for your cooperation.`
    }

    const sendBulkNotice = async () => {
        if (!preview || filteredUsers.length === 0) return;
        try {
            setLoading(true);
            const userIds = filteredUsers.map(u => u.id);
            const response = await api.post('/admin/notices/send-bulk', {
                userIds,
                title: `Official Notice: ${preview.month} ${preview.year}`,
                message: preview.text,
                month: months.indexOf(preview.month) + 1,
                year: parseInt(preview.year)
            });
            if (response.data.success) {
                setSent(true);
                setTimeout(() => setSent(false), 8000);
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    }

    return (
        <div className="anim-fade">
            <div className="page-header" style={{ marginBottom: 30 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <div style={{ background: 'var(--color-maroon)15', color: 'var(--color-maroon)', padding: 12, borderRadius: 14 }}>
                        <FiFileText size={24} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>Notice Broadcast Station</h2>
                        <p style={{ margin: 0, color: '#666' }}>Generate official communications with live document preview</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 380px) 1fr', gap: 30, alignItems: 'start' }}>
                {/* Left: Configuration Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card anim-slide-right" style={{ padding: 25, borderRadius: 24, boxShadow: 'var(--shadow-sm)' }}>
                        <h4 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FiSettings color="var(--color-maroon)" /> Correspondence Settings
                        </h4>
                        
                        <div className="form-group">
                            <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>A. Targeting Region</label>
                            {district && !isSuperAdmin ? (
                                <div style={{ background: '#f8f9fa', padding: '12px 16px', borderRadius: 12, fontWeight: 700, display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <FiMapPin color="var(--color-maroon)" /> <span style={{ textTransform: 'capitalize' }}>{district}</span>
                                </div>
                            ) : (
                                <select className="form-control" value={district} onChange={e => setDistrict(e.target.value)} style={{ borderRadius: 12 }}>
                                    <option value="">-- Choose District --</option>
                                    {districts.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
                                </select>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                            <div className="form-group">
                                <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>B. Month</label>
                                <select className="form-control" value={month} onChange={e => setMonth(e.target.value)} style={{ borderRadius: 12 }}>
                                    <option value="">Select Month</option>
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>C. Year</label>
                                <select className="form-control" value={year} onChange={e => setYear(e.target.value)} style={{ borderRadius: 12 }}>
                                    <option value="2026">2026</option>
                                    <option value="2025">2025</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>D. Notification Template</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {Object.entries(templates).map(([id, t]) => (
                                    <div 
                                        key={id}
                                        onClick={() => setTemplateId(id)}
                                        style={{ 
                                            padding: '12px', 
                                            borderRadius: 14, 
                                            cursor: 'pointer',
                                            border: `2px solid ${templateId === id ? t.color : '#eee'}`,
                                            background: templateId === id ? `${t.color}05` : 'white',
                                            transition: '0.3s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: templateId === id ? t.color : '#333' }}>{t.title}</span>
                                            {templateId === id && <FiCheckCircle color={t.color} size={14} />}
                                        </div>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#888' }}>{t.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="btn btn-maroon btn-lg anim-zoom" style={{ width: '100%', marginTop: 10, height: 50, borderRadius: 14, fontWeight: 700 }} 
                            onClick={findUsers} disabled={loading || !district || !month}>
                            {loading ? 'Analyzing...' : 'Generate Broadcast Preview'}
                        </button>
                    </div>
                </div>

                {/* Right: Modern Document Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {preview ? (
                        <div className="anim-fade">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                <div style={{ 
                                    background: templates[templateId].color, 
                                    color: 'white', 
                                    padding: '6px 16px', 
                                    borderRadius: 10, 
                                    fontSize: '0.85rem', 
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10
                                }}>
                                    <FiUsers size={16} /> BROADCAST TO {preview.count} SHOPKEEPERS
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>Document Status: <b>Draft Preview</b></div>
                            </div>

                            <div className="card anim-zoom" style={{ 
                                padding: '60px 50px', 
                                borderRadius: 8, 
                                background: 'white', 
                                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                minHeight: 650,
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Header */}
                                <div style={{ textAlign: 'center', borderBottom: '2px double #333', paddingBottom: 20, marginBottom: 40 }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--color-maroon)', letterSpacing: 1 }}>ZILA PANCHAYAT OFFICE, {preview.district.toUpperCase()}</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#666' }}>Government of Uttarakhand | Directorate of Panchayati Raj</div>
                                    <div style={{ position: 'absolute', top: 40, right: 50, fontSize: '0.8rem', color: '#333' }}><b>DATE:</b> {new Date().toLocaleDateString('en-GB')}</div>
                                </div>

                                {/* Body */}
                                <div style={{ fontSize: '1rem', color: '#333', lineHeight: 1.8, fontFamily: 'serif' }}>
                                    <div style={{ fontWeight: 800, marginBottom: 30, textDecoration: 'underline' }}>{preview.text.split('\n\n')[0]}</div>
                                    <p style={{ marginBottom: 20 }}>Dear Taxpayer/Shop Owner,</p>
                                    <p style={{ textIndent: 40 }}>{preview.text.split('\n\n')[1]}</p>
                                    <p style={{ marginTop: 20 }}>This communication serves as an official notice under the Uttarakhand Panchayati Raj Act. Please comply to maintain legal business operations.</p>
                                </div>

                                {/* Seal & Signature Visual */}
                                <div style={{ marginTop: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div style={{ 
                                        width: 100, height: 100, 
                                        borderRadius: '50%', 
                                        border: '4px double rgba(130, 29, 48, 0.2)', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.6rem', color: 'rgba(130, 29, 48, 0.4)', textAlign: 'center',
                                        fontWeight: 800, textTransform: 'uppercase'
                                    }}>
                                        Zila Panchayat<br/>Official Seal<br/>{preview.district}
                                    </div>
                                    <div style={{ textAlign: 'center', borderTop: '1px solid #333', paddingTop: 10, width: 220 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>Additional Chief Officer</div>
                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>Zila Panchayat Administration</div>
                                    </div>
                                </div>

                                {/* Background Watermark */}
                                <div style={{ 
                                    position: 'absolute', top: '50%', left: '50%', 
                                    transform: 'translate(-50%, -50%) rotate(-30deg)', 
                                    fontSize: '8rem', color: 'rgba(0,0,0,0.02)', 
                                    fontWeight: 900, pointerEvents: 'none', whiteSpace: 'nowrap'
                                }}>
                                    {preview.district.toUpperCase()}
                                </div>
                            </div>

                            <button className="btn btn-maroon btn-lg anim-slide-up" 
                                style={{ width: '100%', marginTop: 25, height: 60, borderRadius: 18, fontSize: '1.2rem', fontWeight: 800, boxShadow: '0 10px 20px rgba(130, 29, 48, 0.3)' }} 
                                onClick={sendBulkNotice}>
                                <FiSend style={{ marginRight: 10 }} /> Broadcast Notices to {preview.count} Citizens
                            </button>

                            {sent && (
                                <div className="alert alert-success anim-zoom" style={{ marginTop: 20, borderRadius: 14, padding: 20 }}>
                                    <FiCheckCircle size={24} style={{ marginRight: 15 }} />
                                    <div>
                                        <b style={{ fontSize: '1.1rem' }}>Success!</b><br/>
                                        Official notices have been successfully dispatched to {preview.count} users in {preview.district}.
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="card anim-fade" style={{ 
                            height: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', 
                            justifyContent: 'center', background: '#f8f9fa', border: '2px dashed #ccc', borderRadius: 24 
                        }}>
                            <div style={{ fontSize: '4rem', opacity: 0.3, marginBottom: 20 }}>✉️</div>
                            <h3 style={{ margin: 0, color: '#999' }}>Live Document Preview</h3>
                            <p style={{ color: '#aaa', textAlign: 'center' }}>Select region and criteria on the left to<br/>begin crafting official correspondence.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
