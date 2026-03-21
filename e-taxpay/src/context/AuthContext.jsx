import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loginAttempts, setLoginAttempts] = useState(0)
    const [isLocked, setIsLocked] = useState(false)

    // Restore session from Supabase on mount
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                
                if (session?.user) {
                    // Fetch real role from DB since auth metadata might be empty for SQL-created admins
                    const { data: adminData } = await supabase
                        .from('admins')
                        .select('*, roles(name)')
                        .eq('auth_id', session.user.id)
                        .single()

                    let userData = buildUserObject(session.user, session.access_token)
                    
                    if (adminData) {
                        userData.role = adminData.roles?.name || 'district_admin'
                        userData.district = adminData.district
                        userData.username = adminData.username
                    } else {
                        // If not admin, get user details
                        const { data: profile } = await supabase
                            .from('users')
                            .select('*')
                            .eq('auth_id', session.user.id)
                            .single()
                        
                        if (profile) {
                            userData.username = profile.username
                            userData.district = profile.district
                            userData.block = profile.block
                        }
                    }

                    setUser(userData)
                    localStorage.setItem('etaxpay-user', JSON.stringify(userData))
                }
            } catch (err) {
                console.error("Session restoration error:", err)
            } finally {
                setLoading(false)
            }
        }

        restoreSession()

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                // If it's a login event, we already have the state from the login function
                // But if it's a refresh or just an event, let's keep it in sync
                const userData = buildUserObject(session.user, session.access_token)
                setUser(prev => {
                    // Only update if we don't have a role yet or roles don't match (for safety)
                    if (!prev || prev.id !== session.user.id) return userData
                    return prev
                })
            } else {
                setUser(null)
                localStorage.removeItem('etaxpay-user')
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    function buildUserObject(supabaseUser, token) {
        const meta = supabaseUser.user_metadata || {}
        // Use localStorage as a hint for the role if metadata is missing (temporary fix until DB fetch)
        const stored = localStorage.getItem('etaxpay-user')
        const storedUser = stored ? JSON.parse(stored) : null
        
        return {
            id: supabaseUser.id,
            email: supabaseUser.email,
            gstId: meta.gstId || supabaseUser.email?.split('@')[0] || '',
            username: meta.username || meta.gstId || supabaseUser.email?.split('@')[0] || '',
            role: meta.role || (storedUser?.id === supabaseUser.id ? storedUser.role : 'user'),
            district: storedUser?.id === supabaseUser.id ? storedUser.district : null,
            token
        }
    }

    const login = async (credentials, type = 'user') => {
        if (isLocked) throw new Error('locked')

        try {
            let email, password

            if (type === 'user') {
                email = `${credentials.gstId}@shop.com`
                password = credentials.password
            } else {
                // Admin login: Pehle database se email nikalo (Kyuki domain @etaxpay.com ho sakta hai)
                const { data: adminData, error: adminLookupError } = await supabase
                    .from('admins')
                    .select('email, passkey_hash')
                    .eq('username', credentials.username)
                    .single()

                if (adminLookupError || !adminData) {
                    throw new Error('invalid')
                }

                // Verify Passkey
                if (String(adminData.passkey_hash) !== String(credentials.passkey)) {
                    throw new Error('invalid')
                }

                email = adminData.email
                password = credentials.password
            }

            const { data, error } = await supabase.auth.signInWithPassword({ email, password })

            if (error) throw new Error('invalid')


            const userData = buildUserObject(data.user, data.session.access_token)
            
            if (type === 'admin') {
                // Fetch full admin details to get the exact role name (district_admin/super_admin)
                const { data: adminProfile } = await supabase
                    .from('admins')
                    .select('*, roles(name)')
                    .eq('auth_id', data.user.id)
                    .single()

                if (adminProfile) {
                    userData.role = adminProfile.roles?.name || 'district_admin'
                    userData.district = adminProfile.district
                } else {
                    userData.role = 'admin' // fallback
                }
            }

            setUser(userData)
            localStorage.setItem('etaxpay-user', JSON.stringify(userData))
            setLoginAttempts(0)
            return userData

        } catch (error) {
            const attempts = loginAttempts + 1
            setLoginAttempts(attempts)
            if (attempts >= 5) {
                setIsLocked(true)
                setTimeout(() => {
                    setIsLocked(false)
                    setLoginAttempts(0)
                }, 30 * 60 * 1000)
                throw new Error('locked')
            }
            throw new Error(error.message || 'invalid')
        }
    }

    const register = async (userData) => {
        try {
            const email = `${userData.gstId}@shop.com`

            // 1. Supabase Auth signup
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password: userData.password,
                options: {
                    data: {
                        username: userData.username,
                        gstId: userData.gstId,
                        role: 'user'
                    }
                }
            })

            if (authError) throw new Error(authError.message)

            // 2. Insert into users table
            const { error: dbError } = await supabase.from('users').insert([{
                auth_id: authData.user.id,
                username: userData.username,
                father_name: userData.fatherName,
                gst_id: userData.gstId,
                mobile: userData.mobile,
                district: userData.district,
                block: userData.block,
                business_type: userData.businessType
            }])

            if (dbError) throw new Error(dbError.message)

            return { success: true, message: 'Registration successful! You can now log in.' }

        } catch (error) {
            console.error('REGISTRATION ERROR:', error.message)
            throw new Error(error.message || 'Registration failed')
        }
    }

    const logout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        localStorage.removeItem('etaxpay-user')
    }

    const updateProfile = (updates) => {
        const updated = { ...user, ...updates }
        setUser(updated)
        localStorage.setItem('etaxpay-user', JSON.stringify(updated))
    }

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isLocked,
            loginAttempts,
            login,
            logout,
            register,
            updateProfile,
            isAuthenticated: !!user,
            isAdmin: user?.role === 'super_admin' || user?.role === 'district_admin' || user?.role === 'admin',
            isUser: user?.role === 'user'
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
