import { getApiRoot } from './builClient.ts';
import { RegistrationOptions, AuthResponse } from './authTypes.ts';

function getProject(options: RegistrationOptions) {
  return getApiRoot()
    .withProjectKey({
      projectKey: 'new-ecommerce-app',
    })
    .customers()
    .post({
      body: {
        email: options.email,
        firstName: options.firstName,
        lastName: options.lastName,
        password: options.password,
      },
    })
    .execute();
}

export async function registration(
  options: RegistrationOptions
): Promise<AuthResponse> {
  try {
    const project = await getProject(options);
    if (project.statusCode! >= 400) return { succes: false };
    return { succes: true };
  } catch {
    return { succes: false };
  }
}
