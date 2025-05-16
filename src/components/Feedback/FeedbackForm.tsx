import React, { useState } from 'react';
import { FeedbackFormData, feedbackSchema } from '../../validation/schemas';
import { validateForm, sanitizeInput } from '../../utils/formUtils';
import { submitFeedback } from '../../firebase/feedbackService';
import { signOut } from '../../firebase/authService';
import { MessageSquare, LogOut } from 'lucide-react';
import './FeedbackForm.css';

interface FeedbackFormProps {
  userEmail: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ userEmail }) => {
  const [formData, setFormData] = useState<FeedbackFormData>({
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
  
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    try {
      setLoading(true);
      
      // Validate form
      const validationErrors = validateForm(feedbackSchema, formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      // Sanitize input
      const sanitizedMessage = sanitizeInput(formData.message);
      
      // Submit feedback
      await submitFeedback(sanitizedMessage);
      
      // Reset form
      setFormData({ message: '' });
      setSubmitted(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      const submitErr = error as Error;
      setSubmitError(submitErr.message);
    } finally {
      setLoading(false);
    }
  };
  
  const remainingChars = 500 - (formData.message.length || 0);
  
  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h2 className="feedback-title">Share Your Feedback</h2>
        <div className="user-info">
          <span className="user-email">{userEmail}</span>
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {submitted && (
        <div className="success-message">
          Thank you for your feedback! It has been submitted successfully.
        </div>
      )}
      
      {submitError && (
        <div className="error-container">{submitError}</div>
      )}
      
      <form className="feedback-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="message" className="form-label">
            Your Feedback <span className="required">*</span>
          </label>
          <div className="textarea-wrapper">
            <MessageSquare className="textarea-icon" size={18} />
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className={`feedback-textarea ${errors.message ? 'textarea-error' : ''}`}
              placeholder="Please share your thoughts, suggestions, or concerns..."
              disabled={loading}
              rows={5}
              maxLength={500}
            />
          </div>
          <div className="textarea-footer">
            <span className={`char-count ${remainingChars < 50 ? 'char-count-warning' : ''}`}>
              {remainingChars} characters remaining
            </span>
            {errors.message && <span className="error-message">{errors.message}</span>}
          </div>
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;