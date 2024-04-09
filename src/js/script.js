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

function renderEventsGallery(events) {
  const markup = events
    .map(({ name, images, dates, _embedded }) => {
      return `
              
                <div class="col-md-3 event-data">
                  <div class="event-data-box">
                    <div class=event-data-boxForImg>
                      <img src="${images[0].url}" loading="lazy" />
                    </div>
                    <div class="event-data-overlay-border">
                    </div>
                      <div class="info">
                          <h4 class="info-item">
                              ${name}
                          </h4>
                          <p class="info-item">
                              ${dates.start.localDate}
                          </p>
                          <small class="info-item">
                               ${_embedded.venues[0].name}
                          </small>
                        
                      </div>
                  </div>
                </div>
             
              `;
    })
    .join('');

  eventsGallery.insertAdjacentHTML('beforeend', markup);

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
  let selectedOption = selectCountry.options[selectCountry.selectedIndex];
  console.log(selectedOption.id);

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
    totalPages = res.data.page.totalPages;

    const { events } = res.data._embedded;
    console.log(events[0].name);

    if (!events || events.length === 0) {
      Notify.failure(
        'Sorry, there are no events matching your search query. Please try again.'
      );
    } else {
      Notify.success(`Hooray! We found ${totalPages} pages.`);
      renderEventsGallery(events);
    }
    inputSearch.value = '';
  } catch (err) {
    Notify.failure(err);
  }
}

///////////////////////////////////////////////////////////////

async function loadMore() {
  options.params.page += 1;
  try {
    const res = await axios.get(BASE_URL, options);
    const hits = res.data.hits;
    renderGallery(hits);
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
inputSearch.addEventListener('input', _.debounce(handleEventSearch, 500));
// selectCountry.addEventListener("change", () => {
//   let selectedOption = selectCountry.options[selectCountry.selectedIndex];
//   console.log(selectedOption.id);
// })
// window.addEventListener('scroll', handleScroll);

/////////////////////////////////////////////////////////////////////////////////////
// PAGINATION
const pageNumbersUl = document.getElementById('page-numbers');
const currentPageDiv = document.querySelector('.current-page');
const nums = [...Array(30).keys()].slice(1);

function renderPageNumbers(startIndex) {
  pageNumbersUl.innerHTML = '';
  currentPageDiv.textContent = startIndex;
  if (startIndex > 1) {
    const previousPageLi = document.createElement('li');
    previousPageLi.textContent = 1;
    pageNumbersUl.appendChild(previousPageLi);
    const previousEllipsisLi = document.createElement('li');
    previousEllipsisLi.textContent = '...';
    pageNumbersUl.appendChild(previousEllipsisLi);
    previousEllipsisLi.addEventListener('click', () => {
      const previousStartIndex = Math.max(startIndex - 5, 1);
      renderPageNumbers(previousStartIndex);
    });
  }
  const endIndex = Math.min(startIndex + 4, nums.length);
  for (let i = startIndex; i <= endIndex; i++) {
    const li = document.createElement('li');
    li.textContent = i;
    if (i === startIndex) {
      li.classList.add('active');
    }
    li.addEventListener('click', () => {
      pageNumbersUl
        .querySelectorAll('.active')
        .forEach(activeLi => activeLi.classList.remove('active'));
      li.classList.add('active');
      currentPageDiv.textContent = i;
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
    nextEllipsisLi.addEventListener('click', () => {
      const nextStartIndex = endIndex + 1;
      renderPageNumbers(nextStartIndex);
    });
  }
}
renderPageNumbers(1);


