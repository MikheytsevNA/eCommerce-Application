import { getApiRoot } from './generalClient';
import { showNextImage, showPreviousImage } from '../../View/components/Slider';
import { ProductVariant } from '@commercetools/platform-sdk';

type ProductImages = {
  url: string;
  dimensions: {
    w: number;
    h: number;
  };
};

type ProductAttributesEnum = {
  name: string;
  value: {
    key: string;
    label: string;
  };
};

type ProductAttributes = {
  name: string;
  value: string;
};

// type ProductVariants = {
//   assets: any[],
//   attributes: ProductAttributes,
//   id: number,
//   images: ProductImages,
//   key: string,
//   prices: {
//     country: string,
//     discounted: {
//       discount: {
//         id: string,
//         typeId: string,
//       },
//       value: ProductPrice,
//       id: string
//     },
//     value: ProductPrice
//   },
//   sku: string
// }

function getCurrencySign(currency: string) {
  switch (currency) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
  }
}

export async function getProductData(id: string) {
  const response = await getApiRoot()
    .withProjectKey({
      projectKey: import.meta.env.VITE_PROJECT_KEY,
    })
    .productProjections()
    .withId({ ID: id })
    .get()
    .execute();
  return response.body;
}

export async function setProductMainData(
  id: string,
  productPage: HTMLDivElement
) {
  await getProductData(id).then((body) => {
    const productName = body.name['en-US'];
    setProductName(productName, productPage);
  });
}

export async function setProductInfo(id: string, productPage: HTMLDivElement) {
  await getProductData(id).then((body) => {
    const mainVariant = body.masterVariant;
    // const productVariants = body.variants;
    setMainVariant(mainVariant, productPage);
    // setVariants(productVariants);
  });
}

export async function setProductDetails(
  id: string,
  productPage: HTMLDivElement
) {
  await getProductData(id).then((body) => {
    const attributesArray = body.masterVariant.attributes;
    if (attributesArray) {
      setDescription(attributesArray, productPage);
      setBrand(attributesArray, productPage);
    }
  });
}

function setMainVariant(
  mainVariant: ProductVariant,
  productPage: HTMLDivElement
) {
  let productImageSrc: string;
  if (mainVariant.images) {
    productImageSrc = mainVariant.images[0].url;
    mainVariant.images.shift();
    setProductMainImage(productImageSrc, productPage);

    const mainImage = productPage.querySelector(
      '.product-image'
    ) as HTMLDivElement;
    mainImage.addEventListener('click', () => {
      const background = document.createElement('div');
      background.className = 'background';

      const modalWindow = document.createElement('div');
      modalWindow.className = 'modal-window';
      modalWindow.innerHTML = `
      <div class="modal-window__close-button"></div>
        <div class="modal-window__gallery">
          <div class="main-image-container">
            <img class="product-image" alt="product-image">
          </div> 
          <div class="other-images">
            <img class="product-image_size_small product-image_1 product-image_selected" alt="image">
          </div>
        </div>`;

      setProductMainImage(productImageSrc, modalWindow);

      if (mainVariant.images) {
        if (mainVariant.images.length > 0) {
          setOtherImages(mainVariant.images, modalWindow);
        }
      }

      const closeButton = modalWindow.querySelector(
        '.modal-window__close-button'
      ) as HTMLDivElement;
      closeButton.addEventListener('click', () => {
        modalWindow.remove();
        background.remove();
      });

      background.addEventListener('click', () => {
        modalWindow.remove();
        background.remove();
      });

      document.body.appendChild(background);
      document.body.appendChild(modalWindow);
    });

    if (mainVariant.images.length > 0) {
      setOtherImages(mainVariant.images, productPage);
    }
  }

  let currentPrice;
  let currentPriceCurrency;
  let previousPrice;
  let previousPriceCurrency;

  if (mainVariant.prices) {
    if (mainVariant.prices[0].discounted) {
      currentPrice = mainVariant.prices[0].discounted.value.centAmount / 100;
      currentPriceCurrency = getCurrencySign(
        mainVariant.prices[0].discounted.value.currencyCode
      );
      if (currentPriceCurrency) {
        const currentPriceFull = currentPriceCurrency + currentPrice;
        setProductCurrentPrice(currentPriceFull, productPage);
      }
      previousPrice = mainVariant.prices[0].value.centAmount / 100;
      previousPriceCurrency = getCurrencySign(
        mainVariant.prices[0].value.currencyCode
      );
      if (previousPriceCurrency) {
        const previousPriceFull = '$' + previousPrice;
        setProductPreviousPrice(previousPriceFull, productPage);
        setDiscount(previousPrice, currentPrice, productPage);
      }
    } else {
      currentPrice = mainVariant.prices[0].value.centAmount / 100;
      currentPriceCurrency = getCurrencySign(
        mainVariant.prices[0].value.currencyCode
      );
      setProductCurrentPrice('$' + currentPrice, productPage);
      setProductPreviousPrice('', productPage);
      setDiscount(0, 0, productPage, false);
    }
  }

  const attributesArray = mainVariant.attributes;
  if (attributesArray) {
    setColors(attributesArray, productPage);
    setSize(attributesArray, productPage);
  }
}

