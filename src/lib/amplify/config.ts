import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!,
      identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID!,
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      loginWith: {
        email: true,
        username: false,
      },
      signUpVerificationMethod: 'code',
      userAttributes: {
        email: {
          required: true,
        },
      },
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },
  API: {
    REST: {
      JamiiConnectAPI: {
        endpoint: process.env.NEXT_PUBLIC_API_ENDPOINT!,
        region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      },
    },
  },
};

export function configureAmplify() {
  Amplify.configure(amplifyConfig);
}