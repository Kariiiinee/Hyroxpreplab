import React, { createContext, useContext, useState, useEffect } from 'react';

const WorkoutsContext = createContext();

export const WorkoutsProvider = ({ children }) => {
    const [completedWorkouts, setCompletedWorkouts] = useState(() => {
        const saved = localStorage.getItem('hyrox_completed_workouts');
        const data = saved ? JSON.parse(saved) : [];
        // Migration: Ensure all old workouts have a completed status
        return data.map(w => ({ ...w, completed: w.completed !== undefined ? w.completed : true }));
    });

    const [readinessData, setReadinessData] = useState(() => {
        const saved = localStorage.getItem('hyrox_readiness_data');
        return saved ? JSON.parse(saved) : {
            currentScore: 0,
            lastUpdated: null,
            history: [], // For baseline calculation
            streak: 0
        };
    });

    const [stats, setStats] = useState({
        hrv: 0,
        sleep: 0,
        runningVolume: 0, // Total km for the week
        pftScore: '-'
    });

    useEffect(() => {
        localStorage.setItem('hyrox_completed_workouts', JSON.stringify(completedWorkouts));
    }, [completedWorkouts]);

    useEffect(() => {
        localStorage.setItem('hyrox_readiness_data', JSON.stringify(readinessData));
    }, [readinessData]);

    const [savedDays, setSavedDays] = useState(() => {
        const saved = localStorage.getItem('hyrox_saved_days');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('hyrox_saved_days', JSON.stringify(savedDays));
    }, [savedDays]);

    const saveDay = () => {
        const todayStr = new Date().toLocaleDateString();
        if (!savedDays.includes(todayStr)) {
            setSavedDays(prev => [...prev, todayStr]);
        }
    };

    const unsaveDay = () => {
        const todayStr = new Date().toLocaleDateString();
        setSavedDays(prev => prev.filter(day => day !== todayStr));
    };

    const calculateReadiness = (input) => {
        // 1. Normalization (0-100)
        // Sleep component: (Target 8h)
        const sSleep = ((input.sleepHrs / 8) * 50) + (input.sleepQual * 10);
        const sEnergy = input.energy * 20;
        const sRecovery = (input.freshness * 10) + (input.nervousSystem * 10);
        const sStress = (6 - input.stress) * 20;
        const sSoreness = (6 - input.soreness) * 20;

        // 2. Base Weighted Score
        let score = (sSleep * 0.3) + (sEnergy * 0.2) + (sRecovery * 0.2) +
            (sStress * 0.15) + (sSoreness * 0.1) + (input.yesterdayLoad * 0.05);

        // 3. Non-Linear Penalties
        if (input.yesterdayLoad >= 4 && input.soreness >= 4) {
            score *= 0.85;
        }

        // 4. Safety Caps
        if (input.isIll) score = Math.min(score, 35);

        // 5. Delta Cap (25%/day)
        const yesterday = readinessData.currentScore;
        const diff = score - yesterday;
        if (Math.abs(diff) > 25 && !input.isIll) {
            score = yesterday + (Math.sign(diff) * 25);
        }

        const finalScore = Math.round(Math.max(0, Math.min(100, score)));

        setReadinessData(prev => ({
            ...prev,
            currentScore: finalScore,
            lastInputs: input,
            lastUpdated: new Date().toLocaleDateString(),
            history: [finalScore, ...prev.history].slice(0, 30),
            streak: prev.lastUpdated === new Date().toLocaleDateString() ? prev.streak : prev.streak + 1
        }));

        return finalScore;
    };

    const logWorkout = (workout, completed = false) => {
        const newWorkout = {
            ...workout,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString(),
            completed
        };
        setCompletedWorkouts(prev => [newWorkout, ...prev]);
    };

    const toggleWorkoutStatus = (id) => {
        setCompletedWorkouts(prev => prev.map(w =>
            w.id === id ? { ...w, completed: !w.completed } : w
        ));
    };

    const deleteWorkout = (id) => {
        setCompletedWorkouts(prev => prev.filter(w => w.id !== id));
    };

    const getWeeklyStats = () => {
        const categories = { 'Race Stations': 0, 'Strength': 0, 'Endurance': 0, 'Recovery': 0 };
        const now = new Date();
        const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));

        completedWorkouts.forEach(w => {
            if (!w.completed) return; // Only count completed workouts for trends
            const workoutDate = new Date(w.date);
            if (workoutDate >= sevenDaysAgo) {
                if (categories.hasOwnProperty(w.category)) {
                    categories[w.category]++;
                }
            }
        });

        // Normalize to 0-100 for bar height (max of 5 workouts per cat as 100% for now)
        return {
            race: Math.min((categories['Race Stations'] / 5) * 100, 100),
            strength: Math.min((categories['Strength'] / 5) * 100, 100),
            endurance: Math.min((categories['Endurance'] / 5) * 100, 100),
            recovery: Math.min((categories['Recovery'] / 5) * 100, 100)
        };
    };

    return (
        <WorkoutsContext.Provider value={{
            completedWorkouts,
            logWorkout,
            toggleWorkoutStatus,
            deleteWorkout,
            readinessData,
            calculateReadiness,
            stats,
            weeklyStats: getWeeklyStats(),
            savedDays,
            saveDay,
            unsaveDay
        }}>
            {children}
        </WorkoutsContext.Provider>
    );
};

export const useWorkouts = () => useContext(WorkoutsContext);