function setProductName(productName: string, productPage: HTMLDivElement) {
  const productNameField = productPage.querySelector(
    '.product-name'
  ) as HTMLHeadingElement;
  productNameField.innerHTML = productName;
}

function setProductMainImage(src: string, productPage: HTMLDivElement) {
  const mainImage = productPage.querySelector(
    '.product-image'
  ) as HTMLImageElement;
  mainImage.setAttribute('src', src);
  const selectedImage = productPage.querySelector(
    '.product-image_selected'
  ) as HTMLImageElement;
  selectedImage.setAttribute('src', src);
  selectedImage.addEventListener('click', () => {
    changeSelectedImage(selectedImage, src, productPage);
  });
}

// function setProductMainImage(src: string, productPage: HTMLDivElement) {
//   const mainImage = productPage.querySelector(
//     '.product-image'
//   ) as HTMLImageElement;
//   mainImage.setAttribute('src', src);
//   const selectedImage = productPage.querySelector(
//     '.product-image_selected'
//   ) as HTMLImageElement;
//   selectedImage.setAttribute('src', src);
//   selectedImage.addEventListener('click', () => {
//     changeSelectedImage(selectedImage, src);
//   });
// }

export function changeSelectedImage(
  additionalImage: HTMLImageElement,
  src: string,
  productPage: HTMLDivElement
) {
  const otherImagesArray = productPage.querySelectorAll(
    '.product-image_size_small'
  );
  otherImagesArray.forEach((image) => {
    if (image.classList.contains('product-image_selected')) {
      image.classList.remove('product-image_selected');
    }
  });
  additionalImage.classList.add('product-image_selected');
  const mainImage = productPage.querySelector(
    '.product-image'
  ) as HTMLImageElement;
  mainImage.setAttribute('src', src);
}

// скачут изображения доделать
function setOtherImages(
  srcArray: ProductImages[],
  productPage: HTMLDivElement
) {
  //if (srcArray.length > 0) {
  const productImage = productPage.querySelector(
    '.product-image'
  ) as HTMLDivElement;
  productImage.insertAdjacentHTML(
    'beforebegin',
    `
    <div class="previous-image"></div>
    `
  );
  productImage.insertAdjacentHTML(
    'afterend',
    `
  <div class="next-image"></div>
  `
  );
  // }
  const otherImages = productPage.querySelector(
    '.other-images'
  ) as HTMLDivElement;
  srcArray.forEach((src, index) => {
    const additionalImage = document.createElement('img');
    additionalImage.className = `product-image_size_small product-image_${
      index + 2
    }`;
    additionalImage.setAttribute('src', src.url);
    additionalImage.setAttribute('alt', 'product-image');
    additionalImage.addEventListener('click', () => {
      changeSelectedImage(additionalImage, src.url, productPage);
    });
    otherImages.appendChild(additionalImage);
  });

  const totalImageAmount = productPage.querySelectorAll(
    '.product-image_size_small'
  ).length;
  console.log(totalImageAmount);
  const previousImageButton = productPage.querySelector(
    '.previous-image'
  ) as HTMLDivElement;
  previousImageButton.addEventListener('click', () => {
    showPreviousImage(totalImageAmount, productPage);
  });
  const nextImageButton = productPage.querySelector(
    '.next-image'
  ) as HTMLDivElement;
  nextImageButton.addEventListener('click', () => {
    showNextImage(totalImageAmount, productPage);
  });
}

function setProductCurrentPrice(
  currentPrice: string,
  productPage: HTMLDivElement
) {
  const currentPriceField = productPage.querySelector(
    '.current-price'
  ) as HTMLDivElement;
  currentPriceField.classList.add('non-active');
  currentPriceField.innerText = currentPrice;
}

