import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { FiCreditCard, FiCheckCircle, FiDownload, FiAlertCircle } from 'react-icons/fi'
import jsPDF from 'jspdf'
import api from '../../lib/api'
import { supabase } from '../../supabaseClient'

export default function Payments() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [processing, setProcessing] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [paymentDone, setPaymentDone] = useState(null)
    const [error, setError] = useState(null)
    const [pendingPayments, setPendingPayments] = useState([])

    const fetchTaxes = useCallback(async () => {
        try {
            setFetching(true)
            const { data } = await api.get('/taxpayers/taxes')
            if (data.success) {
                // Show all 12 months as returned by backend
                setPendingPayments(data.taxes || [])
            }
        } catch (err) {
            console.error("Fetch Taxes Error:", err)
            setError("Failed to load tax records")
        } finally {
            setFetching(false)
        }
    }, [])

    useEffect(() => {
        fetchTaxes()
    }, [fetchTaxes])

    // Current month/year based on simulated system date (March 2026)
    const CURRENT_MONTH = 3;
    const CURRENT_YEAR = 2026;

    const totalPending = pendingPayments
        .filter(p => p.status !== 'paid')
        .reduce((s, p) => s + (Number(p.amount) || 0), 0)

    const handlePayment = async (payment) => {
        setProcessing(true)
        setError(null)
        
        try {
            const totalAmount = Number(payment.amount) + (Number(payment.penalty) || 0)
            
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const displayMonth = typeof payment.month === 'number' ? monthNames[payment.month - 1] : payment.month;

            // 1. Create Order on Backend
            const { data } = await api.post('/payments/create-order', {
                amount: totalAmount,
                receipt: payment.id
            })

            if (!data.success) throw new Error(data.message)

            // 2. Open Razorpay Checkout
            const options = {
                key: data.keyId || 'rzp_test_YOUR_KEY_HERE', // Use key from backend
                amount: data.amount,
                currency: data.currency,
                name: "E-TaxPay Uttarakhand",
                description: `Tax Payment for ${displayMonth} ${payment.year}`,
                order_id: data.orderId,
                handler: async (response) => {
                    try {
                        // 3. Verify Payment on Backend
                        const verifyRes = await api.post('/payments/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            taxId: payment.id // Pass the DB ID to mark it as paid
                        })

                        if (verifyRes.data.success) {
                            const receipt = {
                                receiptNo: 'RCP-' + Date.now(),
                                transactionId: response.razorpay_payment_id,
                                amount: totalAmount,
                                month: displayMonth,
                                year: payment.year,
                                paidAt: new Date().toLocaleString('en-IN'),
                                gstId: user?.gstId || 'N/A',
                                userName: user?.username || 'User'
                            }
                            setPaymentDone(receipt)
                            fetchTaxes() // Refresh the list
                        } else {
                            alert("Payment verification failed: " + (verifyRes.data.message || "Unknown error"))
                        }
                    } catch (err) {
                        console.error("Verification Error:", err)
                        const errMsg = err.response?.data?.message || err.message || "Failed to contact verification server"
                        alert(`Payment confirmation error: ${errMsg}`)
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
            alert("Failed to initiate payment. Make sure backend is running and Razorpay keys are set.")
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

        // QR Code placeholder
        doc.setDrawColor(130, 29, 48)
        doc.rect(140, 55, 50, 50)
        doc.setFontSize(8)
        doc.text('QR Code', 155, 82)
        doc.text('Scan to Verify', 150, 88)

        // Footer
        doc.setFontSize(8)
        doc.setTextColor(138, 138, 138)
        doc.text('This is a computer-generated receipt. No signature required.', 14, 270)
        doc.text('© 2026 E-TaxPay | Zila Panchayat, Uttarakhand', 14, 276)

        doc.save(`receipt-${data.receiptNo}.pdf`)
    }

    const handleViewReceipt = async (taxId) => {
        try {
            setProcessing(true)
            const { data } = await api.get(`/payments/receipt/${taxId}`)
            if (data.success) {
                // Set paymentDone to show the success/summary card UI
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

    if (paymentDone) {
        return (
            <div>
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <FiCheckCircle size={72} color="var(--color-green)" style={{ marginBottom: 16 }} />
                    <h2 style={{ color: 'var(--color-green)', marginBottom: 8 }}>{t('user.paymentSuccess')}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 30 }}>
                        Your tax payment has been processed successfully.
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

                        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                            <button className="btn btn-maroon" style={{ flex: 1 }} onClick={() => downloadReceipt(paymentDone)}>
                                <FiDownload size={16} /> {t('user.downloadReceipt')}
                            </button>
                            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setPaymentDone(null)}>
                                Back to Payments
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 30 }}>
                <div>
                    <h2>{t('user.payments')}</h2>
                    <p style={{ opacity: 0.8 }}>Manage your dues and generate official receipts</p>
                </div>
                <div style={{ padding: '8px 16px', background: 'var(--color-maroon-light)', color: 'var(--color-maroon)', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                    Uttarakhand Govt. Certified Payment Portal
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
                {/* Pending Amount Card */}
                <div className="card animate-fade-in delay-1" style={{ borderLeft: '6px solid var(--color-maroon)', background: 'linear-gradient(to right, #ffffff, #fffbfb)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>{t('user.pendingAmount')}</p>
                            <h1 style={{ color: 'var(--color-maroon)', fontSize: '2.8rem', letterSpacing: '-1px' }}>₹{totalPending.toLocaleString()}</h1>
                        </div>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-maroon-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FiCreditCard size={32} color="var(--color-maroon)" />
                        </div>
                    </div>
                    <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <span className="aipan-diamond" style={{ margin: 0 }}></span>
                        Includes {pendingPayments.filter(p => p.status !== 'paid').length} pending billing statements
                    </div>
                </div>

                {/* Secure Gateway Card */}
                <div className="card animate-fade-in delay-2" style={{ borderLeft: '6px solid var(--color-green)', background: 'linear-gradient(to right, #ffffff, #f7faf7)' }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--color-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FiCheckCircle size={24} color="var(--color-green)" />
                        </div>
                        <div>
                            <h4 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>Fastest Settlement</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Payments are cleared instantly through Razorpay's high-uptime network.
                            </p>
                        </div>
                    </div>
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>SUPPORTED METHODS</span>
                        <div style={{ display: 'flex', gap: 10, opacity: 0.7 }}>
                            <small>UPI</small>
                            <small>Cards</small>
                            <small>NetBanking</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Billing History Table */}
            <div className="animate-fade-in delay-3">
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>Billing Statement History</h3>
                    <div className="lang-toggle" style={{ background: '#eee' }}>
                        <span style={{ fontSize: '0.75rem', padding: '0 12px', color: '#666' }}>Filter by Year: 2026</span>
                    </div>
                </div>
                <div className="data-table-wrapper" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    {fetching ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <div className="pulse-soft">Loading tax records...</div>
                        </div>
                    ) : pendingPayments.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ marginBottom: 16 }}>No billing history found for this year.</div>
                        </div>
                    ) : (
                        <table className="data-table">
                        <thead>
                            <tr>
                                <th>Transaction Ref</th>
                                <th>Billing Period</th>
                                <th>Current Dues</th>
                                <th>Levy/Penalty</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingPayments.map(p => {
                                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                                const displayMonth = typeof p.month === 'number' ? monthNames[p.month - 1] : p.month;
                                const isCurrentMonth = p.month === CURRENT_MONTH && p.year === CURRENT_YEAR;
                                
                                return (
                                <tr key={p.id || `v-${p.month}`}>
                                    <td>
                                        <div style={{ fontWeight: 700, color: 'var(--color-maroon)' }}>{p.id ? p.id.substring(0, 8) : 'GEN-001'}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.created_at ? `Generated on ${new Date(p.created_at).toLocaleDateString()}` : 'System Generated'}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{displayMonth} {p.year}</div>
                                    </td>
                                    <td>₹{p.amount}</td>
                                    <td>
                                        {p.penalty > 0 ? (
                                            <span style={{ color: 'var(--color-maroon)', background: 'var(--color-maroon-light)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                                                + ₹{p.penalty}
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Nil</span>
                                        )}
                                    </td>
                                    <td>
                                        {p.status === 'paid' ? (
                                            <span style={{ color: 'var(--color-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <FiCheckCircle size={14} /> Paid
                                            </span>
                                        ) : (
                                            <span style={{ color: '#E8863A', fontWeight: 600 }}>Pending</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {p.status !== 'paid' && p.month <= CURRENT_MONTH ? (
                                            <button 
                                                className="btn btn-green btn-sm" 
                                                style={{ borderRadius: '8px', padding: '8px 20px', fontWeight: 600 }}
                                                onClick={() => handlePayment(p)} 
                                                disabled={processing}
                                            >
                                                {processing ? (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <span className="pulse-soft">Processing...</span>
                                                    </span>
                                                ) : (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        {t('user.payNow')} <FiCreditCard size={14} />
                                                    </span>
                                                )}
                                            </button>
                                        ) : p.status === 'paid' ? (
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleViewReceipt(p.id)} disabled={processing}>
                                                {processing ? '...' : 'Receipt'}
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available {displayMonth}</span>
                                        )}
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="alert alert-info animate-fade-in delay-3" style={{ marginTop: 24, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 12, border: 'none', background: '#e0f2fe', color: '#0369a1' }}>
                <div style={{ background: '#fff', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🛡️</div>
                <div>
                    <strong>Secure Payment Infrastructure</strong>
                    <p style={{ margin: 0, opacity: 0.9 }}>
                        Your payment is processed through a PCI-DSS certified environment. E-TaxPay does not store your card details.
                    </p>
                </div>
            </div>
        </div>
    )
}
