import axios from 'axios';
// import SimpleLightbox from 'simplelightbox';
// import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

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

  //   console.log(getImages(query));
  getImages(query)
    .then(data => {
      // console.log(data.data.totalHits);
      maxPage = Math.ceil(data.data.totalHits / perPage);
      // console.log(maxPage);
      // console.log(data.data.hits.length);
      if (!data.data.hits.length) {
        throw new Error(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      // page += 1;
      renderCards(data.data.hits);

      // currentPage += 1;
      refs.search.reset();
    })
    .catch(err => {
      // console.log(err.message);
      Notiflix.Notify.failure(`${err.message}`);
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
      <img src="${webformatURL}" alt="${tags}" loading="lazy" />
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
  //   refs.gallery.innerHTML = markup;
  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function callback(entries, observer) {
  entries.forEach(entry => {
    // console.log(entry.isIntersecting);
    // console.log(refs.gallery.innerHTML);
    if (entry.isIntersecting && refs.gallery.innerHTML !== '') {
      // console.log(currentPage);
      // console.log(maxPage);
      if (currentPage === maxPage) {
        Notiflix.Notify.failure(
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
          Notiflix.Notify.failure(
            `Sorry, there are no images matching your search query. Please try again.`
          );
        });
    }
  });
}
const observer = new IntersectionObserver(callback);
observer.observe(refs.observerTarget);
