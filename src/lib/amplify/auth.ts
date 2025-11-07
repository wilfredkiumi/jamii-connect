import { 
  signIn, 
  signOut, 
  signUp, 
  confirmSignUp,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
  updateUserAttributes,
  type SignInInput,
  type SignUpInput,
  type AuthUser,
} from 'aws-amplify/auth';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  location?: string;
  bio?: string;
  heritageCountry?: string;
  currentCountry?: string;
  skills?: string[];
  interests?: string[];
  verified?: boolean;
  createdAt?: string;
}

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

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const user = await getCurrentUser();
    const attributes = await fetchUserAttributes();
    
    return {
      id: user.userId,
      email: attributes.email || '',
      firstName: attributes.given_name,
      lastName: attributes.family_name,
      username: attributes.preferred_username,
      location: attributes['custom:location'],
      bio: attributes['custom:bio'],
      heritageCountry: attributes['custom:heritage_country'],
      currentCountry: attributes['custom:current_country'],
      skills: attributes['custom:skills']?.split(',').filter(Boolean),
      interests: attributes['custom:interests']?.split(',').filter(Boolean),
      verified: attributes.email_verified === 'true',
      createdAt: attributes['custom:created_at'],
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

export async function updateUserProfile(updates: Partial<UserProfile>) {
  try {
    const attributeUpdates: Record<string, string> = {};
    
    if (updates.firstName) attributeUpdates.given_name = updates.firstName;
    if (updates.lastName) attributeUpdates.family_name = updates.lastName;
    if (updates.username) attributeUpdates.preferred_username = updates.username;
    if (updates.location) attributeUpdates['custom:location'] = updates.location;
    if (updates.bio) attributeUpdates['custom:bio'] = updates.bio;
    if (updates.heritageCountry) attributeUpdates['custom:heritage_country'] = updates.heritageCountry;
    if (updates.currentCountry) attributeUpdates['custom:current_country'] = updates.currentCountry;
    if (updates.skills) attributeUpdates['custom:skills'] = updates.skills.join(',');
    if (updates.interests) attributeUpdates['custom:interests'] = updates.interests.join(',');

    await updateUserAttributes({
      userAttributes: attributeUpdates,
    });

    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}