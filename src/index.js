import axios, { formToJSON } from 'axios';
import Notiflix, { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};

refs.loadMore.style.display = 'none';
let page = 1;
let isVisible = 0;

const LoadMore = () => {
  page += 1;
  const name = refs.form.querySelector('input').value.trim();
  pixAPI(name, page);
  refs.loadMore.style.display = 'flex';
};
refs.loadMore.addEventListener('click', LoadMore);

const search = e => {
  e.preventDefault();
  isVisible = 0;
  refs.gallery.innerHTML = '';

  const name = refs.form.querySelector('input').value.trim();

  if (name !== '') {
    pixAPI(name);
  } else {
    refs.loadMore.style.display = 'none';
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
};
refs.form.addEventListener('submit', search);

const pixAPI = async (name, page) => {
  const BASE_URL = 'https://pixabay.com/api/';

  const options = {
    params: {
      key: '34923482-2fb4ccc15af9a628627f7d6c1',
      q: name,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: page,
      per_page: 40,
    },
  };

  try {
    const response = await axios.get(BASE_URL, options);
    isVisible += response.data.hits.length;

    message(
      response.data.hits.length,
      isVisible,
      options.params.per_page,
      response.data.total
    );

    createMarkup(response.data);
  } catch (error) {
    console.log(error);
  }
};

const simpleLightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const createMarkup = arr => {
  const markup = arr.hits
    .map(
      item =>
        `<a class="photo-link" href="${item.largeImageURL}">
            <div class="photo-card">
            <div class="photo">
            <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy"/>
            </div>
                    <div class="info">
                        <p class="info-item">
                            <b>Likes</b>
                            ${item.likes}
                        </p>
                        <p class="info-item">
                            <b>Views</b>
                            ${item.views}
                        </p>
                        <p class="info-item">
                            <b>Comments</b>
                            ${item.comments}
                        </p>
                        <p class="info-item">
                            <b>Downloads</b>
                            ${item.downloads}
                        </p>
                    </div>
            </div>
        </a>`
    )
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  simpleLightBox.refresh();
};

const message = (length, isVisible, per_page, total) => {
  if (!length) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  if (length >= isVisible) {
    refs.loadMore.style.display = 'flex';
    Notify.info(`Hooray! We found ${total} images.`);
  }
  if (isVisible >= total) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    refs.loadMore.style.display = 'none';
  }
};
