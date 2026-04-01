import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
    FiBarChart2, FiActivity, FiTrendingUp, FiCheckCircle, FiAlertCircle, FiInfo, 
    FiDownloadCloud, FiAward, FiLock, FiShield
} from 'react-icons/fi'
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import jsPDF from 'jspdf'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const getAdminName = (dist) => {
    const admins = {
        'ALMORA': 'Raja',
        'DEHRADUN': 'Rahul',
        'HARIDWAR': 'Amit',
        'NAINITAL': 'Priya'
    };
    return admins[dist] || 'Raja';
};

export default function UserDashboard() {
    const { t } = useTranslation()
    const { user } = useAuth()
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
                    
                    const currentDate = new Date();
                    const currentM = currentDate.getMonth() + 1;
                    const currentY = currentDate.getFullYear();

                    // 1. Calculate Stats
                    const paid = taxes.filter(t => t.status === 'paid')
                    const totalPaid = paid.reduce((s, t) => s + (t.amount + (t.penalty || 0)), 0)
                    
                    // Only count as pending if the due month is less than or equal to current month
                    const pending = taxes.filter(t => t.status !== 'paid' && (t.year < currentY || (t.year === currentY && t.month <= currentM)))
                    const totalPending = pending.reduce((s, t) => s + (t.amount + (t.penalty || 0)), 0)
                    
                    const penaltyAmount = taxes.reduce((s, t) => s + (t.penalty || 0), 0)
                    
                    // Efficiency should also only check due taxes
                    const dueTaxes = taxes.filter(t => t.year < currentY || (t.year === currentY && t.month <= currentM))
                    const duePaid = dueTaxes.filter(t => t.status === 'paid')
                    const efficiency = dueTaxes.length > 0 ? (duePaid.length / dueTaxes.length) * 100 : 0

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
                            pending: (record && record.status !== 'paid') ? record.amount : 0,
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
// ... SKIP lines to chart ...
    // Note: I will replace the whole return block up to the pie chart
    const generateNOC = () => {
        if (stats.totalPending > 0) {
            alert("Please clear all pending dues to unlock your No Dues Certificate.");
            return;
        }

        const doc = new jsPDF();
        const district = (user?.district || 'Almora').toUpperCase();
        const userName = user?.name || 'Taxpayer';
        const adminName = getAdminName(district);
        const dateStr = new Date().toLocaleDateString('en-GB');
        const refNo = `UK-NOC/${new Date().getFullYear()}/CLEAR-${Math.floor(Math.random() * 90000) + 10000}`;

        // Border
        doc.setDrawColor(46, 125, 50); // Green
        doc.setLineWidth(3);
        doc.rect(10, 10, 190, 277);
        doc.setLineWidth(0.5);
        doc.rect(12, 12, 186, 273);

        // Watermark
        doc.setTextColor(240, 248, 240);
        doc.setFontSize(70);
        doc.setFont('helvetica', 'bold');
        doc.text('CLEARED', 105, 150, { align: 'center', angle: -45 });

        // Header
        doc.setTextColor(46, 125, 50);
        doc.setFontSize(26);
        doc.text('NO DUES CERTIFICATE', 105, 30, { align: 'center' });
        
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Zila Panchayat Office, ${district}`, 105, 38, { align: 'center' });
        doc.text('Government of Uttarakhand | Department of Revenue', 105, 45, { align: 'center' });

        doc.setDrawColor(46, 125, 50);
        doc.setLineWidth(1);
        doc.line(20, 52, 190, 52);

        // Meta info
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Certificate No: ${refNo}`, 20, 65);
        doc.text(`Date of Issue: ${dateStr}`, 190, 65, { align: 'right' });

        // Body Text
        doc.setFont('times', 'normal');
        doc.setFontSize(14);
        const lines = [
            `This is to certify that Mr./Ms. ${userName}, a registered taxpayer under the jurisdiction of Zila Panchayat ${district}, has successfully cleared all outstanding tax liabilities up to the current assessment year.`,
            ``,
            `According to the official revenue records, there are NO PENDING DUES or arrears recorded against this taxpayer's property/account as of ${dateStr}.`,
            ``,
            `This official clearance certificate is automatically generated via the E-TaxPay digital portal.`
        ];
        
        doc.text(lines, 20, 85, { maxWidth: 170, lineHeightFactor: 1.5, align: 'justify' });

        // Fake QR Code
        doc.setDrawColor(0, 0, 0);
        doc.rect(160, 150, 30, 30);
        doc.setFontSize(6);
        doc.text('VERIFIED', 175, 165, { align: 'center' });
        for(let i=0; i<25; i++) {
            doc.setFillColor(0);
            const x = 162 + Math.random()*26;
            const y = 152 + Math.random()*26;
            const w = 1 + Math.random()*3;
            doc.rect(x, y, w, w, 'F');
        }

        const ySeal = 200;
        
        // Green Seal outer ring
        doc.setDrawColor(46, 125, 50);
        doc.setFillColor(255, 255, 255);
        doc.setLineWidth(1.5);
        doc.circle(50, ySeal, 20, 'SD');
        doc.setLineWidth(0.5);
        doc.circle(50, ySeal, 19, 'S');
        doc.circle(50, ySeal, 14, 'S');
        
        // Seal text
        doc.setTextColor(46, 125, 50);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('ZILA PANCHAYAT', 50, ySeal - 9, { align: 'center' });
        doc.setFontSize(6);
        doc.text('CERTIFIED CLEARED', 50, ySeal + 12, { align: 'center' });
        doc.setFontSize(5);
        doc.text('OFFICIAL SEAL', 50, ySeal - 2, { align: 'center' });
        doc.setFontSize(8);
        doc.text(district, 50, ySeal + 4, { align: 'center' });

        // Admin Signature in PDF
        doc.setTextColor(0, 0, 128); // Standard Blue ink signature
        doc.setFont('times', 'italic');
        doc.setFontSize(18);
        doc.text(adminName, 150, ySeal + 2, { align: 'center' });

        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.line(120, ySeal + 4, 180, ySeal + 4);
        doc.text('Authorized Signatory', 150, ySeal + 10, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('Revenue Department', 150, ySeal + 15, { align: 'center' });

        doc.save(`NOC_${userName.replace(' ', '_')}_${district}.pdf`);
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
                <div className="loader" style={{ width: 50, height: 50 }}></div>
                <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Preparing your analytics dashboard...</p>
            </div>
        )
    }

    const isCleared = stats.totalPending === 0 && stats.totalPaid > 0;
    const isNewUser = stats.totalPending === 0 && stats.totalPaid === 0;

    return (
        <div className="anim-fade">
             <style>
                {`
                @keyframes pulse-green {
                    0% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(46, 125, 50, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
                }
                .btn-shine {
                    position: relative;
                    overflow: hidden;
                }
                .btn-shine::before {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%; width: 50%; height: 100%;
                    background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);
                    transform: skewX(-20deg);
                    animation: shine 3s infinite;
                }
                @keyframes shine {
                    0% { left: -100%; }
                    20% { left: 200%; }
                    100% { left: 200%; }
                }
                `}
            </style>
            
            <div className="page-header" style={{ marginBottom: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: 'var(--color-maroon)', color: 'white', padding: 10, borderRadius: 12 }}>
                        <FiBarChart2 size={24} />
                    </div>
                    <div>
                        <h2>Personal Tax Analytics</h2>
                        <p>Detailed breakdown of your tax contributions and compliance</p>
                    </div>
                </div>

                {/* NO DUES CERTIFICATE ACTION CARD TOP HEADER */}
                <div style={{ 
                    background: isCleared ? 'linear-gradient(135deg, #2e7d32, #1b5e20)' : '#f8f9fa',
                    border: isCleared ? 'none' : '1px solid #ddd',
                    padding: '12px 20px', 
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 15,
                    boxShadow: isCleared ? '0 8px 25px rgba(46, 125, 50, 0.3)' : 'none',
                    color: isCleared ? 'white' : '#666'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>Clearance Status</span>
                        {isCleared ? (
                            <span style={{ fontSize: '0.8rem', color: '#a5d6a7' }}>100% Tax Compliant</span>
                        ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-maroon)', fontWeight: 700 }}>Dues Pending</span>
                        )}
                    </div>
                    
                    <button 
                        onClick={generateNOC}
                        className={isCleared ? "btn btn-shine" : "btn"}
                        title={isCleared ? "Download Certificate" : "Clear dues to download"}
                        style={{
                            background: isCleared ? 'white' : '#eee',
                            color: isCleared ? '#2e7d32' : '#999',
                            padding: '10px 20px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            border: 'none',
                            cursor: isCleared ? 'pointer' : 'not-allowed',
                            animation: isCleared ? 'pulse-green 2s infinite' : 'none'
                        }}
                    >
                        {isCleared ? <FiAward size={20} /> : <FiLock size={20} />}
                        {isCleared ? "Generate NOC" : "Locked"}
                    </button>
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

            {/* Smart Tips Context */}
            {isCleared ? (
                <div className="alert anim-slide-down" style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--color-green-light)', borderLeft: '4px solid var(--color-green)', padding: 20, marginBottom: 32 }}>
                    <div style={{ background: 'white', padding: 12, borderRadius: '50%', color: 'var(--color-green)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        <FiShield size={32} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#1b5e20', display: 'flex', alignItems: 'center', gap: 8 }}>
                            Official NOC Unlocked <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#4caf50', color: 'white', borderRadius: 4, letterSpacing: 1 }}>VIP CITIZEN</span>
                        </h4>
                        <p style={{ margin: 0, color: '#333', fontSize: '0.95rem', lineHeight: 1.5 }}>
                            Outstanding! You have maintained a completely clean record with exactly ₹0 pending dues. 
                            You are eligible to claim your certified "No Dues Certificate" (NOC) digitally from the top action bar.
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={generateNOC} style={{ background: 'var(--color-green)', borderRadius: 20, padding: '12px 24px', fontWeight: 800 }}>
                        <FiDownloadCloud /> Claim Certificate
                    </button>
                </div>
            ) : isNewUser ? (
                <div className="alert alert-info" style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 32 }}>
                    <FiInfo size={24} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <h5 style={{ marginBottom: 4 }}>Welcome to E-TaxPay</h5>
                        <p style={{ margin: 0, opacity: 0.9 }}>
                            No tax bills have been generated for your account yet. Once your district administration issues your first bill, it will appear here. Note: You must complete at least one tax payment to become eligible for the official 'No Dues Certificate'.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="alert alert-info" style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 32 }}>
                    <FiInfo size={24} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <h5 style={{ marginBottom: 4 }}>Smart Tax Tip: Claim your NOC</h5>
                        <p style={{ margin: 0, opacity: 0.9 }}>
                            You currently have ₹{stats.totalPending.toLocaleString()} in dues. Clear your remaining balance this fiscal year to instantaneously unlock your verifiable digital 'No Dues Certificate'.
                        </p>
                    </div>
                </div>
            )}

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
                                <Bar dataKey="paid" name="Paid Amount" stackId="a" fill="var(--color-green)" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="pending" name="Billed (Pending)" stackId="a" fill="#e0e0e0" radius={[4, 4, 0, 0]} barSize={20} />
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
        </div>
    )
}
