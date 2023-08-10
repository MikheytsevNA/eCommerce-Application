import { getPasswordApiRoot } from '../apiRoot/loginClient.ts';
import { AuthResponse, User } from './loginTypes.ts';

function getProject(user: User) {
  const request = getPasswordApiRoot(user)
    .withProjectKey({
      projectKey: 'new-ecommerce-app',
    })
    .me()
    .login()
    .post({ body: { password: user.password, email: user.username } })
    .execute();
  return request;
}

export async function authentication(user: User): Promise<AuthResponse> {
  try {
    const project = await getProject(user);
    if (project.statusCode! >= 400) return { succes: false };
    return { succes: true, token: project.body.customer.id };
  } catch (error) {
    console.error(error);
    return { succes: false };
  }
}
