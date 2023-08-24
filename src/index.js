import SimpleLightbox from 'simplelightbox';
import '../node_modules/simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix';
import { per_page } from './api.js';
import { getImages } from './api.js';
import { templateCard } from './api.js';
import { page } from './api.js';

const refs = {
  search: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  observerTarget: document.querySelector('.js-observer'),
};

let maxPage = 1;
let query = '';
let currentPage = 1;

const lightbox = new SimpleLightbox('.gallery a');

refs.search.addEventListener('submit', onFormSubmit);

async function onFormSubmit(event) {
  event.preventDefault();
  page = 1;
  refs.gallery.innerHTML = '';
  query = event.target.elements.searchQuery.value;
  if (!query) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    getImages(query)
      .then(data => {
        maxPage = Math.ceil(data.data.totalHits / per_page);
        Notify.success(`You can see ${data.data.totalHits} images`);
        if (!data.data.hits.length) {
          throw new Error();
        }
        renderCards(data.data.hits);
        refs.search.reset();
      })
      .catch(err => {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      });
  }
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
        })
        .catch(err => {
          Notify.failure(
            `Sorry, there are no images matching your search query. Please try again.`
          );
        });
    }
  });
  lightbox.refresh();
}
const observer = new IntersectionObserver(callback);
observer.observe(refs.observerTarget);
