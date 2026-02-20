import React, { useState } from 'react';
import { useWorkouts } from '../context/WorkoutsContext';
import './WorkoutCard.css';

const WorkoutCard = ({ workout }) => {
    const { title, category, description, technique } = workout;
    const { logWorkout } = useWorkouts();
    const [isLogged, setIsLogged] = useState(false);

    const handleLog = () => {
        logWorkout({ title, category });
        setIsLogged(true);
        setTimeout(() => setIsLogged(false), 2000);
    };

    return (
        <div className="workout-card glass">
            <div className="card-header">
                <span className="category-tag text-emerald">{category}</span>
                <h3>{title}</h3>
            </div>
            <p className="description text-muted">{description}</p>
            {technique && (
                <div className="technique-box">
                    <span className="label text-emerald">PRO TIP:</span>
                    <p>{technique}</p>
                </div>
            )}
            <div className="card-actions">
                <button className="btn-secondary" onClick={handleLog} disabled={isLogged}>
                    {isLogged ? 'ADDED!' : 'ADD TO DAILY LIST'}
                </button>
                {/* 
                <button className="btn-primary">
                    START
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </button>
                */}
            </div>
        </div>
    );
};

export default WorkoutCard;
