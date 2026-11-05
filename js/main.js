// Код главной страницы: блоки из файлов данных, фильтр щенков и раскрытие отзывов.
// Меню, помощники и карточка щенка лежат в common.js — он подключается раньше.

// ===== КОРГИ НА ПЕРВОМ ЭКРАНЕ: подпрыгивает по клику =====
const heroCorgi = document.querySelector('.hero__photo');

heroCorgi.addEventListener('click', () => {
  heroCorgi.classList.remove('is-jumping');
  void heroCorgi.offsetWidth; // «перезапуск» анимации, чтобы корги прыгал при каждом клике
  heroCorgi.classList.add('is-jumping');
});

// После появления и после каждого прыжка корги переходит к спокойной анимации с наклоном головы
heroCorgi.addEventListener('animationend', (event) => {
  if (event.animationName === 'corgi-in') heroCorgi.classList.add('is-ready');
  if (event.animationName === 'corgi-jump') heroCorgi.classList.remove('is-jumping');
});

// ===== КОНТАКТЫ =====
function renderContacts(data) {
  document.querySelector('#contact-city').textContent = data.city || '';
  renderFooter(data);

  // Telegram: принимаем «name», «@name» или ссылку https://t.me/name
  const telegram = (data.telegram || '').trim().replace(/^https?:\/\/t\.me\//, '').replace(/^@/, '');
  if (/^[A-Za-z0-9_]{4,32}$/.test(telegram)) {
    const link = document.querySelector('#contact-telegram');
    link.href = `https://t.me/${telegram}`;
    link.hidden = false;
  }

  // Max: принимаем только полную ссылку, которая начинается с https://
  const max = (data.max || '').trim();
  if (max.startsWith('https://')) {
    const link = document.querySelector('#contact-max');
    link.href = max;
    link.hidden = false;
  }

  // Телефон: для ссылки оставляем только цифры и «+», показываем как написано
  const phoneDigits = (data.phone || '').replace(/[^\d+]/g, '');
  if (phoneDigits.length >= 10) {
    const link = document.querySelector('#contact-phone');
    link.href = `tel:${phoneDigits}`;
    document.querySelector('#contact-phone-text').textContent = data.phone.trim();
    link.hidden = false;
  }
}

// ===== ЦИФРЫ =====
function renderStats(data) {
  const list = document.querySelector('#stats-list');
  (data.items || []).forEach((item) => {
    const li = createElement('li', 'stats__item');
    li.append(createElement('strong', 'stats__number', item.number), createElement('span', 'stats__label', item.label));
    list.append(li);
  });
}

// ===== ЩЕНКИ =====
const puppiesList = document.querySelector('#puppies-list');
const puppiesMessage = document.querySelector('#puppies-message');

function renderPuppies(data) {
  const puppies = data.puppies || [];
  if (puppies.length === 0) {
    puppiesMessage.textContent = 'Сейчас свободных щенков нет. Напишите нам — расскажем о следующем помёте.';
    puppiesMessage.hidden = false;
    return;
  }
  puppies.forEach((puppy, index) => puppiesList.append(createPuppyCard(puppy, index)));
}

// ===== РОДИТЕЛИ =====
function renderParents(data) {
  const list = document.querySelector('#parents-list');
  (data.items || []).forEach((parent) => {
    const card = createElement('article', 'parent');
    const info = createElement('div', 'parent__info');
    info.append(
      createElement('p', 'parent__role', parent.role),
      createElement('h3', 'parent__name', parent.name),
      createElement('p', 'parent__details', parent.details),
    );
    card.append(createPhoto('parent__photo', parent.photo, parent.photo ? `Вельш-корги ${parent.name}` : 'Фото'), info);
    list.append(card);
  });
}

// ===== О ПИТОМНИКЕ =====
function renderAbout(data) {
  if (data.title) document.querySelector('#about-title').textContent = data.title;
  document.querySelector('#about-text').textContent = data.text || '';

  const points = document.querySelector('#about-points');
  (data.points || []).forEach((point) => points.append(createElement('li', '', point)));

  // Первое фото высокое, на две строки
  const photos = document.querySelector('#about-photos');
  (data.photos || []).slice(0, 3).forEach((photo, index) => {
    const className = index === 0 ? 'about__photo about__photo--tall' : 'about__photo';
    photos.append(createPhoto(className, photo.image, photo.alt));
  });
}

// ===== ГАЛЕРЕЯ =====
function renderGallery(data) {
  const list = document.querySelector('#gallery-list');
  (data.photos || []).slice(0, 5).forEach((photo, index) => {
    const className = index === 0 ? 'gallery__photo gallery__photo--big' : 'gallery__photo';
    list.append(createPhoto(className, photo.image, photo.alt));
  });
}

// ===== ОТЗЫВЫ =====
function renderReviews(data) {
  const list = document.querySelector('#reviews-list');
  (data.items || []).forEach((review) => {
    const card = createElement('article', 'review');
    const author = createElement('div', 'review__author');
    author.append(createElement('p', 'review__name', review.name), createElement('p', 'review__place', review.place));
    card.append(
      createPhoto('review__photo', review.photo, review.photo ? `Корги ${review.place || ''} в новой семье` : 'Корги в новой семье'),
      createElement('p', 'review__text', review.text),
      createReadMoreButton(card),
      author,
    );
    list.append(card);
  });
  updateReadMoreButtons();
}

// Кнопка «Читать полностью» раскрывает и сворачивает длинный отзыв
function createReadMoreButton(card) {
  const button = createElement('button', 'review__more', 'Читать полностью');
  button.type = 'button';
  button.hidden = true; // покажем, только если текст правда не поместился
  button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', () => {
    const isExpanded = card.classList.toggle('is-expanded');
    button.textContent = isExpanded ? 'Свернуть' : 'Читать полностью';
    button.setAttribute('aria-expanded', String(isExpanded));
  });
  return button;
}

