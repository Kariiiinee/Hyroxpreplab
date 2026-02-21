import React, { useState } from 'react';
import { WORKOUT_DATA } from '../constants/workouts';
import WorkoutCard from '../components/WorkoutCard';
import './Library.css';

const Library = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const filters = ['All', 'Race Stations', 'Strength & Power', 'Endurance', 'Recovery'];

    const getCount = (filter) => {
        if (filter === 'All') return WORKOUT_DATA.length;
        // Normalizing category match for Strength variants
        return WORKOUT_DATA.filter(w => {
            if (filter === 'Strength & Power') return w.category === 'Strength' || w.category === 'Strength & Power';
            return w.category === filter;
        }).length;
    };

    const filteredWorkouts = WORKOUT_DATA.filter(w => {
        const matchesFilter = activeFilter === 'All' ||
            (activeFilter === 'Strength & Power' ? (w.category === 'Strength' || w.category === 'Strength & Power') : w.category === activeFilter);

        const safeTitle = w.title || '';
        const safeDesc = w.description || '';
        const safeTech = w.technique || '';
        const safeAlt = w.calisthenicsAlternative || '';
        const q = searchQuery.toLowerCase();

        const matchesSearch = safeTitle.toLowerCase().includes(q) ||
            safeDesc.toLowerCase().includes(q) ||
            safeTech.toLowerCase().includes(q) ||
            safeAlt.toLowerCase().includes(q);

        return matchesFilter && matchesSearch;
    });

    const handleFilterClick = (f) => {
        setActiveFilter(f);
        // Optional: clear search on filter change to avoid "empty results" confusion
        // setSearchQuery(''); 
    };

    return (
        <div className="library-page animate-in">
            <div className="library-header">
                <h1 className="page-title">Activity Library</h1>
                <p className="page-subtitle text-muted">
                    This library contains detailed training activities for HYROX preparation, including performance cues and technique tips.
                </p>
            </div>

            <div className="search-box glass">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--text-secondary)">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="filters-scroll">
                {filters.map(f => (
                    <button
                        key={f}
                        className={`filter-chip ${activeFilter === f ? 'active' : ''}`}
                        onClick={() => handleFilterClick(f)}
                    >
                        {f} <span className="count">({getCount(f)})</span>
                    </button>
                ))}
            </div>

            <div className="workout-list">
                {filteredWorkouts.length > 0 ? (
                    filteredWorkouts.map((w, i) => (
                        <WorkoutCard key={i} workout={w} />
                    ))
                ) : (
                    <div className="empty-state">
                        <p className="text-muted">No workouts found for "{searchQuery}" in {activeFilter}.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Library;
