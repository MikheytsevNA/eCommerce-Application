import {
  ClientBuilder,
  type AuthMiddlewareOptions,
  type HttpMiddlewareOptions,
  Client,
} from '@commercetools/sdk-client-v2';
import {
  createApiBuilderFromCtpClient,
  ApiRoot,
} from '@commercetools/platform-sdk';
import { store } from './storeToken';

const authMiddlewareOptions: AuthMiddlewareOptions = {
  host: 'https://auth.europe-west1.gcp.commercetools.com',
  projectKey: import.meta.env.VITE_PROJECT_KEY,
  credentials: {
    clientId: import.meta.env.VITE_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_CLIENT_SECRET || '',
  },
  scopes: import.meta.env.VITE_SCOPES.split(' '),
  tokenCache: store(''),
  fetch,
};
const httpMiddlewareOptions: HttpMiddlewareOptions = {
  host: 'https://api.europe-west1.gcp.commercetools.com',
  fetch,
};

export const getApiRoot: () => ApiRoot = () => {
  let accesscookieValue;
  if (typeof window !== 'undefined') {
    accesscookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith('accessToken='))
      ?.split('=')[1];
  }
  let ctpClient: Client;
  // if user was logged in previously - has access token in cookie, we create client with this token
  // else create unnamed client(might need to use AnonymousSession, once we get to shopping cart)
  if (accesscookieValue) {
    ctpClient = new ClientBuilder()
      .withExistingTokenFlow(`Bearer ${accesscookieValue}`, { force: true })
      .withHttpMiddleware(httpMiddlewareOptions)
      .withLoggerMiddleware()
      .build();
  } else {
    ctpClient = new ClientBuilder()
      .withAnonymousSessionFlow(authMiddlewareOptions)
      .withHttpMiddleware(httpMiddlewareOptions)
      .withLoggerMiddleware()
      .build();
  }
  return createApiBuilderFromCtpClient(ctpClient);
};
