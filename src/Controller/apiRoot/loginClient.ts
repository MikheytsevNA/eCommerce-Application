import {
  ClientBuilder,
  type PasswordAuthMiddlewareOptions,
  type HttpMiddlewareOptions,
} from '@commercetools/sdk-client-v2';
import {
  createApiBuilderFromCtpClient,
  ApiRoot,
} from '@commercetools/platform-sdk';
import { User } from '../login/loginTypes';
import { store } from './storeToken';

// Configure authMiddlewareOptions
const passwordAuthMiddlewareOptions = function (
  user: User
): PasswordAuthMiddlewareOptions {
  return {
    host: 'https://auth.europe-west1.gcp.commercetools.com',
    projectKey: import.meta.env.VITE_PROJECT_KEY,
    credentials: {
      clientId: import.meta.env.VITE_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_CLIENT_SECRET || '',
      user: user,
    },
    scopes: import.meta.env.VITE_SCOPES.split(' '),
    tokenCache: store(''),
    fetch,
  };
};

// Configure httpMiddlewareOptions
const httpMiddlewareOptions: HttpMiddlewareOptions = {
  host: 'https://api.europe-west1.gcp.commercetools.com',
  fetch,
};

export const getPasswordApiRoot: (user: User) => ApiRoot = (user: User) => {
  const client = new ClientBuilder()
    .withPasswordFlow(passwordAuthMiddlewareOptions(user))
    .withHttpMiddleware(httpMiddlewareOptions)
    .withLoggerMiddleware()
    .build();
  return createApiBuilderFromCtpClient(client);
};
