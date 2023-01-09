import {select, settings} from '../settings.js';

class AmountWidget{
  constructor(element){
    const thisWidget = this;

    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.getElements(element);
    thisWidget.initActions(element);
    // console.log('AmountWidget', thisWidget);
    // console.log('construktor arguments:', element);
  }

  getElements(element){
    const thisWidget = this;
  
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    
    thisWidget.setValue(thisWidget.input.value);
  }

  setValue(value){
    const thisWidget = this;

    const newValue = parseInt(value);
    if (thisWidget.value !== newValue && !isNaN(newValue)  &&  newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
      thisWidget.value = newValue;
      thisWidget.announce();
    }

    thisWidget.input.value = thisWidget.value;
    // console.log(thisWidget.value);
  }

  initActions(element){
    const thisWidget = this;
    
    thisWidget.input.addEventListener('change', function(event){
      thisWidget.setValue(thisWidget.input.value);
    });
    thisWidget.linkDecrease.addEventListener('click', function(event){
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.linkIncrease.addEventListener('click', function(event){
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

  announce(){
    const thisWidget = this;

    const event = new Event('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;