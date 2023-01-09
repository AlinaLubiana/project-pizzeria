import { select, templates, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';


class Product{
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    // console.log('new Product:', thisProduct);
  }

  renderInMenu(){
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    //console.log('generatedHTML',generatedHTML);
    
    /* create element using utils.createElementFromHTML*/
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    // console.log('thisProduct.element',thisProduct.element);
    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;
  
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }
  
  initAccordion(){
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    // const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    
    /* START: add event limerry cristmas you toostener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function(event) {
    /* prevent default action for event */
      event.preventDefault();
      /* find active product (product that has active class) */
      const activeProducts = document.querySelector(select.all.menuProductsActive);
      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if(activeProducts && (thisProduct.element != activeProducts)){
        activeProducts.classList.remove(classNames.menuProduct.wrapperActive);
      }
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      // console.log('thisProduct.element',thisProduct.element);
    });
  }

  initOrderForm(){
    const thisProduct = this;
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
    
    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
    
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
    // console.log('initOrderForm');
  }
  
  processOrder() {
    const thisProduct = this;
  
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    // console.log('formData', formData);
  
    // set price to default price
    let price = thisProduct.data.price;
  
    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      // console.log('++++++++++++');
      // console.log(paramId, param);
  
      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        // const option = param.options[optionId];
        const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
        const optionSelected = formData[paramId];
        // console.log('PRICE', param.options[optionId].price);
        // console.log(optionId, option); //error  'option' is assigned a value but never used  no-unused-vars
        if(optionSelected && optionSelected.includes(optionId)){
          price += param.options[optionId].price;
        }
        
        if(optionImage) {
          if(optionSelected.includes(optionId)) {
            optionImage.classList.add(classNames.menuProduct.wrapperActive);
          } else {
            optionImage.classList.remove(classNames.menuProduct.wrapperActive);
          }
        }
      }
    }
    thisProduct.priceSingle = price;
    price *= thisProduct.amountWidget.value;
    // update calculated price in the HTML
    
    thisProduct.priceElem.innerHTML = price;
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
  
    thisProduct.amountWidgetElem.addEventListener('updated', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });  
  }

  addToCart(){
    const thisProduct = this;
    // // console.log('thisProduct.prepareCartProduct',thisProduct.prepareCartProduct());

    // - thisProduct.name = thisProduct.data.name;
    // - thisProduct.amount = thisProduct.amountWidget.value;

    // app.cart.add(thisProduct.prepareCartProduct());

    // // console.log('!!!prepareCartProductParams',thisProduct.prepareCartProductParams());
    // // thisProduct.prepareCartProductParams();

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });
    thisProduct.element.dispatchEvent(event);
    

  }

  prepareCartProduct(){
    const thisProduct = this;

    const productSummary = {
      id : thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSigle: thisProduct.priceSingle,
      price: thisProduct.amountWidget.value * thisProduct.priceSingle
    };
    // console.log('thisProduct', thisProduct);
    productSummary.params = thisProduct.prepareCartProductParams();
    return productSummary;
  }

  prepareCartProductParams(){
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    const params = {}; 

    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      
      params[paramId] = {
        label: param.label,
        options: {}
      };

      for(let optionId in param.options) {
        const option = param.options[optionId];
        
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        
        if(optionSelected) {
          params[paramId].options[optionId] = option.label;

        }
      }
    }
    // console.log('PP', params);
    return params;
  }

}

export default Product;