import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import '../node_modules/simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix';

const BASEURL = 'https://pixabay.com/api/';

const refs = {
  search: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  observerTarget: document.querySelector('.js-observer'),
};

const per_page = 40;
let page = 1;
let maxPage = 1;
let query = '';
let currentPage = 1;
const perPage = 40;

const lightbox = new SimpleLightbox('.gallery a');

function getImages(query) {
  const params = new URLSearchParams({
    key: '39023312-2f71f46960a1d00fee06a2093',
    per_page,
    page,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  });
  page += 1;
  // console.log(`${BASEURL}?${params}&q=${query}`);
  return axios.get(`${BASEURL}?${params}&q=${query}`);
}

refs.search.addEventListener('submit', onFormSubmit);

function onFormSubmit(event) {
  event.preventDefault();
  currentPage = 1;
  refs.gallery.innerHTML = '';
  query = event.target.elements.searchQuery.value;

  getImages(query)
    .then(data => {
      maxPage = Math.ceil(data.data.totalHits / perPage);

      if (!data.data.hits.length) {
        throw new Error(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      renderCards(data.data.hits);

      refs.search.reset();
    })
    .catch(err => {
      Notify.failure(`${err.message}`);
    });
}

function templateCard({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `
      <div class="photo-card">
      <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
      
      <div class="info">
        <p class="info-item">
          <b>Likes: ${likes}</b>
        </p>
        <p class="info-item">
          <b>Views: ${views}</b>
        </p>
        <p class="info-item">
          <b>Comments: ${comments}</b>
        </p>
        <p class="info-item">
          <b>Downloads: ${downloads}</b>
        </p>
      </div>
    </div>`;
}

function renderCards(hits) {
  const markup = hits.map(templateCard).join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function callback(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting && refs.gallery.innerHTML !== '') {
      if (currentPage === maxPage) {
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }
      getImages(query)
        .then(data => {
          if (!data.data.hits) {
            throw new Error(
              'Sorry, there are no images matching your search query. Please try again.'
            );
          }

          renderCards(data.data.hits);
          currentPage += 1;

          // console.log(`${currentPage} of ${maxPage}`);
        })
        .catch(err => {
          Notify.failure(
            `Sorry, there are no images matching your search query. Please try again.`
          );
        });
    }
  });
  lightbox.refresh()
}
const observer = new IntersectionObserver(callback);
observer.observe(refs.observerTarget);
