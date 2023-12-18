import { createFooter } from './components/footer';
import Header from './components/header';
import { PageNotFound } from './Pages/404.page';
import { MainPage } from './pages/Main.page';
import createLoginPage from './pages/login';
import createRegistrationPage from './pages/registration';
import { doOnAuthSubmit } from '../Controller/login/doOnSubmit';
import { doOnRegistrationSubmit } from '../Controller/registration/doOnSubmit';
import { ProfilePageView } from './Pages/Profile.page';
import { AboutPage } from './Pages/about.page';
import { Catalog } from './Pages/catalog';
import { Basket } from './Pages/basket';
import { getCart } from '../Controller/basket/basket';

interface IView {
  renderStartElements: () => void;
}

export class View implements IView {
  private readonly $footer = createFooter();
  static readonly $mainContent: HTMLElement = document.createElement('div');
  static readonly $notFound = new PageNotFound().getPageCode();
  static readonly $mainPage = new MainPage().getElement();
  static readonly $loginPage = createLoginPage();
  static readonly $RegistrationPage = createRegistrationPage();
  static readonly $aboutPage = new AboutPage().getElement();
  static $catalogPage = new Catalog();
  static readonly $cartPage = new Basket();

  async renderStartElements(): Promise<void> {
    const check = localStorage.getItem('check') === 'true';
    let option: { isLogged: boolean; cartItems: number };
    let itemCount: number | null = null;
    const response = await getCart();
    if (response !== null) {
      itemCount = response.lineItems.reduce(
        (accumulator: number, value: { quantity: number }) => {
          return accumulator + value.quantity;
        },
        0
      );
    }
    if (check === null) {
      option = { isLogged: true, cartItems: itemCount ?? 0 };
    } else {
      option = { isLogged: check, cartItems: itemCount ?? 0 };
    }
    const header = Header.getInstance(option);

    document.body.append(header.element, View.$mainContent, this.$footer);
    header.addListeners();
  }

  static renderMainPage() {
    View.$mainContent.innerHTML = '';
    View.$mainContent.append(View.$mainPage);
  }

  static renderProfilePage() {
    const isAuthCustomer = window.localStorage.getItem('check');

    if (isAuthCustomer !== 'true') {
      const link = document.createElement('a');
      link.setAttribute('href', '/user/authorization');
      link.click();
    } else {
      const $page = new ProfilePageView();

      View.$mainContent.innerHTML = '';
      View.$mainContent.append($page.getElement());
    }
  }

  static renderRegistrationPage() {
    View.$mainContent.innerHTML = '';
    View.$mainContent.append(View.$RegistrationPage);
    const formToSend = document.querySelector(
      '.registration-form'
    )! as HTMLFormElement;
    formToSend.addEventListener('submit', (event: SubmitEvent) =>
      doOnRegistrationSubmit(event)
    );
  }

  static renderLoginPage() {
    View.$mainContent.innerHTML = '';
    View.$mainContent.append(View.$loginPage);
    const formToSend = document.querySelector(
      '.login-form'
    )! as HTMLFormElement;
    formToSend.addEventListener('submit', (event: SubmitEvent) =>
      doOnAuthSubmit(event)
    );
  }

  static renderLogout() {
    const header = Header.getInstance();
    localStorage.setItem('check', 'false');
    header.loginElement = false;
    header.cartElement = 0;
    document.cookie = `cartVersion=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `cartID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    View.$mainContent.innerHTML = '';
    View.$mainContent.append(View.$mainPage);
  }

  static async renderCatalog(queryParams?: URLSearchParams) {
    View.$mainContent.innerHTML = '';
    const catalogRelatedPage = await View.$catalogPage.getElement(queryParams);
    View.$mainContent.append(catalogRelatedPage);
  }

  static renderBasket() {
    View.$mainContent.innerHTML = '';
    View.$mainContent.append(View.$cartPage.getElement());
  }

  static render404Page() {
    View.$mainContent.innerHTML = View.$notFound.outerHTML;
  }

  static renderAboutPage() {
    View.$mainContent.innerHTML = View.$aboutPage.outerHTML;
  }
}
