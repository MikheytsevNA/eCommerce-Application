import { getApiRoot } from '../apiRoot/generalClient.ts';
import { getCart } from './basket.ts';

export async function addPromoCode(code: string) {
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
      .post({
        body: {
          actions: [
            {
              action: 'addDiscountCode',
              code: code,
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
  } catch {
    return null;
    /* do nothing */
  }
}
