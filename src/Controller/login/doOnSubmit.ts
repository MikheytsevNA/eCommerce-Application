import { getInputElement } from '../../Utility/submitForm';
import { authentificateCustomer } from './loginClient';
import Header from '../../View/components/header';
import { Routing } from '../../Router/Router';
import { getCart } from '../basket/basket';
import { getApiRoot } from '../apiRoot/generalClient';

export async function doOnAuthSubmit(event: SubmitEvent) {
  const form = event.target as HTMLFormElement;
  if (!form.reportValidity()) return;
  event.preventDefault();
  const email = getInputElement(form, '.e-mail');
  const password = getInputElement(form, '.password1');
  const response = await authentificateCustomer({
    username: email.value,
    password: password.value,
  });
  if (response.success === true) {
    const header = Header.getInstance();
    header.loginElement = true;
    email.value = '';
    password.value = '';
    const router = new Routing();
    router.get('/');

    await getCart();

    let cartCookieValue;
    if (typeof window !== 'undefined') {
      cartCookieValue = document.cookie
        .split('; ')
        .find((row) => row.startsWith('cartID='))
        ?.split('=')[1];
    }

    let cartVersionCookieValue: string | undefined;
    if (typeof window !== 'undefined') {
      cartVersionCookieValue = document.cookie
        .split('; ')
        .find((row) => row.startsWith('cartVersion='))
        ?.split('=')[1];
    }

    if (response.cart) {
      const existingCartResponse = await getApiRoot()
        .withProjectKey({
          projectKey: import.meta.env.VITE_PROJECT_KEY,
        })
        .carts()
        .withId({ ID: response.cart })
        .get()
        .execute();
      const cart = existingCartResponse.body;
      document.cookie = `cartID=${cart.id}; max-age=172000; path=/;`;
      document.cookie = `cartVersion=${cart.version}; max-age=172000; path=/;`;
      header.cartElement = cart.lineItems.reduce((accumulator, value) => {
        return accumulator + value.quantity;
      }, 0);
    } else {
      const basketUpdateResponse = await getApiRoot()
        .withProjectKey({
          projectKey: import.meta.env.VITE_PROJECT_KEY,
        })
        .carts()
        .withId({ ID: cartCookieValue! })
        .post({
          body: {
            actions: [
              {
                action: 'setCustomerId',
                customerId: response.token,
              },
            ],
            version: Number.parseInt(cartVersionCookieValue!),
          },
        })
        .execute();
      document.cookie = `cartVersion=${basketUpdateResponse.body.version}; max-age=172000; path=/;`;
    }
  } else {
    const errorrDiv = document.querySelector('.api-error')!;
    errorrDiv.textContent = response.errorMessage;
    errorrDiv.classList.add('api-error_color_red');
  }
}
