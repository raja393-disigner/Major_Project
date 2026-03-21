import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

export default function UserLayout() {
    const { t } = useTranslation()
    const { user } = useAuth()

    return (
        <div className="anim-fade">
            <Navbar variant="panel" />
            <div className="panel-layout">
                <Sidebar type="user" />
                <main className="panel-content anim-slide-up">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
