import {select ,classNames, settings, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions(element);

    // console.log('new Cart', thisCart)
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};
    
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelector(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    
    // console.log('thisCart.dom.totalPrice',thisCart.dom.totalPrice);
  }

  initActions(element){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function(element){
      // console.log('thisCart.dom.wrapper',thisCart.dom.wrapper);
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(callback){
      callback.preventDefault();
      thisCart.sendOrder();
    });
  }

  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;
    
    const payload = {
      address : thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: []
    };
    // console.log('payload', payload);

    for(let prod of thisCart.products) {
      // console.log('prod', prod.getData());
      payload.products.push(prod.getData());
    }
    // console.log('payload1111', payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
  
    // fetch(url, options);
  }


  add(menuProduct){
    const thisCart = this;
    const cartContainer = document.querySelector(select.cart.productList);
    const generatedHTML = templates.cartProduct(menuProduct);
    // console.log('generatedHTML', generatedHTML);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    // console.log('cartContainerA',cartContainer);
    // console.log('generatedDOMa',generatedDOM);
    cartContainer.appendChild(generatedDOM);
    // console.log('adding product', menuProduct);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    // console.log('thisCart.products', thisCart.products);
    thisCart.update();
  }

  update(){
    const thisCart = this;

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    // console.log('thisCart.products', thisCart.products);
    for(let product in thisCart.products){
      // console.log('product', thisCart.products[product].price);
      thisCart.totalNumber += 1;
      thisCart.subtotalPrice += thisCart.products[product].price;
    }
    if (thisCart.subtotalPrice == 0){
      thisCart.deliveryFee = 0;
    }
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
  
    // console.log('totalNumber', totalNumber);
    // console.log('subtotalPrice', subtotalPrice);
    // console.log('thisCart.totalPrice', thisCart.totalPrice);
  }

  remove(productForRemove){
    const thisCart = this;
    
    productForRemove.dom.wrapper.remove();
    // console.log('thisCart', thisCart.products);
    thisCart.products.splice(thisCart.products.indexOf(productForRemove), 1);

    thisCart.update();
  }

}


export default Cart;