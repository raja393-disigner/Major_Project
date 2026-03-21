import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { FiTrendingUp, FiUsers, FiMapPin, FiBriefcase, FiZap, FiX, FiShield, FiAlertCircle, FiSettings } from 'react-icons/fi'

const districts = [
    { id: 'uttarkashi', name: 'UTTARKASHI', hq: 'Uttarkashi', color: '#E53E3E', d: 'M187.5 12.5 L200.5 4.5 L215.5 15.5 L225.5 12.5 L245.5 45.5 L260.5 40.5 L285.5 85.5 L260.5 110.5 L250.5 105.5 L220.5 125.5 L200.5 110.5 L170.5 120.5 L140.5 95.5 L130.5 75.5 L150.5 45.5 L160.5 15.5 Z', shops: '1,240', revenue: '₹42L', top: 'Eco-Tourism' },
    { id: 'chamoli', name: 'CHAMOLI', hq: 'Gopeshwar', color: '#68D391', d: 'M285.5 85.5 L310.5 75.5 L340.5 100.5 L360.5 125.5 L380.5 130.5 L375.5 160.5 L365.5 180.5 L350.5 200.5 L320.5 190.5 L290.5 210.5 L260.5 215.5 L260.5 180.5 L285.5 150.5 L270.5 125.5 L285.5 85.5 Z', shops: '2,150', revenue: '₹68L', top: 'Retail & Pilgrimage' },
    { id: 'rudraprayag', name: 'RUDRA PRAYAG', hq: 'Rudraprayag', color: '#F6AD55', d: 'M220.5 125.5 L250.5 105.5 L270.5 125.5 L285.5 150.5 L220.5 190.5 L200.5 175.5 L220.5 125.5 Z', shops: '980', revenue: '₹28L', top: 'Religious Commerce' },
    { id: 'tehri', name: 'TEHRI GARHWAL', hq: 'New Tehri', color: '#00B5D8', d: 'M130.5 130.5 L170.5 120.5 L200.5 110.5 L220.5 125.5 L200.5 175.5 L180.5 200.5 L150.5 195.5 L130.5 130.5 Z', shops: '1,890', revenue: '₹55L', top: 'Leisure & Hydro' },
    { id: 'dehradun', name: 'DEHRADUN', hq: 'Dehradun', color: '#D53F8C', d: 'M130.5 75.5 L140.5 95.5 L170.5 120.5 L130.5 130.5 L110.5 180.5 L80.5 190.5 L60.5 160.5 L90.5 100.5 L110.5 80.5 L130.5 75.5 Z', shops: '12,400', revenue: '₹4.2Cr', top: 'IT & Retail Hub' },
    { id: 'pauri', name: 'PAURI GARHWAL', hq: 'Pauri', color: '#ED8936', d: 'M110.5 180.5 L130.5 130.5 L150.5 195.5 L180.5 200.5 L220.5 190.5 L210.5 240.5 L200.5 285.5 L160.5 275.5 L140.5 260.5 L120.5 240.5 L110.5 180.5 Z', shops: '3,200', revenue: '₹85L', top: 'Education Hub' },
    { id: 'haridwar', name: 'HARIDWAR', hq: 'Haridwar', color: '#C53030', d: 'M80.5 190.5 L110.5 180.5 L120.5 240.5 L100.5 290.5 L70.5 260.5 L80.5 190.5 Z', shops: '8,400', revenue: '₹2.8Cr', top: 'Industries & Pharma' },
    { id: 'pithoragarh', name: 'PITHORAGARH', hq: 'Pithoragarh', color: '#C05621', d: 'M380.5 130.5 L420.5 150.5 L460.5 180.5 L480.5 220.5 L460.5 280.5 L420.5 290.5 L390.5 250.5 L365.5 180.5 L380.5 130.5 Z', shops: '1,560', revenue: '₹48L', top: 'Trade & Adventure' },
    { id: 'bageshwar', name: 'BAGESHWAR', hq: 'Bageshwar', color: '#ECC94B', d: 'M290.5 210.5 L320.5 190.5 L350.5 200.5 L365.5 180.5 L390.5 250.5 L360.5 240.5 L320.5 260.5 L290.5 210.5 Z', shops: '820', revenue: '₹22L', top: 'Local Handicrafts' },
    { id: 'almora', name: 'ALMORA', hq: 'Almora', color: '#9B2C2C', d: 'M220.5 190.5 L285.5 150.5 L260.5 180.5 L260.5 215.5 L290.5 210.5 L320.5 260.5 L310.5 290.5 L240.5 300.5 L220.5 190.5 Z', shops: '2,840', revenue: '₹1.1Cr', top: 'Cultural Heritage' },
    { id: 'champawat', name: 'CHAMPAWAT', hq: 'Champawat', color: '#48BB78', d: 'M360.5 240.5 L390.5 250.5 L420.5 290.5 L400.5 320.5 L360.5 330.5 L340.5 300.5 L360.5 240.5 Z', shops: '740', revenue: '₹18L', top: 'Tourism & Craft' },
    { id: 'nainital', name: 'NAINITAL', hq: 'Nainital', color: '#008080', d: 'M240.5 300.5 L310.5 290.5 L320.5 260.5 L360.5 240.5 L340.5 300.5 L360.5 330.5 L300.5 360.5 L260.5 340.5 L240.5 300.5 Z', shops: '5,600', revenue: '₹1.9Cr', top: 'Hospitality Hub' },
    { id: 'udhamsingh', name: 'UDHAM SINGH NAGAR', hq: 'Rudrapur', color: '#F56565', d: 'M100.5 290.5 L120.5 240.5 L140.5 260.5 L160.5 275.5 L200.5 285.5 L240.5 300.5 L260.5 340.5 L300.5 360.5 L340.5 380.5 L280.5 410.5 L200.5 400.5 L100.5 290.5 Z', shops: '7,200', revenue: '₹2.4Cr', top: 'Manufacturing' },
]

