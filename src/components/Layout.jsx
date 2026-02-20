import React from 'react';
import './Layout.css';

const Layout = ({ children, activeTab, onTabChange }) => {
    return (
        <div className="layout-container">
            <header className="header glass">
                <div className="header-content">
                    <span className="brand">HYROX<span className="text-emerald">PREPLAB</span></span>
                </div>
            </header>

            <main className="content">
                {children}
            </main>

            <nav className="bottom-nav glass">
                <button
                    className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => onTabChange('dashboard')}
                >
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                    </svg>
                    <span>My Program</span>
                </button>
                <button
                    className={`nav-item ${activeTab === 'library' ? 'active' : ''}`}
                    onClick={() => onTabChange('library')}
                >
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                    </svg>
                    <span>Library</span>
                </button>
                <button
                    className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
                    onClick={() => onTabChange('calendar')}
                >
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                    </svg>
                    <span>Calendar</span>
                </button>
                <button
                    className={`nav-item ${activeTab === 'coach' ? 'active' : ''}`}
                    onClick={() => onTabChange('coach')}
                >
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M8 12h8m-4-4v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span>AI Coach</span>
                </button>
            </nav>
            <div className="bottom-spacing"></div>
        </div>
    );
};

export default Layout;
