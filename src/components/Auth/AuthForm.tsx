import React, { useState } from 'react';
import { LoginFormData, RegistrationFormData, loginSchema, registrationSchema } from '../../validation/schemas';
import { validateForm } from '../../utils/formUtils';
import { signIn, signUp } from '../../firebase/authService';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import './AuthForm.css';

interface AuthFormProps {
  onSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<LoginFormData & { confirmPassword?: string }>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear individual error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const toggleFormMode = () => {
    setIsLogin(prev => !prev);
    setErrors({});
    setAuthError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      setLoading(true);
      
      if (isLogin) {
        // Login form validation
        const validationErrors = validateForm(loginSchema, formData);
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }
        
        // Perform login
        await signIn(formData.email, formData.password);
      } else {
        // Registration form validation
        const validationErrors = validateForm(registrationSchema, 
          formData as RegistrationFormData);
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }
        
        // Perform registration
        await signUp(formData.email, formData.password);
      }
      
      // On successful authentication
      onSuccess();
    } catch (error) {
      const authErr = error as Error;
      setAuthError(authErr.message);
    } finally {
      setLoading(false);
    }
  };

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
  );
};

export default AuthForm;