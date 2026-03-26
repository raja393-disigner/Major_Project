import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiCpu, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiLoader, FiZap, FiTarget, FiAward, FiActivity, FiGlobe, FiShield, FiHexagon, FiBriefcase } from 'react-icons/fi'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../../lib/api'

export default function AIInsights() {
    const { t } = useTranslation()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedMetric, setSelectedMetric] = useState('forecast')

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const response = await api.get('/ai/insights')
                if (response.data.success) setData(response.data)
            } catch (error) { console.error('Error fetching AI insights:', error) } finally { setLoading(false) }
        }
        fetchInsights()
    }, [])

    if (loading) return (
        <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
            <div className="loader"></div>
            <p style={{ color: 'var(--color-maroon)', fontWeight: 700, letterSpacing: 2, fontSize: '0.8rem' }}>NEURAL ENGINE INITIALIZING...</p>
        </div>
    )

    const forecast = data?.forecast || {}
    const suggestions = data?.suggestions || []
    const trendData = data?.trendData || []
    const complianceData = [
        { name: 'Compliant', value: forecast.paidCount || 0, color: 'var(--color-green)' },
        { name: 'Defaulters', value: forecast.unpaidCount || 0, color: 'var(--color-maroon)' }
    ]
    const leaderboard = data?.leaderboard || []

    const COLORS = ['var(--color-maroon)', 'var(--color-saffron)', 'var(--color-green)', '#4285F4', '#9C27B0'];

    return (
        <div className="anim-fade">
            {/* AI Core Header */}
            <div className="page-header" style={{ 
                marginBottom: 35, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'linear-gradient(135deg, white 0%, #f8f9fa 100%)', padding: '25px 30px', borderRadius: 28,
                border: '1px solid #f0f0f0', position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.03 }}><FiHexagon size={180} /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ 
                        width: 65, height: 65, borderRadius: 20, background: 'var(--color-maroon)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        boxShadow: '0 10px 25px rgba(130, 29, 48, 0.2)', position: 'relative'
                    }}>
                        <FiCpu color="white" size={32} />
                        <div className="pulse" style={{ position: 'absolute', top: -5, right: -5, width: 15, height: 15, background: 'var(--color-green)', borderRadius: '50%', border: '3px solid white' }}></div>
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                            Neural Intelligence Terminal
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
                            <span style={{ fontSize: '0.8rem', color: '#888', letterSpacing: 1 }}>AUTO-ADAPTIVE PREDICTIVE ENGINE V2.0</span>
                            <div style={{ height: 4, width: 4, borderRadius: '50%', background: '#ccc' }}></div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-green)', fontWeight: 800 }}>LIVE ANALYSIS</span>
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', gap: 15 }}>
                    <div style={{ background: '#f0f0f0', padding: '10px 20px', borderRadius: 16 }}>
                        <div style={{ fontSize: '0.65rem', color: '#999', fontWeight: 800, textTransform: 'uppercase' }}>Data Confidence</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-maroon)' }}>98.4%</div>
                    </div>
                </div>
            </div>

            {/* Predictive Intelligence Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 25, marginBottom: 35 }}>
                <div 
                    className={`card hover-lift ${selectedMetric === 'forecast' ? 'active-metric' : ''}`} 
                    style={{ 
                        padding: 30, borderRadius: 32, cursor: 'pointer', transition: '0.4s',
                        border: selectedMetric === 'forecast' ? '2px solid var(--color-green)' : '2px solid transparent',
                        background: 'white'
                    }}
                    onClick={() => setSelectedMetric('forecast')}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div style={{ width: 45, height: 45, background: '#5B9A5915', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-green)' }}>
                            <FiTrendingUp size={20} />
                        </div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-green)', background: '#5B9A5915', padding: '5px 12px', borderRadius: 8 }}>PREDICTED</div>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#999' }}>ESTIMATED COLLECTION (NEXT MONTH)</span>
                    <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#222', margin: '10px 0' }}>₹{forecast.predictedNextMonth?.toLocaleString('en-IN')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-green)' }}>{forecast.growthTrend > 0 ? '+' : ''}{Math.round(forecast.growthTrend * 100)}% Momentum</div>
                        <div style={{ flex: 1, height: 4, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: '85%', height: '100%', background: 'var(--color-green)', borderRadius: 2 }}></div>
                        </div>
                    </div>
                </div>

                <div 
                    className={`card hover-lift ${selectedMetric === 'compliance' ? 'active-metric' : ''}`} 
                    style={{ 
                        padding: 30, borderRadius: 32, cursor: 'pointer', transition: '0.4s',
                        border: selectedMetric === 'compliance' ? '2px solid var(--color-saffron)' : '2px solid transparent',
                        background: 'white'
                    }}
                    onClick={() => setSelectedMetric('compliance')}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div style={{ width: 45, height: 45, background: '#E8863A15', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-saffron)' }}>
                            <FiTarget size={20} />
                        </div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-saffron)', background: '#E8863A15', padding: '5px 12px', borderRadius: 8 }}>PRECISION</div>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#999' }}>DISTRICT COMPLIANCE SCORE</span>
                    <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#222', margin: '10px 0' }}>{forecast.efficiency}%</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`badge badge-${forecast.confidence === 'High' ? 'success' : 'info'}`} style={{ padding: '6px 12px', borderRadius: 10 }}>
                            {forecast.confidence} Confidence Level
                        </span>
                    </div>
                </div>

                <div className="card" style={{ 
                    padding: 30, borderRadius: 32, background: 'var(--color-maroon)', color: 'white', position: 'relative', overflow: 'hidden' 
                }}>
                    <div style={{ position: 'absolute', right: -30, top: -30, opacity: 0.1 }}><FiZap size={150} /></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-saffron)', fontWeight: 800, fontSize: '0.75rem', letterSpacing: 1.5, marginBottom: 15 }}>
                        <FiGlobe /> NEURAL ADVISORY
                    </div>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.6, fontStyle: 'italic', zIndex: 1, position: 'relative' }}>
                        "{data?.recommendation}"
                    </p>
                    <div style={{ marginTop: 25, display: 'flex', gap: 15 }}>
                        <div style={{ height: 2, flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 1, marginTop: 10 }}></div>
                        <FiCpu size={24} style={{ opacity: 0.5 }} />
                    </div>
                </div>
            </div>

            {/* Core Visualization Engine */}
            <div className="grid-2" style={{ gap: 25, marginBottom: 35 }}>
                <div className="card" style={{ padding: 35, borderRadius: 36 }}>
                    <h4 style={{ margin: '0 0 30px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                        {selectedMetric === 'forecast' ? (
                            <><FiActivity color="var(--color-maroon)" /> Strategic Revenue Forecast</>
                        ) : (
                            <><FiShield color="var(--color-maroon)" /> Compliance Distribution Matrix</>
                        )}
                    </h4>
                    
                    <div style={{ height: 350 }}>
                        {selectedMetric === 'forecast' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorCore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-maroon)" stopOpacity={0.25}/>
                                            <stop offset="95%" stopColor="var(--color-maroon)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#aaa', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#aaa', fontSize: 12}} />
                                    <Tooltip contentStyle={{ borderRadius: 20, border: 'none', boxShadow: '0 15px 40px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="collection" stroke="var(--color-maroon)" strokeWidth={4} fill="url(#colorCore)" />
                                    <ReferenceLine x="Mar" stroke="var(--color-saffron)" strokeDasharray="4 4" label={{ value: 'CURRENT', fill: 'var(--color-saffron)', fontWeight: 800, fontSize: 10 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={complianceData} cx="50%" cy="50%" innerRadius={85} outerRadius={120} paddingAngle={8} dataKey="value" stroke="none">
                                        {complianceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: 20, border: 'none' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="card" style={{ padding: 35, borderRadius: 36 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                        <h3 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <FiAward color="var(--color-saffron)" /> District Standings 🏆
                        </h3>
                        <span className="badge" style={{ background: '#f8f9fa', color: '#888' }}>Real-time Ranking</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {leaderboard.slice(0, 3).map((block, idx) => (
                            <div key={idx} style={{ 
                                padding: 22, borderRadius: 24, border: '1px solid #f0f0f0', position: 'relative',
                                background: idx === 0 ? 'rgba(130, 29, 48, 0.02)' : 'white',
                                boxShadow: idx === 0 ? '0 10px 25px rgba(0,0,0,0.02)' : 'none',
                                transition: '0.3s'
                             }} className="hover-lift">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                                    <div style={{ 
                                        width: 50, height: 50, borderRadius: 16, fontSize: '1.2rem', fontWeight: 900,
                                        background: idx === 0 ? 'var(--color-saffron)' : (idx === 1 ? '#adb5bd' : '#cd7f32'),
                                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                    }}>
                                        {idx + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{block.blockName}</h4>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-green)' }}>{block.compliancePercentage}%</span>
                                        </div>
                                        <div style={{ height: 10, background: '#f8f9fa', borderRadius: 5, overflow: 'hidden' }}>
                                            <div style={{ width: `${block.compliancePercentage}%`, height: '100%', background: 'var(--color-green)', borderRadius: 5, transition: '2s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: '0.75rem', color: '#999', fontWeight: 600 }}>
                                            <span>{block.paidShops} COMPLIANT ENTITIES</span>
                                            <span>TOP PERFORMANCE</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Smart Action Engine */}
            <div className="card" style={{ padding: 35, borderRadius: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
                    <div style={{ width: 40, height: 40, background: 'rgba(130, 29, 48, 0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-maroon)' }}>
                        <FiAlertCircle size={22} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Defaulter Neutralization Suggestions</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#999' }}>AI pinpointed targets for immediate administrative intervention</p>
                    </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                    {suggestions.map((s, idx) => (
                        <div key={idx} style={{ padding: 22, background: '#fcfcfc', borderRadius: 24, border: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#333' }}>{s.username}</div>
                                <div style={{ fontSize: '0.7rem', color: '#aaa', marginTop: 4 }}>REVENUE RISK: ₹{s.totalPending.toLocaleString()}</div>
                                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 800, background: 'rgba(130, 29, 48, 0.15)', color: 'var(--color-maroon)', padding: '4px 10px', borderRadius: 6 }}>{s.unpaidCount} MOS DELAY</span>
                                </div>
                            </div>
                            <button className="btn btn-primary btn-sm" style={{ borderRadius: 10, padding: '8px 20px', fontWeight: 700 }}>Initiate Notice</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
