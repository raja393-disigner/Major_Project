import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
    FiBarChart2, FiActivity, FiTrendingUp, FiCreditCard, 
    FiCheckCircle, FiAlertCircle, FiInfo 
} from 'react-icons/fi'
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts'
import api from '../../lib/api'

export default function UserDashboard() {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalPaid: 0,
        totalPending: 0,
        efficiency: 0,
        penaltyAmount: 0,
    })
    const [chartData, setChartData] = useState([])
    const [pieData, setPieData] = useState([])

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true)
                const { data } = await api.get('/taxpayers/taxes')
                if (data.success) {
                    const taxes = data.taxes
                    
                    // 1. Calculate Stats
                    const paid = taxes.filter(t => t.status === 'paid')
                    const totalPaid = paid.reduce((s, t) => s + (t.amount + (t.penalty || 0)), 0)
                    const pending = taxes.filter(t => t.status !== 'paid')
                    const totalPending = pending.reduce((s, t) => s + (t.amount + (t.penalty || 0)), 0)
                    const penaltyAmount = taxes.reduce((s, t) => s + (t.penalty || 0), 0)
                    const efficiency = taxes.length > 0 ? (paid.length / taxes.length) * 100 : 0

                    setStats({ totalPaid, totalPending, efficiency, penaltyAmount })

                    // 2. Prepare Chart Data (Monthly Trend)
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    const currentYear = 2026
                    const monthlyData = months.map((name, index) => {
                        const monthIdx = index + 1
                        const record = taxes.find(t => t.month === monthIdx && t.year === currentYear)
                        return {
                            name,
                            amount: record ? record.amount : 0,
                            paid: (record && record.status === 'paid') ? record.amount : 0,
                            penalty: record ? (record.penalty || 0) : 0
                        }
                    })
                    setChartData(monthlyData)

                    // 3. Prepare Pie Data
                    setPieData([
                        { name: 'Paid', value: totalPaid, color: 'var(--color-green)' },
                        { name: 'Pending', value: totalPending, color: 'var(--color-maroon)' }
                    ])
                }
            } catch (err) {
                console.error("Dashboard Fetch Error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchDashboardData()
    }, [])

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
                <div className="loader" style={{ width: 50, height: 50 }}></div>
                <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Preparing your analytics dashboard...</p>
            </div>
        )
    }

    return (
        <div className="anim-fade">
            <div className="page-header" style={{ marginBottom: 30 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: 'var(--color-maroon)', color: 'white', padding: 10, borderRadius: 12 }}>
                        <FiBarChart2 size={24} />
                    </div>
                    <div>
                        <h2>Personal Tax Analytics</h2>
                        <p>Detailed breakdown of your tax contributions and compliance</p>
                    </div>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid-4" style={{ marginBottom: 32 }}>
                <div className="stat-card hover-lift" style={{ borderTop: '4px solid var(--color-green)' }}>
                    <div className="stat-icon" style={{ background: 'var(--color-green-light)', color: 'var(--color-green)' }}>
                        <FiCheckCircle size={20} />
                    </div>
                    <div className="stat-info">
                        <p>Lifetime Paid</p>
                        <h3>₹{stats.totalPaid.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="stat-card hover-lift" style={{ borderTop: '4px solid var(--color-maroon)' }}>
                    <div className="stat-icon" style={{ background: 'var(--color-maroon-light)', color: 'var(--color-maroon)' }}>
                        <FiAlertCircle size={20} />
                    </div>
                    <div className="stat-info">
                        <p>Total Pending</p>
                        <h3>₹{stats.totalPending.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="stat-card hover-lift" style={{ borderTop: '4px solid var(--color-saffron)' }}>
                    <div className="stat-icon" style={{ background: 'rgba(232,134,58,0.1)', color: 'var(--color-saffron)' }}>
                        <FiActivity size={20} />
                    </div>
                    <div className="stat-info">
                        <p>Compliance Rate</p>
                        <h3>{Math.round(stats.efficiency)}%</h3>
                    </div>
                </div>

                <div className="stat-card hover-lift" style={{ borderTop: '4px solid #4285F4' }}>
                    <div className="stat-icon" style={{ background: 'rgba(66,133,244,0.1)', color: '#4285F4' }}>
                        <FiTrendingUp size={20} />
                    </div>
                    <div className="stat-info">
                        <p>Total Penalty Paid</p>
                        <h3 style={{ color: 'var(--color-maroon)' }}>₹{stats.penaltyAmount.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, marginBottom: 32 }}>
                <div className="card">
                    <h4 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiActivity color="var(--color-maroon)" /> Monthly Tax Contribution (2026)
                    </h4>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(130,29,48,0.05)' }}
                                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="paid" name="Paid Amount" fill="var(--color-green)" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="penalty" name="Penalty" fill="var(--color-maroon)" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h4 style={{ marginBottom: 20 }}>Payment Composition</h4>
                    <div style={{ height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 10 }}>
                        {pieData.map(d => (
                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }}></div>
                                <span>{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Smart Tips Context */}
            <div className="alert alert-info" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <FiInfo size={24} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                    <h5 style={{ marginBottom: 4 }}>Smart Tax Tip</h5>
                    <p style={{ margin: 0, opacity: 0.9 }}>
                        {stats.penaltyAmount > 0 
                            ? `You've paid ₹${stats.penaltyAmount} in penalties this year. Set up a reminder for the 10th of every month to save on late fees!`
                            : `Outstanding! You have maintained a 100% compliance rate with zero penalties. You are a star taxpayer of Uttarakhand.`
                        }
                    </p>
                </div>
            </div>
        </div>
    )
}
