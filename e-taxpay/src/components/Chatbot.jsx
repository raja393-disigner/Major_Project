import { useState, useRef, useEffect } from 'react'
import { FiMessageSquare, FiX, FiSend, FiMinus } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

export default function Chatbot() {
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', content: `Namaste! I am your E-TaxPay Assistant. How can I help you today?` }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef()

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isOpen])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMsg = { role: 'user', content: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            const { data } = await api.post('/ai/chat', { message: input })
            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }])
            }
        } catch (err) {
            console.error("Chat Error:", err)
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Please check if backend is running." }])
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) {
        return (
            <button className="chatbot-trigger anim-float" onClick={() => setIsOpen(true)}>
                <span className="trigger-text">Ask AI Assistant</span>
                <FiMessageSquare size={28} />
                <div className="pulse-soft" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--color-maroon)', opacity: 0.2, zIndex: -1 }}></div>
            </button>
        )
    }

    return (
        <div className={`chatbot-window anim-slide-up ${isMinimized ? 'minimized' : ''}`}>
            {/* Header */}
            <div className="chatbot-header">
                <div className="header-info">
                    <div className="bot-avatar">🤖</div>
                    <div>
                        <h4>E-Tax Assistant</h4>
                        <div className="status-online">AI Powered</div>
                    </div>
                </div>
                <div className="header-actions">
                    <button onClick={() => setIsMinimized(!isMinimized)}>
                        <FiMinus size={18} />
                    </button>
                    <button onClick={() => setIsOpen(false)}>
                        <FiX size={18} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
                <>
                    <div className="chatbot-messages" ref={scrollRef}>
                        {messages.map((msg, i) => (
                            <div key={i} className={`message-wrapper ${msg.role}`}>
                                <div className="message-icon">
                                    {msg.role === 'assistant' ? '🤖' : '👤'}
                                </div>
                                <div className="message-content">
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="message-wrapper assistant">
                                <div className="message-icon">🤖</div>
                                <div className="message-content">
                                    <div className="typing">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form className="chatbot-input" onSubmit={handleSend}>
                        <input 
                            type="text" 
                            placeholder="Type your question..." 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" disabled={!input.trim() || loading}>
                            <FiSend size={18} />
                        </button>
                    </form>
                </>
            )}
        </div>
    )
}
