import { Amplify } from 'aws-amplify';
import { configureAmplify } from './config';

// Configure Amplify for client-side usage
if (typeof window !== 'undefined') {
  configureAmplify();
}

export { Amplify };