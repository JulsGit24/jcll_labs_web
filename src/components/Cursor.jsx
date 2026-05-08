import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Cursor.scss';

const Cursor = () => {
    const cursorRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        const moveCursor = (e) => {
            cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        };

        const onHoverStart = () => document.body.classList.add('hovering');
        const onHoverEnd = () => document.body.classList.remove('hovering');

        window.addEventListener('mousemove', moveCursor);

        // Add listeners to all clickable elements
        const clickables = document.querySelectorAll('a, button, .clickable');
        clickables.forEach(el => {
            el.addEventListener('mouseenter', onHoverStart);
            el.addEventListener('mouseleave', onHoverEnd);
        });

        // Mutation observer to handle dynamically added elements (like newly rendered routes)
        const observer = new MutationObserver((mutations) => {
            const newClickables = document.querySelectorAll('a, button, .clickable');
            newClickables.forEach(el => {
                el.removeEventListener('mouseenter', onHoverStart); // plain remove to avoid dupe? actually better to just re-add efficiently or delegate.
                el.addEventListener('mouseenter', onHoverStart);
                el.addEventListener('mouseleave', onHoverEnd);
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            observer.disconnect();
            clickables.forEach(el => {
                el.removeEventListener('mouseenter', onHoverStart);
                el.removeEventListener('mouseleave', onHoverEnd);
            });
        };
    }, [location]);

    return (
        <div className="custom-cursor" ref={cursorRef}>
            <div className="cursor-bubble"></div>
        </div>
    );
};

export default Cursor;
