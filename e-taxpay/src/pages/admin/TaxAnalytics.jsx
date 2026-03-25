import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiDownload } from 'react-icons/fi'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, Legend, PieChart, Pie, Cell
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
                <div className="anim-fade">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 30 }}>
                        <div className="card anim-slide-up" style={{ padding: 25, borderRadius: 24, background: 'var(--color-maroon)10', borderLeft: '6px solid var(--color-maroon)' }}>
                            <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600 }}>Total Life-time Revenue</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-maroon)' }}>
                                ₹{yearlyData.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                            </div>
                        </div>
                        <div className="card anim-slide-up delay-1" style={{ padding: 25, borderRadius: 24, borderLeft: '6px solid var(--color-saffron)' }}>
                            <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600 }}>Highest Yearly Revenue</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-saffron)' }}>
                                {yearlyData.length > 0 ? `₹${Math.max(...yearlyData.map(d => d.amount)).toLocaleString()}` : 'N/A'}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 30 }}>
                        <div className="chart-card anim-zoom" style={{ padding: 30, borderRadius: 28, boxShadow: 'var(--shadow-md)' }}>
                            <h4 style={{ marginBottom: 30, fontSize: '1.2rem' }}>Revenue Growth Journey</h4>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={yearlyData}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--color-maroon)" stopOpacity={1}/>
                                            <stop offset="100%" stopColor="var(--color-maroon-dark)" stopOpacity={0.8}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#666'}} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} tick={{fill: '#666'}} />
                                    <Tooltip 
                                        cursor={{fill: 'rgba(130, 29, 48, 0.05)'}}
                                        contentStyle={{borderRadius: 12, border: 'none', boxShadow: 'var(--shadow-lg)'}}
                                        formatter={v => [`₹${v.toLocaleString()}`, 'Yearly Collection']}
                                    />
                                    <Bar dataKey="amount" fill="url(#barGradient)" radius={[10, 10, 0, 0]} barSize={60} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <h4 style={{ margin: '10px 0', fontSize: '1.1rem' }}>Comparative Performance</h4>
                            {yearlyData.map((d, i) => {
                                const prevAmount = i > 0 ? yearlyData[i-1].amount : 0;
                                const growth = i > 0 && prevAmount > 0 ? ((d.amount - prevAmount) / prevAmount * 100).toFixed(1) : 0;
                                const isPositive = Number(growth) >= 0;

                                return (
                                    <div key={d.year} className="card anim-slide-right" style={{ 
                                        padding: 20, 
                                        borderRadius: 20, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        animationDelay: `${i * 0.1}s`,
                                        border: '1px solid #f0f0f0'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{d.year}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Tax Collected: <strong>₹{d.amount.toLocaleString()}</strong></div>
                                        </div>
                                        {i > 0 && (
                                            <div style={{ 
                                                textAlign: 'right', 
                                                padding: '8px 14px', 
                                                borderRadius: 12, 
                                                background: isPositive ? 'rgba(91, 154, 89, 0.1)' : 'rgba(130, 29, 48, 0.1)',
                                                color: isPositive ? 'var(--color-green)' : 'var(--color-maroon)'
                                            }}>
                                                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{isPositive ? '↑' : '↓'} {Math.abs(growth)}%</div>
                                                <div style={{ fontSize: '0.65rem', fontWeight: 600 }}>vs Prev Year</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            <div className="card" style={{ marginTop: 'auto', padding: 20, borderRadius: 20, background: 'var(--bg-secondary)', border: '1px dashed #ccc' }}>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666', lineHeight: 1.5 }}>
                                    <b>Analysis:</b> The tax collection ecosystem is stabilizing. 2026 data reflects collections for the first quarter only.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Monthly */}
            {activeTab === 'monthly' && (
                <div className="anim-fade">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 25 }}>
                        <div className="card" style={{ padding: 15, background: 'rgba(130, 29, 48, 0.05)', borderRadius: 16, border: '1px solid var(--color-maroon)10' }}>
                            <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Avg Collection / Month</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-maroon)' }}>
                                ₹{Math.round(monthlyBreakdown.reduce((acc, curr) => acc + (curr['2026'] || 0), 0) / 3).toLocaleString()}
                            </div>
                        </div>
                        <div className="card" style={{ padding: 15, background: 'rgba(232, 134, 58, 0.05)', borderRadius: 16, border: '1px solid var(--color-saffron)10' }}>
                            <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>District Peak Performance</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-saffron)' }}>Jan 2026</div>
                        </div>
                        <div className="card" style={{ padding: 15, background: 'rgba(91, 154, 89, 0.05)', borderRadius: 16, border: '1px solid var(--color-green)10' }}>
                            <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Overall YoY Growth</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-green)' }}>+12.4% ↑</div>
                        </div>
                    </div>

                    <div className="chart-card anim-zoom" style={{ padding: 30, borderRadius: 24, boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                            <h4 style={{ margin: 0, fontSize: '1.3rem' }}>Monthly Performance Comparison</h4>
                            <div style={{ display: 'flex', gap: 15 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--color-maroon)' }}></div> 2025 Action
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--color-saffron)' }}></div> 2026 Vision
                                </div>
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={monthlyBreakdown}>
                                <defs>
                                    <linearGradient id="color2025" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-maroon)" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="var(--color-maroon)" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="color2026" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-saffron)" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="var(--color-saffron)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E0D5" />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#666', fontSize: 12 }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#666', fontSize: 12 }}
                                    tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} 
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: 'var(--shadow-lg)' }}
                                    formatter={(v, name) => [`₹${v.toLocaleString()}`, `Year ${name}`]}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="2025" 
                                    stroke="var(--color-maroon)" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#color2025)" 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="2026" 
                                    stroke="var(--color-saffron)" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#color2026)" 
                                    activeDot={{ r: 8, stroke: 'white', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
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
                <div className="anim-fade">
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) 1fr', gap: 30, alignItems: 'start' }}>
                        {/* Table Column */}
                        <div className="data-table-wrapper" style={{ borderRadius: 24, padding: 0, overflow: 'hidden' }}>
                            <table className="data-table">
                                <thead style={{ background: 'var(--bg-secondary)' }}>
                                    <tr>
                                        <th style={{ paddingLeft: 20 }}>Category</th>
                                        <th>Shops</th>
                                        <th>Collection Rate</th>
                                        <th style={{ paddingRight: 20 }}>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(shopTypeAnalytics || []).map((s, idx) => {
                                        const rate = s.collected + s.pending > 0 ? (s.collected / (s.collected + s.pending) * 100).toFixed(0) : 0;
                                        return (
                                            <tr key={s.type} className="anim-slide-right" style={{ animationDelay: `${idx * 0.05}s` }}>
                                                <td style={{ paddingLeft: 20 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <div style={{ 
                                                            width: 32, height: 32, 
                                                            borderRadius: 8, 
                                                            background: `${idx % 2 === 0 ? 'var(--color-maroon)' : 'var(--color-saffron)'}15`,
                                                            color: idx % 2 === 0 ? 'var(--color-maroon)' : 'var(--color-saffron)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}>
                                                            {s.type === 'medical' ? '🏥' : s.type === 'restaurant' ? '🍲' : s.type === 'electronics' ? '📱' : s.type === 'clothing' ? '🧥' : '🛒'}
                                                        </div>
                                                        <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{s.type}</span>
                                                    </div>
                                                </td>
                                                <td>{s.shops}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ flex: 1, height: 4, background: '#eee', borderRadius: 2 }}>
                                                            <div style={{ 
                                                                width: `${rate}%`, 
                                                                height: '100%', 
                                                                background: Number(rate) > 60 ? 'var(--color-green)' : 'var(--color-saffron)',
                                                                borderRadius: 2 
                                                            }}></div>
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{rate}%</span>
                                                    </div>
                                                </td>
                                                <td style={{ paddingRight: 20, fontWeight: 800 }}>₹{s.collected.toLocaleString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Chart Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="chart-card anim-zoom" style={{ padding: 25, borderRadius: 24 }}>
                                <h4 style={{ textAlign: 'center', marginBottom: 20 }}>Revenue Contribution</h4>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={shopTypeAnalytics.map(s => ({ name: s.type, value: s.collected }))}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {shopTypeAnalytics.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={[
                                                    '#821D30', '#E8863A', '#5B9A59', '#4285F4', '#D4712A', '#666'
                                                ][index % 6]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 15 }}>
                                    {shopTypeAnalytics.slice(0, 4).map((s, i) => (
                                        <div key={s.type} style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: 2, background: ['#821D30', '#E8863A', '#5B9A59', '#4285F4'][i] }}></div>
                                            <span style={{ textTransform: 'capitalize' }}>{s.type}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="card anim-slide-up" style={{ padding: 20, background: 'linear-gradient(135deg, var(--color-maroon), #4a101b)', color: 'white', borderRadius: 24 }}>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Star Performer</div>
                                <h3 style={{ margin: '5px 0', textTransform: 'capitalize' }}>
                                    {shopTypeAnalytics.sort((a,b) => b.collected - a.collected)[0]?.type || 'N/A'}
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>
                                    This category contributes the highest revenue this quarter.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
