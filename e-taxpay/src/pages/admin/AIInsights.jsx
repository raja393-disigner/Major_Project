import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiCpu, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiLoader, FiMail, FiBarChart, FiZap, FiTarget, FiAward } from 'react-icons/fi'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../../lib/api'

export default function AIInsights() {
    const { t } = useTranslation()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedMetric, setSelectedMetric] = useState('forecast') // 'forecast' or 'compliance'

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const response = await api.get('/ai/insights')
                if (response.data.success) {
                    setData(response.data)
                }
            } catch (error) {
                console.error('Error fetching AI insights:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchInsights()
    }, [])

    if (loading) return (
        <div style={{ textAlign: 'center', padding: 100 }}>
            <FiLoader className="spin" size={48} color="var(--color-maroon)" />
            <h4 style={{ marginTop: 20 }}>Processing District Big Data...</h4>
        </div>
    )

    const forecast = data?.forecast || {}
    const suggestions = data?.suggestions || []
    const trendData = data?.trendData || []

    const complianceData = [
        { name: 'Paid', value: forecast.paidCount || 0, color: 'var(--color-green)' },
        { name: 'Unpaid', value: forecast.unpaidCount || 0, color: 'var(--color-maroon)' }
    ]

    const leaderboard = data?.leaderboard || []

    return (
        <div className="anim-fade">
            {/* ... previous header and cards code ... */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Header content unchanged */}
                <div>
                    <h2><FiCpu style={{ marginBottom: -4, marginRight: 8 }} /> AI Analytics & Forecast</h2>
                    <p>Financial predictive modelling for your district's tax collection</p>
                </div>
                <div className="badge badge-success" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                    <FiZap style={{ marginRight: 6 }} /> Engine Active
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
                {/* Stats cards unchanged (forecast, compliance, recommendation) */}
                <div 
                    className={`card hover-lift ${selectedMetric === 'forecast' ? 'active-metric' : ''}`} 
                    style={{ 
                        borderLeft: '4px solid var(--color-green)', 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: selectedMetric === 'forecast' ? '0 8px 30px rgba(91, 154, 89, 0.15)' : ''
                    }}
                    onClick={() => setSelectedMetric('forecast')}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Estimated Collection (Apr)</span>
                        <FiTrendingUp color="var(--color-green)" size={20} />
                    </div>
                    <h2 style={{ fontSize: '2.4rem', marginBottom: 8, color: 'var(--color-green)' }}>₹{forecast.predictedNextMonth?.toLocaleString('en-IN')}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
                        <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '4px',
                            background: forecast.growthTrend > 0 ? '#5B9A5920' : '#821D3020',
                            color: forecast.growthTrend > 0 ? 'var(--color-green)' : 'var(--color-maroon)',
                            fontWeight: 700
                        }}>
                            {forecast.growthTrend > 0 ? '+' : ''}{Math.round(forecast.growthTrend * 100)}%
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>Predicted growth trend</span>
                    </div>
                    {selectedMetric === 'forecast' && <div className="indicator-dot green" />}
                </div>

                <div 
                    className={`card hover-lift ${selectedMetric === 'compliance' ? 'active-metric' : ''}`} 
                    style={{ 
                        borderLeft: '4px solid var(--color-saffron)', 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: selectedMetric === 'compliance' ? '0 8px 30px rgba(244, 161, 89, 0.15)' : ''
                    }}
                    onClick={() => setSelectedMetric('compliance')}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>District Compliance</span>
                        <FiTarget color="var(--color-saffron)" size={20} />
                    </div>
                    <h2 style={{ fontSize: '2.4rem', marginBottom: 8 }}>{forecast.efficiency}%</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
                        <span className={`badge badge-${forecast.confidence === 'High' ? 'success' : 'info'}`}>
                            {forecast.confidence} Precision
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>Based on current month</span>
                    </div>
                    {selectedMetric === 'compliance' && <div className="indicator-dot saffron" />}
                </div>

                <div 
                    className="card anim-scale-in" 
                    style={{ 
                        background: 'linear-gradient(135deg, var(--color-maroon), #4a101d)', 
                        color: 'white',
                        border: 'none',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <FiZap color="var(--color-saffron)" size={18} />
                            <span style={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>AI RECOMMENDATION</span>
                        </div>
                        <p style={{ fontSize: '0.95rem', lineHeight: '1.5', margin: 0, fontWeight: 300, fontStyle: 'italic' }}>
                            "{data.recommendation}"
                        </p>
                    </div>
                    <FiCpu size={80} style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.1, color: 'white' }} />
                </div>
            </div>

            {/* Dynamic Chart Section */}
            <div className="card" style={{ marginBottom: 24, padding: 24 }}>
                <h4 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                    {selectedMetric === 'forecast' ? (
                        <><FiBarChart color="var(--color-maroon)" /> Monthly Collection Trend & Forecast</>
                    ) : (
                        <><FiTarget color="var(--color-maroon)" /> Paid vs Unpaid Status Analysis (Mar)</>
                    )}
                </h4>
                
                <div style={{ height: 350, width: '100%' }}>
                    {selectedMetric === 'forecast' ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorCol" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-maroon)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--color-maroon)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 13}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 13}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                    cursor={{ stroke: 'var(--color-maroon)', strokeWidth: 2 }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="collection" 
                                    stroke="var(--color-maroon)" 
                                    fillOpacity={1} 
                                    fill="url(#colorCol)" 
                                    strokeWidth={3}
                                    animationDuration={1500}
                                />
                                <ReferenceLine x="Mar" stroke="var(--color-saffron)" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: 'var(--color-saffron)', fontSize: 11 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={complianceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                    animationDuration={1500}
                                >
                                    {complianceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
                {/* Clean Block Leaderboard - EXCLUSIVE TOP 3 */}
                <div className="card" style={{ padding: 24, background: 'var(--color-bg-light)', borderTop: '5px solid var(--color-saffron)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ background: 'var(--color-saffron)20', padding: 10, borderRadius: 12 }}>
                                <FiAward color="var(--color-saffron)" size={24} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>District Top 3 Blocks 🏆</h3>
                        </div>
                        <div className="badge badge-info" style={{ fontSize: '0.75rem' }}>Exclusive Rankings</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 25 }}>
                        {leaderboard.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#999' }}>Calculating final rankings...</p>
                        ) : (
                            leaderboard.slice(0, 3).map((block, idx) => (
                                <div key={idx} className={`podium-card rank-${idx + 1}`} style={{
                                    padding: '20px',
                                    background: idx === 0 ? 'white' : 'rgba(255,255,255,0.4)',
                                    borderRadius: '20px',
                                    boxShadow: idx === 0 ? '0 10px 30px rgba(244, 161, 89, 0.1)' : 'none',
                                    border: idx === 0 ? '2px solid var(--color-saffron)30' : '1px solid #eee',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Number Rank Badge */}
                                    <div style={{ 
                                        position: 'absolute', right: -10, top: -10,
                                        width: 80, height: 80,
                                        background: idx === 0 ? 'var(--color-saffron)10' : '#eee',
                                        borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        zIndex: 0
                                    }}>
                                        <span style={{ fontSize: '3rem', fontWeight: 900, color: idx === 0 ? 'var(--color-saffron)' : '#ddd', opacity: 0.5 }}>{idx + 1}</span>
                                    </div>

                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 15 }}>
                                            <div style={{ 
                                                width: 44, height: 44, 
                                                borderRadius: '12px', 
                                                background: idx === 0 ? 'var(--color-saffron)' : (idx === 1 ? '#adb5bd' : '#cd7f32'),
                                                color: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.2rem', fontWeight: 900,
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                            }}>
                                                {idx === 0 ? <FiAward /> : (idx + 1)}
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '1.2rem', color: idx === 0 ? 'var(--color-maroon)' : '#333' }}>{block.blockName}</h4>
                                                <span style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                    {idx === 0 ? '🥇 Unbeatable Performance' : (idx === 1 ? '🥈 Excellent Growth' : '🥉 High Compliance')}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: 12 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Efficiency Score</span>
                                                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-green)' }}>{block.compliancePercentage}%</span>
                                            </div>
                                            <div style={{ height: 10, background: '#f1f3f5', borderRadius: 5, overflow: 'hidden' }}>
                                                <div style={{ 
                                                    width: `${block.compliancePercentage}%`, 
                                                    height: '100%', 
                                                    background: idx === 0 ? 'linear-gradient(90deg, var(--color-saffron), #ff9800)' : 'var(--color-green)',
                                                    borderRadius: 5,
                                                    transition: 'width 2s ease-out'
                                                }} />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                             <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                                <b>{block.paidShops}</b> / {block.totalShops} shops paid
                                             </div>
                                             {idx === 0 && (
                                                <div style={{ color: 'var(--color-saffron)', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: '0.8rem' }}>
                                                    <FiZap size={14} /> District Medal
                                                </div>
                                             )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {leaderboard.length > 3 && (
                        <p style={{ textAlign: 'center', marginTop: 20, color: '#888', fontSize: '0.8rem' }}>
                            And {(leaderboard.length - 3)} other blocks are striving for the top...
                        </p>
                    )}
                </div>

                {/* Critical Defaulters Suggestions */}
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                        <div style={{ background: 'var(--color-maroon)15', padding: 8, borderRadius: 8 }}>
                            <FiAlertCircle color="var(--color-maroon)" size={20} />
                        </div>
                        <h3 style={{ margin: 0 }}>Smart Action Items</h3>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                        {suggestions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 40, background: '#f8f9fa', borderRadius: 12 }}>
                                <FiCheckCircle color="var(--color-green)" size={40} style={{ opacity: 0.5 }} />
                                <p style={{ marginTop: 10, color: '#666' }}>No critical issues found today.</p>
                            </div>
                        ) : (
                            suggestions.map((s, idx) => (
                                <div key={idx} style={{ 
                                    padding: '12px 16px', 
                                    background: '#f8f9fa', 
                                    borderRadius: 12, 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    border: '1px solid #edf2f7'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.username}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>GST: {s.gst}</div>
                                        <div style={{ marginTop: 5 }}>
                                            <span className="badge badge-maroon" style={{ fontSize: '0.65rem' }}>{s.unpaidCount} Mos Pending</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 800, color: 'var(--color-maroon)', marginBottom: 8 }}>₹{s.totalPending.toLocaleString()}</div>
                                        <button className="btn btn-primary btn-sm" onClick={() => window.location.href = '/admin/notices'} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                                            Remind
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
