// Здесь «живое» поведение сайта: меню-бургер, блоки из файлов данных и фильтр щенков.
// Данные лежат в папке data — их меняют в панели (адрес-сайта/admin/).
// Важно: если открыть index.html двойным щелчком, браузер не даст прочитать файлы данных,
// поэтому блоки видно только на сайте в интернете или на локальном сервере.

// ===== МЕНЮ-БУРГЕР =====
const burger = document.querySelector('.burger');
const nav = document.querySelector('#site-nav');

function setMenuOpen(isOpen) {
  nav.classList.toggle('is-open', isOpen);
  burger.setAttribute('aria-expanded', String(isOpen)); // по этому атрибуту CSS рисует крестик
  burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
}

burger.addEventListener('click', () => {
  setMenuOpen(!nav.classList.contains('is-open'));
});

// После выбора пункта меню закрываем его, чтобы оно не закрывало страницу
nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false));
});

// Клавиша Esc тоже закрывает меню
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenuOpen(false);
});

// ===== ОБЩИЕ ПОМОЩНИКИ =====

// Создаёт элемент с классом и текстом. textContent безопасен:
// даже если в данных окажутся теги, они покажутся как обычный текст
function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

// Фото из панели или заглушка с подписью, если фото ещё нет
function createPhoto(className, image, alt) {
  if (image) {
    const photo = createElement('img', className);
    photo.src = image.replace(/^\//, ''); // убираем «/» в начале, чтобы путь работал в папке сайта
    photo.alt = alt || '';
    photo.loading = 'lazy'; // фото грузится, только когда до него долистали
    return photo;
  }
  const baseClass = className.split(' ')[0];
  return createElement('div', `${className} ${baseClass}--empty`, alt);
}

// Загружает файл из папки data. no-cache: всегда берём свежую версию
function loadData(name) {
  return fetch(`data/${name}.json`, { cache: 'no-cache' }).then((response) => response.json());
}

// ===== КОНТАКТЫ =====
function renderContacts(data) {
  const city = data.city || '';
  // На первом экране — только город, без района (то, что до запятой)
  let heroCity = city.split(',')[0].trim();
  if (heroCity.startsWith('[') && !heroCity.endsWith(']')) heroCity += ']'; // чтобы заглушка «[Город, район]» выглядела аккуратно
  document.querySelector('#hero-city').textContent = heroCity ? ` · ${heroCity}` : '';
  document.querySelector('#contact-city').textContent = city;
  document.querySelector('#footer-socials').textContent = data.socials ? ` · ${data.socials}` : '';

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
const genderNames = { boy: 'Мальчик', girl: 'Девочка' };

function createPuppyCard(puppy) {
  const card = createElement('article', 'puppy');
  card.dataset.gender = puppy.gender; // нужно фильтру: boy или girl
  card.append(createPhoto('puppy__photo', puppy.photo, puppy.photo ? `Щенок вельш-корги ${puppy.name}` : 'Фото щенка'));

  const body = createElement('div', 'puppy__body');

  const top = createElement('div', 'puppy__top');
  top.append(createElement('h3', 'puppy__name', puppy.name));
  if (puppy.price) {
    // ₽ добавляем, только если цена написана цифрами, а не словами («по договорённости»)
    const isNumber = /^[\d\s]+$/.test(puppy.price);
    top.append(createElement('p', 'puppy__price', isNumber ? `${puppy.price} ₽` : puppy.price));
  }

  const facts = createElement('ul', 'puppy__facts');
  [genderNames[puppy.gender], puppy.color, puppy.age].forEach((fact) => {
    if (fact) facts.append(createElement('li', '', fact));
  });

  const button = createElement('a', 'btn btn--outline puppy__btn', 'Подробнее');
  button.href = '#contacts';

  body.append(top, facts);
  if (puppy.status) body.append(createElement('span', 'puppy__status', puppy.status));
  body.append(button);
  card.append(body);
  return card;
}

function renderPuppies(data) {
  const puppies = data.puppies || [];
  if (puppies.length === 0) {
    puppiesMessage.textContent = 'Сейчас свободных щенков нет. Напишите нам — расскажем о следующем помёте.';
    puppiesMessage.hidden = false;
    return;
  }
  puppies.forEach((puppy) => puppiesList.append(createPuppyCard(puppy)));
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
      author,
    );
    list.append(card);
  });
}

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
