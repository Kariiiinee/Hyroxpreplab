import React, { useState, useRef, useEffect } from 'react';
import { getCoachResponse } from '../services/geminiService';
import './Coach.css';

const Coach = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your HYROX PREPLAB AI Coach. I've analyzed your training program and the library. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await getCoachResponse(input, messages, apiKey);
            const assistantMessage = { role: 'assistant', content: response };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="coach-page animate-in">
            <div className="chat-container">
                {messages.map((m, i) => (
                    <div key={i} className={`message-wrapper ${m.role}`}>
                        <div className={`message-bubble glass ${m.role}`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="message-wrapper assistant">
                        <div className="message-bubble glass assistant typing">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area glass">
                <input
                    type="text"
                    placeholder="Ask your coach anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button onClick={handleSend} className="send-btn">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="var(--emerald)">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Coach;
