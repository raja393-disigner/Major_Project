import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiPlusCircle, FiTrash2, FiCheckCircle, FiLoader } from 'react-icons/fi'
import api from '../../lib/api'

export default function GovUpdatesAdmin() {
    const { t } = useTranslation()
    const [updates, setUpdates] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ title: '', content: '', category: 'Notice' })
    const [published, setPublished] = useState(false)

    const fetchUpdates = async () => {
        try {
            setLoading(true)
            const response = await api.get('/gov-updates')
            if (response.data.success) {
                setUpdates(response.data.updates)
            }
        } catch (error) {
            console.error('Error fetching updates:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUpdates()
    }, [])

    const handlePublish = async (e) => {
        e.preventDefault()
        try {
            const response = await api.post('/gov-updates', form)
            if (response.data.success) {
                setUpdates([response.data.data, ...updates])
                setForm({ title: '', content: '', category: 'Notice' })
                setShowForm(false)
                setPublished(true)
                setTimeout(() => setPublished(false), 3000)
            }
        } catch (error) {
            console.error('Error publishing update:', error)
            alert('Failed to publish update. Please try again.')
        }
    }

    const deleteUpdate = async (id) => {
        if (!window.confirm('Are you sure you want to delete this update?')) return
        try {
            const response = await api.delete(`/gov-updates/${id}`)
            if (response.data.success) {
                setUpdates(updates.filter(u => u.id !== id))
            }
        } catch (error) {
            console.error('Error deleting update:', error)
        }
    }

    const totalUpdates = updates.length;
    const districtName = updates[0]?.district || 'Your District';

    const getIcon = (category) => {
        switch (category) {
            case 'Tax Update': return <FiCheckCircle color="#e8863a" />;
            case 'Scheme': return <FiPlusCircle color="#5b9a59" />;
            case 'Notice': return <FiTrash2 color="#821d30" />;
            default: return <FiCheckCircle color="#adb5bd" />;
        }
    };

    return (
        <div className="anim-fade">
            <div className="page-header-actions" style={{ marginBottom: 30 }}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ background: 'var(--color-maroon)', color: 'white', padding: 10, borderRadius: 12 }}>
                            <FiPlusCircle size={24} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0 }}>{t('admin.govUpdates')}</h2>
                            <p style={{ margin: 0, color: '#666' }}>Official Administration Broadcast Center</p>
                        </div>
                    </div>
                </div>
                <button 
                    className={`btn ${showForm ? 'btn-secondary' : 'btn-maroon'}`} 
                    onClick={() => setShowForm(!showForm)}
                    style={{ padding: '12px 24px', borderRadius: 14, fontWeight: 600 }}
                >
                    {showForm ? 'Close Form' : <><FiPlusCircle /> {t('admin.postUpdate')}</>}
                </button>
            </div>

            {published && (
                <div className="alert alert-success anim-slide-down" style={{ borderRadius: 12, marginBottom: 20 }}>
                    <FiCheckCircle /> New notification broadcasted successfully!
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 30, alignItems: 'start' }}>
                {/* Left Side: Broadcast Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {showForm && (
                        <div className="card anim-slide-up" style={{ padding: 25, border: '2px solid var(--color-maroon)20', borderRadius: 20 }}>
                            <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <FiPlusCircle color="var(--color-maroon)" /> Create New Broadcast
                            </h3>
                            <form onSubmit={handlePublish}>
                                <div className="form-group">
                                    <label style={{ fontWeight: 600 }}>Update Title</label>
                                    <input type="text" className="form-control" required value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        placeholder="e.g., New Property Tax Slab 2026" 
                                        style={{ padding: '12px 16px', fontSize: '1rem' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 600 }}>Urgency Category</label>
                                        <select className="form-control" value={form.category}
                                            onChange={e => setForm({ ...form, category: e.target.value })}
                                            style={{ padding: '12px 16px' }}>
                                            <option value="Tax Update">Tax Update (Gold)</option>
                                            <option value="Scheme">Scheme (Green)</option>
                                            <option value="Notice">Notice (Maroon)</option>
                                            <option value="Announcement">Announcement (Blue)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 600 }}>Target Audience</label>
                                        <input type="text" className="form-control" disabled value={districtName} style={{ background: '#f8f9fa' }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 600 }}>Broadcast Message</label>
                                    <textarea className="form-control" required value={form.content}
                                        onChange={e => setForm({ ...form, content: e.target.value })}
                                        placeholder="Type your message to shopkeepers here..." rows={4}
                                        style={{ padding: '12px 16px', fontSize: '1rem' }}></textarea>
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                                    <button type="submit" className="btn btn-maroon" style={{ flex: 1, padding: '12px' }}>Publish to All Citizens</button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 60 }}>
                            <FiLoader className="spin" size={40} color="var(--color-maroon)" />
                            <p style={{ marginTop: 15, color: '#888', fontWeight: 500 }}>Refreshing broadcast feed...</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {updates.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: 60, borderRadius: 20, borderStyle: 'dashed' }}>
                                    <p style={{ color: '#999', fontSize: '1.1rem' }}>No broadcast history found for {districtName}.</p>
                                </div>
                            ) : (
                                updates.map((update, idx) => (
                                    <div key={update.id} className="card hover-lift anim-slide-right" style={{ 
                                        padding: 0, 
                                        border: '1px solid #eee', 
                                        borderRadius: 20,
                                        overflow: 'hidden',
                                        animationDelay: `${idx * 0.1}s`
                                    }}>
                                        <div style={{ display: 'flex' }}>
                                            <div style={{ 
                                                width: 6, 
                                                background: update.category === 'Tax Update' ? 'var(--color-saffron)' : 
                                                           (update.category === 'Scheme' ? 'var(--color-green)' : 'var(--color-maroon)')
                                            }} />
                                            <div style={{ flex: 1, padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                                        <span style={{ 
                                                            padding: '4px 12px', 
                                                            borderRadius: '8px', 
                                                            fontSize: '0.75rem', 
                                                            fontWeight: 700,
                                                            background: update.category === 'Tax Update' ? 'rgba(232, 134, 58, 0.1)' : 
                                                                       (update.category === 'Scheme' ? 'rgba(91, 154, 89, 0.1)' : 'rgba(130, 29, 48, 0.1)'),
                                                            color: update.category === 'Tax Update' ? 'var(--color-saffron)' : 
                                                                   (update.category === 'Scheme' ? 'var(--color-green)' : 'var(--color-maroon)')
                                                        }}>
                                                            {update.category.toUpperCase()}
                                                        </span>
                                                        <span style={{ fontSize: '0.8rem', color: '#888', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                            {new Date(update.created_at || update.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <button 
                                                        onClick={() => deleteUpdate(update.id)}
                                                        className="btn-icon" 
                                                        style={{ background: '#f8f9fa', color: '#dc3545', width: 32, height: 32 }}
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </div>
                                                <h4 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', fontWeight: 700, color: '#333' }}>{update.title}</h4>
                                                <p style={{ margin: 0, color: '#555', lineHeight: 1.6, fontSize: '0.95rem' }}>{update.content}</p>
                                                <div style={{ marginTop: 15, paddingTop: 15, borderTop: '1px solid #f8f9fa', display: 'flex', gap: 20 }}>
                                                    <span style={{ fontSize: '0.75rem', color: '#999', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                        <FiCheckCircle size={12} /> Priority High
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: '#999', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                        <FiPlusCircle size={12} /> {update.district || 'All Blocks'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Right Side: Quick Stats Column */}
                <div style={{ position: 'sticky', top: 100 }}>
                    <div className="card" style={{ padding: 24, borderRadius: 24, background: 'var(--color-sidebar)', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ marginBottom: 20, fontWeight: 700 }}>Communication Summary</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                            <div style={{ background: 'white', padding: 15, borderRadius: 16, border: '1px solid #eee' }}>
                                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: 5 }}>Total Updates Post</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-maroon)' }}>{totalUpdates}</div>
                            </div>
                            <div style={{ background: 'white', padding: 15, borderRadius: 16, border: '1px solid #eee' }}>
                                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: 5 }}>Target Region</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#333', textTransform: 'capitalize' }}>{districtName}</div>
                            </div>
                            <div style={{ marginTop: 10, padding: 15, borderRadius: 16, background: 'rgba(91, 154, 89, 0.05)', border: '1px solid rgba(91, 154, 89, 0.1)' }}>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-green)', lineHeight: 1.4 }}>
                                    <b>Pro Tip:</b> Keep titles short and impactful for better citizen engagement.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card anim-fade" style={{ marginTop: 20, padding: 24, borderRadius: 24, background: 'linear-gradient(135deg, var(--color-maroon), var(--color-maroon-dark))', color: 'white' }}>
                        <h5 style={{ margin: '0 0 10px 0' }}>Need Help?</h5>
                        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8, lineHeight: 1.5 }}>
                            The broadcasted updates are visible to all registered shopkeepers in your region instantly.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
