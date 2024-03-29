import {templates, select, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(element){
    const thisBooking = this;

    thisBooking.selectedTable = {};
    thisBooking.starters = [];

    thisBooking.renderBooking(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
    
    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    // console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };
    
    // console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponse){
        const bookingResponse = allResponse[0];
        const eventsCurrentResponse = allResponse[1];
        const eventsRepeatResponse = allResponse[2];

        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]); 
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat) {
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    // console.log('thisBooking.booked111111',thisBooking.booked);
    thisBooking.updateDom();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      // console.log('loop', hourBlock);

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDom(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){ 
      let tableID = table.getAttribute(settings.booking.tableIdAttribute);
      thisBooking.selectedTable = {};
      table.classList.remove('selected');
      if(!isNaN(tableID)){
        tableID = parseInt(tableID);
      }

      if(
        !allAvailable 
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableID) // > -1
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  renderBooking(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesPlan = element.querySelector('.floor-plan');
    thisBooking.dom.bookingOptions = element.querySelector('.booking-options');
    
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.cart.address);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.cart.phone);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
  }

  initWidgets(){
    const thisBooking = this;
    
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    // thisBooking.peopleAmountWidget.addEventListener('updated', function(event){
    // }); 
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDom();
    });
    thisBooking.dom.tablesPlan.addEventListener('click', function(event) {
      let table = event.target;
      event.preventDefault();
      if (table && table.matches('.table') && !table.classList.contains(classNames.booking.tableBooked)) {
        let selectedTable = table.getAttribute(settings.booking.tableIdAttribute);
        if (thisBooking.selectedTable.table != selectedTable){
          thisBooking.selectedTable.table = parseInt(selectedTable);
        } else {
          thisBooking.selectedTable.table = 0;
        }
        for(let table of thisBooking.dom.tables){
          let tableID = table.getAttribute(settings.booking.tableIdAttribute);
          if(!isNaN(tableID)){
            tableID = parseInt(tableID);
          }
          if(tableID == thisBooking.selectedTable.table && !table.classList.contains(classNames.booking.tableBooked)){
            table.classList.add(classNames.booking.tableSelected);
          }
          else{
            table.classList.remove(classNames.booking.tableSelected);
          }
          
        }
        console.log(thisBooking.selectedTable.table);
      }

    });
    thisBooking.dom.bookingOptions.addEventListener('click', function(event) {
      if(event.target.getAttribute('type') == 'checkbox') {
        if(event.target.checked) {
          thisBooking.starters.push(event.target.getAttribute('value'));
        } else{
          thisBooking.starters.splice(thisBooking.starters.indexOf(event.target.getAttribute('value')),1);
        }
      }
    }
    );

    thisBooking.dom.form.addEventListener('submit', function(callback){
      callback.preventDefault();
      thisBooking.sendBooking();
      thisBooking.updateDom();
    });
  }

  sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;
    
    const payload = {
      date: thisBooking.date,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.selectedTable.table,
      duration: thisBooking.hoursAmountWidget.value,
      ppl: thisBooking.peopleAmountWidget.value,
      starters: thisBooking.starters,
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value
    };

    console.log('payload', payload);

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
    thisBooking.makeBooked(thisBooking.date, thisBooking.hourPicker.value, thisBooking.hoursAmountWidget.value, thisBooking.selectedTable.table);
  }
}


export default Booking;