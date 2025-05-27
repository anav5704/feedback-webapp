import React, { useState, useEffect } from 'react'
import { LoginFormData, RegistrationFormData, loginSchema, registrationSchema } from '../../validation/schemas'
import { validateForm } from '../../utils/formUtils'
import { signIn, signUp, enableMFA, completeMFAEnrollment, completeMFASignIn } from '../../firebase/authService'
import { Eye, EyeOff, Mail, Lock, Phone } from 'lucide-react'
import type { MultiFactorResolver } from 'firebase/auth'
import { clearRecaptcha } from '../../firebase/config'
import './AuthForm.css'

interface AuthFormProps {
    onSuccess: () => void
    initialStep?: 'login' | 'register' | 'mfa-setup'
    userEmail?: string
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess, initialStep = 'login', userEmail = '' }) => {
    const [isLogin, setIsLogin] = useState<boolean>(initialStep === 'login')
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [formData, setFormData] = useState<LoginFormData & { confirmPassword?: string }>({
        email: userEmail,
        password: '',
        confirmPassword: ''
    })
    const [mfaData, setMfaData] = useState({
        phoneNumber: '',
        verificationCode: '',
        verificationId: '',
        showMFASetup: initialStep === 'mfa-setup',
        showMFAVerification: false
    })
    const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState<boolean>(false)
    const [authError, setAuthError] = useState<string>('')
    const [setupError, setSetupError] = useState<boolean>(false)

    useEffect(() => {
        return () => {
            clearRecaptcha()
        }
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            })
        }
    }

    const handleMFAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setMfaData(prev => ({ ...prev, [name]: value }))
        setAuthError('')
    }

    const handleSetupMFA = async () => {
        try {
            if (!mfaData.phoneNumber) {
                setAuthError('Please enter a phone number')
                return
            }

            setLoading(true)
            const verificationId = await enableMFA(mfaData.phoneNumber)
            setMfaData(prev => ({
                ...prev,
                verificationId,
                showMFAVerification: true
            }))
        } catch (error: any) {
            const mfaError = error as Error
            if (error.code === 'auth/operation-not-allowed') {
                setSetupError(true)
                setAuthError('MFA is not enabled for this application. Please contact the administrator.')
            } else {
                setAuthError(mfaError.message)
            }
            clearRecaptcha()
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyMFA = async () => {
        try {
            if (!mfaData.verificationCode) {
                setAuthError('Please enter the verification code')
                return
            }

            setLoading(true)
            if (mfaResolver) {
                await completeMFASignIn(
                    mfaResolver,
                    mfaData.verificationId,
                    mfaData.verificationCode
                )
            } else {
                await completeMFAEnrollment(
                    mfaData.verificationId,
                    mfaData.verificationCode
                )
            }
            clearRecaptcha()
            onSuccess()
        } catch (error) {
            const mfaError = error as Error
            setAuthError(mfaError.message)
        } finally {
            setLoading(false)
        }
    }

    const toggleFormMode = () => {
        setIsLogin(prev => !prev)
        setErrors({})
        setAuthError('')
        setMfaData({
            phoneNumber: '',
            verificationCode: '',
            verificationId: '',
            showMFASetup: false,
            showMFAVerification: false
        })
        clearRecaptcha()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setAuthError('')

        try {
            setLoading(true)

            if (isLogin) {
                const validationErrors = validateForm(loginSchema, formData)
                if (Object.keys(validationErrors).length > 0) {
                    setErrors(validationErrors)
                    return
                }

                const result = await signIn(formData.email, formData.password)
                if (result) {
                    setMfaResolver(result)
                    setMfaData(prev => ({ ...prev, showMFAVerification: true }))
                    return
                }
                onSuccess()
            } else {
                const validationErrors = validateForm(registrationSchema,
                    formData as RegistrationFormData)
                if (Object.keys(validationErrors).length > 0) {
                    setErrors(validationErrors)
                    return
                }

                await signUp(formData.email, formData.password)
                setMfaData(prev => ({ ...prev, showMFASetup: true }))
            }
        } catch (error) {
            const authErr = error as Error
            setAuthError(authErr.message)
        } finally {
            setLoading(false)
        }
    }

    if (mfaData.showMFASetup || mfaData.showMFAVerification) {
        return (
            <div className="auth-container">
                <div className="auth-form-wrapper">
                    <h2 className="auth-title">
                        {mfaData.showMFAVerification ? 'Verify Phone Number' : 'Setup Two-Factor Authentication'}
                    </h2>
                    <p className="auth-subtitle">
                        {mfaData.showMFAVerification
                            ? 'Enter the verification code sent to your phone'
                            : 'Add your phone number for additional security'}
                    </p>

                    {authError && (
                        <div className="auth-error">
                            {authError}
                            {setupError && (
                                <p className="help-text\" style={{ color: 'inherit', marginTop: '0.5rem' }}>
                                    Please enable Phone Authentication in the Firebase Console under Authentication {'>'} Sign-in method.
                                </p>
                            )}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={e => e.preventDefault()}>
                        {!mfaData.showMFAVerification && (
                            <div className="form-group">
                                <label htmlFor="phoneNumber\" className="form-label">Phone Number</label>
                                <div className="input-wrapper">
                                    <Phone className="input-icon" size={18} />
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={mfaData.phoneNumber}
                                        onChange={handleMFAChange}
                                        className="form-input"
                                        placeholder="+1234567890"
                                        disabled={loading}
                                    />
                                </div>
                                <p className="help-text">Include country code (e.g., +679 for Fiji)</p>
                            </div>
                        )}

                        {mfaData.showMFAVerification && (
                            <div className="form-group">
                                <label htmlFor="verificationCode" className="form-label">Verification Code</label>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" size={18} />
                                    <input
                                        type="text"
                                        id="verificationCode"
                                        name="verificationCode"
                                        value={mfaData.verificationCode}
                                        onChange={handleMFAChange}
                                        className="form-input"
                                        placeholder="Enter 6-digit code"
                                        maxLength={6}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        )}

                        <div id="recaptcha-container" className="recaptcha-container"></div>

                        <button
                            type="button"
                            className="auth-button"
                            onClick={mfaData.showMFAVerification ? handleVerifyMFA : handleSetupMFA}
                            disabled={loading || setupError}
                        >
                            {loading ? 'Processing...' : (mfaData.showMFAVerification ? 'Verify Code' : 'Send Code')}
                        </button>

                        {setupError && (
                            <button
                                type="button"
                                className="auth-button"
                                onClick={onSuccess}
                                style={{ marginTop: '1rem', backgroundColor: '#6c757d' }}
                            >
                                Continue Without MFA
                            </button>
                        )}
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-container">
            <div className="auth-form-wrapper">
                <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="auth-subtitle">
                    {isLogin
                        ? 'Sign in to submit your feedback'
                        : 'Register to start sharing your feedback'}
                </p>

                {authError && <div className="auth-error">{authError}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`form-input ${errors.email ? 'input-error' : ''}`}
                                placeholder="Enter your email"
                                disabled={loading}
                            />
                        </div>
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`form-input ${errors.password ? 'input-error' : ''}`}
                                placeholder="Enter your password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(prev => !prev)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword || ''}
                                    onChange={handleChange}
                                    className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                                    placeholder="Confirm your password"
                                    disabled={loading}
                                />
                            </div>
                            {errors.confirmPassword && (
                                <span className="error-message">{errors.confirmPassword}</span>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading
                            ? 'Processing...'
                            : isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        {isLogin
                            ? "Don't have an account?"
                            : "Already have an account?"}
                        <button
                            type="button"
                            className="toggle-form-button"
                            onClick={toggleFormMode}
                            disabled={loading}
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AuthForm