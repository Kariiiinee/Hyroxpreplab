import React, { useState } from 'react';
import { useWorkouts } from '../context/WorkoutsContext';
import './ReadinessCheck.css';

const ReadinessCheck = ({ onComplete, onCancel }) => {
    const { calculateReadiness } = useWorkouts();
    const [step, setStep] = useState(1);
    const [inputs, setInputs] = useState({
        sleepHrs: 7.5,
        sleepQual: 3,
        freshness: 3,
        nervousSystem: 3,
        energy: 3,
        soreness: 1,
        yesterdayLoad: 2,
        stress: 2,
        isIll: false
    });

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else {
            calculateReadiness(inputs);
            onComplete();
        }
    };

    const handleInputChange = (name, value) => {
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="readiness-overlay animate-in">
            <div className="readiness-modal">
                <div className="modal-header">
                    <h2>DAILY CHECK-IN</h2>
                    <span className="step-indicator">Step {step} of 3</span>
                </div>

                <div className="step-content">
                    {step === 1 && (
                        <div className="step-fade-in">
                            <h3 className="emerald-text">How did you wake up?</h3>
                            <div className="input-group">
                                <label>Sleep Duration: <strong>{inputs.sleepHrs}h</strong></label>
                                <input
                                    type="range" min="4" max="12" step="0.5"
                                    value={inputs.sleepHrs}
                                    onChange={(e) => handleInputChange('sleepHrs', parseFloat(e.target.value))}
                                />
                            </div>
                            <div className="input-group">
                                <label>Sleep Quality: <strong>{['Bad', 'Fair', 'Good', 'Great', 'Perfect'][inputs.sleepQual - 1]}</strong></label>
                                <div className="rating-options">
                                    {[1, 2, 3, 4, 5].map(v => (
                                        <button
                                            key={v}
                                            className={inputs.sleepQual === v ? 'active' : ''}
                                            onClick={() => handleInputChange('sleepQual', v)}
                                        >{v}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step-fade-in">
                            <h3 className="emerald-text">Body Status</h3>
                            <div className="input-group">
                                <label>Energy Level: <strong>{inputs.energy}/5</strong></label>
                                <div className="rating-options">
                                    {[1, 2, 3, 4, 5].map(v => (
                                        <button
                                            key={v}
                                            className={inputs.energy === v ? 'active' : ''}
                                            onClick={() => handleInputChange('energy', v)}
                                        >{v}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Muscle Soreness: <strong>{inputs.soreness}/5</strong></label>
                                <div className="rating-options red-scale">
                                    {[1, 2, 3, 4, 5].map(v => (
                                        <button
                                            key={v}
                                            className={inputs.soreness === v ? 'active' : ''}
                                            onClick={() => handleInputChange('soreness', v)}
                                        >{v}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="step-fade-in">
                            <h3 className="emerald-text">Environment</h3>
                            <div className="input-group">
                                <label>Yesterday's Intensity: <strong>{['Rest', 'Easy', 'Mod', 'Hard', 'Max'][inputs.yesterdayLoad - 1]}</strong></label>
                                <div className="rating-options">
                                    {[1, 2, 3, 4, 5].map(v => (
                                        <button
                                            key={v}
                                            className={inputs.yesterdayLoad === v ? 'active' : ''}
                                            onClick={() => handleInputChange('yesterdayLoad', v)}
                                        >{v}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="input-group stress-group">
                                <label className="flex-between">
                                    Mental Stress Level: <strong>{inputs.stress}/5</strong>
                                </label>
                                <input
                                    type="range" min="1" max="5"
                                    value={inputs.stress}
                                    onChange={(e) => handleInputChange('stress', parseInt(e.target.value))}
                                />
                            </div>
                            <div className="input-group inline-group">
                                <label>Feeling Ill/Injured?</label>
                                <input
                                    type="checkbox"
                                    checked={inputs.isIll}
                                    onChange={(e) => handleInputChange('isIll', e.target.checked)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-text" onClick={onCancel}>SKIP</button>
                    <button className="btn-primary" onClick={handleNext}>
                        {step === 3 ? 'CALCULATE' : 'NEXT'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReadinessCheck;
