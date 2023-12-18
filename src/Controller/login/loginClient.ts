import { getPasswordApiRoot } from '../apiRoot/loginClient.ts';
import { AuthResponse, User } from './loginTypes.ts';

function getProject(user: User) {
  const request = getPasswordApiRoot(user)
    .withProjectKey({
      projectKey: import.meta.env.VITE_PROJECT_KEY,
    })
    .me()
    .login()
    .post({ body: { password: user.password, email: user.username } })
    .execute();
  return request;
}

export async function authentificateCustomer(
  user: User
): Promise<AuthResponse> {
  try {
    const project = await getProject(user);
    if (project.statusCode! >= 400) {
      return { success: false, errorMessage: '' };
    }

    return project.body.cart
      ? {
          success: true,
          token: project.body.customer.id,
          cart: project.body.cart.id,
        }
      : {
          success: true,
          token: project.body.customer.id,
        };
  } catch (error) {
    return {
      success: false,
      errorMessage: 'Customer account with the given credentials not found.',
    };
  }
}
