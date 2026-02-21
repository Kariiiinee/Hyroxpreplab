import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2pdf from 'html2pdf.js';
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

    const handleDownloadPdf = (index) => {
        const element = document.getElementById(`message-content-${index}`);
        if (!element) return;

        // Create an off-screen container for clean PDF rendering (white background)
        const printContainer = document.createElement('div');
        printContainer.style.padding = '40px';
        printContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        printContainer.style.color = '#111';
        printContainer.style.background = '#fff';

        // Add Header
        const header = document.createElement('div');
        header.innerHTML = `
            <h1 style="color: #000; margin-bottom: 5px;">HYROX PREPLAB</h1>
            <h3 style="color: #666; margin-top: 0; margin-bottom: 20px;">AI Coach Session</h3>
            <hr style="border: none; border-top: 1px solid #ddd; margin-bottom: 30px;" />
        `;

        // Add Content (clone ReactMarkdown node)
        const contentClone = element.cloneNode(true);
        // We ensure text is dark formatted
        contentClone.style.color = '#111';

        // Add Footer
        const footer = document.createElement('div');
        footer.innerHTML = `
            <hr style="border: none; border-top: 1px solid #ddd; margin-top: 40px; margin-bottom: 20px;" />
            <p style="color: #888; font-size: 0.85rem; text-align: center;">
                &copy; ${new Date().getFullYear()} HyroxPrepLab. All rights reserved. <br/>
                <span style="font-size: 0.75rem;">This is AI-generated guidance. Always consult a professional for medical or specific training advice.</span>
            </p>
        `;

        printContainer.appendChild(header);
        printContainer.appendChild(contentClone);
        printContainer.appendChild(footer);

        const options = {
            margin: 0,
            filename: `HyroxPrepLab-Coach-${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Use the built-in save method, but add a tiny delay to ensure the DOM is ready
        setTimeout(() => {
            html2pdf().from(printContainer).set(options).save();
        }, 100);
    };

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
                            <div id={`message-content-${i}`} className="markdown-content">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {m.content}
                                </ReactMarkdown>
                            </div>
                            {m.role === 'assistant' && i > 0 && (
                                <button
                                    onClick={() => handleDownloadPdf(i)}
                                    className="download-pdf-btn"
                                    title="Download Response as PDF"
                                >
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                                    </svg>
                                    Download PDF
                                </button>
                            )}
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
