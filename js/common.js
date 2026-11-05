// Общий код для всех страниц сайта: меню-бургер, помощники и карточка щенка.
// Подключается раньше скрипта самой страницы (main.js или puppy.js).
// Данные лежат в папке data — их меняют в панели (адрес-сайта/admin/).
// Важно: если открыть страницу двойным щелчком, браузер не даст прочитать файлы данных,
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

// ===== ПОМОЩНИКИ =====

// Создаёт элемент с классом и текстом. textContent безопасен:
// даже если в данных окажутся теги, они покажутся как обычный текст
function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

// Путь к фото из панели: убираем «/» в начале, чтобы путь работал в папке сайта
function photoPath(image) {
  return image.replace(/^\//, '');
}

// Фото из панели или заглушка с подписью, если фото ещё нет
function createPhoto(className, image, alt) {
  if (image) {
    const photo = createElement('img', className);
    photo.src = photoPath(image);
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

// ₽ добавляем, только если цена написана цифрами, а не словами («по договорённости»)
function formatPrice(price) {
  return /^[\d\s]+$/.test(price) ? `${price} ₽` : price;
}

// Соцсети в подвале — есть на всех страницах
function renderFooter(contacts) {
  document.querySelector('#footer-socials').textContent = contacts.socials ? ` · ${contacts.socials}` : '';
}

// ===== КАРТОЧКА ЩЕНКА =====
// Используется в списке на главной и в блоке «Другие щенки» на странице щенка.
// index — номер щенка в списке: по нему страница щенка понимает, кого показать
const genderNames = { boy: 'Мальчик', girl: 'Девочка' };

function createPuppyCard(puppy, index) {
  const card = createElement('article', 'puppy');
  card.dataset.gender = puppy.gender; // нужно фильтру: boy или girl
  card.append(createPhoto('puppy__photo', puppy.photo, puppy.photo ? `Щенок вельш-корги ${puppy.name}` : 'Фото щенка'));

  const body = createElement('div', 'puppy__body');

  const top = createElement('div', 'puppy__top');
  top.append(createElement('h3', 'puppy__name', puppy.name));
  if (puppy.price) top.append(createElement('p', 'puppy__price', formatPrice(puppy.price)));

  const facts = createElement('ul', 'puppy__facts');
  [genderNames[puppy.gender], puppy.color, puppy.age].forEach((fact) => {
    if (fact) facts.append(createElement('li', '', fact));
  });

  const button = createElement('a', 'btn btn--outline puppy__btn', 'Подробнее');
  button.href = `puppy.html?n=${index}`;

  body.append(top, facts);
  if (puppy.status) body.append(createElement('span', 'puppy__status', puppy.status));
  body.append(button);
  card.append(body);
  return card;
}

// ===== ФИЛЬТР ЩЕНКОВ: «Все», «Мальчики», «Девочки» =====
// list — блок с карточками, которые нужно прятать и показывать
function setupPuppyFilter(list) {
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
      list.querySelectorAll('.puppy').forEach((card) => {
        card.hidden = filter !== 'all' && card.dataset.gender !== filter;
      });
    });
  });
}
