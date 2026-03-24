import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../lib/api'

const actionColors = {
    'User Login': '#4285F4',
    'Admin Login': '#821D30',
    'Payment Made': '#5B9A59',
    'Notice Generated': '#E8863A',
    'Complaint Updated': '#D4712A',
    'User Registration': '#4285F4',
    'Gov Update Posted': '#5B9A59',
    'Auto Penalty': '#821D30',
    'Auto Tax Created': '#E8863A',
}

export default function AuditLogs() {
    const { t } = useTranslation()
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/admin/audit-logs')
                if (res.data.success) {
                    setLogs(res.data.logs || [])
                }
            } catch (err) {
                console.error("Failed to fetch audit logs", err)
            } finally {
                setLoading(false)
            }
        }
        fetchLogs()
    }, [])

    return (
        <div>
            <div className="page-header">
                <h2>{t('admin.auditLogs')}</h2>
                <p>Complete audit trail of all system actions</p>
            </div>

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>{t('admin.timestamp')}</th>
                            <th>{t('admin.action')}</th>
                            <th>{t('admin.performedBy')}</th>
                            <th>{t('admin.ipAddress')}</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 && !loading && (
                            <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>No audit logs found for the last 24 hours.</td></tr>
                        )}
                        {logs.map((log, index) => (
                            <tr key={log.id}>
                                <td>{index + 1}</td>
                                <td style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>
                                    {new Date(log.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                                </td>
                                <td>
                                    <span className="badge" style={{
                                        background: `${actionColors[log.action] || '#666'}15`,
                                        color: actionColors[log.action] || '#666'
                                    }}>
                                        {log.action}
                                    </span>
                                </td>
                                <td><strong>{log.performedBy}</strong></td>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                    {log.ip_address || 'System'}
                                </td>
                                <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {typeof log.details === 'string' ? log.details : (log.details?.description || JSON.stringify(log.details))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
