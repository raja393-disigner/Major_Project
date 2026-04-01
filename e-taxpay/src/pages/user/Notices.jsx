import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiDownload, FiAlertCircle, FiEye, FiX } from 'react-icons/fi'
import jsPDF from 'jspdf'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

export default function Notices() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [notices, setNotices] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedNotice, setSelectedNotice] = useState(null)

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const response = await api.get('/users/notices')
                if (response.data.success) {
                    setNotices(response.data.notices || [])
                }
            } catch (error) {
                console.error("Fetch notices error:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchNotices()
    }, [])

    const getAdminName = (dist) => {
        const admins = {
            'ALMORA': 'Raja',
            'DEHRADUN': 'Rahul',
            'HARIDWAR': 'Amit',
            'NAINITAL': 'Priya'
        };
        return admins[dist] || 'Raja';
    };

    const downloadNotice = (notice) => {
        const doc = new jsPDF()
        const district = (user?.district || 'Almora').toUpperCase()
        const adminName = getAdminName(district)

        // Watermark
        doc.setTextColor(245, 245, 245)
        doc.setFontSize(80)
        doc.setFont(undefined, 'bold')
        doc.text(district, 105, 150, { angle: 45, align: 'center' })

        // Header
        doc.setTextColor(130, 29, 48) // Maroon
        doc.setFontSize(20)
        doc.setFont(undefined, 'bold')
        doc.text(`ZILA PANCHAYAT OFFICE, ${district}`, 105, 30, { align: 'center' })
        
        doc.setTextColor(100, 100, 100)
        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text('Government of Uttarakhand | Directorate of Panchayati Raj', 105, 38, { align: 'center' })
        
        doc.setDrawColor(50, 50, 50)
        doc.setLineWidth(0.5)
        doc.line(20, 45, 190, 45)

        // Date
        doc.setTextColor(50, 50, 50)
        doc.setFontSize(10)
        doc.text(`DATE: ${new Date(notice.created_at).toLocaleDateString('en-GB')}`, 190, 20, { align: 'right' })

        // Body
        doc.setTextColor(30, 30, 30)
        
        // Split notice.message
        const parts = notice.message.split('\n\n')
        const subjectRaw = parts[0] || notice.title
        const bodyContent = parts[1] || notice.message

        doc.setFontSize(12)
        doc.setFont(undefined, 'bold')
        doc.text(subjectRaw, 20, 60)
        doc.line(20, 62, 20 + doc.getTextWidth(subjectRaw), 62) // underline Subject

        doc.setFont(undefined, 'normal')
        doc.text('Dear Taxpayer/Shop Owner,', 20, 75)

        const splitBody = doc.splitTextToSize(bodyContent, 160)
        doc.text(splitBody, 30, 85) // indent

        doc.text('This communication serves as an official notice under the Uttarakhand Panchayati Raj Act.', 20, 85 + (splitBody.length * 6) + 10)
        doc.text('Please comply to maintain legal business operations.', 20, 85 + (splitBody.length * 6) + 16)

        // Seal & Signature
        const ySeal = 220
        doc.setDrawColor(130, 29, 48)
        doc.setLineWidth(1)
        doc.circle(50, ySeal, 20)
        doc.circle(50, ySeal, 19)
        doc.setTextColor(130, 29, 48)
        doc.setFontSize(8)
        doc.setFont(undefined, 'bold')
        doc.text('ZILA PANCHAYAT', 50, ySeal - 4, { align: 'center' })
        doc.text('OFFICIAL SEAL', 50, ySeal + 1, { align: 'center' })
        doc.text(district, 50, ySeal + 6, { align: 'center' })

        // Signature
        doc.setDrawColor(50, 50, 50)
        doc.setLineWidth(0.5)
        doc.line(140, ySeal + 5, 190, ySeal + 5)
        
        // Admin Signature in PDF
        doc.setTextColor(0, 0, 128) // Navy blue ink
        doc.setFont('times', 'italic')
        doc.setFontSize(18)
        doc.text(adminName, 165, ySeal + 2, { align: 'center' })

        doc.setTextColor(30, 30, 30)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text('Additional Chief Officer', 165, ySeal + 10, { align: 'center' })
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(100, 100, 100)
        doc.text('Zila Panchayat Administration', 165, ySeal + 15, { align: 'center' })

        doc.save(`Notice-${district}.pdf`)
    }

    const renderOfficialDocument = (notice) => {
        const district = (user?.district || 'Almora').toUpperCase()
        const adminName = getAdminName(district)
        const parts = notice.message.split('\n\n')
        const subjectRaw = parts[0] || notice.title
        const bodyContent = parts[1] || notice.message

        return (
            <div className="card anim-zoom" style={{ 
                padding: '40px 50px', 
                borderRadius: 4, 
                background: 'white', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'left',
                border: '1px solid #ddd',
                margin: '0 auto',
                maxWidth: '100%'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',flexDirection: 'column' }}>
                        <div style={{ fontWeight: 900, fontSize: '1.6rem', color: 'var(--color-maroon)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Zila Panchayat Office, {district}</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#555', marginTop: 4 }}>Government of Uttarakhand | Directorate of Panchayati Raj</div>
                    </div>
                </div>

                <div style={{ borderBottom: '2px solid var(--color-maroon)', marginBottom: 2 }}></div>
                <div style={{ borderBottom: '1px solid var(--color-maroon)', marginBottom: 20 }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, marginBottom: 30, color: '#333' }}>
                    <div><b>Ref No:</b> ETAX/{new Date().getFullYear()}/{notice.id ? notice.id.toString().substring(0, 6).toUpperCase() : 'GEN'}</div>
                    <div><b>Date:</b> {new Date(notice.created_at).toLocaleDateString('en-GB')}</div>
                </div>

                {/* Body */}
                <div style={{ fontSize: '1rem', color: '#222', lineHeight: 1.6, fontFamily: '"Times New Roman", Times, serif', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontWeight: 800, marginBottom: 25, textDecoration: 'underline', fontSize: '1.05rem' }}>{subjectRaw}</div>
                    <p style={{ marginBottom: 15, fontWeight: 600 }}>Dear Taxpayer/Shop Owner,</p>
                    <p style={{ textIndent: 30, textAlign: 'justify', marginBottom: 15 }}>{bodyContent}</p>
                    <p style={{ textAlign: 'justify', fontWeight: 600 }}>This communication serves as an official notice under the Uttarakhand Panchayati Raj Act. Please comply to maintain legal business operations and avoid penal actions.</p>
                </div>

                {/* Seal & Signature Visual */}
                <div style={{ marginTop: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 20, position: 'relative', zIndex: 1 }}>
                    <div style={{ 
                        width: 110, height: 110, 
                        opacity: 0.85, 
                        transform: 'rotate(-10deg)',
                        flexShrink: 0,
                        mixBlendMode: 'multiply'
                    }}>
                        <svg viewBox="0 0 100 100" width="110" height="110">
                            <circle cx="50" cy="50" r="48" fill="none" stroke="#a32020" strokeWidth="1.2" strokeDasharray="3 1"/>
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#a32020" strokeWidth="2.5" />
                            <circle cx="50" cy="50" r="28" fill="none" stroke="#a32020" strokeWidth="1.5" />
                            <circle cx="50" cy="50" r="26" fill="none" stroke="#a32020" strokeWidth="0.8" />
                            
                            <path id={`topCurve-${notice.id}`} d="M 16 50 A 34 34 0 0 1 84 50" fill="none" />
                            <text fill="#a32020" fontSize="10" fontWeight="900" letterSpacing="1">
                                <textPath href={`#topCurve-${notice.id}`} startOffset="50%" textAnchor="middle">ZILA PANCHAYAT</textPath>
                            </text>
                            
                            <path id={`botCurve-${notice.id}`} d="M 16 50 A 34 34 0 0 0 84 50" fill="none" />
                            <text fill="#a32020" fontSize="8" fontWeight="bold" letterSpacing="2">
                                <textPath href={`#botCurve-${notice.id}`} startOffset="50%" textAnchor="middle">UTTARAKHAND</textPath>
                            </text>
                            
                            <text x="14" y="53" fill="#a32020" fontSize="10" textAnchor="middle">★</text>
                            <text x="86" y="53" fill="#a32020" fontSize="10" textAnchor="middle">★</text>
                            
                            <text x="50" y="44" fill="#a32020" fontSize="6" fontWeight="bold" textAnchor="middle" letterSpacing="1">OFFICIAL</text>
                            <text x="50" y="52" fill="#a32020" fontSize="6" fontWeight="bold" textAnchor="middle" letterSpacing="1">SEAL</text>
                            <text x="50" y="62" fill="#a32020" fontSize="8" fontWeight="900" textAnchor="middle">{district}</text>
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
                        }}>{adminName}</div>
                        <div style={{ borderTop: '1px solid #333', paddingTop: 8, marginTop: 5 }}>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#222' }}>Additional Chief Officer</div>
                            <div style={{ fontSize: '0.8rem', color: '#555' }}>Zila Panchayat Administration</div>
                        </div>
                    </div>
                </div>

                {/* Background Watermark */}
                <div style={{ 
                    position: 'absolute', top: '50%', left: '50%', 
                    transform: 'translate(-50%, -50%) rotate(-45deg)', 
                    fontSize: '6rem', color: 'rgba(130, 29, 48, 0.04)', 
                    fontWeight: 900, pointerEvents: 'none', whiteSpace: 'nowrap',
                    zIndex: 0, letterSpacing: 10
                }}>
                    {district}
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="page-header">
                <h2>{t('user.notices')}</h2>
                <p>{t('user.noticeFrom')}</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
            ) : notices.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">📋</div>
                    <h4>{t('user.noNotices')}</h4>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 20 }}>
                    {notices.map(notice => (
                        <div key={notice.id} className={`notice-card ${notice.is_urgent ? 'urgent' : ''}`} style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-sm)' }}>
                            <div className="notice-header" style={{ marginBottom: 15 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {notice.is_urgent && <FiAlertCircle color="var(--color-maroon)" size={18} />}
                                    <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{notice.title}</h4>
                                </div>
                                <span className="notice-date" style={{ color: '#888', fontSize: '0.85rem' }}>{new Date(notice.created_at).toLocaleDateString('en-IN')}</span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20, fontSize: '0.95rem' }}>
                                {notice.message.split('\n\n')[1] || notice.message}
                            </p>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="btn btn-maroon btn-sm" onClick={() => setSelectedNotice(notice)} style={{ borderRadius: 8 }}>
                                    <FiEye size={16} style={{ marginRight: 6 }} /> View Official Document
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={() => downloadNotice(notice)} style={{ borderRadius: 8 }}>
                                    <FiDownload size={14} style={{ marginRight: 6 }} /> {t('user.downloadPdf')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedNotice && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'rgba(0,0,0,0.6)', zIndex: 9999, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
                }}>
                    <div style={{
                        width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto',
                        background: '#f8f9fa', borderRadius: 12, padding: 20, position: 'relative'
                    }}>
                        <button 
                            onClick={() => setSelectedNotice(null)}
                            style={{ position: 'absolute', top: 15, right: 15, background: '#eee', border: 'none', padding: 8, borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}
                        ><FiX size={20}/></button>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, padding: '0 50px 0 20px', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Official Notice Document</h3>
                            <button className="btn btn-sm btn-maroon" onClick={() => downloadNotice(selectedNotice)}>
                                <FiDownload style={{ marginRight: 6 }} /> Download PDF
                            </button>
                        </div>
                        
                        <div>
                            {renderOfficialDocument(selectedNotice)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
