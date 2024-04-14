import { BASE_URL, options } from './project-api.js';
import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

///////////////////////////////////////////////////////////////

// ELEMENTS
const inputSearch = document.querySelector('input[name="searchQuery"');
const selectCountry = document.getElementById('select-country');
const eventsGallery = document.getElementById('events-gallery');
let paginationNum = document.getElementById('pagination-div');
let modalHeaderLogoDiv = document.getElementById('modal-header-logo-div');
let modalBody = document.querySelector(".modal-body");


// const searchFormEl = document.getElementById('search-form');

///////////////////////////////////////////////////////////////

// window.onload = function () {

// }

// instantiate simplelightbox
const lightbox = new SimpleLightbox('.lightbox', {
  captionsData: 'alt',
  captionDelay: 250,
});

///////////////////////////////////////////////////////////////
let totalPages = 0;
let reachedEnd = false;
let currentEvents = {};

window.onload = () => {
  sessionStorage.clear();
  paginationNum.classList.remove('is-visible');
  paginationNum.classList.add('is-hidden');
};

function renderModal(currentID) {
  console.log('The is the id: ', currentID);
  // modalBody.innerText = currentEvents[0].name;
  let eventIndex = currentEvents.map(e => e.id).indexOf(currentID);
  // modalBody.innerText = eventIndex;
  const { name, id, images, dates, classifications, _embedded, priceRanges} =
    currentEvents[eventIndex];
  let headerImgHTML = ` 
                   <img src="${images[0].url}" class="rounded-circle" loading="lazy"/>
  `;

  let modalBodyHTML = `
          <div class="modal-body-one">
            <div class="modal-body-img-div">
              <img src="${
                images[0].url
              }" class="modal-body-img" loading="lazy"/>
            </div>
            <div class="modal-body-info-div">
              <h3 class="modal-info-title">INFO</h3>
              <p class="info-content">${name} is the largest ${
    classifications[0].segment.name
  } festival in ${
    _embedded.venues[0].state.name
  }. More than 200 celebrities will create a proper ${
    classifications[0].segment.name
  } festival atmosphere on 10 stages. </p>
              <h3 class="modal-info-title">WHEN</h3>
              <p class="info-content">${dates.start.localDate}<br>${
    dates.start.localTime
  }</p>
              <h3 class="modal-info-title">WHERE</h3>
              <p class="info-content">${_embedded.venues[0].name}<br>${
    _embedded.venues[0].city.name
  }, ${_embedded.venues[0].state.name}</p>
            </div>
          </div>
           <div class="modal-body-who-div">
              <h3 class="modal-info-title">WHO</h3>
              <p class="info-content">${name}</p>
           </div>
           <div class="modal-body-price-div">
              <h3 class="modal-info-title">PRICES</h3>
              <div class="price-content">
                <div>
                  <p class="info-content">Standard ${priceRanges[0].min.toFixed(2)} ${priceRanges[0].currency}</p>
                  <button type="button" class="btn btn-primary">BUY TICKETS</button>
                </div>
                <div>
                  <p class="info-content">VIP ${priceRanges[0].max.toFixed(2)} ${priceRanges[0].currency}</p>
                  <button type="button" class="btn btn-primary">BUY TICKETS</button>
                </div>
                
              </div>
           </div>
  `;

  modalHeaderLogoDiv.insertAdjacentHTML('beforeend', headerImgHTML);
  modalBody.innerHTML = modalBodyHTML;
}

