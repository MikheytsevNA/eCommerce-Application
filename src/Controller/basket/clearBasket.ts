import { getApiRoot } from '../apiRoot/generalClient.ts';
import { getCart } from './basket.ts';

export async function clearBasket() {
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
  if (!cartVersionCookieValue) return;
  try {
    const response = await getApiRoot()
      .withProjectKey({
        projectKey: import.meta.env.VITE_PROJECT_KEY,
      })
      .carts()
      .withId({ ID: cartCookieValue! })
      .delete({
        queryArgs: { version: Number.parseInt(cartVersionCookieValue) },
      })
      .execute();
    if (response.statusCode! >= 400) {
      return null;
    }
  } catch (error) {
    console.error(error);
  }
  document.cookie = `cartVersion=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = `cartID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
