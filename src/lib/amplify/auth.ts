import { 
  signIn, 
  signOut, 
  signUp, 
  confirmSignUp,
  getCurrentUser,
  fetchAuthSession,
  type SignInInput,
  type SignUpInput,
  type AuthUser,
} from 'aws-amplify/auth';

export async function signUpUser(email: string, password: string, firstName: string, lastName: string) {
  try {
    const { userId, isSignUpComplete, nextStep } = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          given_name: firstName,
          family_name: lastName,
        },
      },
    });

    return { userId, isSignUpComplete, nextStep };
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

export async function confirmSignUpUser(email: string, code: string) {
  try {
    const { isSignUpComplete, nextStep } = await confirmSignUp({
      username: email,
      confirmationCode: code,
    });

    return { isSignUpComplete, nextStep };
  } catch (error) {
    console.error('Error confirming sign up:', error);
    throw error;
  }
}

export async function signInUser(email: string, password: string) {
  try {
    const { isSignedIn, nextStep } = await signIn({
      username: email,
      password,
    });

    return { isSignedIn, nextStep };
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

export async function signOutUser() {
  try {
    await signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  try {
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    console.error('No authenticated user:', error);
    return null;
  }
}

export async function getAuthSession() {
  try {
    const session = await fetchAuthSession();
    return session;
  } catch (error) {
    console.error('Error fetching auth session:', error);
    throw error;
  }
}