function renderEventsGallery(events) {
  eventsGallery.innerHTML = '';
  const markup = events
    .map(({ name, id, images, dates, _embedded }) => {
      return `
              
                <div class="col-md-3 event-data" data-name="event-card" data-id="${id}">
                <a href="#" class="eventModal" data-bs-toggle="modal" data-bs-target="#eventModal">
                  <div class="event-data-box" data-name="event-card" data-id="${id}">
                    <div class="event-data-boxForImg" data-name="event-card" data-id="${id}">
                      <img src="${images[0].url}" class="image-card" loading="lazy" data-name="event-card" data-id="${id}"/>
                    </div>
                    <div class="event-data-overlay-border" data-name="event-card" data-id="${id}">
                    </div>
                      <div class="info" data-name="event-card" data-id="${id}">
                          <h4 class="info-item" data-name="event-card" data-id="${id}">
                              ${name}
                          </h4>
                          <p class="info-item" data-name="event-card" data-id="${id}">
                              ${dates.start.localDate}
                          </p>
                          <small class="info-item" data-name="event-card" data-id="${id}">
                               ${_embedded.venues[0].name}
                          </small>
                        
                      </div>
                  </div>
                </a>
                </div>
             
              `;
    })
    .join('');

  currentEvents = events;
  eventsGallery.insertAdjacentHTML('beforeend', markup);
  paginationNum.classList.remove('is-hidden');
  paginationNum.classList.add('is-visible');

  //   If the user has reached the end of the collection
  if (options.params.page >= 49) {
    if (!reachedEnd) {
      Notify.info("We're sorry, but you've reached the end of search results.");
      reachedEnd = true;
    }
  }
  lightbox.refresh();
}

///////////////////////////////////////////////////////////////

async function handleEventSearch(e) {
  e.preventDefault();
  paginationNum.classList.remove('is-visible');
  paginationNum.classList.add('is-hidden');

  let selectedOption = selectCountry.options[selectCountry.selectedIndex];
  // console.log(selectedOption.id);

  options.params.keyword = inputSearch.value.trim();
  options.params.countryCode = selectedOption.id;
  // console.log(options.params.keyword);
  // console.log(options.params.countryCode);

  if (options.params.keyword === '' || options.params.countryCode === '') {
    Notify.failure('Please choose a country');
    inputSearch.value = '';
    return;
  }
  // options.params.page = 1;
  eventsGallery.innerHTML = '';
  reachedEnd = false;

  try {
    const res = await axios.get(BASE_URL, options);
    // totalPages = res.data.page.totalPages;
    sessionStorage.setItem('actualTotalPages: ', res.data.page.totalPages);
    if (res.data.page.totalPages < 49) {
      totalPages = res.data.page.totalPages;
      console.log('total pages:', totalPages);
      sessionStorage.setItem('totalPages', totalPages);
    } else {
      totalPages = 49;
      console.log('total pages:', totalPages);
      sessionStorage.setItem('totalPages', totalPages);
    }

    const { events } = res.data._embedded;
    // console.log(events[0].name);

    if (!events || events.length === 0) {
      Notify.failure(
        'Sorry, there are no events matching your search query. Please try again.'
      );
    } else {
      Notify.success(`Hooray! We found ${totalPages} pages.`);
      renderPageNumbers(1, 1);
      renderEventsGallery(events);
    }
    inputSearch.value = '';
  } catch (err) {
    Notify.failure(err);
  }
}

///////////////////////////////////////////////////////////////

async function loadPage(i) {
  options.params.page = i - 1;
  try {
    const res = await axios.get(BASE_URL, options);
    const { events } = res.data._embedded;
    // const hits = res.data.hits;
    renderEventsGallery(events);
  } catch (err) {
    Notify.failure(err);
  }
}

function handleScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight) {
    loadMore();
  }
}

// EVENT LISTENERS -----------------------------

inputSearch.addEventListener('input', _.debounce(handleEventSearch, 500));
document.addEventListener('click', e => {
  // console.log("this is clicked:  ", e.target.parentElement.parentElement.parentElement)
  // console.log('this is clicked: ', e.target.getAttribute('data-name'));
  if (e.target.getAttribute('data-name') === 'event-card') {
    let currentID = e.target.getAttribute('data-id');
    // console.log("this is the id: ", currentID);
    // console.log("this is the event: ", currentEvents);
    renderModal(currentID);
  }
});

