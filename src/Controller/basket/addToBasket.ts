import { getApiRoot } from '../apiRoot/generalClient.ts';
import { getCart } from './basket.ts';

export async function addToBasket(id: string, quantity?: number) {
  await getCart();
  let cartCookieValue;
  if (typeof window !== 'undefined') {
    cartCookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith('cartID='))
      ?.split('=')[1];
  }
  let cartVersionCookieValue;
  if (typeof window !== 'undefined') {
    cartVersionCookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith('cartVersion='))
      ?.split('=')[1];
  }
  if (!cartVersionCookieValue) return;
  try {
    const response = await getApiRoot()
      .withProjectKey({
        projectKey: import.meta.env.VITE_PROJECT_KEY,
      })
      .carts()
      .withId({ ID: cartCookieValue! })
      .post({
        body: {
          actions: [
            {
              action: 'addLineItem',
              productId: id,
              variantId: 1,
              quantity: quantity ?? 1,
            },
          ],
          version: Number.parseInt(cartVersionCookieValue),
        },
      })
      .execute();
    if (response.statusCode! >= 400) {
      return null;
    } else {
      document.cookie = `cartVersion=${response.body.version}; max-age=172000; path=/;`;
      return response.body;
    }
  } catch (error) {
    console.error(error);
  }
}
