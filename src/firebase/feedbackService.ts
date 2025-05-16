import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { getCurrentUser } from './authService';

// Interface for feedback data
export interface FeedbackData {
  message: string;
  userId: string;
  userEmail: string;
  createdAt: any; // FirebaseTimestamp
}

// Submit feedback to Firestore
export const submitFeedback = async (message: string): Promise<void> => {
  try {
    const user = getCurrentUser();
    
    if (!user) {
      throw new Error('User must be authenticated to submit feedback');
    }
    
    const feedbackData: Omit<FeedbackData, 'createdAt'> & { createdAt: any } = {
      message,
      userId: user.uid,
      userEmail: user.email || 'unknown email',
      createdAt: serverTimestamp()
    };
    
    await addDoc(collection(db, 'feedback'), feedbackData);
  } catch (error) {
    const firebaseError = error as Error;
    throw new Error(`Failed to submit feedback: ${firebaseError.message}`);
  }
};