document.addEventListener('click', e => {
  if (
    e.target.tagName === 'BUTTON' &&
    e.target.getAttribute('class') === 'btn-close'
  ) {
    document.getElementById('modal-header-logo-div').innerHTML="";
  }
});
document.addEventListener('click', e => {
  if (e.target.tagName === 'DIV' &&
    e.target.getAttribute('id') === 'eventModal') {
    document.getElementById('modal-header-logo-div').innerHTML = '';
    }
});
// EVENT LISTENERS END -----------------------------------


// PAGINATION --------------------------------------------
const currentPageDiv = document.querySelector('.current-page');
const pageNumbersUl = document.querySelector('.page-numbers');
// let activePage = 1;

function renderPageNumbers(startIndex, activePage) {
  let pageTotal = parseInt(sessionStorage.getItem('totalPages'));
  // sessionStorage.clear();
  const nums = [...Array(pageTotal).keys()].slice();
  
  console.log('keykeykeyword: ', options.params.keyword);
  // console.log('pahina: ', pageTotal);
  pageNumbersUl.innerHTML = '';
  currentPageDiv.textContent = startIndex;
  if (startIndex > 1) {
    // for previous li; in this case page number 1
    const previousPageLi = document.createElement('li');
    previousPageLi.textContent = 1;
    pageNumbersUl.appendChild(previousPageLi);
    previousPageLi.addEventListener('click', () => {
      pageNumbersUl
        .querySelectorAll('.active')
        .forEach(activeLi => activeLi.classList.remove('active'));
      previousPageLi.classList.add('active');
      activePage = Number(previousPageLi.textContent); ////////////////////////
      currentPageDiv.textContent = Number(previousPageLi.textContent);
      loadPage(Number(previousPageLi.textContent));
    });

    const previousEllipsisLi = document.createElement('li');
    previousEllipsisLi.textContent = '...';
    pageNumbersUl.appendChild(previousEllipsisLi);
    previousEllipsisLi.addEventListener('click', () => {
      const previousStartIndex = Math.max(startIndex - 5, 1);
      renderPageNumbers(previousStartIndex, activePage);
    });
  }
  const endIndex = Math.min(startIndex + 4, nums.length);
  for (let i = startIndex; i <= endIndex; i++) {
    const li = document.createElement('li');
    li.textContent = i;
    // if (i === startIndex) {
    //   li.classList.add('active');
    // }
    li.addEventListener('click', () => {
      pageNumbersUl
        .querySelectorAll('.active')
        .forEach(activeLi => activeLi.classList.remove('active'));
      li.classList.add('active');
      activePage = i; ////////////////////////
      currentPageDiv.textContent = i;
      loadPage(i);
    });
    pageNumbersUl.appendChild(li);
  }
  if (endIndex < nums.length) {
    const nextEllipsisLi = document.createElement('li');
    nextEllipsisLi.textContent = '...';
    pageNumbersUl.appendChild(nextEllipsisLi);
    const lastPageLi = document.createElement('li');
    lastPageLi.textContent = nums.length;
    pageNumbersUl.appendChild(lastPageLi);
    lastPageLi.addEventListener('click', () => {
      pageNumbersUl
        .querySelectorAll('.active')
        .forEach(activeLi => activeLi.classList.remove('active'));
      lastPageLi.classList.add('active');
      activePage = Number(lastPageLi.textContent); ////////////////////////
      currentPageDiv.textContent = Number(lastPageLi.textContent);
      loadPage(Number(lastPageLi.textContent));
    });

    nextEllipsisLi.addEventListener('click', () => {
      const nextStartIndex = endIndex + 1;
      renderPageNumbers(nextStartIndex, activePage);
    });
  }

  let liPages = document.querySelectorAll('.page-numbers li');
  // console.log("mao ni lipages: ", liPages);
  for (let liPage of liPages) {
    // console.log("liPage: ", liPage.textContent)
    // console.log('activePage: ', activePage);

    if (Number(liPage.textContent) === Number(activePage)) {
      console.log('kit-an ra jd');
      liPage.classList.add('active');
    }
  }
}
// PAGINATION END ------------------------------