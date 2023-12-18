import { getApiRoot } from '../apiRoot/generalClient.ts';
import { getOptions } from './products.type.ts';

function getSimpleProject(options?: getOptions) {
  return getApiRoot()
    .withProjectKey({
      projectKey: import.meta.env.VITE_PROJECT_KEY,
    })
    .productProjections()
    .search()
    .get(options)
    .execute();
}

export async function getProducts(options?: getOptions) {
  try {
    const project = await getSimpleProject(options);
    if (project.statusCode! >= 400) {
      return { body: null };
    } else {
      return project;
    }
  } catch {
    return { body: null };
  }
}
