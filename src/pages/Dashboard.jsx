import React, { useState } from 'react';
import { useWorkouts } from '../context/WorkoutsContext';
import ReadinessCheck from '../components/ReadinessCheck';
import { WORKOUT_DATA } from '../constants/workouts';
import './Dashboard.css';
import heroImage from '../assets/hero_image.png';

const Dashboard = () => {
    const { completedWorkouts, readinessData, deleteWorkout, weeklyStats, logWorkout, toggleWorkoutStatus, saveDay, unsaveDay, savedDays } = useWorkouts();
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmSaveDay, setConfirmSaveDay] = useState(false);
    const [confirmUnsaveDay, setConfirmUnsaveDay] = useState(false);

    // Library Picker State
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerSearch, setPickerSearch] = useState('');

    const score = readinessData.currentScore;
    const [animatedScore, setAnimatedScore] = useState(0);

    const todayStr = new Date().toLocaleDateString();
    const todayWorkouts = completedWorkouts.filter(w => w.date === todayStr);

    React.useEffect(() => {
        let start = 0;
        const end = score;
        const duration = 1500; // 1.5 seconds for a premium feel
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Cubic ease-out for a smooth finish
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            const currentCount = Math.floor(easeProgress * end);
            setAnimatedScore(currentCount);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [score]);

    const filteredLibrary = WORKOUT_DATA.filter(w =>
        w.title.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        w.category.toLowerCase().includes(pickerSearch.toLowerCase())
    );

    const addWorkoutFromLibrary = (workout) => {
        const newW = {
            title: workout.title,
            category: workout.category,
            // time can just be "Scheduled" or similar if we don't have one
            time: 'Scheduled'
        };
        // logWorkout defaults to completed=false, but we could set it if we wanted.
        logWorkout(newW, false);
        setIsPickerOpen(false);
        setPickerSearch('');
    };

    const getZoneClass = () => {
        if (score >= 70) return 'zone-emerald';
        if (score >= 50) return 'zone-yellow';
        return 'zone-red';
    };

    // Suggestion Engine Logic
    const getSuggestions = () => {
        // Advanced Logic: Balance trends + Readiness
        let suggestedTitles = [];
        if (score >= 80) {
            if (weeklyStats.race < weeklyStats.strength) {
                suggestedTitles = [
                    { title: "Sled Push", reason: "Readiness is peak. Weekly race volume is low." },
                    { title: "Running Intervals", reason: "High energy day. Perfect for VO2 max work." }
                ];
            } else {
                suggestedTitles = [
                    { title: "Heavy Back Squats", reason: "Readiness is peak. Build your force production." },
                    { title: "Wall Balls", reason: "Excellent recovery. Focus on race-pace station work." }
                ];
            }
        } else if (score >= 50) {
            if (weeklyStats.endurance < 60) {
                suggestedTitles = [
                    { title: "Easy Run", reason: "Aerobic focus. Build engine without high CNS fatigue." },
                    { title: "Rowing", reason: "Focus on technical efficiency at moderate heart rate." }
                ];
            } else {
                suggestedTitles = [
                    { title: "KB Swings & Lunges", reason: "Maintenance strength. Focus on movement quality." },
                    { title: "Distance Reps", reason: "Steady state cardio for metabolic conditioning." }
                ];
            }
        } else {
            suggestedTitles = [
                { title: "Active Recovery Path", reason: "CNS fatigue detected. Low impact movement only." },
                { title: "Mobility & Flow", reason: "Improve range of motion and accelerate recovery." }
            ];
        }

        // Map titles to full workout objects from WORKOUT_DATA
        return suggestedTitles.map(s => {
            const fullWorkout = WORKOUT_DATA.find(w => w.title === s.title);
            return fullWorkout ? { ...fullWorkout, reason: s.reason } : { title: s.title, category: 'General', reason: s.reason, description: 'No details available.' };
        });
    };

    const suggestions = getSuggestions();

    const formattedDate = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });

    const strokeDashoffset = 282 - (282 * animatedScore) / 100;

    const handleLogSuggested = (workout) => {
        logWorkout({ title: workout.title, category: workout.category }, false); // Add as not completed
        setSelectedWorkout(null);
    };

    return (
        <div className="dashboard-page animate-in">
            <section className="dashboard-hero animate-in">

                <h1 className="hero-title" style={{ textAlign: 'center' }}>
                    Training for <span className="text-gradient">HYROX</span>
                </h1>

                <div className="hero-image-container">
                    <img src={heroImage} alt="Hyrox Training" className="hero-image" />
                </div>

                <div className="hero-content">
                    <p className="hero-challenge">
                        It's unique because you are trying to build two things that usually fight each other: <strong className="text-primary">massive strength</strong> and <strong className="text-primary">long-distance running endurance</strong>.
                    </p>

                    <div className="hero-solution glass-panel">
                        <p>
                            Stop guessing your training. We give you structured workouts, daily readiness insights, and an AI Coach that adapts to your fitness so every session builds real performance.
                        </p>
                    </div>

                    <div className="hero-benefits">
                        <span className="benefit-item">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--emerald)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                            Train with purpose
                        </span>
                        <span className="benefit-item">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--emerald)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                            Recover smarter
                        </span>
                        <span className="benefit-item">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--emerald)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                            Show up ready
                        </span>
                    </div>

                    <p className="hero-footer-text text-muted">
                        Your plan evolves with you — so you always know what to do today and why it matters.
                    </p>
                </div>

                <div className="hero-bottom-highlight">
                    <p className="hero-subtitle text-emerald">YOUR PREPARATION. OPTIMIZED.</p>
                </div>
            </section>

            {showCheckIn && (
                <ReadinessCheck
                    onComplete={() => setShowCheckIn(false)}
                    onCancel={() => setShowCheckIn(false)}
                />
            )}

            {selectedWorkout && (
                <div className="readiness-overlay glass animate-in" onClick={() => setSelectedWorkout(null)}>
                    <div className="readiness-modal workout-detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="tag text-emerald">{selectedWorkout.category}</span>
                            <button className="close-btn" onClick={() => setSelectedWorkout(null)}>×</button>
                        </div>
                        <h2>{selectedWorkout.title}</h2>
                        <p className="description">{selectedWorkout.description}</p>

                        {selectedWorkout.technique && (
                            <div className="technique-box">
                                <span className="label text-emerald">PRO TIP:</span>
                                <p>{selectedWorkout.technique}</p>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setSelectedWorkout(null)}>CANCEL</button>
                            <button className="btn-primary" onClick={() => handleLogSuggested(selectedWorkout)}>
                                ADD TO DAILY ACTIVITY
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`readiness-section ${getZoneClass()}`}>
                <div className="readiness-text">
                    <h2>DAILY READINESS</h2>
                    <p className="text-muted" style={{ fontSize: '0.85rem', maxWidth: '90%', margin: '0 auto 16px auto', lineHeight: '1.4' }}>
                        Your Daily Readiness score combines various factors including your sleep, recovery, energy, stress inputs etc to estimate how prepared your body is to train today.
                    </p>
                    <button className="btn-primary start-checkin-btn" onClick={() => setShowCheckIn(true)}>
                        START YOUR DAILY CHECK-IN
                    </button>
                </div>
                <div className="radial-progress-container" onClick={() => setShowCheckIn(true)}>
                    <svg viewBox="0 0 100 100" className="radial-progress">
                        <circle cx="50" cy="50" r="45" className="bg" />
                        <circle cx="50" cy="50" r="45" className="fg" style={{ strokeDasharray: '282', strokeDashoffset }} />
                    </svg>
                    <div className="progress-content">
                        <span className="value">{animatedScore}%</span>
                        <span className="label">READY</span>
                    </div>
                    {readinessData.lastUpdated !== todayStr && (
                        <div className="checkin-badge">TAP TO CHECK IN</div>
                    )}
                </div>
                <p className="text-muted" style={{ maxWidth: '80%', margin: '0 auto', lineHeight: '1.5' }}>
                    {score >= 80 ? "Your baseline strength and recovery are optimal for high-intensity today." :
                        score >= 50 ? "Moderate readiness. Focus on technical quality and controlled intensity." :
                            "Recovery priority. Consider a mobility session or active rest today."}
                </p>
            </div>

            <div className="stats-card glass">
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="label">SLEEP</span>
                        <span className="val">{readinessData.lastInputs?.sleepHrs || 0} <span className="unit">hr</span></span>
                    </div>
                    <div className="stat-item">
                        <span className="label">ENERGY</span>
                        <span className="val">{readinessData.lastInputs?.energy || 0}<span className="unit">/5</span></span>
                    </div>
                    <div className="stat-item">
                        <span className="label">RECOVERY</span>
                        <span className="val">{readinessData.lastInputs?.freshness || 0}<span className="unit">/5</span></span>
                    </div>
                    <div className="stat-item">
                        <span className="label">STRESS</span>
                        <span className="val">{readinessData.lastInputs?.stress || 0}<span className="unit">/5</span></span>
                    </div>
                </div>
            </div>

            <div className="dashboard-sections">
                {readinessData.lastUpdated === todayStr && (
                    <section className="suggestions-section">
                        <div className="section-header">
                            <div>
                                <h3 className="section-title">Activities suggested for you</h3>
                                <p className="section-subtitle text-muted">Based on your daily readiness and weekly trend</p>
                            </div>
                        </div>
                        <div className="suggestion-cards">
                            {suggestions.map((s, i) => (
                                <div
                                    key={i}
                                    className="suggestion-item animate-in clickable"
                                    style={{ animationDelay: `${i * 0.1}s` }}
                                    onClick={() => setSelectedWorkout(s)}
                                >
                                    <div className="suggestion-meta">
                                        <span className="tag text-emerald">{s.category}</span>
                                        <span className="reason text-muted">{s.reason}</span>
                                    </div>
                                    <div className="suggestion-content">
                                        <span className="title">{s.title}</span>
                                        <div className="activity-icon emerald-bg mini">
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="black">
                                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="daily-progress">
                    <div className="section-header">
                        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            My Daily Activities log
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>({todayWorkouts.length})</span>
                        </h3>
                        <span className="date-badge glass">{formattedDate}</span>
                    </div>
                    <div className="activity-list">
                        {todayWorkouts.length > 0 && !todayWorkouts[0].completed && (
                            <div className="onboarding-hint">
                                <svg viewBox="0 0 24 24" width="22" height="22" fill="var(--emerald)">
                                    <path d="M11 5v11.17l-4.88-4.88c-.39-.39-1.03-.39-1.42 0s-.39 1.03 0 1.42l6.59 6.59c.39.39 1.02.39 1.41 0l6.59-6.59c.39-.39.39-1.02 0-1.41s-1.02-.39-1.41 0L13 16.17V5c0-.55-.45-1-1-1s-1 .45-1 1z" />
                                </svg>
                                <span className="hint-text">Mark your activity as complete here</span>
                            </div>
                        )}
                        {todayWorkouts.length > 0 ? todayWorkouts.map(workout => (
                            <div key={workout.id} className="activity-item">
                                <div
                                    className={`activity-icon status-toggle ${workout.completed ? 'emerald-bg' : 'grey-bg'}`}
                                    onClick={() => toggleWorkoutStatus(workout.id)}
                                    title={workout.completed ? "Mark as planned" : "Mark as completed"}
                                >
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill={workout.completed ? "black" : "white"}>
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    </svg>
                                </div>
                                <div className="activity-info">
                                    <span className={`title ${workout.completed ? '' : 'planned'}`}>{workout.title}</span>
                                    <span className="category text-muted">{workout.category}</span>
                                </div>
                                <div className="activity-meta">
                                    <span className="time">{workout.time}</span>
                                    <button
                                        className={`delete-btn ${deletingId === workout.id ? 'confirming' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (deletingId === workout.id) {
                                                deleteWorkout(workout.id);
                                                setDeletingId(null);
                                            } else {
                                                setDeletingId(workout.id);
                                                // Reset after 3 seconds if not confirmed
                                                setTimeout(() => setDeletingId(null), 3000);
                                            }
                                        }}
                                        title={deletingId === workout.id ? "Click again to delete" : "Delete activity"}
                                    >
                                        {deletingId === workout.id ? (
                                            <span className="confirm-text">CONFIRM?</span>
                                        ) : (
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--text-secondary)">
                                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-muted empty-state">No activities completed today yet.</p>
                        )}
                        <div className="add-activity-container" style={{ marginTop: '16px' }}>
                            {!isPickerOpen ? (
                                <button className="browse-library-btn glass" style={{ width: '100%' }} onClick={() => setIsPickerOpen(true)}>
                                    + ADD FROM LIBRARY
                                </button>
                            ) : (
                                <div className="library-picker glass animate-in" style={{ position: 'relative', marginTop: '8px' }}>
                                    <div className="picker-header">
                                        <input
                                            type="text"
                                            placeholder="Search library..."
                                            value={pickerSearch}
                                            onChange={(e) => setPickerSearch(e.target.value)}
                                            autoFocus
                                        />
                                        <button className="close-picker" onClick={() => setIsPickerOpen(false)}>×</button>
                                    </div>
                                    <div className="picker-results scrollable" style={{ maxHeight: '200px' }}>
                                        {filteredLibrary.map((w, idx) => (
                                            <div key={idx} className="picker-item" onClick={() => addWorkoutFromLibrary(w)}>
                                                <span className="item-title">{w.title}</span>
                                                <span className="item-cat">{w.category}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {savedDays.includes(todayStr) ? (
                            <button
                                className={`btn-primary ${confirmUnsaveDay ? 'confirming' : ''}`}
                                style={{
                                    marginTop: '16px',
                                    width: '100%',
                                    backgroundColor: confirmUnsaveDay ? 'var(--alert-red)' : 'transparent',
                                    color: confirmUnsaveDay ? 'white' : 'var(--text-secondary)',
                                    border: confirmUnsaveDay ? 'none' : '1px solid var(--border-color)',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => {
                                    if (confirmUnsaveDay) {
                                        unsaveDay();
                                        setConfirmUnsaveDay(false);
                                    } else {
                                        setConfirmUnsaveDay(true);
                                        // Reset confirmation after 3 seconds
                                        setTimeout(() => setConfirmUnsaveDay(false), 3000);
                                    }
                                }}
                            >
                                {confirmUnsaveDay ? "CONFIRM UNSAVE?" : "UNSAVE DAY TO EDIT"}
                            </button>
                        ) : (
                            <button
                                className={`btn-primary ${confirmSaveDay ? 'confirming' : ''}`}
                                style={{
                                    marginTop: '16px',
                                    width: '100%',
                                    backgroundColor: confirmSaveDay ? 'var(--alert-red)' : 'var(--emerald)',
                                    color: 'black',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => {
                                    if (confirmSaveDay) {
                                        saveDay();
                                        setConfirmSaveDay(false);
                                    } else {
                                        setConfirmSaveDay(true);
                                        // Reset confirmation after 3 seconds
                                        setTimeout(() => setConfirmSaveDay(false), 3000);
                                    }
                                }}
                            >
                                {confirmSaveDay ? "CONFIRM SAVE?" : "SAVE MY DAY"}
                            </button>
                        )}
                    </div>
                </section>


            </div>
        </div>
    );
};

export default Dashboard;
