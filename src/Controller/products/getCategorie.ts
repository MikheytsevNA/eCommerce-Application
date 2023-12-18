import { getApiRoot } from '../apiRoot/generalClient.ts';

function getSimpleCategories() {
  return getApiRoot()
    .withProjectKey({
      projectKey: import.meta.env.VITE_PROJECT_KEY,
    })
    .categories()
    .get()
    .execute();
}

export async function getCategories() {
  try {
    const categories = await getSimpleCategories();
    if (categories.statusCode! >= 400) {
      return null;
    } else {
      return categories;
    }
  } catch {
    return null;
  }
}
