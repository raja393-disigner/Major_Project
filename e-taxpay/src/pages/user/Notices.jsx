import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiDownload, FiAlertCircle } from 'react-icons/fi'
import jsPDF from 'jspdf'
import api from '../../lib/api'

export default function Notices() {
    const { t } = useTranslation()
    const [notices, setNotices] = useState([])
    const [loading, setLoading] = useState(true)

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

    const downloadNotice = (notice) => {
        const doc = new jsPDF()

        doc.setFillColor(130, 29, 48)
        doc.rect(0, 0, 210, 30, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(16)
        doc.text('E-TaxPay — Official Notice', 14, 20)

        doc.setTextColor(45, 45, 45)
        doc.setFontSize(12)
        doc.text(notice.title, 14, 45)
        doc.setFontSize(9)
        doc.setTextColor(100, 100, 100)
        doc.text(`Date: ${new Date(notice.created_at).toLocaleDateString('en-IN')}`, 14, 55)

        doc.setTextColor(45, 45, 45)
        doc.setFontSize(10)
        const lines = doc.splitTextToSize(notice.message, 180)
        doc.text(lines, 14, 70)

        doc.setFontSize(8)
        doc.setTextColor(138, 138, 138)
        doc.text('This is an official notice from Zila Panchayat, Uttarakhand.', 14, 270)

        doc.save(`notice-${notice.id}.pdf`)
    }

    return (
        <div>
            <div className="page-header">
                <h2>{t('user.notices')}</h2>
                <p>{t('user.noticeFrom')}</p>
            </div>

            {notices.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">📋</div>
                    <h4>{t('user.noNotices')}</h4>
                </div>
            ) : (
                notices.map(notice => (
                    <div key={notice.id} className={`notice-card ${notice.is_urgent ? 'urgent' : ''}`}>
                        <div className="notice-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {notice.is_urgent && <FiAlertCircle color="var(--color-maroon)" size={18} />}
                                <h4>{notice.title}</h4>
                            </div>
                            <span className="notice-date">{new Date(notice.created_at).toLocaleDateString('en-IN')}</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14, fontSize: '0.9rem' }}>
                            {notice.message}
                        </p>
                        <button className="btn btn-secondary btn-sm" onClick={() => downloadNotice(notice)}>
                            <FiDownload size={14} /> {t('user.downloadPdf')}
                        </button>
                    </div>
                ))
            )}
        </div>
    )
}
