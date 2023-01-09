import {select ,classNames, settings, templates} from './settings.js';
import utils from './utils.js';
// import CartProduct from './components/CartProduct.js';
// import AmountWidget from './components/AmountWidget.js';
import Cart from './components/Cart.js';
import Product from './components/Product.js';








const app = {
  initMenu: function(){
    const thisApp = this;
    // console.log('thisApp.data', thisApp.data);
    // const testProduct = new Product();
    // console.log('testProduct:', testProduct);
    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  init: function(){
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initData();
    // thisApp.initMenu();
    thisApp.initCart();
  },

  initData: function(){
    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /* exete initMenu method */
        thisApp.initMenu();
      });
    
    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
    console.log('123252321', cartElem);
  },
};


app.init();



