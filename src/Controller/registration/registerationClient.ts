import { MyCustomerDraft } from '@commercetools/platform-sdk';
import { getApiRoot } from '../apiRoot/generalClient.ts';
import { AuthResponse } from './registerationTypes.ts';

function getProject(options: MyCustomerDraft) {
  return getApiRoot()
    .withProjectKey({
      projectKey: import.meta.env.VITE_PROJECT_KEY,
    })
    .me()
    .signup()
    .post({
      body: {
        email: options.email,
        firstName: options.firstName,
        lastName: options.lastName,
        password: options.password,
        dateOfBirth: options.dateOfBirth,
        addresses: options.addresses,
        defaultBillingAddress: options.defaultBillingAddress,
        defaultShippingAddress: options.defaultShippingAddress,
      },
    })
    .execute();
}

export async function registerNewCustomer(
  options: MyCustomerDraft
): Promise<AuthResponse> {
  try {
    const project = await getProject(options);
    if (project.statusCode! >= 400) return { success: false, errorMessage: '' };
    return { success: true };
  } catch {
    return {
      success: false,
      errorMessage:
        'There is already an existing customer with the provided email.',
    };
  }
}
