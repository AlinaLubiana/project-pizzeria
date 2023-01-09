import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

// import AmountWidget from './AmountWidget.js';

class CartProduct{
  constructor(menuProduct, element){
    const thisCartProduct = this;

    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.params = menuProduct.params;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSigle = menuProduct.priceSigle;
    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
    // console.log('thisCartProduct', thisCartProduct);

  }

  getElements(element){
    const thisCartProduct = this;

    thisCartProduct.dom = {};

    thisCartProduct.dom.wrapper = element;

    thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove  = element.querySelector(select.cartProduct.remove);
    // console.log('element', element);
    // console.log('thisCartProduct', thisCartProduct);
  }

  initAmountWidget(){
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
  
    thisCartProduct.dom.amountWidget.addEventListener('updated', function(event){
      thisCartProduct.price = thisCartProduct.amountWidget.value * thisCartProduct.priceSigle;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    // console.log('thisCartProduct.price', thisCartProduct.price);
    }); 
  }

  remove(){
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
    // console.log('thisCartProduct.dom.wrappert', thisCartProduct.dom.wrapper);
  }

  initActions(){
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function(event) {
      event.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', function(event) {
      event.preventDefault();       
      thisCartProduct.remove();
    });
    
  }

  getData(){
    const thisCartProduct = this;

    const readyCartProduct = {
      id : thisCartProduct.id,
      name: thisCartProduct.name,
      amount: thisCartProduct.amount,
      priceSigle: thisCartProduct.priceSigle,
      price: thisCartProduct.price
    };
    return readyCartProduct;
  }

} 


export default CartProduct;