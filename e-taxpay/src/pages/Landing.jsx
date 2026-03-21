import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import UttarakhandMap from '../components/UttarakhandMap'
import {
    FiShield, FiCreditCard, FiActivity, FiMessageCircle,
    FiBell, FiLock, FiSend, FiTrendingUp, FiCheckCircle, FiMapPin,
    FiMail, FiPhoneCall, FiClock, FiChevronRight, FiUser, FiInfo,
    FiZap, FiEye, FiGlobe, FiLayout, FiSettings, FiClipboard, FiMonitor,
    FiCamera
} from 'react-icons/fi'

export default function Landing() {
    const { t } = useTranslation()
    const { isAuthenticated } = useAuth()
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        
        // Scroll Reveal Observer
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible')
                }
            })
        }, observerOptions)

        const elements = document.querySelectorAll('.reveal-hidden')
        elements.forEach(el => observer.observe(el))

        return () => {
            window.removeEventListener('scroll', handleScroll)
            elements.forEach(el => observer.unobserve(el))
        }
    }, [])

    return (
        <div className="landing-wrapper init-fade-anim">
            <Navbar />

            {/* ===== HERO SECTION (IMAGE MATCHED - FIXED & RIGID) ===== */}
            <section className="unified-section hero-prime" id="home">
                <div className="mountain-bg floating-bg-soft"></div>
                <div className="container-rigid">
                    <div className="rigid-row-hero">
                        {/* LEFT SIDE: TEXT & ACTIONS */}
                        <div className="hero-text-side anim-slide-up">
                            <div className="location-pill interaction-bounce anim-fade delay-1">
                                <FiMapPin /> {t('hero.district')}
                            </div>
                            <h1 className="hero-title-giant-img anim-slide-up delay-2">{t('hero.title')}</h1>
                            <h2 className="hero-tagline-img anim-slide-up delay-3">{t('hero.subtitle')}</h2>
                            <p className="hero-desc anim-fade delay-4">
                                {t('hero.description')}
                            </p>

                            <div className="hero-actions-img">
                                <Link to="/register" className="btn-orange-img">
                                    {t('hero.registerNow')} <FiChevronRight />
                                </Link>
                                <button 
                                    className="btn-white-img" 
                                    onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
                                >
                                    {t('hero.learnMore')}
                                </button>
                            </div>

                            <div className="hero-stats-grid-img">
                                {[
                                    { label: t('hero.stats.activeShops'), val: '12,500+' },
                                    { label: t('hero.stats.annualCollection'), val: `${t('common.rupee')}18.2 Cr` },
                                    { label: t('hero.stats.growthRate'), val: '+12%' }
                                ].map((s, i) => (
                                    <div key={i} className="stat-card-img interaction-lift">
                                        <h3>{s.val}</h3>
                                        <p>{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT SIDE: MAP IN WHITE CARD */}
                        <div className="hero-map-side-img floating-map-mini">
                            <div className="map-white-card shadow-premium">
                                <UttarakhandMap />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== ABOUT SECTION (UNTOUCHED) ===== */}
            <section className="unified-section about-prime" id="about-section">
                <div className="container-rigid">
                    <div className="center-header reveal-hidden anim-fade">
                        <h2 className="maroon-heading">{t('about.sectionTitle')}</h2>
                        <p className="grey-subtitle">{t('about.sectionSubtitle')}</p>
                    </div>

                    <div className="rigid-row-4">
                        <div className="about-card-modern hover-lift reveal-hidden anim-zoom delay-1">
                            <div className="about-ico-box orange"><FiShield /></div>
                            <h3>{t('about.transparency')}</h3>
                            <p>{t('about.transparencyDesc')}</p>
                        </div>
                        <div className="about-card-modern hover-lift reveal-hidden anim-zoom delay-2">
                            <div className="about-ico-box green"><FiCreditCard /></div>
                            <h3>{t('about.easyPayment')}</h3>
                            <p>{t('about.easyPaymentDesc')}</p>
                        </div>
                        <div className="about-card-modern hover-lift reveal-hidden anim-zoom delay-3">
                            <div className="about-ico-box maroon"><FiActivity /></div>
                            <h3>{t('about.monitoring')}</h3>
                            <p>{t('about.monitoringDesc')}</p>
                        </div>
                        <div className="about-card-modern hover-lift reveal-hidden anim-zoom delay-4">
                            <div className="about-ico-box brown"><FiMessageCircle /></div>
                            <h3>{t('about.complaintTracking')}</h3>
                            <p>{t('about.complaintTrackingDesc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== NEED HELP SECTION (SIDE-BY-SIDE FIXED) ===== */}
            <section className="unified-section help-prime" id="help">
                <div className="container-rigid">
                    <div className="center-header reveal-hidden anim-fade">
                        <h2 className="maroon-heading">{t('help.sectionTitle')}</h2>
                        <p className="grey-subtitle">{t('help.sectionSubtitle')}</p>
                    </div>

                    <div className="rigid-row-help">
                        <div className="help-form-side reveal-hidden anim-slide-right">
                            <div className="help-card-modern hover-lift">
                                <div className="help-field-group"><label>{t('help.name')}</label><input type="text" placeholder="John Doe" /></div>
                                <div className="help-field-group"><label>{t('help.email')}</label><input type="email" placeholder="john@example.com" /></div>
                                <div className="help-field-group"><label>{t('help.message')}</label><textarea rows="5" placeholder="..."></textarea></div>
                                <button className="btn-help-send">{t('help.submit')} <FiSend /></button>
                            </div>
                        </div>

                        <div className="help-side-info reveal-hidden anim-slide-left">
                            <h3 className="help-info-title">{t('footer.contactInfo')}</h3>
                            <div className="help-channels-list">
                                <div className="contact-pill-modern interaction-slide-right hover-glow">
                                    <div className="cp-icon"><FiMapPin /></div>
                                    <div className="cp-text"><span>{t('complaint.location')}</span><p>{t('footer.address')}</p></div>
                                </div>
                                <div className="contact-pill-modern interaction-slide-right hover-glow">
                                    <div className="cp-icon"><FiPhoneCall /></div>
                                    <div className="cp-text"><span>{t('help.helpline')}</span><p>{t('footer.phone')}</p></div>
                                </div>
                                <div className="contact-pill-modern interaction-slide-right hover-glow">
                                    <div className="cp-icon"><FiMail /></div>
                                    <div className="cp-text"><span>{t('help.officialEmail')}</span><p>{t('footer.email')}</p></div>
                                </div>
                                <div className="contact-pill-modern interaction-slide-right hover-glow">
                                    <div className="cp-icon"><FiClock /></div>
                                    <div className="cp-text"><span>{t('help.officeHours')}</span><p>{t('help.officeHoursValue')}</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== COMPLAINT SECTION (PRESERVED FIX) ===== */}
            <section className="unified-section complaint-primary" id="complaints">
                <div className="container-rigid">
                    <div className="rigid-row-hero">
                        <div className="complaint-info-side reveal-hidden anim-slide-right">
                            <div className="portal-badge interaction-bounce anim-float"><FiShield /> {t('complaint.sectionTitle')}</div>
                            <h2 className="complaint-title-modern">{t('complaint.sectionTitle')}</h2>
                            <p className="complaint-desc-modern">{t('complaint.sectionSubtitle')}</p>
                            
                            <div className="complaint-steps-modern">
                                <div className="complaint-step-item hover-lift">
                                    <div className="cs-num">01</div>
                                    <div className="cs-info"><h4>{t('complaint.shopName')}</h4><p>{t('complaint.shopName')}</p></div>
                                </div>
                                <div className="complaint-step-item hover-lift">
                                    <div className="cs-num">02</div>
                                    <div className="cs-info"><h4>{t('complaint.uploadPhoto')}</h4><p>{t('complaint.uploadPhoto')}</p></div>
                                </div>
                                <div className="complaint-step-item hover-lift">
                                    <div className="cs-num">03</div>
                                    <div className="cs-info"><h4>{t('admin.verification')}</h4><p>{t('admin.verification')}</p></div>
                                </div>
                            </div>
                        </div>

                        <div className="complaint-form-side reveal-hidden anim-slide-left">
                            <div className="complaint-card-modern hover-lift">
                                <div className="complaint-field-group"><label>{t('complaint.shopName')}</label><input type="text" placeholder="e.g., ZP-ALM-102" /></div>
                                <div className="complaint-field-row">
                                    <div className="complaint-field-group"><label>{t('help.name')}</label><input type="text" placeholder="Raju" /></div>
                                    <div className="complaint-field-group"><label>{t('help.mobile')}</label><input type="text" placeholder="+91 XXXX" /></div>
                                </div>
                                <div className="complaint-field-group">
                                    <label>{t('complaint.reason')}</label>
                                    <select className="complaint-select">
                                        <option value="overcharging">{t('complaint.reasons.overcharging')}</option>
                                        <option value="no_receipt">{t('complaint.reasons.noReceipt')}</option>
                                        <option value="corruption">{t('complaint.reasons.corruption')}</option>
                                        <option value="other">{t('complaint.reasons.other')}</option>
                                    </select>
                                </div>
                                <div className="complaint-field-group"><label>{t('complaint.description')}</label><textarea rows="3" placeholder="..."></textarea></div>
                                
                                <div className="complaint-upload-zone">
                                    <input type="file" id="evidence-upload" hidden />
                                    <label htmlFor="evidence-upload" className="upload-trigger-modern hover-glow">
                                        <FiCamera className="cam-ico" /> <span>{t('complaint.uploadPhoto')}</span>
                                    </label>
                                </div>
                                
                                <button className="btn-submit-grievance hover-glow">{t('complaint.submit')} <FiChevronRight /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== TEAM SECTION (UNTOUCHED) ===== */}
            <section className="unified-section team-prime" id="team">
                <div className="container-rigid">
                    <div className="center-header">
                        <h2 className="maroon-heading">{t('team.sectionTitle')}</h2>
                        <p className="grey-subtitle">{t('team.sectionSubtitle')}</p>
                    </div>

                    <div className="rigid-row-4">
                        {[
                            { n: 'Manish Kumar', r: t('team.roles.leadDev'), i: <FiMonitor />, c: 'blue' },
                            { n: 'Ankit Singh', r: t('team.roles.uiux'), i: <FiLayout />, c: 'pink' },
                            { n: 'Priya Sharma', r: t('team.roles.backend'), i: <FiSettings />, c: 'green' },
                            { n: 'Rahul Pant', r: t('team.roles.pm'), i: <FiClipboard />, c: 'amber' }
                        ].map((m, i) => (
                            <div key={i} className={`team-card-modern hover-lift reveal-hidden anim-slide-up delay-${i+1}`}>
                                <div className={`team-avatar ${m.c}`}>
                                    <div className="avatar-icon-glow">{m.i}</div>
                                </div>
                                <h3 className="team-name">{m.n}</h3>
                                <p className="team-role">{m.r}</p>
                                <div className="team-social-dot"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />

            <style jsx>{`
                /* NO POSITION CHANGE - FIXED RIGID LOCK */
                .landing-wrapper { background: #fff; overflow-x: hidden; font-family: 'Inter', sans-serif; }
                .container-rigid { max-width: 1440px; margin: 0 auto; padding: 0 40px; width: 100%; box-sizing: border-box; }

                /* GRID SYSTEM (LOCK) */
                .rigid-row-hero { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); gap: 60px; align-items: center; }
                .rigid-row-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; }
                .rigid-row-help { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); gap: 70px; align-items: flex-start; }

                /* HERO SPECIAL (IMAGE MATCH VERSION) */
                .hero-prime { min-height: 95vh; position: relative; background: #fff; display: flex; align-items: center; padding: 120px 0 80px; }
                .mountain-bg { position: absolute; inset: 0; background: url('/uttarakhand_mountains_bg_1773922903505.png') no-repeat bottom center/cover; opacity: 0.05; pointer-events: none; }
                
                .location-pill { display: inline-flex; align-items: center; gap: 8px; background: #fff; padding: 12px 28px; border-radius: 50px; font-weight: 900; color: #666; border: 1.5px solid #f2f2f2; margin-bottom: 30px; box-shadow: 0 2px 15px rgba(0,0,0,0.02); font-size: 1rem; }
                
                .hero-title-giant-img { font-size: clamp(4.5rem, 9vw, 8.5rem); font-weight: 1000; color: #B33D26; margin: 0; line-height: 0.9; letter-spacing: -2px; }
                .hero-tagline-img { font-size: 3.5rem; font-weight: 950; color: #1a1a1a; margin: 15px 0 25px; letter-spacing: -1.5px; line-height: 1.1; }
                .hero-desc { font-size: 1.3rem; color: #666; font-weight: 500; line-height: 1.6; margin-bottom: 45px; max-width: 90%; }
                
                .hero-actions-img { display: flex; gap: 24px; margin-bottom: 60px; }
                .btn-orange-img { background: #E8863A; color: #fff; padding: 22px 52px; border-radius: 18px; font-weight: 900; text-decoration: none; display: flex; align-items: center; gap: 12px; box-shadow: 0 15px 35px rgba(232, 134, 58, 0.25); transition: 0.3s; font-size: 1.2rem; }
                .btn-orange-img:hover { transform: translateY(-4px); box-shadow: 0 20px 45px rgba(232, 134, 58, 0.35); }
                .btn-white-img { background: #fff; color: #1a1a1a; padding: 22px 52px; border-radius: 18px; border: 1px solid #e1e1e1; font-weight: 900; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 25px rgba(0,0,0,0.02); font-size: 1.2rem; }
                .btn-white-img:hover { background: #fafafa; border-color: #ccc; transform: translateY(-4px); }

                .hero-stats-grid-img { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; width: 100%; }
                .stat-card-img { background: #fff; padding: 35px 15px; border-radius: 28px; text-align: center; border: 1px solid #f0f0f0; box-shadow: 0 20px 50px rgba(0,0,0,0.03); transition: 0.3s; }
                .stat-card-img:hover { transform: translateY(-8px); box-shadow: 0 25px 60px rgba(0,0,0,0.05); }
                .stat-card-img h3 { font-size: 2.8rem; font-weight: 1000; color: #1a1a1a; margin: 0; line-height: 1; }
                .stat-card-img p { font-size: 0.9rem; font-weight: 900; color: #aaa; margin-top: 10px; letter-spacing: 1.5px; }

                /* RIGHT SIDE MAP CARD */
                .map-white-card { 
                    background: #fff; border-radius: 80px; padding: 70px; 
                    box-shadow: 0 50px 150px rgba(0,0,0,0.06); 
                    border: 1px solid #f5f5f5; width: 100%; transition: 0.5s;
                }
                .map-white-card:hover { transform: translateY(-5px); box-shadow: 0 60px 180px rgba(0,0,0,0.08); }
                .floating-map-mini { animation: mapFloatMini 8s ease-in-out infinite; }
                @keyframes mapFloatMini { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }

                /* COMPLAINT CUSTOM SIDE-BY-SIDE */
                .maroon-heading-left { font-size: 3.5rem; font-weight: 1000; color: #821D30; margin: 15px 0; line-height: 1.1; letter-spacing: -1px; }
                .grey-desc { font-size: 1.25rem; color: #666; line-height: 1.6; max-width: 90%; margin-bottom: 40px; }
                .complaint-steps { display: flex; flex-direction: column; gap: 20px; }
                .c-step { display: flex; align-items: center; gap: 18px; background: #fff; padding: 22px 30px; border-radius: 24px; font-weight: 850; border: 1.5px solid #f0f0f0; transition: 0.3s; color: #333; }
                .c-step:hover { background: #fafafa; transform: translateX(10px); }
                .complaint-card-rigid-full { background: #fff; border-radius: 40px; padding: 50px; border: 1px solid #f2f2f2; box-shadow: 0 20px 70px rgba(0,0,0,0.05); }
                .cf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

                /* ANIMATIONS */
                .init-fade-anim { animation: pageFade 1s ease-out; }
                @keyframes pageFade { from { opacity: 0; } to { opacity: 1; } }
                .fade-up-reveal { animation: revealUp 1s cubic-bezier(0.2, 0.8, 0.2, 1); }
                @keyframes revealUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

                /* ABOUT SECTION (PREMIUM GRID) */
                .about-prime { background: #fdfdfd; position: relative; }
                .about-card-modern {
                    background: #fff; padding: 50px 35px; border-radius: 35px; text-align: center;
                    border: 1px solid #f0f0f0; box-shadow: 0 15px 40px rgba(0,0,0,0.02);
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); position: relative; overflow: hidden;
                }
                .about-card-modern:hover { transform: translateY(-12px); box-shadow: 0 30px 70px rgba(0,0,0,0.06); border-color: #821D3015; }
                
                .about-ico-box { 
                    width: 90px; height: 90px; border-radius: 30px; display: flex; align-items: center; justify-content: center; 
                    margin: 0 auto 35px; font-size: 2.5rem; transition: 0.4s; position: relative;
                }
                .about-card-modern:hover .about-ico-box { transform: scale(1.1) rotate(5deg); }
                
                .about-ico-box.orange { background: #FFF4ED; color: #E8863A; }
                .about-ico-box.green { background: #F0FDF4; color: #2E7D32; }
                .about-ico-box.maroon { background: #FFF1F3; color: #821D30; }
                .about-ico-box.brown { background: #FDFAF7; color: #A0522D; }

                .about-card-modern h3 { font-size: 1.6rem; font-weight: 1000; color: #1a1a1a; margin-bottom: 18px; letter-spacing: -0.5px; }
                .about-card-modern p { font-size: 1.1rem; color: #777; line-height: 1.6; font-weight: 500; }

                /* TEAM SECTION (MODERN) */
                .team-card-modern {
                    background: #fff; padding: 50px 30px; border-radius: 40px; text-align: center;
                    border: 1px solid #f2f2f2; box-shadow: 0 15px 50px rgba(0,0,0,0.03);
                    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); position: relative;
                }
                .team-card-modern:hover { transform: translateY(-15px); box-shadow: 0 30px 80px rgba(0,0,0,0.06); border-color: #821D3010; }
                
                .team-avatar { 
                    width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                    margin: 0 auto 30px; position: relative; transition: 0.5s;
                }
                .team-card-modern:hover .team-avatar { transform: scale(1.1) rotate(5deg); }
                
                .avatar-icon-glow { font-size: 2.2rem; z-index: 2; position: relative; }
                
                .team-avatar.blue { background: #EBF8FF; color: #3182CE; }
                .team-avatar.pink { background: #FFF5F7; color: #D53F8C; }
                .team-avatar.green { background: #F0FFF4; color: #38A169; }
                .team-avatar.amber { background: #FFFBEB; color: #D69E2E; }
                
                .team-name { font-size: 1.65rem; font-weight: 1000; color: #1a1a1a; margin-bottom: 8px; letter-spacing: -0.5px; }
                .team-role { font-size: 1rem; font-weight: 850; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 25px; }
                
                .team-social-dot { width: 40px; height: 4px; background: #821D3015; border-radius: 10px; margin: 0 auto; transition: 0.3s; }
                .team-card-modern:hover .team-social-dot { width: 60px; background: #821D30; }

                .avatar-box { width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; font-size: 1.6rem; color: #333; }
                .avatar-box.grey { background: #f0f0f0; }
                .avatar-box.pink { background: #fff5f8; color: #D81B60; }
                .avatar-box.green { background: #f0fdf4; color: #2E7D32; }
                .avatar-box.brown { background: #fdfaf7; color: #A0522D; }

                /* HELP SECTION (MODERN) */
                .help-card-modern { background: #fff; border-radius: 40px; padding: 50px; border: 1px solid #f2f2f2; box-shadow: 0 20px 80px rgba(0,0,0,0.04); }
                .help-field-group { display: flex; flex-direction: column; gap: 10px; margin-bottom: 25px; }
                .help-field-group label { font-weight: 900; color: #1a1a1a; font-size: 0.95rem; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
                .help-field-group input, .help-field-group textarea { padding: 22px; border-radius: 18px; border: 1.5px solid #eee; background: #fafafa; font-size: 1.05rem; transition: 0.3s; font-weight: 550; }
                .help-field-group input:focus, .help-field-group textarea:focus { border-color: #E8863A; background: #fff; box-shadow: 0 0 0 5px rgba(232,134,58,0.06); outline: none; }
                .btn-help-send { background: #E8863A; color: #fff; border: none; padding: 22px; border-radius: 18px; font-weight: 900; width: 100%; cursor: pointer; font-size: 1.2rem; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 12px; box-shadow: 0 15px 30px rgba(232,134,58,0.2); }
                .btn-help-send:hover { transform: translateY(-3px); box-shadow: 0 20px 40px rgba(232,134,58,0.3); filter: brightness(1.05); }

                .help-info-title { font-size: 2.2rem; font-weight: 1000; color: #1a1a1a; margin-bottom: 40px; letter-spacing: -1px; }
                .help-channels-list { display: flex; flex-direction: column; gap: 15px; }
                .contact-pill-modern { 
                    display: flex; align-items: center; gap: 25px; background: #fff; padding: 25px 35px; border-radius: 30px; 
                    border: 1px solid #f0f0f0; box-shadow: 0 5px 25px rgba(0,0,0,0.02); transition: 0.3s; cursor: default;
                }
                .contact-pill-modern:hover { transform: translateX(15px); background: #fdfdfd; border-color: #eee; }
                .cp-icon { width: 55px; height: 55px; background: #FFF4ED; color: #E8863A; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
                .cp-text span { display: block; font-size: 0.75rem; font-weight: 1000; color: #aaa; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 2px; }
                .cp-text p { font-size: 1.15rem; font-weight: 800; color: #333; margin: 0; }

                /* COMPLAINT SECTION (PREMIUM) */
                .complaint-primary { background: #fffafb; position: relative; }
                .portal-badge { display: inline-flex; align-items: center; gap: 10px; background: #FFF1F3; color: #821D30; padding: 12px 25px; border-radius: 50px; font-weight: 900; font-size: 0.9rem; margin-bottom: 25px; }
                .complaint-title-modern { font-size: 4rem; font-weight: 1000; color: #821D30; margin-bottom: 15px; letter-spacing: -2px; line-height: 1.1; }
                .complaint-desc-modern { font-size: 1.35rem; color: #666; line-height: 1.6; max-width: 90%; margin-bottom: 45px; font-weight: 550; }
                .complaint-desc-modern strong { color: #821D30; }

                .complaint-steps-modern { display: flex; flex-direction: column; gap: 18px; }
                .complaint-step-item { display: flex; align-items: center; gap: 25px; background: #fff; padding: 25px 35px; border-radius: 28px; border: 1.5px solid #f0f0f0; transition: 0.3s; }
                .complaint-step-item:hover { transform: translateX(12px); border-color: #821D3030; }
                .cs-num { min-width: 50px; height: 50px; background: #821D30; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 1000; font-size: 1.15rem; }
                .cs-info h4 { font-size: 1.3rem; font-weight: 950; color: #1a1a1a; margin-bottom: 3px; }
                .cs-info p { font-size: 1.05rem; color: #888; font-weight: 600; margin: 0; }

                .complaint-card-modern { background: #fff; border-radius: 45px; padding: 55px; border: 1.5px solid #f2f2f2; box-shadow: 0 30px 90px rgba(130,29,48,0.06); }
                .complaint-field-group { display: flex; flex-direction: column; gap: 10px; margin-bottom: 25px; }
                .complaint-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                .complaint-field-group label { font-weight: 900; color: #444; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
                .complaint-field-group input, .complaint-select, .complaint-field-group textarea { padding: 22px; border-radius: 18px; border: 1.5px solid #eee; background: #fafafa; font-size: 1.1rem; transition: 0.3s; font-weight: 550; width: 100%; box-sizing: border-box; }
                .complaint-field-group input:focus, .complaint-select:focus, .complaint-field-group textarea:focus { border-color: #821D30; background: #fff; box-shadow: 0 0 0 5px rgba(130,29,48,0.08); outline: none; }
                
                .complaint-upload-zone { margin-bottom: 30px; }
                .upload-trigger-modern { 
                    display: flex; align-items: center; gap: 15px; background: #fafafa; padding: 22px; border-radius: 20px; 
                    border: 1.5px dashed #ddd; cursor: pointer; transition: 0.3s; font-weight: 900; color: #666; justify-content: center;
                }
                .upload-trigger-modern:hover { background: #fff; border-color: #821D30; color: #821D30; }
                .cam-ico { font-size: 1.4rem; }

                .btn-submit-grievance { background: #821D30; color: #fff; border: none; padding: 25px; border-radius: 20px; font-weight: 950; width: 100%; cursor: pointer; font-size: 1.4rem; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 15px; box-shadow: 0 15px 35px rgba(130,29,48,0.25); }
                .btn-submit-grievance:hover { transform: translateY(-4px); box-shadow: 0 20px 45px rgba(130,29,48,0.35); filter: brightness(1.1); }

                .form-group, .cf-group { display: flex; flex-direction: column; gap: 10px; margin-bottom: 25px; }
                .form-group label, .cf-group label { font-weight: 800; color: #444; font-size: 0.95rem; margin-bottom: 4px; }
                .form-group input, .cf-group input, .cf-group textarea, .cf-select { padding: 20px; border-radius: 16px; border: 1.5px solid #eee; background: #fafafa; font-size: 1rem; transition: 0.3s; }
                .form-group input:focus, .cf-group input:focus, .cf-group textarea:focus { border-color: #821D30; background: #fff; box-shadow: 0 0 0 5px rgba(130,29,48,0.05); outline: none; }
                
                .btn-send-fixed, .btn-submit-complaint { background: #E8863A; color: #fff; border: none; padding: 22px; border-radius: 16px; font-weight: 900; width: 100%; cursor: pointer; font-size: 1.15rem; transition: 0.3s; }
                .btn-submit-complaint { background: #821D30; padding: 24px; font-size: 1.3rem; }
                .btn-send-fixed:hover, .btn-submit-complaint:hover { filter: brightness(1.1); transform: translateY(-3px); }

                .maroon-heading { font-size: 4rem; font-weight: 1000; color: #821D30; margin-bottom: 20px; text-align: center; letter-spacing: -2px; }
                .grey-subtitle { font-size: 1.4rem; color: #888; font-weight: 600; text-align: center; margin-bottom: 100px; max-width: 700px; margin-left: auto; margin-right: auto; }
                .unified-section { padding: 120px 0; border-bottom: 1px solid #f5f5f5; }

                .cf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

                .dashed-upload-box { border: 2px dashed #ddd; border-radius: 20px; padding: 25px; text-align: center; background: #fafafa; transition: 0.3s; cursor: pointer; }
                .dashed-upload-box:hover { border-color: #821D30; background: #fff; }

                .interaction-lift:hover { transform: translateY(-10px); }

                @media (max-width: 1024px) {
                    .rigid-row-hero { grid-template-columns: 1fr; text-align: center; }
                    .hero-text-side { order: 2; margin-top: 40px; }
                    .hero-map-side-img { order: 1; max-width: 600px; margin: 0 auto; }
                    .hero-actions-img { justify-content: center; }
                    .hero-desc { margin-left: auto; margin-right: auto; }
                    .rigid-row-help { grid-template-columns: 1fr; }
                    .maroon-heading-left { text-align: center; }
                    .grey-desc { margin-left: auto; margin-right: auto; }
                }

                @media (max-width: 550px) {
                    .rigid-row-4, .cf-row, .hero-stats-grid-img { grid-template-columns: 1fr !important; gap: 24px; }
                    .hero-title-giant-img { font-size: 3.5rem; }
                    .hero-tagline-img { font-size: 2.2rem; }
                    .container-rigid { padding: 0 24px; }
                }
            `}</style>
        </div>
    )
}
