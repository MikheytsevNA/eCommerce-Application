import { getApiRoot } from '../apiRoot/generalClient.ts';

async function getSimpleCart() {
  // const check = localStorage.getItem('check') === 'true';

  let cartcookieValue;
  if (typeof window !== 'undefined') {
    cartcookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith('cartID='))
      ?.split('=')[1];
  }
  if (!cartcookieValue) {
    try {
      const response = await getApiRoot()
        .withProjectKey({
          projectKey: import.meta.env.VITE_PROJECT_KEY,
        })
        .carts()
        .post({
          body: {
            currency: 'USD',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .execute();
      const cart = response.body;
      cartcookieValue = cart.id;
      document.cookie = `cartID=${cartcookieValue}; max-age=172000; path=/;`;
      document.cookie = `cartVersion=${cart.version}; max-age=172000; path=/;`;
    } catch (error) {
      console.error(error);
    }
  }
  return getApiRoot()
    .withProjectKey({
      projectKey: import.meta.env.VITE_PROJECT_KEY,
    })
    .carts()
    .withId({ ID: cartcookieValue! })
    .get()
    .execute();
}

export async function getCart() {
  try {
    const cart = await getSimpleCart();
    if (cart.statusCode! >= 400) {
      return null;
    } else {
      return cart.body;
    }
  } catch {
    return null;
  }
}
