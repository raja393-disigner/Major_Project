import { useState, useMemo, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FiDownload, FiCheckCircle, FiXCircle, FiAlertTriangle, FiCreditCard } from 'react-icons/fi'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import Papa from 'papaparse'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

export default function TaxTable() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [yearFilter, setYearFilter] = useState('2026')
    const [taxData, setTaxData] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [paymentDone, setPaymentDone] = useState(null)

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    // Current month/year based on real-time system date
    const CURRENT_MONTH = new Date().getMonth() + 1; // 1-indexed (1=Jan, 12=Dec)
    const CURRENT_YEAR = new Date().getFullYear();

    const fetchTaxes = useCallback(async () => {
        try {
            setLoading(true)
            const response = await api.get('/taxpayers/taxes')
            if (response.data.success) {
                // Map DB fields to what our UI expects
                const mappedData = response.data.taxes.map(record => ({
                    id: record.id,
                    year: record.year,
                    monthIdx: record.month,
                    month: months[record.month - 1] || record.month,
                    amount: record.amount,
                    penalty: record.penalty || 0,
                    total: record.total_amount || (record.amount + (record.penalty || 0)),
                    status: record.status || 'unpaid',
                    paidDate: record.paid_date ? new Date(record.paid_date).toLocaleDateString('en-IN') : '-',
                    paidTime: record.paid_date ? new Date(record.paid_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-',
                    dueDate: record.due_date ? new Date(record.due_date).toLocaleDateString('en-IN') : '-',
                    raw: record // Keep original record for payment logic
                }))
                setTaxData(mappedData)
            }
        } catch (err) {
            console.error("Failed to fetch taxes:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchTaxes()
    }, [fetchTaxes])

    const handlePayment = async (taxRecord) => {
        setProcessing(true)
        try {
            const totalAmount = Number(taxRecord.total)
            
            // 1. Create Order on Backend
            const { data } = await api.post('/payments/create-order', {
                amount: totalAmount,
                receipt: taxRecord.id
            })

            if (!data.success) throw new Error(data.message)

            // 2. Open Razorpay Checkout
            const options = {
                key: data.keyId || 'rzp_test_YOUR_KEY_HERE',
                amount: data.amount,
                currency: data.currency,
                name: "E-TaxPay Uttarakhand",
                description: `Tax Payment for ${taxRecord.month} ${taxRecord.year}`,
                order_id: data.orderId,
                handler: async (response) => {
                    try {
                        // 3. Verify Payment on Backend
                        const verifyRes = await api.post('/payments/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            taxId: taxRecord.id
                        })

                        if (verifyRes.data.success) {
                            const receipt = {
                                receiptNo: 'RCP-' + Date.now(),
                                transactionId: response.razorpay_payment_id,
                                amount: totalAmount,
                                month: taxRecord.month,
                                year: taxRecord.year,
                                paidAt: new Date().toLocaleString('en-IN'),
                                gstId: user?.gstId || 'N/A',
                                userName: user?.username || 'User'
                            }
                            setPaymentDone(receipt)
                            fetchTaxes() // Refresh list
                        } else {
                            alert("Payment verification failed: " + (verifyRes.data.message || "Unknown error"))
                        }
                    } catch (err) {
                        console.error("Verification Error:", err)
                        alert("Payment confirmation error.")
                    } finally {
                        setProcessing(false)
                    }
                },
                prefill: {
                    name: user?.username,
                    email: user?.email,
                    contact: user?.mobile
                },
                theme: { color: "#821d30" }
            }

            const rzp = new window.Razorpay(options)
            rzp.open()

        } catch (err) {
            console.error("Payment Error:", err)
            alert("Failed to initiate payment. Check backend and keys.")
            setProcessing(false)
        }
    }

    const handleViewReceipt = async (taxId) => {
        try {
            setProcessing(true)
            const { data } = await api.get(`/payments/receipt/${taxId}`)
            if (data.success) {
                setPaymentDone(data.receipt)
            } else {
                alert("Receipt details not found.")
            }
        } catch (err) {
            console.error("View Receipt Error:", err)
            alert("Failed to fetch receipt data.")
        } finally {
            setProcessing(false)
        }
    }

    const downloadReceipt = (data) => {
        if (!data) return
        const doc = new jsPDF()

        // Header
        doc.setFillColor(130, 29, 48)
        doc.rect(0, 0, 210, 35, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(20)
        doc.text('E-TaxPay', 14, 18)
        doc.setFontSize(10)
        doc.text('Zila Panchayat, Uttarakhand | Digital Tax Payment Receipt', 14, 28)

        // Body
        doc.setTextColor(45, 45, 45)
        doc.setFontSize(14)
        doc.text('Payment Receipt', 14, 50)

        doc.setFontSize(10)
        const y = 60
        const fields = [
            ['Receipt No.', data.receiptNo],
            ['Transaction ID', data.transactionId],
            ['Name', user?.username || 'User'],
            ['GST ID', user?.gstId || 'N/A'],
            ['Month / Year', `${data.month} ${data.year}`],
            ['Amount Paid', `₹ ${data.amount}`],
            ['Payment Date', data.paidAt],
            ['Payment Mode', 'Online (Razorpay)'],
            ['Status', 'PAID ✓'],
        ]

        fields.forEach(([label, value], i) => {
            doc.setFont(undefined, 'bold')
            doc.text(label + ':', 14, y + i * 10)
            doc.setFont(undefined, 'normal')
            doc.text(value, 70, y + i * 10)
        })

        // Footer
        doc.setFontSize(8)
        doc.setTextColor(138, 138, 138)
        doc.text('This is a computer-generated receipt. No signature required.', 14, 270)
        doc.text('© 2026 E-TaxPay | Zila Panchayat, Uttarakhand', 14, 276)

        doc.save(`receipt-${data.receiptNo}.pdf`)
    }

    const filtered = yearFilter ? taxData.filter(r => r.year === parseInt(yearFilter)) : taxData

    const totalPaid = filtered.filter(r => r.status === 'paid').reduce((s, r) => s + r.amount, 0)
    const totalPending = filtered.filter(r => r.status !== 'paid').reduce((s, r) => s + r.total, 0)

    const exportPDF = () => {
        const doc = new jsPDF()
        doc.setFontSize(16)
        doc.text('E-TaxPay - Tax Records', 14, 20)
        doc.setFontSize(10)
        doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 28)

        doc.autoTable({
            startY: 35,
            head: [['Year', 'Month', 'Amount (₹)', 'Penalty (₹)', 'Total (₹)', 'Status', 'Paid Date']],
            body: filtered.map(r => [r.year, r.month, r.amount, r.penalty, r.total, r.status.toUpperCase(), r.paidDate]),
            theme: 'grid',
            headStyles: { fillColor: [130, 29, 48] },
            styles: { fontSize: 8 }
        })
        doc.save('tax-records.pdf')
    }

    const exportCSV = () => {
        const csv = Papa.unparse(filtered.map(r => ({
            Year: r.year, Month: r.month, Amount: r.amount, Penalty: r.penalty,
            Total: r.total, Status: r.status, PaidDate: r.paidDate
        })))
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'tax-records.csv'; a.click()
    }

    const statusIcon = (status) => {
        if (status === 'paid') return <FiCheckCircle size={14} />
        if (status === 'overdue') return <FiAlertTriangle size={14} />
        return <FiXCircle size={14} />
    }

    if (paymentDone) {
        return (
            <div className="anim-fade">
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <FiCheckCircle size={72} color="var(--color-green)" style={{ marginBottom: 16 }} />
                    <h2 style={{ color: 'var(--color-green)', marginBottom: 8 }}>{t('user.paymentSuccess')}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 30 }}>
                        Your tax payment for <strong>{paymentDone.month} {paymentDone.year}</strong> has been processed.
                    </p>

                    <div className="card" style={{ maxWidth: 500, margin: '0 auto', textAlign: 'left' }}>
                        <div style={{ display: 'grid', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{t('user.receiptNo')}</span>
                                <strong>{paymentDone.receiptNo}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{t('user.transactionId')}</span>
                                <strong>{paymentDone.transactionId}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{t('user.amount')}</span>
                                <strong style={{ color: 'var(--color-green)' }}>₹{paymentDone.amount}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{t('common.date')}</span>
                                <strong>{paymentDone.paidAt}</strong>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                            <button className="btn btn-maroon" style={{ flex: 1 }} onClick={() => downloadReceipt(paymentDone)}>
                                <FiDownload size={16} /> {t('user.downloadReceipt')}
                            </button>
                            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setPaymentDone(null)}>
                                Back to Records
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="anim-fade">
            <div className="page-header">
                <h2>{t('user.monthlyTax')}</h2>
                <p>{t('user.taxTable')} — View and export your complete tax history</p>
            </div>

            {/* Stats */}
            <div className="grid-3" style={{ marginBottom: 32 }}>
                <div className="stat-card hover-lift" style={{ borderLeft: '4px solid var(--color-green)' }}>
                    <div className="stat-icon" style={{ background: 'var(--color-green-light)', color: 'var(--color-green)' }}>
                        <FiCheckCircle size={22} />
                    </div>
                    <div className="stat-info">
                        <h3>₹{totalPaid.toLocaleString()}</h3>
                        <p>{t('user.totalPaid')}</p>
                    </div>
                </div>
                <div className="stat-card hover-lift" style={{ borderLeft: '4px solid var(--color-maroon)' }}>
                    <div className="stat-icon" style={{ background: 'var(--color-maroon-light)', color: 'var(--color-maroon)' }}>
                        <FiXCircle size={22} />
                    </div>
                    <div className="stat-info">
                        <h3>₹{totalPending.toLocaleString()}</h3>
                        <p>{t('user.totalPending')}</p>
                    </div>
                </div>
                <div className="stat-card hover-lift" style={{ borderLeft: '4px solid var(--color-saffron)' }}>
                    <div className="stat-icon" style={{ background: 'rgba(232,134,58,0.15)', color: 'var(--color-saffron)' }}>
                        <FiAlertTriangle size={22} />
                    </div>
                    <div className="stat-info">
                        <h3>{filtered.filter(r => r.status === 'overdue' || (r.status === 'unpaid' && r.monthIdx < CURRENT_MONTH)).length}</h3>
                        <p>{t('user.overdue')}</p>
                    </div>
                </div>
            </div>

            {/* Filters + Export */}
            <div className="filter-bar" style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
                <select className="form-control" style={{ maxWidth: 200 }} value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                    <option value="">{t('user.year')} — All</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                </select>
                <div style={{ flex: 1 }}></div>
                <button className="btn btn-secondary btn-sm" onClick={exportPDF}>
                    <FiDownload size={14} /> {t('user.downloadPdf')}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={exportCSV}>
                    <FiDownload size={14} /> {t('user.downloadCsv')}
                </button>
            </div>

            {/* Table */}
            <div className="data-table-wrapper" style={{ boxShadow: 'var(--shadow-md)' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div className="loader" style={{ width: 40, height: 40, borderSize: 3 }}></div>
                        <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>{t('common.loading')}...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                        <FiAlertTriangle size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                        <p>No tax records found for the selected year.</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>{t('user.year')}</th>
                            <th>{t('user.month')}</th>
                            <th>{t('user.amount')}</th>
                            <th>{t('user.penalty')}</th>
                            <th>Total</th>
                            <th>{t('user.status')}</th>
                            <th>{t('user.date')}</th>
                            <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(r => (
                            <tr key={r.id}>
                                <td>{r.year}</td>
                                <td>{r.month}</td>
                                <td>₹{r.amount}</td>
                                <td>{r.penalty > 0 ? <span style={{ color: 'var(--color-maroon)', fontWeight: 600 }}>₹{r.penalty}</span> : '-'}</td>
                                <td><strong>₹{r.total}</strong></td>
                                <td>
                                    <span className={`badge badge-${r.status === 'paid' ? 'paid' : (r.status === 'overdue' || (r.status === 'unpaid' && r.monthIdx < CURRENT_MONTH)) ? 'danger' : 'warning'}`}>
                                        {statusIcon(r.status === 'paid' ? 'paid' : (r.status === 'overdue' || (r.status === 'unpaid' && r.monthIdx < CURRENT_MONTH)) ? 'overdue' : 'pending')} 
                                        {r.status === 'paid' ? t('user.paid') : (r.status === 'overdue' || (r.status === 'unpaid' && r.monthIdx < CURRENT_MONTH)) ? t('user.overdue') : t('user.unpaid')}
                                    </span>
                                </td>
                                <td>
                                    {r.paidDate}
                                    {r.paidTime !== '-' && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.paidTime}</div>}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    {r.status === 'paid' ? (
                                        <button 
                                            className="btn btn-secondary btn-sm" 
                                            onClick={() => handleViewReceipt(r.id)}
                                            disabled={processing}
                                        >
                                            {processing ? '...' : 'Receipt'}
                                        </button>
                                    ) : (r.monthIdx <= CURRENT_MONTH && r.year === CURRENT_YEAR) ? (
                                        <button 
                                            className="btn btn-green btn-sm"
                                            style={{ padding: '6px 16px', borderRadius: '8px' }}
                                            onClick={() => handlePayment(r)}
                                            disabled={processing}
                                        >
                                            <FiCreditCard size={14} /> Pay Now
                                        </button>
                                    ) : (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Locked</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                )}
            </div>
            
            <div className="alert alert-info" style={{ marginTop: 24, background: 'rgba(91,154,89,0.05)', color: 'var(--color-green)', borderColor: 'var(--color-green-light)' }}>
                <FiCheckCircle /> 
                <span>All payments are secured with 256-bit encryption. Receipts are valid for official use by Zila Panchayat Uttarakhand.</span>
            </div>
        </div>
    )
}