export default function UttarakhandMap() {
    const { t } = useTranslation()
    const { isAdmin } = useAuth()
    const [hovered, setHovered] = useState(null)
    const [selected, setSelected] = useState(null)
    const mapRef = useRef(null)

    const activeDist = districts.find(d => d.id === selected)

    const handleDistrictClick = (id, e) => {
        e.stopPropagation()
        setSelected(selected === id ? null : id)
    }

    // Close on clicking anywhere outside
    useEffect(() => {
        const handleClickOutside = () => setSelected(null)
        window.addEventListener('click', handleClickOutside)
        return () => window.removeEventListener('click', handleClickOutside)
    }, [])

    return (
        <div className="uk-sidebar-map-wrapper" ref={mapRef} onClick={(e) => e.stopPropagation()}>
            <div className="map-svg-container">
                <svg
                    viewBox="50 0 450 430"
                    width="100%"
                    height="100%"
                    className="uk-svg-realistic"
                >
                    {districts.map(d => (
                        <g
                            key={d.id}
                            onMouseEnter={() => setHovered(d.id)}
                            onMouseLeave={() => setHovered(null)}
                            onClick={(e) => handleDistrictClick(d.id, e)}
                            className="dist-group"
                        >
                            <path
                                d={d.d}
                                fill={d.color}
                                stroke={(selected === d.id) ? '#fff' : 'rgba(255,255,255,0.3)'}
                                strokeWidth={(hovered === d.id || selected === d.id) ? '2.5' : '0.5'}
                                className="dist-path"
                                style={{
                                    transform: (hovered === d.id || selected === d.id) ? 'scale(1.02) translateY(-2px)' : 'scale(1)',
                                    transformOrigin: '50% 50%',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    cursor: 'pointer',
                                    filter: selected === d.id ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' : 'none'
                                }}
                            />
                            {/* District Text */}
                            {(() => {
                                const pathParts = d.d.match(/[\d.]+/g).map(Number)
                                const xs = pathParts.filter((_, i) => i % 2 === 0)
                                const ys = pathParts.filter((_, i) => i % 2 === 1)
                                const cx = xs.reduce((a, b) => a + b, 0) / xs.length
                                const cy = ys.reduce((a, b) => a + b, 0) / ys.length
                                return (
                                    <text
                                        x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                                        fill="#fff" fontSize="7" fontWeight="1000"
                                        style={{
                                            pointerEvents: 'none',
                                            transition: '0.4s',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        {t(`districts.${d.id}`).split(' ').map((word, i) => (
                                            <tspan x={cx} dy={i === 0 ? 0 : 7} key={i}>{word}</tspan>
                                        ))}
                                    </text>
                                )
                            })()}
                        </g>
                    ))}
                </svg>
            </div>

            {/* RELIABLE SIDE PANEL POPUP */}
            {activeDist && (
                <div className="dist-details-overlay" onClick={() => setSelected(null)}>
                    <div className="dist-details-card" onClick={(e) => e.stopPropagation()} style={{ borderTop: `6px solid ${activeDist.color}` }}>
                        <button className="close-dist-btn" onClick={() => setSelected(null)}><FiX /></button>

                        <div className="details-header">
                            <div className="ico-box" style={{ background: activeDist.color }}><FiMapPin /></div>
                            <div className="title-area">
                                <h2>{t(`districts.${activeDist.id}`)}</h2>
                                <p>{t('hero.district')}: {activeDist.hq}</p>
                            </div>
                        </div>

                        <div className="details-stats-grid">
                            <div className="det-item">
                                <small>{t('admin.totalShops')}</small>
                                <strong>{activeDist.shops}</strong>
                                <div className="bar" style={{ width: '80%', background: activeDist.color }}></div>
                            </div>
                            <div className="det-item">
                                <small>{t('admin.totalCollected')}</small>
                                <strong>{activeDist.revenue}</strong>
                                <div className="bar" style={{ width: '60%', background: activeDist.color }}></div>
                            </div>
                        </div>

                        <div className="details-footer">
                            <div className="status-live"><div className="dot"></div> {t('user.liveTracking') || 'Live Monitoring'}</div>
                            <button className="btn-view-records">{t('admin.viewAll')} <FiTrendingUp /></button>
                        </div>

                        {/* EXCLUSIVE ADMIN INSIGHTS */}
                        {isAdmin && (
                            <div className="admin-insights-section anim-slide-up">
                                <div className="admin-divider"><span>ADMIN INSIGHTS</span></div>
                                <div className="admin-stats-row">
                                    <div className="adm-stat">
                                        <FiAlertCircle className="adm-ico warn" />
                                        <div><strong>12</strong><small>GRV</small></div>
                                    </div>
                                    <div className="adm-stat">
                                        <FiShield className="adm-ico secure" />
                                        <div><strong>94%</strong><small>COMP</small></div>
                                    </div>
                                    <div className="adm-stat">
                                        <FiTrendingUp className="adm-ico grow" />
                                        <div><strong>+5%</strong><small>YOY</small></div>
                                    </div>
                                </div>
                                <button className="btn-adm-panel" onClick={() => window.location.href = '/admin'}>
                                    Go to Admin Panel <FiSettings />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                .uk-sidebar-map-wrapper { width: 100%; position: relative; }
                .map-svg-container { width: 100%; }
                .uk-svg-realistic { width: 100%; height: auto; display: block; }
                
                .dist-path { transition: 0.3s; }

                /* FIXED POPUP OVERLAY */
                .dist-details-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.2); 
                    backdrop-filter: blur(4px); z-index: 99999;
                    display: flex; align-items: center; justify-content: center;
                }
                .dist-details-card {
                    background: #fff; width: 340px; border-radius: 24px; padding: 30px;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.25); position: relative;
                    animation: cardSlideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                @keyframes cardSlideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

                .close-dist-btn { position: absolute; top: 15px; right: 15px; background: #f5f5f5; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #666; transition: 0.2s; }
                .close-dist-btn:hover { background: #821D30; color: #fff; }

                .details-header { display: flex; gap: 15px; align-items: center; margin-bottom: 25px; }
                .ico-box { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.2rem; }
                .title-area h2 { font-size: 1.4rem; font-weight: 1000; margin: 0; color: #111; letter-spacing: -0.5px; }
                .title-area p { font-size: 0.8rem; color: #888; margin: 2px 0 0; font-weight: 700; text-transform: uppercase; }

                .details-stats-grid { display: grid; gap: 20px; margin-bottom: 30px; }
                .det-item small { font-size: 0.65rem; color: #aaa; font-weight: 800; letter-spacing: 1px; }
                .det-item strong { display: block; font-size: 1.5rem; font-weight: 1000; color: #111; margin: 5px 0 8px; }
                .det-item .bar { height: 4px; border-radius: 2px; opacity: 0.3; }

                .details-footer { display: flex; flex-direction: column; gap: 15px; }
                .status-live { font-size: 0.75rem; font-weight: 800; color: #38a169; display: flex; align-items: center; gap: 8px; }
                .status-live .dot { width: 8px; height: 8px; background: #38a169; border-radius: 50%; animation: pulse 1s infinite; }
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

                .btn-view-records { background: #111; color: #fff; border: none; padding: 14px; border-radius: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; }
                .btn-view-records:hover { background: #E07A3B; transform: translateY(-2px); }

                /* ADMIN INSIGHTS STYLING */
                .admin-insights-section { margin-top: 25px; padding-top: 20px; border-top: 1px dashed #eee; }
                .admin-divider { text-align: center; margin-bottom: 20px; position: relative; }
                .admin-divider::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: #eee; z-index: 1; }
                .admin-divider span { background: #fff; padding: 0 12px; font-size: 0.6rem; font-weight: 900; color: #821D30; letter-spacing: 2px; position: relative; z-index: 2; }
                
                .admin-stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
                .adm-stat { background: #f9f9f9; padding: 12px 8px; border-radius: 12px; display: flex; align-items: center; gap: 8px; border: 1px solid #f0f0f0; transition: 0.2s; }
                .adm-stat:hover { border-color: #821D30; background: #fff; transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
                .adm-ico { font-size: 1rem; }
                .adm-ico.warn { color: #e53e3e; }
                .adm-ico.secure { color: #38a169; }
                .adm-ico.grow { color: #3182ce; }
                .adm-stat strong { display: block; font-size: 0.9rem; font-weight: 1000; color: #111; line-height: 1; }
                .adm-stat small { font-size: 0.55rem; color: #aaa; font-weight: 800; text-transform: uppercase; }

                .btn-adm-panel { width: 100%; padding: 12px; border-radius: 10px; border: 2px solid #821D30; background: transparent; color: #821D30; font-weight: 900; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
                .btn-adm-panel:hover { background: #821D30; color: #fff; transform: scale(1.02); }

            `}</style>
        </div>
    )
}
