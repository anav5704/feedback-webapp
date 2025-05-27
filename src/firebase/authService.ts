import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    multiFactor,
    PhoneAuthProvider,
    PhoneMultiFactorGenerator,
    type User as FirebaseUser,
    type MultiFactorResolver,
    type Auth,
} from "firebase/auth";
import { auth, initRecaptcha } from "./config";

// Sign in with email and password
export const signIn = async (
    email: string,
    password: string
): Promise<void | MultiFactorResolver> => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        if (error.code === "auth/multi-factor-auth-required") {
            return error.resolver;
        }
        throw new Error(`Authentication failed: ${error.message}`);
    }
};

// Sign up with email and password
export const signUp = async (
    email: string,
    password: string
): Promise<void> => {
    try {
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        const authError = error as Error;
        throw new Error(`Registration failed: ${authError.message}`);
    }
};

// Enable MFA for current user
export const enableMFA = async (phoneNumber: string): Promise<string> => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");

    const recaptchaVerifier = initRecaptcha();
    const session = await multiFactor(user).getSession();

    const phoneAuthProvider = new PhoneAuthProvider(auth);
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier
    );

    return verificationId;
};

// Complete MFA enrollment
export const completeMFAEnrollment = async (
    verificationId: string,
    verificationCode: string
): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");

    const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

    await multiFactor(user).enroll(multiFactorAssertion, "Phone Number");
};

// Complete MFA sign in
export const completeMFASignIn = async (
    resolver: MultiFactorResolver,
    verificationId: string,
    verificationCode: string
): Promise<void> => {
    const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
    await resolver.resolveSignIn(multiFactorAssertion);
};

// Sign out
export const signOut = async (): Promise<void> => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        const authError = error as Error;
        throw new Error(`Sign out failed: ${authError.message}`);
    }
};

// Function to listen to auth state changes
export const onAuthStateChange = (
    callback: (user: FirebaseUser | null) => void
): (() => void) => {
    return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
    return auth.currentUser;
};
