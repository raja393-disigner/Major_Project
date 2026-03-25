import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiGlobe, FiLoader } from 'react-icons/fi'
import api from '../../lib/api'

const categoryColors = {
    'Tax Update': 'var(--color-maroon)',
    'Scheme': 'var(--color-green)',
    'Notice': 'var(--color-saffron)',
    'Announcement': '#4285F4',
}

export default function GovUpdates() {
    const { t } = useTranslation()
    const [updates, setUpdates] = useState([])
    const [loading, setLoading] = useState(true)

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

    return (
        <div>
            <div className="page-header">
                <h2>{t('user.govUpdates')}</h2>
                <p>Stay informed with latest government notifications and updates</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60 }}>
                    <FiLoader className="spin" size={48} color="var(--color-maroon)" />
                    <p style={{ marginTop: 16 }}>Checking for latest updates...</p>
                </div>
            ) : updates.length === 0 ? (
                <div className="empty-state">
                    <div className="icon"><FiGlobe size={48} /></div>
                    <h4>{t('user.noUpdates')}</h4>
                    <p>There are no updates for your district at the moment.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 16 }}>
                    {updates.map(update => (
                        <div key={update.id} className="update-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <span className="badge" style={{
                                    background: `${categoryColors[update.category] || '#888'}15`,
                                    color: categoryColors[update.category] || '#888'
                                }}>
                                    {update.category}
                                </span>
                                <span className="update-date" style={{ marginBottom: 0 }}>
                                    {new Date(update.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                            <h4>{update.title}</h4>
                            <p>{update.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
