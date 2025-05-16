import React, { useState, useEffect } from 'react';
import AuthForm from './components/Auth/AuthForm';
import FeedbackForm from './components/Feedback/FeedbackForm';
import { onAuthStateChange, getCurrentUser } from './firebase/authService';
import './App.css';

function App() {
  const [user, setUser] = useState<{ uid: string, email: string | null } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser({
        uid: currentUser.uid,
        email: currentUser.email
      });
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Feedback Portal</h1>
      </header>

      <main className="app-main">
        {user ? (
          <FeedbackForm userEmail={user.email || 'Anonymous User'} />
        ) : (
          <AuthForm onSuccess={() => {
            const currentUser = getCurrentUser();
            if (currentUser) {
              setUser({
                uid: currentUser.uid,
                email: currentUser.email
              });
            }
          }} />
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Feedback Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;