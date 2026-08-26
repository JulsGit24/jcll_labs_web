import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../utils/store';
import { content } from '../utils/content';
import { SOCIAL_LINKS } from '../utils/site';
import './Footer.scss';

const Footer = () => {
    const { language } = useStore();
    const t = content[language].footer;
    const tNav = content[language].nav;
    const tContact = content[language].contact;

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    const handleScroll = (id) => {
        if (window.location.pathname !== '/') {
            window.location.href = `/#${id}`;
        } else {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <footer className="site-footer">
            <div className="footer-content">
                <div className="footer-section navigation">
                    <h4>{t.navigation}</h4>
                    <nav>
                        <a href="#home" onClick={(e) => { e.preventDefault(); handleScroll('home'); }}>{tNav.home}</a>
                        <a href="#work" onClick={(e) => { e.preventDefault(); handleScroll('work'); }}>{tNav.work}</a>
                        <Link to="/photography/">{tNav.photography}</Link>
                        <a href="#about" onClick={(e) => { e.preventDefault(); handleScroll('about'); }}>{tNav.about}</a>
                        <a href="#contact" onClick={(e) => { e.preventDefault(); handleScroll('contact'); }}>{tNav.contact}</a>
                    </nav>
                </div>

                <div className="footer-section contact">
                    <h4>{t.contact}</h4>
                    <p>Email: {tContact.email}</p>
                    <p>{t.location}</p>
                </div>

                {/* Omitted entirely while SOCIAL_LINKS is empty. The column used to
                    link to bare platform homepages, which corroborates no entity and
                    tells a crawler the brand has no profile. The grid is auto-fit,
                    so three columns reflow without leaving a hole. */}
                {SOCIAL_LINKS.length > 0 && (
                    <div className="footer-section social">
                        <h4>{t.follow}</h4>
                        <div className="social-links">
                            {SOCIAL_LINKS.map((social) => (
                                <a key={social.url} href={social.url} target="_blank" rel="noopener noreferrer">
                                    {social.label}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                <div className="footer-section back-to-top">
                    <button onClick={scrollToTop} className="top-btn">
                        ↑ {t.backToTop}
                    </button>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} JCLL Labs. {t.rights}</p>
                <div className="policy-links">
                    <Link to="/privacy">{t.privacy}</Link>
                    <Link to="/terms">{t.terms}</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