function setProductPreviousPrice(
  previousPrice: string,
  productPage: HTMLDivElement
) {
  const previousPriceField = productPage.querySelector(
    '.previous-price'
  ) as HTMLDivElement;
  previousPriceField.innerText = previousPrice;
}

function setDiscount(
  previousPrice: number,
  currentPrice: number,
  productPage: HTMLDivElement,
  isNeeded: boolean = true
) {
  const discount = productPage.querySelector('.discount') as HTMLDivElement;
  if (isNeeded) {
    discount.innerText =
      (((previousPrice - currentPrice) / previousPrice) * 100)
        .toFixed(2)
        .toString() + '%';
  } else {
    discount.classList.add('non-active');
  }
}

function setColors(
  attributesArray: ProductAttributesEnum[],
  productPage: HTMLDivElement
) {
  attributesArray.forEach((attribute) => {
    if (attribute.name === 'color') {
      const colorBlock = productPage.querySelector(
        '.color-block'
      ) as HTMLDivElement;
      const colorBlockHeadingField = productPage.querySelector(
        '.color-block__heading'
      );
      if (!colorBlockHeadingField) {
        colorBlock.innerHTML = `
          <h6 class="color-block__heading">Color</h6>
          <div class="color">
            <div class="color-container color-container-selected">
              <div class="color color_${attribute.value.key}"></div>
            </div>
          </div>
          `;
      } else {
        const color = productPage.querySelector('.color') as HTMLDivElement;
        color.insertAdjacentHTML(
          'beforeend',
          `
            <div class="color-container">
              <div class="color color_${attribute.value.key}"></div>
            </div>
          `
        );
      }
    }
  });
}

function setSize(
  attributesArray: ProductAttributesEnum[],
  productPage: HTMLDivElement
) {
  attributesArray.forEach((attribute) => {
    if (attribute.name === 'size') {
      const sizeBlock = productPage.querySelector(
        '.size-block'
      ) as HTMLDivElement;
      const sizeBlockHeadingField = productPage.querySelector(
        '.size-block__heading'
      );
      if (!sizeBlockHeadingField) {
        sizeBlock.innerHTML = `
        <h6 class="size-block__heading">Size</h6>
        <select class="size">
        <option class="please-select">Please select</option>
        <option class=${attribute.value.key}>${attribute.value.key}</option>
        </select>
        `;
      } else {
        const size = productPage.querySelector('.size') as HTMLDivElement;
        size.insertAdjacentHTML(
          'beforeend',
          `
          <option class=${attribute.value.key}>${attribute.value.key}</option>
        `
        );
      }
    }
  });
}

function setDescription(
  attributesArray: ProductAttributes[],
  productPage: HTMLDivElement
) {
  attributesArray.forEach((attribute) => {
    if (attribute.name === 'description') {
      const descriptionBlock = productPage.querySelector(
        '.product__description'
      ) as HTMLDivElement;
      descriptionBlock.innerHTML = attribute.value;
      return;
    }
  });
}

function setBrand(
  attributesArray: ProductAttributes[],
  productPage: HTMLDivElement
) {
  attributesArray.forEach((attribute) => {
    if (attribute.name === 'brand') {
      const brandBlock = productPage.querySelector(
        '.product__brand'
      ) as HTMLDivElement;
      brandBlock.innerHTML = attribute.value;
      return;
    }
  });
}

// function setVariants(variantsArray: ProductVariants[]){
//   const variantsBlock = productPage.querySelector('.variants-block') as HTMLDivElement;
//   const variantBlockHeadingField = productPage.querySelector('.variant-block__heading');
//   variantsArray.forEach((variant) => {
//     if(!variantBlockHeadingField){
//       variantsBlock.innerHTML = `
//       <h6 class="variant-block__heading">Variants</h6>
//       <img class="variant variant_${variant.sku}" src="${variant.images[0].url}" alt="variant-img">
//       </select>
//       `
//       variantsBlock.querySelector(`.variant_${variant.sku}`)?.addEventListener('click', () => {
//         setMainVariant(variant);
//       })
//     } else {
//       variantsBlock.insertAdjacentHTML('beforeend', `
//       <img class="variant variant_${variant.sku}" src="${variant.images[0].url}" alt="variant-img">
//       `)
//       variantsBlock.querySelector(`.variant_${variant.sku}`)?.addEventListener('click', () => {
//         setMainVariant(variant);
//         variantsBlock.setAttribute('src')
//       })

//     }
//   })
// }
