import React, { useState, useEffect } from 'react';
import { useStore } from '../utils/store';
import { content } from '../utils/content';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Navigation.scss';

const Navigation = () => {
    const { language, setLanguage } = useStore();
    const t = content[language].nav;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const handleScroll = (id) => {
        closeMenu();
        if (window.location.pathname !== '/') {
            // Need to return user to home page with anchor hash
            window.location.href = `/#${id}`;
        } else {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMenuOpen]);

    return (
        <nav className="main-nav">
            <Link
                to="/"
                className="logo-container"
                onClick={(e) => {
                    if (window.location.pathname === '/') {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                    closeMenu();
                }}
            >
                <img src="/logo.png" alt="JCLL Labs Logo" className="brand-logo" />
                <div className="logo-text">JCLL Labs</div>
            </Link>

            {/* Desktop Navigation */}
            <div className="nav-links desktop-only">
                <a href="#home" onClick={(e) => { e.preventDefault(); handleScroll('home'); }}>
                    {t.home}
                </a>
                <a href="#work" onClick={(e) => { e.preventDefault(); handleScroll('work'); }}>
                    {t.work}
                </a>
                <a href="#animations" onClick={(e) => { e.preventDefault(); handleScroll('animations'); }}>
                    {t.automation}
                </a>
                <a href="#about" onClick={(e) => { e.preventDefault(); handleScroll('about'); }}>
                    {t.about}
                </a>
                <a href="#contact" onClick={(e) => { e.preventDefault(); handleScroll('contact'); }}>
                    {t.contact}
                </a>
                <a href="#contact" className="book-btn" onClick={(e) => { e.preventDefault(); handleScroll('contact'); }}>
                    {t.book}
                </a>
                <Link to="/referral-club" className="lab-link" title="Referral Club" style={{ fontSize: '1.2rem', marginLeft: '0.5rem', textDecoration: 'none' }}>
                    🤝
                </Link>
                <Link to="/interact" className="lab-link" title="Interact" style={{ fontSize: '1.2rem', marginLeft: '0.5rem', textDecoration: 'none' }}>
                    🌌
                </Link>
                <a href="/experimental" className="lab-link" title="Experimental AI">
                    🧪
                </a>
            </div>

            <div className="lang-switch desktop-only">
                <button
                    className={language === 'en' ? 'active' : ''}
                    onClick={() => setLanguage('en')}
                >
                    EN
                </button>
                <span className="separator">/</span>
                <button
                    className={language === 'es' ? 'active' : ''}
                    onClick={() => setLanguage('es')}
                >
                    ES
                </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Side Menu */}
            <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                <div className="mobile-nav-links">
                    <a href="#home" onClick={(e) => { e.preventDefault(); handleScroll('home'); }}>
                        {t.home}
                    </a>
                    {/* ... other links ... */}
                    <Link to="/referral-club" onClick={closeMenu}>
                        Referral Club 🤝
                    </Link>
                    <Link to="/interact" onClick={closeMenu}>
                        Interact 🌌
                    </Link>
                    <a href="/experimental" onClick={closeMenu}>
                        Experimental AI 🧪
                    </a>
                    <a href="#work" onClick={(e) => { e.preventDefault(); handleScroll('work'); }}>
                        {t.work}
                    </a>
                    <a href="#animations" onClick={(e) => { e.preventDefault(); handleScroll('animations'); }}>
                        {t.automation}
                    </a>
                    <a href="#about" onClick={(e) => { e.preventDefault(); handleScroll('about'); }}>
                        {t.about}
                    </a>
                    <a href="#contact" onClick={(e) => { e.preventDefault(); handleScroll('contact'); }}>
                        {t.contact}
                    </a>
                    <a href="#contact" className="book-btn" onClick={(e) => { e.preventDefault(); handleScroll('contact'); }}>
                        {t.book}
                    </a>
                </div>

                <div className="mobile-lang-switch">
                    <button
                        className={language === 'en' ? 'active' : ''}
                        onClick={() => { setLanguage('en'); closeMenu(); }}
                    >
                        English
                    </button>
                    <button
                        className={language === 'es' ? 'active' : ''}
                        onClick={() => { setLanguage('es'); closeMenu(); }}
                    >
                        Español
                    </button>
                </div>
            </div>

            {/* Overlay Backdop */}
            {isMenuOpen && <div className="menu-backdrop" onClick={closeMenu}></div>}
        </nav>
    );
};

export default Navigation;
