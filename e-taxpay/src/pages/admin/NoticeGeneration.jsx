import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiSend, FiCheckCircle, FiUsers, FiFilter, FiMapPin } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'

const districts = ['almora', 'bageshwar', 'chamoli', 'champawat', 'dehradun', 'haridwar', 'nainital', 'pauri', 'pithoragarh', 'rudraprayag', 'tehri', 'udhamsingh', 'uttarkashi']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function NoticeGeneration() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [allUsers, setAllUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [district, setDistrict] = useState('')
    const [month, setMonth] = useState('')
    const [year, setYear] = useState('2026')
    const [status, setStatus] = useState('unpaid')
    
    const [filteredUsers, setFilteredUsers] = useState([])
    const [preview, setPreview] = useState(null)
    const [sent, setSent] = useState(false)

    const isSuperAdmin = user?.role === 'super_admin'

    useEffect(() => {
        // Set default district from user profile if not super admin
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

    const findUnpaidUsers = () => {
        if (!district || !month) return
        
        const filtered = allUsers.filter(u => {
            const matchesDistrict = u.district?.toLowerCase() === district.toLowerCase()
            const matchesStatus = (u.status || 'unpaid').toLowerCase() === status.toLowerCase()
            // In a real system, you'd check if a payment record exists for THIS specific month/year.
            // For now, we use the user's current status and filters.
            return matchesDistrict && matchesStatus
        })
        
        setFilteredUsers(filtered)
        
        const capDistrict = district.charAt(0).toUpperCase() + district.slice(1)
        const monthNum = months.indexOf(month) + 1
        
        if (filtered.length > 0) {
            setPreview({
                count: filtered.length,
                district: capDistrict,
                month,
                monthNum,
                year,
                text: `OFFICIAL TAX NOTICE - ZILA PANCHAYAT ${capDistrict.toUpperCase()}

Subject: Outstanding Trade Tax for the Month of ${month} ${year}

Dear Shop Owner,

This is a formal communication from the Zila Panchayat Office, ${capDistrict}. Our records indicate that your business shop tax for the month of ${month} ${year} remains UNPAID.

MANDATORY ACTION REQUIRED:
Please ensure that all pending dues are cleared through the E-TaxPay portal within the next 7 days. Failure to comply may result in additional penalty charges and potential legal action under the Uttarakhand Panchayati Raj Act.

Ignore this notice if you have already made the payment within the last 24 hours.

By Order of,
Additional Chief Officer,
Zila Panchayat, ${capDistrict}
Uttarakhand State`
            })
        } else {
            setPreview(null)
            alert("No unpaid users found for the selected criteria.")
        }
        setSent(false)
    }

    const sendBulkNotice = async () => {
        if (!preview || filteredUsers.length === 0) return;
        
        try {
            setLoading(true);
            const userIds = filteredUsers.map(u => u.id);
            
            const response = await api.post('/admin/notices/send-bulk', {
                userIds,
                title: `Tax Payment Reminder - ${preview.month} ${preview.year}`,
                message: preview.text,
                month: preview.monthNum,
                year: parseInt(preview.year)
            });

            if (response.data.success) {
                setSent(true);
                setTimeout(() => setSent(false), 5000);
            }
        } catch (error) {
            console.error("Failed to send bulk notices:", error);
            alert("Failed to send notices. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="page-header">
                <h2>{t('admin.noticeGen')}</h2>
                <p>Generate and send official notices to shop owners</p>
            </div>

            <div className="grid-2">
                {/* Form */}
                <div className="card">
                    <h4 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiFilter size={18} /> {t('admin.noticeDetails') || 'Filter Unpaid Users'}
                    </h4>
                    
                    <div className="form-group">
                        <label>{t('auth.district')} *</label>
                        {user?.district && !isSuperAdmin ? (
                            <div className="form-control" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FiMapPin size={14} color="var(--color-maroon)" />
                                {t(`districts.${user.district.toLowerCase()}`) || user.district}
                            </div>
                        ) : (
                            <select className="form-control" value={district} onChange={e => setDistrict(e.target.value)}>
                                <option value="">-- Select District --</option>
                                {districts.map(d => <option key={d} value={d}>{t(`districts.${d}`)}</option>)}
                            </select>
                        )}
                    </div>

                    <div className="auth-form-row">
                        <div className="form-group">
                            <label>{t('admin.selectMonth')}</label>
                            <select className="form-control" value={month} onChange={e => setMonth(e.target.value)}>
                                <option value="">--</option>
                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t('admin.selectYear')}</label>
                            <select className="form-control" value={year} onChange={e => setYear(e.target.value)}>
                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Payment Status</label>
                        <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
                            <option value="unpaid">Unpaid</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>

                    <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={findUnpaidUsers}
                        disabled={loading || !district || !month}>
                        {loading ? 'Loading...' : t('admin.generateNotice') || 'Search Unpaid Users'}
                    </button>
                </div>

                {/* Preview */}
                <div className="card">
                    <h4 style={{ marginBottom: 20 }}>{t('admin.noticeTemplate')}</h4>
                    {preview ? (
                        <>
                            <div style={{ marginBottom: 16 }}>
                                <span className="badge badge-danger" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                                    <FiUsers size={14} style={{ marginRight: 6 }} /> 
                                    Targeting All Unpaid Users
                                </span>
                            </div>
                            <div style={{
                                background: 'var(--bg-secondary)',
                                padding: 20,
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                                whiteSpace: 'pre-line',
                                fontSize: '0.88rem',
                                lineHeight: 1.7,
                                color: 'var(--text-primary)',
                                maxHeight: 300,
                                overflowY: 'auto'
                            }}>
                                {preview.text}
                            </div>
                            <button className="btn btn-green btn-lg" style={{ width: '100%', marginTop: 16 }} onClick={sendBulkNotice}>
                                <FiSend size={16} /> Send Notices to All
                            </button>
                            {sent && (
                                <div className="alert alert-success" style={{ marginTop: 12 }}>
                                    <FiCheckCircle /> Bulk notices sent successfully to {preview.count} users in {preview.district}!
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="icon">📝</div>
                            <p style={{ color: 'var(--text-muted)' }}>Select criteria and search to generate batch notice preview</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
