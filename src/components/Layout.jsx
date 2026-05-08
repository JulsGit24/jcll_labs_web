import React, { useEffect } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import Cursor from './Cursor';
import { Outlet, useLocation } from 'react-router-dom';
import Lenis from 'lenis'; // Import default export from lenis package
import './Layout.scss';

const Layout = ({ children }) => {
    const location = useLocation();

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    return (
        <>
            <Cursor />
            <Navigation />
            <main className="ui-layer">
                {children}
            </main>
            <Footer />
        </>
    );
};

export default Layout;
