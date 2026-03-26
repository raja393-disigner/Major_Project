import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiUsers, FiCheckCircle, FiXCircle, FiDollarSign, FiActivity, FiTrendingUp, FiZap, FiShield, FiClock, FiBriefcase } from 'react-icons/fi'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts'
import api from '../../lib/api'

export default function Dashboard() {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(true)
    const [metrics, setMetrics] = useState({
        totalUsers: 0,
        paidShops: 0,
        unpaidShops: 0,
        totalTaxesCollected: 0,
        activeSessions: 0
    })
    const [blockData, setBlockData] = useState([])
    const [shopTypeData, setShopTypeData] = useState([])
    const [monthlyData, setMonthlyData] = useState([])
    const [recentPayments, setRecentPayments] = useState([])
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const metricsRes = await api.get('/admin/metrics');
                if (metricsRes.data.success) setMetrics(metricsRes.data.metrics);

                const statsRes = await api.get('/admin/stats');
                if (statsRes.data.success) {
                    setBlockData(statsRes.data.blockData);
                    setShopTypeData(statsRes.data.shopTypeData);
                    setMonthlyData(statsRes.data.monthlyData);
                    setRecentPayments(statsRes.data.recentPayments);
                }
            } catch (error) { console.error("Failed to fetch dashboard data", error); } finally { setLoading(false); }
        };
        fetchDashboardData();
    }, []);

    const COLORS = ['var(--color-maroon)', 'var(--color-saffron)', 'var(--color-green)', '#4285F4', '#9C27B0'];

    if (loading) return (
        <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
            <div className="loader"></div>
            <p style={{ color: 'var(--color-maroon)', fontWeight: 700, letterSpacing: 1 }}>SYNCHRONIZING SECURE COMMAND CENTER...</p>
        </div>
    );

    return (
        <div className="anim-fade">
            {/* War Room Header */}
            <div className="page-header" style={{ marginBottom: 35, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '20px 25px', borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-maroon)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>
                        <FiZap /> System Live Pulse
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Welcome back, Chief Admin</h2>
                    <p style={{ margin: 0, color: '#888' }}>Monitoring tax flow across {blockData.length} administrative blocks</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-maroon)', letterSpacing: 1, fontFamily: 'monospace' }}>
                        {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>
                        {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* High Impact Pulse Cards - Hyper Interactive */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 25, marginBottom: 35 }}>
                {[
                    { label: 'Total Entities', val: metrics.totalUsers, icon: <FiUsers />, color: '#4285F4', growth: '+5.2%', id: 'entities' },
                    { label: 'Compliant Shops', val: metrics.paidShops, icon: <FiCheckCircle />, color: 'var(--color-green)', growth: '+8.1%', id: 'compliant' },
                    { label: 'Defaulters', val: metrics.unpaidShops, icon: <FiXCircle />, color: 'var(--color-maroon)', growth: '-2.4%', id: 'defaulters' },
                    { label: 'Revenue Pulse', val: `₹${metrics.totalTaxesCollected.toLocaleString()}`, icon: <FiDollarSign />, color: 'var(--color-saffron)', growth: '+14.6%', id: 'revenue' }
                ].map((s, i) => (
                    <div 
                        key={i} 
                        className="card anim-slide-up dashboard-stat-card" 
                        style={{ 
                            padding: 28, borderRadius: 32, position: 'relative', overflow: 'hidden', 
                            animationDelay: `${i * 0.15}s`, background: 'white', border: '1px solid #f0f0f0',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            '--hover-color': s.color
                        }}
                    >
                        {/* Interactive Background Glow */}
                        <div className="card-glow" style={{ 
                            position: 'absolute', top: '-50%', right: '-50%', width: '100%', height: '100%',
                            background: `radial-gradient(circle, ${s.color}10 0%, transparent 70%)`,
                            transition: '0.5s', zIndex: 0
                        }}></div>

                        {/* Large Background Icon */}
                        <div style={{ position: 'absolute', top: -10, right: -10, fontSize: '6rem', opacity: 0.04, color: s.color, transition: '0.4s' }} className="bg-icon-anim">
                            {s.icon}
                        </div>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <div className="stat-icon-box" style={{ 
                                    width: 52, height: 52, borderRadius: 16, background: `${s.color}12`, color: s.color, 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                                    transition: '0.3s'
                                }}>
                                    {s.icon}
                                </div>
                                <div className="growth-badge" style={{ 
                                    fontSize: '0.75rem', fontWeight: 800, color: s.growth.startsWith('+') ? 'var(--color-green)' : 'var(--color-maroon)', 
                                    background: s.growth.startsWith('+') ? '#5B9A5912' : '#821D3012', 
                                    padding: '6px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 5,
                                    animation: 'floatAnim 3s ease-in-out infinite'
                                }}>
                                    <FiTrendingUp size={12} /> {s.growth}
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1a1a1a', letterSpacing: -0.5 }}>{s.val}</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
                <style>{`
                    .dashboard-stat-card:hover { 
                        transform: translateY(-10px);
                        box-shadow: 0 20px 40px rgba(0,0,0,0.06);
                    }
                    .dashboard-stat-card:hover .card-glow { top: -20% !important; right: -20% !important; opacity: 1 !important; }
                    .dashboard-stat-card:hover .stat-icon-box { transform: scale(1.1) rotate(5deg); background: var(--hover-color) !important; color: white !important; }
                    .dashboard-stat-card:hover .bg-icon-anim { transform: scale(1.2) rotate(-10deg); opacity: 0.1 !important; }
                `}</style>
            </div>

            {/* Primary Strategic Row */}
            <div className="grid-2" style={{ gap: 25, marginBottom: 35 }}>
                {/* Revenue Velocity Chart */}
                <div className="card anim-zoom" style={{ padding: 30, borderRadius: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FiTrendingUp color="var(--color-maroon)" /> Monthly Collection Velocity
                        </h4>
                        <select style={{ border: 'none', background: '#f8f9fa', padding: '6px 12px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700 }}>
                            <option>Fiscal Year 2026</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={monthlyData}>
                            <defs>
                                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-maroon)" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="var(--color-maroon)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#aaa' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#aaa' }} />
                            <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="amount" stroke="var(--color-maroon)" strokeWidth={4} fillOpacity={1} fill="url(#colorAmt)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Regional Performance Distribution */}
                <div className="card anim-zoom" style={{ padding: 30, borderRadius: 32, animationDelay: '0.1s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FiShield color="var(--color-saffron)" /> Block Performance Index
                        </h4>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-green)' }}>Top: {blockData[0]?.name}</div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={blockData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#aaa' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#aaa' }} />
                            <Tooltip cursor={{ fill: '#f8f9fa' }} contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="paid" fill="var(--color-green)" radius={[6, 6, 0, 0]} barSize={20} />
                            <Bar dataKey="unpaid" fill="var(--color-maroon)" radius={[6, 6, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Live Surveillance Row */}
            <div className="grid-2" style={{ gap: 25, marginBottom: 35 }}>
                {/* Real-time Collections Feed */}
                <div className="card" style={{ padding: 30, borderRadius: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FiActivity color="var(--color-green)" /> Recent Transactions
                        </h4>
                        <span style={{ fontSize: '0.7rem', color: '#999', fontWeight: 600 }}>LIVE FEED</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                        {recentPayments.slice(0, 5).map((p, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 15, padding: '12px 0', borderBottom: i < 4 ? '1px solid #f8f9fa' : 'none' }}>
                                <div style={{ width: 40, height: 40, background: '#f8f9fa', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--color-maroon)' }}>
                                    {p.user[0]}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#333' }}>{p.user}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#999' }}>GSTIN: {p.gst}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--color-green)' }}>₹{p.amount.toLocaleString()}</div>
                                    <div style={{ fontSize: '0.65rem', color: '#ccc', display: 'flex', alignItems: 'center', gap: 3 }}><FiClock size={10} /> {p.date}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Business Type Composition - Advanced Interactive Donut */}
                <div className="card anim-zoom" style={{ padding: 30, borderRadius: 32, animationDelay: '0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FiBriefcase color="var(--color-saffron)" /> Shop Type-wise Distribution
                        </h4>
                        <span style={{ fontSize: '0.7rem', color: '#999', fontWeight: 600 }}>MARKET SEGMENTATION</span>
                    </div>
                    <div style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={shopTypeData} 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={55} 
                                    outerRadius={85} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                    stroke="none"
                                    label={({ name, value, cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                        const RADIAN = Math.PI / 180;
                                        const sin = Math.sin(-RADIAN * midAngle);
                                        const cos = Math.cos(-RADIAN * midAngle);
                                        const sx = cx + (outerRadius + 10) * cos;
                                        const sy = cy + (outerRadius + 10) * sin;
                                        const mx = cx + (outerRadius + 25) * cos;
                                        const my = cy + (outerRadius + 25) * sin;
                                        const ex = mx + (cos >= 0 ? 1 : -1) * 22;
                                        const ey = my;
                                        const textAnchor = cos >= 0 ? 'start' : 'end';
                                        const color = COLORS[index % COLORS.length];

                                        return (
                                            <g>
                                                <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={color} fill="none" strokeWidth={1.5} />
                                                <circle cx={ex} cy={ey} r={2} fill={color} stroke="none" />
                                                <text 
                                                    x={ex + (cos >= 0 ? 1 : -1) * 12} 
                                                    y={ey} 
                                                    textAnchor={textAnchor} 
                                                    fill={color} 
                                                    style={{ fontSize: '0.8rem', fontWeight: 700 }}
                                                    dominantBaseline="central"
                                                >
                                                    {`${name} (${value}%)`}
                                                </text>
                                            </g>
                                        );
                                    }}
                                >
                                    {shopTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                                    formatter={(value, name) => [`${value}% Share`, name]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
