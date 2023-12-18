import { getApiRoot } from '../apiRoot/generalClient';

export class ProfileController {
  async getCustomer() {
    return await getApiRoot()
      .withProjectKey({
        projectKey: import.meta.env.VITE_PROJECT_KEY,
      })
      .me();
  }

  async updateUserInfo(formData: FormData) {
    const res = await this.getCustomer();
    const response = (await res.get().execute()).body;

    const formDataObj = {
      firstName: formData.get('firstName') || '',
      lastName: formData.get('lastName') || '',
      email: formData.get('email') || '',
      dateOfBirth:
        `${formData.get('year')}-${formData.get('month')}-${formData.get(
          'day'
        )}` || '',
    };

    const req = await res
      .post({
        body: {
          version: response.version,
          actions: [
            {
              action: 'setFirstName',
              firstName: formDataObj.firstName as string,
            },
            {
              action: 'setLastName',
              lastName: formDataObj.lastName as string,
            },
            {
              action: 'changeEmail',
              email: formDataObj.email as string,
            },
            {
              action: 'setDateOfBirth',
              dateOfBirth: formDataObj.dateOfBirth as string,
            },
          ],
        },
      })
      .execute();

    return req;
  }

  async updatePassword(data: FormData) {
    const res = await this.getCustomer();
    const body = (await res.get().execute()).body;

    const formDataObj = {
      currentPassword: data.get('currentPassword') || '',
      newPassword: data.get('newPassword') || '',
    };

    return await getApiRoot()
      .withProjectKey({
        projectKey: import.meta.env.VITE_PROJECT_KEY,
      })
      .me()
      .password()
      .post({
        body: {
          version: body.version,
          currentPassword: formDataObj.currentPassword as string,
          newPassword: formDataObj.newPassword as string,
        },
      })
      .execute();
  }

  async addAdress(formData: FormData) {
    const res = await this.getCustomer();
    const body = (await res.get().execute()).body;

    const formDataObj = {
      city: formData.get('city') || '',
      postalCode: formData.get('postalCode') || '',
      streetName: formData.get('streetName') || '',
    };

    return await res
      .post({
        body: {
          version: body.version,
          actions: [
            {
              action: 'addAddress',
              address: {
                country: 'PL',
                city: formDataObj.city as string,
                postalCode: formDataObj.postalCode as string,
                streetName: formDataObj.streetName as string,
              },
            },
          ],
        },
      })
      .execute();
  }

  async addBillingAddress(formData: FormData) {
    const data = await this.addAdress(formData);
    const body = await data.body;
    const addresses = body.addresses;

    return (await this.getCustomer())
      .post({
        body: {
          version: body.version,
          actions: [
            {
              action: 'addBillingAddressId',
              addressId: addresses[addresses.length - 1].id,
            },
          ],
        },
      })
      .execute();
  }

  async addShippingAddress(formData: FormData) {
    const data = await this.addAdress(formData);
    const body = await data.body;
    const addresses = body.addresses;

    return (await this.getCustomer())
      .post({
        body: {
          version: body.version,
          actions: [
            {
              action: 'addShippingAddressId',
              addressId: addresses[addresses.length - 1].id,
            },
          ],
        },
      })
      .execute();
  }

  async deleteAddress(id: string) {
    const res = await this.getCustomer();
    const body = (await res.get().execute()).body;

    return res
      .post({
        body: {
          version: body.version,
          actions: [
            {
              action: 'removeAddress',
              addressId: id,
            },
          ],
        },
      })
      .execute();
  }

  async setDefaultBillingAddress(id: string) {
    const res = await this.getCustomer();
    const body = (await res.get().execute()).body;

    return res
      .post({
        body: {
          version: body.version,
          actions: [
            {
              action: 'setDefaultBillingAddress',
              addressId: id,
            },
          ],
        },
      })
      .execute();
  }

  async setDefaultShippingAddress(id: string) {
    const res = await this.getCustomer();
    const body = (await res.get().execute()).body;

    return res
      .post({
        body: {
          version: body.version,
          actions: [
            {
              action: 'setDefaultShippingAddress',
              addressId: id,
            },
          ],
        },
      })
      .execute();
  }

  async changeAddress(id: string, formData: FormData) {
    const res = await this.getCustomer();
    const body = (await res.get().execute()).body;

    const formDataObj = {
      city: formData.get('city') || '',
      postalCode: formData.get('postalCode') || '',
      streetName: formData.get('streetName') || '',
    };

    return res
      .post({
        body: {
          version: body.version,
          actions: [
            {
              action: 'changeAddress',
              addressId: id,
              address: {
                country: 'PL',
                city: formDataObj.city as string,
                postalCode: formDataObj.postalCode as string,
                streetName: formDataObj.streetName as string,
              },
            },
          ],
        },
      })
      .execute();
  }
}
