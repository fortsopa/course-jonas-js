'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');
const inputCountry = document.querySelector('.inputCountry');

inputCountry.addEventListener('keyup', function (e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    btn.click();
  }
});
///////////////////////////////////////

/* const getCountryData = function (country) {
  const request = new XMLHttpRequest();
  request.open('GET', `https://restcountries.com/v3.1/name/${country}`);

  request.send();
  request.addEventListener('load', function () {
    const [data] = JSON.parse(this.responseText);
    console.log(data);

    const html = `
    <article class="country">
    <img class="country__img" src="${data.flags.png}" />
     <div class="country__data">
      <h3 class="country__name">${data.name.official}</h3>
      <h4 class="country__region">${data.region}</h4>
      <p class="country__row"><span>👫</span>${(
        +data.population / 1000000
      ).toFixed(1)}M</p>
      <p class="country__row"><span>🗣️</span>${
        data.languages[Object.keys(data.languages)[0]]
      }</p>
      <p class="country__row"><span>💰</span>${
        data.currencies[Object.keys(data.currencies)[0]].symbol
      }</p>
    </div>
  </article>
  `;
    countriesContainer.insertAdjacentHTML('beforeend', html);
    countriesContainer.style.opacity = 1;
  });
};
 */

const renderCountry = function (data, className = '') {
  const html = `
    <article class="country ${className}">
    <img class="country__img" src="${data.flags.png}" />
     <div class="country__data">
      <h3 class="country__name">${data.name.official}</h3>
      <h4 class="country__region">${data.region}</h4>
      <p class="country__row"><span>👫</span>${(
        +data.population / 1000000
      ).toFixed(1)}M</p>
      <p class="country__row"><span>🗣️</span>${
        data.languages[Object.keys(data.languages)[0]]
      }</p>
      <p class="country__row"><span>💰</span>${
        data.currencies[Object.keys(data.currencies)[0]].name
      }</p>
    </div>
  </article>
  `;
  countriesContainer.insertAdjacentHTML('beforeend', html);
  //   countriesContainer.style.opacity = 1;
};

/* const getCountryAndNeighbour = function (country) {
  //AJAX call 1
  const request = new XMLHttpRequest();
  request.open('GET', `https://restcountries.com/v3.1/name/${country}`);

  request.send();
  request.addEventListener('load', function () {
    const [data] = JSON.parse(this.responseText);
    console.log(data);
    //Render country 1
    renderCountry(data);

    //GET the neighbour
    const neighbour = data.borders;
    if (!neighbour) return;

    console.log(neighbour);

    neighbour.forEach(e => {
      const request2 = new XMLHttpRequest();
      request2.open('GET', `https://restcountries.com/v3.1/alpha/${e}`);
      request2.send();

      request2.addEventListener('load', function () {
        const [data2] = JSON.parse(this.responseText);

        renderCountry(data2, 'neighbour');
      });
    });
  });
}; */

// getCountryAndNeighbour('greece');

// PROMISES

/* const getCountryDataPromise = function (country) {
  // Fetch the data with Fetch API
  fetch(`https://restcountries.com/v3.1/name/${country}`) // -> returns a Promise
    // if Promise ->
    .then(response => response.json()) // json() methord returns also another Promise
    // now render the data with renderCountry() function
    .then(data => renderCountry(data[0]));
};

getCountryDataPromise('germany');
 */

const renderError = function (msg) {
  countriesContainer.insertAdjacentText('beforeend', msg);
  countriesContainer.style.opacity = 1;
};

// creating a generic function for getting the JSON to prevent code repetition in the main Promise
const getJSON = function (url, errorMsg = 'Something went wrong') {
  return fetch(url).then(response => {
    console.log(response);
    if (!response.ok) {
      throw new Error(`${errorMsg} (${response.status})`); // this error will propagate to the .catch block down there if the response.ok is not true. (.status property is a property of response object)
    }
    return response.json(); // return must be used bc of arrow function with block. json() methord returns also another Promise
  });
};

const getCountryDataPromise = function (country) {
  // Fetch the data with Fetch API
  getJSON(`https://restcountries.com/v3.1/name/${country}`, 'Country not found') // now render the data with renderCountry() function
    .then(data => {
      renderCountry(data[0]);
      const neighbour = data[0].borders;

      return neighbour;
    })
    .then(neighbour => {
      if (!neighbour) {
        throw new Error(`No neighbour found!`); //throw error if .border property returns nothing (=undefined)
      }
      // return every element of neighbour array with forEach and fetch the country data for every element again.
      return neighbour.forEach(element => {
        getJSON(
          `https://restcountries.com/v3.1/alpha/${element}`,
          'Neighbour countries could not be fetched'
        ).then(data => {
          return renderCountry(data[0], 'neighbour'); // render every neighbour
        });
      });
    })
    .catch(err => renderError(err.message)) //error catching
    .finally(() => {
      countriesContainer.style.opacity = 1; //run this nevertheless
    });
};

btn.addEventListener('click', () => {
  countriesContainer.innerHTML = ''; //refresh the list
  getCountryDataPromise(document.querySelector('.inputCountry').value); //get the value from the input box
});