// Короткому отзыву кнопка не нужна: сравниваем полную высоту текста с видимой
function updateReadMoreButtons() {
  document.querySelectorAll('.review:not(.is-expanded)').forEach((card) => {
    const text = card.querySelector('.review__text');
    card.querySelector('.review__more').hidden = text.scrollHeight <= text.clientHeight + 1;
  });
}

// Пересчитываем, когда загрузились шрифты и когда меняется ширина окна (например, поворот телефона)
document.fonts.ready.then(updateReadMoreButtons);
window.addEventListener('resize', updateReadMoreButtons);

// ===== FAQ =====
function renderFaq(data) {
  const list = document.querySelector('#faq-list');
  (data.items || []).forEach((item) => {
    const details = createElement('details', 'question');
    const summary = createElement('summary', '', `${item.question} `);
    const icon = createElement('span', 'question__icon', '+');
    icon.setAttribute('aria-hidden', 'true');
    summary.append(icon);
    details.append(summary, createElement('p', 'question__answer', item.answer));
    list.append(details);
  });
}

// ===== ЗАГРУЗКА ВСЕХ БЛОКОВ =====
// Каждый блок грузится отдельно: если один файл сломается, остальные блоки всё равно покажутся
const blocks = {
  contacts: renderContacts,
  stats: renderStats,
  puppies: renderPuppies,
  parents: renderParents,
  about: renderAbout,
  gallery: renderGallery,
  reviews: renderReviews,
  faq: renderFaq,
};

Object.entries(blocks).forEach(([name, render]) => {
  loadData(name)
    .then(render)
    .catch(() => {
      if (name === 'puppies') {
        puppiesMessage.textContent = 'Не получилось загрузить список щенков. Обновите страницу или напишите нам.';
        puppiesMessage.hidden = false;
      }
    });
});

// ===== ФИЛЬТР ЩЕНКОВ =====
const filterButtons = document.querySelectorAll('.chip[data-filter]');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter; // all, boy или girl

    // Подсвечиваем нажатую кнопку, с остальных подсветку снимаем
    filterButtons.forEach((other) => {
      other.classList.toggle('is-active', other === button);
      other.setAttribute('aria-pressed', String(other === button));
    });

    // Карточки ищем в момент клика: они появляются после загрузки данных
    puppiesList.querySelectorAll('.puppy').forEach((card) => {
      card.hidden = filter !== 'all' && card.dataset.gender !== filter;
    });
  });
});
