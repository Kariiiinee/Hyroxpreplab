import React, { useState } from 'react';
import { useWorkouts } from '../context/WorkoutsContext';
import { WORKOUT_DATA } from '../constants/workouts';
import './Calendar.css';

const Calendar = () => {
    const { readinessHistory, dailyActivities } = useWorkouts();
    const [view, setView] = useState('weekly'); // 'weekly' or 'monthly'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerSearch, setPickerSearch] = useState('');

    const [weekData, setWeekData] = useState([
        {
            id: 1, day: 'Mon', date: '17', readiness: 85, sessions: 2, balance: 0.6, workouts: [
                { id: 'm1', title: 'HYROX PFT', category: 'Race Workouts', time: '45 min', completed: true },
                { id: 'm2', title: 'Base Run', category: 'Endurance', time: '30 min', completed: true }
            ], notes: 'Legs felt fresh. Strong finish.', isRestDay: false
        },
        {
            id: 2, day: 'Tue', date: '18', readiness: 45, sessions: 1, balance: 0.3, workouts: [
                { id: 't1', title: 'Strength Protocol', category: 'Strength', time: '50 min', completed: true }
            ], notes: 'Low sleep, heart rate high today.', isRestDay: false
        },
        {
            id: 3, day: 'Wed', date: '19', readiness: 92, sessions: 3, balance: 0.8, workouts: [
                { id: 'w1', title: 'Power Clusters', category: 'Power', time: '40 min', completed: true },
                { id: 'w2', title: 'Zone 2 Bike', category: 'Endurance', time: '45 min', completed: true },
                { id: 'w3', title: 'Mobility', category: 'Recovery', time: '20 min', completed: true }
            ], notes: 'Excellent recovery session.', isRestDay: false
        },
        {
            id: 4, day: 'Thu', date: '20', readiness: 78, sessions: 2, balance: 0.5, workouts: [
                { id: 'th1', title: 'Burpee Intervals', category: 'Race Workouts', time: '35 min', completed: true },
                { id: 'th2', title: 'Heavy Sled Pull', category: 'Strength', time: '20 min', completed: true }
            ], isRestDay: false
        },
        {
            id: 5, day: 'Fri', date: '21', readiness: 65, sessions: 1, balance: 0.4, workouts: [
                { id: 'f1', title: 'Progressive Run', category: 'Endurance', time: '40 min', completed: true }
            ], isRestDay: false
        },
        {
            id: 6, day: 'Sat', date: '22', readiness: 88, sessions: 2, balance: 0.7, workouts: [
                { id: 's1', title: 'Simulation 1', category: 'Race Workouts', time: '60 min', completed: true },
                { id: 's2', title: 'Core Stability', category: 'Strength', time: '20 min', completed: true }
            ], isRestDay: false
        },
        { id: 7, day: 'Sun', date: '23', readiness: 95, sessions: 0, balance: 0.0, workouts: [], isRestDay: true },
    ]);

    const [viewDate, setViewDate] = useState(new Date(2026, 1, 1)); // Default Feb 2026

    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));

    // Generate month view data based on viewDate
    const getMonthDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const startDay = (firstDay + 6) % 7; // Convert to Mon=0, Tue=1, ..., Sun=6

        const days = [];
        for (let i = 1; i <= daysInMonth; i++) {
            // Check if this date is in our current weekData (Feb 17-23)
            const weekMatch = weekData.find(wd => wd.date === i.toString() && month === 1 && year === 2026);

            if (weekMatch) {
                days.push({
                    date: i,
                    readiness: weekMatch.readiness,
                    intensity: weekMatch.workouts.length * 0.3,
                    isActive: weekMatch.workouts.length > 0,
                    workouts: weekMatch.workouts
                });
            } else {
                // Simulated data for others
                const isActive = (i + month) % 3 === 0;
                days.push({
                    date: i,
                    readiness: isActive ? 70 : 50,
                    intensity: isActive ? 0.5 : 0.1,
                    isActive,
                    workouts: isActive ? [{}, {}] : []
                });
            }
        }
        return { days, startDay };
    };

    const { days: monthDays, startDay: monthStartDay } = getMonthDays();
    const totalSessions = monthDays.reduce((acc, d) => acc + d.workouts.length, 0);


    const getReadinessColor = (score) => {
        if (score === null || score === undefined) return '#E5E7EB';
        if (score >= 85) return '#16A34A'; // Peak
        if (score >= 70) return '#4ADE80'; // Good
        if (score >= 50) return '#FACC15'; // Moderate
        if (score >= 30) return '#FB923C'; // Low
        return '#EF4444'; // Red
    };

    const recalculateDay = (dayObj) => {
        if (dayObj.isRestDay) {
            return { ...dayObj, sessions: 0, balance: 0, readiness: 100 };
        }

        const workouts = dayObj.workouts;
        const sessions = workouts.length;

        // Calculate Balance (Strength/Power vs Endurance/Race)
        const sWorkouts = workouts.filter(w => ['Strength', 'Power', 'Race Workouts'].includes(w.category)).length;
        const balance = sessions > 0 ? sWorkouts / sessions : 0;

        // Calculate Readiness (Simulated: Workouts add fatigue)
        // Base readiness is high, sessions reduce it
        let readiness = 95;
        workouts.forEach(w => {
            if (w.category === 'Race Workouts') readiness -= 15;
            else if (['Strength', 'Power'].includes(w.category)) readiness -= 10;
            else if (w.category === 'Endurance') readiness -= 8;
            else if (w.category === 'Recovery') readiness += 5;
        });

        return {
            ...dayObj,
            sessions,
            balance: Math.min(1, Math.max(0, balance)),
            readiness: Math.min(100, Math.max(0, readiness))
        };
    };

    const toggleRestDay = (dayId) => {
        setWeekData(prev => prev.map(d => {
            if (d.id === dayId) {
                const nowRest = !d.isRestDay;
                const updated = {
                    ...d,
                    isRestDay: nowRest,
                    workouts: nowRest ? [] : d.workouts,
                };
                return recalculateDay(updated);
            }
            return d;
        }));

        if (selectedDay && selectedDay.id === dayId) {
            setSelectedDay(prev => {
                const nowRest = !prev.isRestDay;
                const updated = {
                    ...prev,
                    isRestDay: nowRest,
                    workouts: nowRest ? [] : prev.workouts,
                };
                return recalculateDay(updated);
            });
        }
    };

    const deleteWorkout = (dayId, workoutId) => {
        setWeekData(prev => prev.map(d => {
            if (d.id === dayId) {
                const updatedWorkouts = d.workouts.filter(w => w.id !== workoutId);
                return recalculateDay({ ...d, workouts: updatedWorkouts });
            }
            return d;
        }));
        if (selectedDay && selectedDay.id === dayId) {
            setSelectedDay(prev => {
                const updatedWorkouts = prev.workouts.filter(w => w.id !== workoutId);
                return recalculateDay({ ...prev, workouts: updatedWorkouts });
            });
        }
    };

    const addWorkoutFromLibrary = (dayId, workout) => {
        const newW = {
            id: Date.now(),
            title: workout.title,
            category: workout.category,
            time: 'Scheduled',
            completed: false
        };
        setWeekData(prev => prev.map(d => {
            if (d.id === dayId) {
                const updatedWorkouts = [...d.workouts, newW];
                return recalculateDay({ ...d, workouts: updatedWorkouts, isRestDay: false });
            }
            return d;
        }));
        if (selectedDay && selectedDay.id === dayId) {
            setSelectedDay(prev => {
                const updatedWorkouts = [...prev.workouts, newW];
                return recalculateDay({ ...prev, workouts: updatedWorkouts, isRestDay: false });
            });
        }
        setIsPickerOpen(false);
    };

    const filteredLibrary = WORKOUT_DATA.filter(w =>
        w.title.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        w.category.toLowerCase().includes(pickerSearch.toLowerCase())
    );

    return (
        <div className="calendar-page animate-in">
            {selectedDay && (
                <div className="day-detail-overlay animate-in" onClick={() => setSelectedDay(null)}>
                    <div className="day-modal solid-card" onClick={e => e.stopPropagation()}>
                        <header className="modal-header">
                            <div className="header-info">
                                <h3>{selectedDay.day} {selectedDay.date} FEB</h3>
                                <div className="readiness-pill" style={{
                                    background: `${getReadinessColor(selectedDay)}20`,
                                    color: getReadinessColor(selectedDay),
                                    border: `1px solid ${getReadinessColor(selectedDay)}40`
                                }}>
                                    {selectedDay.isRestDay ? 'REST DAY' : `READY: ${selectedDay.readiness}%`}
                                </div>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedDay(null)}>×</button>
                        </header>

                        <div className="modal-content">
                            <section className="detail-section">
                                <div className="section-header-row">
                                    <span className="label">ACTIVITIES ({selectedDay.workouts.length})</span>
                                    <button
                                        className={`rest-toggle ${selectedDay.isRestDay ? 'active' : ''}`}
                                        onClick={() => toggleRestDay(selectedDay.id)}
                                    >
                                        {selectedDay.isRestDay ? 'UNMARK REST' : 'MARK REST DAY'}
                                    </button>
                                </div>
                                <div className="detail-list scrollable">
                                    {selectedDay.workouts.length > 0 ? selectedDay.workouts.map((w) => (
                                        <div key={w.id} className="detail-item solid-item">
                                            <div className="item-icon emerald-bg mini">
                                                <svg viewBox="0 0 24 24" width="14" height="14" fill="black">
                                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                                </svg>
                                            </div>
                                            <div className="item-info">
                                                <span className="title">{w.title}</span>
                                                <span className="meta">{w.category} • {w.time}</span>
                                            </div>
                                            <button className="delete-activity-btn" onClick={() => deleteWorkout(selectedDay.id, w.id)}>
                                                <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--text-secondary)">
                                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                                </svg>
                                            </button>
                                        </div>
                                    )) : !selectedDay.isRestDay && (
                                        <p className="empty-state text-muted">No activities logged.</p>
                                    )}

                                    {selectedDay.isRestDay && selectedDay.workouts.length === 0 && (
                                        <div className="rest-day-notice glass">
                                            <span className="turquoise-text">ACTIVE RECOVERY MODE</span>
                                            <p>All activities cleared. Focus on HRV and mobility.</p>
                                        </div>
                                    )}

                                    {!selectedDay.isRestDay && (
                                        <div className="add-activity-container">
                                            {!isPickerOpen ? (
                                                <button className="browse-library-btn glass" onClick={() => setIsPickerOpen(true)}>
                                                    + ADD FROM LIBRARY
                                                </button>
                                            ) : (
                                                <div className="library-picker glass animate-in">
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
                                                    <div className="picker-results scrollable">
                                                        {filteredLibrary.map((w, idx) => (
                                                            <div key={idx} className="picker-item" onClick={() => addWorkoutFromLibrary(selectedDay.id, w)}>
                                                                <span className="item-title">{w.title}</span>
                                                                <span className="item-cat">{w.category}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>

                            <div className="modal-actions">
                                <button className="btn-primary" onClick={() => setSelectedDay(null)}>SAVE</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <header className="calendar-header">
                <div className="header-top">
                    <div>
                        <h2>CALENDAR</h2>
                        <p className="text-muted">Your hybrid engine is building</p>
                    </div>
                    <div className="view-toggle glass">
                        <button
                            className={view === 'weekly' ? 'active' : ''}
                            onClick={() => setView('weekly')}
                        >WEEK</button>
                        <button
                            className={view === 'monthly' ? 'active' : ''}
                            onClick={() => setView('monthly')}
                        >MONTH</button>
                    </div>
                </div>

                <div className="weekly-summary glass">
                    <div className="summary-item">
                        <span className="label">SESSIONS</span>
                        <span className="val">11</span>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-item">
                        <span className="label">AVG READY</span>
                        <span className="val text-emerald">78%</span>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-item">
                        <span className="label">STREAK</span>
                        <span className="val">6d</span>
                    </div>
                </div>
            </header>

            <div className="calendar-content">
                {view === 'weekly' ? (
                    <div className="weekly-agenda">
                        {weekData.map((d) => (
                            <div key={d.id} className="day-card glass" onClick={() => setSelectedDay(d)}>
                                <div className="day-info">
                                    <span className="day-name">{d.day}</span>
                                    <span className="day-date">{d.date}</span>
                                </div>

                                <div className="readiness-indicator">
                                    <div
                                        className={`readiness-ring ${d.isRestDay ? 'rest-mode' : ''}`}
                                        style={{ '--progress': d.readiness, '--color': d.isRestDay ? '#E5E7EB' : getReadinessColor(d.readiness) }}
                                    >
                                        {!d.isRestDay && <span className="score">{d.readiness}</span>}
                                    </div>
                                </div>

                                <div className="day-stats">
                                    <div className="sessions-count">
                                        {d.isRestDay ? (
                                            <span className="count turquoise-text">REST</span>
                                        ) : (
                                            <>
                                                <span className="count">{d.sessions}</span>
                                                <span className="label">WORKOUTS</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="balance-bar">
                                        <div className="bar-bg">
                                            <div className="bar-fill" style={{ width: `${d.balance * 100}%` }}></div>
                                        </div>
                                        <div className="balance-labels">
                                            <span>S</span>
                                            <span>E</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="tap-hint">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--text-secondary)">
                                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="monthly-view animate-in">
                        <div className="month-nav-header">
                            <button className="nav-btn" onClick={prevMonth}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                </svg>
                            </button>
                            <h2 className="current-month-label">
                                {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h2>
                            <button className="nav-btn" onClick={nextMonth}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                                </svg>
                            </button>
                        </div>

                        <div className="heatmap-grid">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => (
                                <div key={d} className="grid-label">{d}</div>
                            ))}
                            {/* Correct alignment based on month start day */}
                            {[...Array(monthStartDay)].map((_, i) => <div key={`empty-${i}`} className="heatmap-cell empty"></div>)}

                            {monthDays.map((d, idx) => (
                                <div
                                    key={d.date}
                                    className={`heatmap-cell ${d.isActive ? 'active' : ''} ${idx % 7 === 0 ? 'new-week' : ''}`}
                                    style={{
                                        backgroundColor: d.isActive ? getReadinessColor(d.readiness) : '#E5E7EB',
                                        opacity: d.isActive ? 1 : 0.6
                                    }}
                                    onClick={() => setView('weekly')}
                                >
                                    <div className="cell-content">
                                        <span className="date-num">{d.date}</span>
                                        {d.isActive && <span className="workout-count">({d.workouts.length})</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="motivational-overlay glass">
                            <div className="stats-row">
                                <div className="stat">
                                    <span className="val">{totalSessions}</span>
                                    <span className="lbl">TOTAL SESSIONS</span>
                                </div>
                                <div className="stat">
                                    <span className="val">{Math.round((totalSessions / 28) * 100)}%</span>
                                    <span className="lbl">CONSISTENCY</span>
                                </div>
                            </div>
                            <div className="overlay-text">
                                <p>You completed <strong>{totalSessions} sessions</strong> this month! Keep the hybrid engine running.</p>
                            </div>
                            <button className="jump-to-week-btn" onClick={() => setView('weekly')}>
                                VIEW LATEST WEEK
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calendar;
