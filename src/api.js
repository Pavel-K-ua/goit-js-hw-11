import axios from 'axios';

const BASEURL = 'https://pixabay.com/api/';

export const per_page = 40;
// let page = 1

export async function getImages(query, page) {
  const params = new URLSearchParams({
    key: '39023312-2f71f46960a1d00fee06a2093',
    per_page,
    page,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  });
  
  page += 1;

  try {

    const response = await axios.get(`${BASEURL}?${params}&q=${query}`);
    // console.log(response);
    // console.log(`${BASEURL}?${params}&q=${query}`);
    return response;
  } catch (error) {
    console.log(error);
  }
}

export function templateCard({
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
