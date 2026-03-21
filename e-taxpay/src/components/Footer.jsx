import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Footer() {
    const { t } = useTranslation()

    return (
        <footer className="footer-final-designed">
            <div className="container footer-content-wrap">
                <div className="footer-grid-3">
                    {/* Column 1: Brand */}
                    <div className="f-col branding">
                        <div className="f-logo-row">
                            <div className="f-logo-icon"><img src={logo} alt="" /></div>
                            <h2 className="f-logo-name">{t('hero.title')}</h2>
                        </div>
                        <p className="f-mission">
                            {t('about.sectionSubtitle')}
                        </p>
                    </div>

                    {/* Column 2: Links */}
                    <div className="f-col extra-links">
                        <h3 className="f-heading">{t('footer.quickLinks')}</h3>
                        <ul className="f-links-list">
                            <li><Link to="/">{t('nav.home')}</Link></li>
                            <li><button onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}>{t('nav.about')}</button></li>
                            <li><button onClick={() => document.getElementById('help')?.scrollIntoView({ behavior: 'smooth' })}>{t('nav.help')}</button></li>
                            <li><button onClick={() => document.getElementById('complaints')?.scrollIntoView({ behavior: 'smooth' })}>{t('nav.complaints')}</button></li>
                            <li><button onClick={() => document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' })}>{t('nav.aboutUs')}</button></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact */}
                    <div className="f-col contact-info">
                        <h3 className="f-heading">{t('footer.contactInfo')}</h3>
                        <div className="f-contact-details">
                            <p>{t('footer.address')}</p>
                            <p>{t('footer.phone')}</p>
                            <p>{t('footer.email')}</p>
                        </div>
                    </div>
                </div>

                <div className="footer-divider-line"></div>

                <div className="footer-bottom-info">
                    <p>{t('footer.copyright')}</p>
                </div>
            </div>

            <style jsx>{`
                .footer-final-designed {
                    background: linear-gradient(135deg, #f5f0ed 0%, #ede3dc 100%);
                    background-image: linear-gradient(135deg, rgba(0,0,0,0.02) 0%, transparent 100%), 
                                      url('https://www.transparenttextures.com/patterns/clean-gray-paper.png');
                    background-color: #f7f3f0;
                    color: #2D3436;
                    padding: 100px 0 50px;
                    font-family: 'Inter', sans-serif;
                    position: relative;
                    overflow: hidden;
                    border-top: 1px solid #e0d5cd;
                }
                .footer-final-designed::before {
                    content: ''; position: absolute; inset: 0;
                    background: radial-gradient(circle at 10% 20%, rgba(130,29,48,0.03) 0%, transparent 50%);
                    pointer-events: none;
                }

                .footer-content-wrap { max-width: 1200px; margin: 0 auto; padding: 0 40px; position: relative; z-index: 2; }
                .footer-grid-3 { display: grid; grid-template-columns: 1.2fr 1fr 1.2fr; gap: 80px; align-items: flex-start; }

                .f-logo-row { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
                .f-logo-icon { width: 45px; height: 45px; background: #fff; border: 1.5px solid #e0d5cd; border-radius: 12px; display: flex; align-items: center; justify-content: center; padding: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
                .f-logo-icon img { width: 100%; height: 100%; object-fit: contain; }
                .f-logo-name { font-size: 2rem; font-weight: 1000; margin: 0; letter-spacing: -1px; color: #821D30; }

                .f-mission { font-size: 1.1rem; line-height: 1.7; color: #666; max-width: 300px; font-weight: 550; }

                .f-heading { font-size: 1.35rem; font-weight: 1000; margin-bottom: 30px; letter-spacing: -0.5px; color: #1a1a1a; }
                .f-links-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 18px; }
                .f-links-list li a, .f-links-list li button { 
                    color: #555; text-decoration: none; font-size: 1.05rem; 
                    transition: 0.3s; background: none; border: none; padding: 0; cursor: pointer; 
                    text-align: left; font-weight: 750; font-family: inherit;
                }
                .f-links-list li a:hover, .f-links-list li button:hover { color: #821D30; transform: translateX(8px); }

                .f-contact-details { display: flex; flex-direction: column; gap: 18px; }
                .f-contact-details p { font-size: 1.05rem; color: #555; margin: 0; font-weight: 750; line-height: 1.6; }

                .footer-divider-line { width: 100%; height: 1.5px; background: #e0d5cd; margin: 70px 0 40px; }

                .footer-bottom-info { text-align: center; }
                .footer-bottom-info p { font-size: 1rem; color: #999; font-weight: 800; margin: 0; }

                @media (max-width: 900px) {
                    .footer-grid-3 { grid-template-columns: 1fr; gap: 60px; text-align: center; }
                    .f-logo-row { justify-content: center; }
                    .f-mission { margin: 0 auto; }
                    .f-links-list { align-items: center; }
                    .f-links-list li button { text-align: center; }
                }
            `}</style>
        </footer>
    )
}
