import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiDownload } from 'react-icons/fi'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend
} from 'recharts'
import api from '../../lib/api'

export default function TaxAnalytics() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('yearly')
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState({
        yearlyData: [],
        monthlyBreakdown: [],
        blockAnalytics: [],
        shopTypeAnalytics: []
    })

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/admin/analytics');
                if (res.data.success) {
                    setData({
                        yearlyData: res.data.yearlyData || [],
                        monthlyBreakdown: res.data.monthlyBreakdown || [],
                        blockAnalytics: res.data.blockAnalytics || [],
                        shopTypeAnalytics: res.data.shopTypeAnalytics || []
                    });
                }
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div style={{ padding: '2rem' }}>Loading analytics reports...</div>;

    const { yearlyData, monthlyBreakdown, blockAnalytics, shopTypeAnalytics } = data;

    return (
        <div>
            <div className="page-header-actions">
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h2>{t('admin.analytics')}</h2>
                    <p>Detailed tax collection analytics and reports</p>
                </div>
                <button className="btn btn-secondary btn-sm">
                    <FiDownload size={14} /> Export Report
                </button>
            </div>

            {/* Tabs */}
            <div className="tabs">
                {['yearly', 'monthly', 'blockWise', 'shopType'].map(tab => (
                    <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}>
                        {tab === 'yearly' ? 'Year-wise' : tab === 'monthly' ? 'Month-wise' :
                            tab === 'blockWise' ? 'Block-wise' : 'Shop Type-wise'}
                    </button>
                ))}
            </div>

            {/* Yearly */}
            {activeTab === 'yearly' && (
                <div className="grid-2">
                    <div className="chart-card">
                        <h4>Year-wise Tax Collection</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={yearlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D5" />
                                <XAxis dataKey="year" />
                                <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                                <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Collection']} />
                                <Bar dataKey="amount" fill="#821D30" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="chart-card">
                        <h4>Year-wise Summary</h4>
                        <div className="data-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                            <table className="data-table">
                                <thead><tr><th>Year</th><th>Collection</th><th>Growth</th></tr></thead>
                                <tbody>
                                    {(yearlyData || []).map((d, i) => (
                                        <tr key={d.year}>
                                            <td><strong>{d.year}</strong></td>
                                            <td>₹{d.amount.toLocaleString()}</td>
                                            <td>
                                                {i > 0 && yearlyData[i-1].amount > 0 ? (
                                                    <span style={{ color: d.amount > yearlyData[i - 1].amount ? 'var(--color-green)' : 'var(--color-maroon)' }}>
                                                        {d.amount > yearlyData[i - 1].amount ? '↑' : '↓'} {Math.abs(((d.amount - yearlyData[i - 1].amount) / yearlyData[i - 1].amount * 100)).toFixed(1)}%
                                                    </span>
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Monthly */}
            {activeTab === 'monthly' && (
                <div className="chart-card">
                    <h4>Month-wise Comparison (2025 vs 2026)</h4>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={monthlyBreakdown}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D5" />
                            <XAxis dataKey="month" />
                            <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                            <Tooltip formatter={v => [`₹${v.toLocaleString()}`, '']} />
                            <Legend />
                            <Line type="monotone" dataKey="2025" stroke="#821D30" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="2026" stroke="#E8863A" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Block-wise */}
            {activeTab === 'blockWise' && (
                <>
                    <div className="chart-card" style={{ marginBottom: 24 }}>
                        <h4>Block-wise Collection Overview</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={blockAnalytics}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D5" />
                                <XAxis dataKey="block" />
                                <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                                <Tooltip formatter={v => [`₹${v.toLocaleString()}`, '']} />
                                <Legend />
                                <Bar dataKey="paid" fill="#5B9A59" name="Paid" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="pending" fill="#E8863A" name="Pending" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="data-table-wrapper">
                        <table className="data-table">
                            <thead><tr><th>Block</th><th>Total</th><th>Paid</th><th>Pending</th><th>Collection %</th></tr></thead>
                            <tbody>
                                {(blockAnalytics || []).map(b => (
                                    <tr key={b.block}>
                                        <td><strong>{b.block}</strong></td>
                                        <td>₹{b.total.toLocaleString()}</td>
                                        <td style={{ color: 'var(--color-green)' }}>₹{b.paid.toLocaleString()}</td>
                                        <td style={{ color: 'var(--color-maroon)' }}>₹{b.pending.toLocaleString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ flex: 1, height: 6, background: '#eee', borderRadius: 3 }}>
                                                    <div style={{ width: `${b.total > 0 ? (b.paid / b.total * 100) : 0}%`, height: '100%', background: 'var(--color-green)', borderRadius: 3 }}></div>
                                                </div>
                                                <span style={{ fontSize: '0.82rem' }}>{b.total > 0 ? (b.paid / b.total * 100).toFixed(0) : 0}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Shop Type */}
            {activeTab === 'shopType' && (
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead><tr><th>Shop Type</th><th>Total Shops</th><th>Collected</th><th>Pending</th><th>Avg/Shop</th></tr></thead>
                        <tbody>
                            {(shopTypeAnalytics || []).map(s => (
                                <tr key={s.type}>
                                    <td><strong>{s.type}</strong></td>
                                    <td>{s.shops}</td>
                                    <td style={{ color: 'var(--color-green)' }}>₹{s.collected.toLocaleString()}</td>
                                    <td style={{ color: 'var(--color-maroon)' }}>₹{s.pending.toLocaleString()}</td>
                                    <td>₹{s.shops > 0 ? Math.round(s.collected / s.shops).toLocaleString() : 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
