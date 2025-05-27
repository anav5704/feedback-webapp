import React, { useState, useEffect } from 'react'
import AuthForm from './components/Auth/AuthForm'
import FeedbackForm from './components/Feedback/FeedbackForm'
import { onAuthStateChange, getCurrentUser } from './firebase/authService'
import { multiFactor } from 'firebase/auth'
import './App.css'

function App() {
    const [user, setUser] = useState<{ uid: string, email: string | null } | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [mfaEnrolled, setMfaEnrolled] = useState<boolean>(false)

    useEffect(() => {
        // Listen to auth state changes
        const unsubscribe = onAuthStateChange((firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email
                })
                // Check MFA enrollment status
                const mfaUser = multiFactor(firebaseUser)
                setMfaEnrolled(mfaUser.enrolledFactors.length > 0)
            } else {
                setUser(null)
                setMfaEnrolled(false)
            }
            setLoading(false)
        })

        // Cleanup subscription
        return () => unsubscribe()
    }, [])

    // Check if user is already logged in
    useEffect(() => {
        const currentUser = getCurrentUser()
        if (currentUser) {
            setUser({
                uid: currentUser.uid,
                email: currentUser.email
            })
            // Check MFA enrollment status
            const mfaUser = multiFactor(currentUser)
            setMfaEnrolled(mfaUser.enrolledFactors.length > 0)
        }
        setLoading(false)
    }, [])

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="app">
            <header className="app-header">
                <h1 className="app-title">Feedback Portal</h1>
            </header>

            <main className="app-main">
                {user ? (
                    mfaEnrolled ? (
                        <FeedbackForm userEmail={user.email || 'Anonymous User'} />
                    ) : (
                        <AuthForm
                            onSuccess={() => setMfaEnrolled(true)}
                            initialStep="mfa-setup"
                            userEmail={user.email || ''}
                        />
                    )
                ) : (
                    <AuthForm onSuccess={() => {
                        const currentUser = getCurrentUser()
                        if (currentUser) {
                            setUser({
                                uid: currentUser.uid,
                                email: currentUser.email
                            })
                            const mfaUser = multiFactor(currentUser)
                            setMfaEnrolled(mfaUser.enrolledFactors.length > 0)
                        }
                    }} />
                )}
            </main>

            <footer className="app-footer">
                <p>&copy; {new Date().getFullYear()} Feedback Portal. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default App