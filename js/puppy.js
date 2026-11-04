// Код страницы щенка (puppy.html). Меню, помощники и карточка щенка лежат в common.js.
// Номер щенка берём из адреса: puppy.html?n=0 — первый щенок в data/puppies.json

const puppyNumber = Number(new URLSearchParams(location.search).get('n'));

function showMessage(text) {
  const message = document.querySelector('#puppy-message');
  message.textContent = text;
  message.hidden = false;
}

// Показывает текст в элементе, а если текста нет — прячет элемент
function fillOrHide(selector, text) {
  const element = document.querySelector(selector);
  element.textContent = text || '';
  element.hidden = !text;
}

// ===== ФОТО: большое и миниатюры =====
function renderGallery(puppy) {
  const main = document.querySelector('#puppy-main-photo');
  const thumbs = document.querySelector('#puppy-thumbs');
  const photos = [puppy.photo, ...(puppy.photos || []).map((item) => item.image)].filter(Boolean);
  const alt = `Щенок вельш-корги ${puppy.name}`;

  function showPhoto(image) {
    main.replaceChildren(createPhoto('puppy-gallery__photo', image, 'Фото щенка'));
    const big = main.querySelector('img');
    if (big) {
      big.alt = alt;
      big.loading = 'eager'; // главное фото нужно сразу, не ждём прокрутки
    }
    thumbs.querySelectorAll('.puppy-gallery__thumb').forEach((thumb) => {
      thumb.classList.toggle('is-active', thumb.dataset.image === image);
    });
  }

  // Миниатюры показываем, только если фото больше одного
  if (photos.length > 1) {
    photos.forEach((image, index) => {
      const thumb = createElement('button', 'puppy-gallery__thumb');
      thumb.type = 'button';
      thumb.dataset.image = image;
      thumb.setAttribute('aria-label', `Показать фото ${index + 1}`);
      thumb.append(createPhoto('puppy-gallery__thumb-img', image, ''));
      thumb.addEventListener('click', () => showPhoto(image));
      thumbs.append(thumb);
    });
  }

  // Видео: ссылка на ролик (например, VK или Rutube) открывается в новой вкладке
  const video = (puppy.video || '').trim();
  if (video.startsWith('https://')) {
    const link = createElement('a', 'puppy-gallery__thumb puppy-gallery__thumb--video', 'Видео ▶');
    link.href = video;
    link.target = '_blank';
    link.rel = 'noopener';
    thumbs.append(link);
  }

  showPhoto(photos[0] || '');
}

// ===== ХАРАКТЕРИСТИКИ =====
function renderSpecs(puppy) {
  const specs = document.querySelector('#puppy-specs');
  [
    ['Пол', genderNames[puppy.gender]],
    ['Дата рождения', puppy.birth],
    ['Возраст', puppy.age],
    ['Окрас', puppy.color],
    ['Класс', puppy.class],
    ['Документы', puppy.documents],
  ].forEach(([label, value]) => {
    if (!value) return; // пустые строки не показываем
    const row = createElement('div', 'puppy-info__row');
    row.append(createElement('dt', '', label), createElement('dd', '', value));
    specs.append(row);
  });
}

// ===== РОДИТЕЛИ — те же, что на главной =====
function renderParents(data) {
  const list = document.querySelector('#puppy-parents');
  (data.items || []).forEach((parent) => {
    const card = createElement('article', 'parent');
    const info = createElement('div', 'parent__info');
    const more = createElement('a', 'parent__more', 'Подробнее →');
    more.href = 'index.html#parents';
    info.append(
      createElement('p', 'parent__role', parent.role),
      createElement('h3', 'parent__name', parent.name),
      more,
    );
    card.append(createPhoto('parent__photo', parent.photo, parent.photo ? `Вельш-корги ${parent.name}` : 'Фото'), info);
    list.append(card);
  });
}

// ===== ДРУГИЕ ЩЕНКИ: до трёх, кроме текущего =====
function renderOthers(puppies) {
  const others = puppies
    .map((puppy, index) => ({ puppy, index }))
    .filter(({ index }) => index !== puppyNumber)
    .slice(0, 3);
  if (others.length === 0) return;
  const list = document.querySelector('#puppy-others');
  others.forEach(({ puppy, index }) => list.append(createPuppyCard(puppy, index)));
  document.querySelector('#puppy-others-block').hidden = false;
}

// ===== ЗАГРУЗКА =====
loadData('puppies')
  .then((data) => {
    const puppies = data.puppies || [];
    const puppy = puppies[puppyNumber];
    if (!Number.isInteger(puppyNumber) || !puppy) {
      showMessage('Такого щенка нет на сайте — возможно, он уже нашёл семью. Посмотрите других щенков на главной.');
      return;
    }

    document.title = `${puppy.name} — щенок вельш-корги — Royal Fox Smile`;
    document.querySelector('#crumb-name').textContent = puppy.name;
    fillOrHide('#puppy-status', puppy.status);
    document.querySelector('#puppy-name').textContent = puppy.name;
    fillOrHide('#puppy-price', puppy.price ? formatPrice(puppy.price) : '');
    fillOrHide('#puppy-booking', puppy.booking);
    document.querySelector('#puppy-about').textContent = puppy.about || '';
    document.querySelector('#puppy-about-block').hidden = !puppy.about;

    renderGallery(puppy);
    renderSpecs(puppy);
    renderOthers(puppies);
    document.querySelector('#puppy-content').hidden = false;
  })
  .catch(() => showMessage('Не получилось загрузить данные щенка. Обновите страницу или напишите нам.'));

loadData('parents').then(renderParents).catch(() => {});
loadData('contacts').then(renderFooter).catch(() => {});
