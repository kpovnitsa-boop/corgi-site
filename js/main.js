// Здесь «живое» поведение сайта. Дальше добавим меню-бургер.

// ===== ЩЕНКИ =====
// Данные щенков лежат в data/puppies.json — их меняют в панели (адрес-сайта/admin/).
// Важно: если открыть index.html двойным щелчком, браузер не даст прочитать файл,
// поэтому щенков видно только на сайте в интернете или на локальном сервере.
const puppiesList = document.querySelector('#puppies-list');
const puppiesMessage = document.querySelector('#puppies-message');
const filterButtons = document.querySelectorAll('.chip[data-filter]');

const genderNames = { boy: 'Мальчик', girl: 'Девочка' };

// Создаёт элемент с классом и текстом. textContent безопасен:
// даже если в данных окажутся теги, они покажутся как обычный текст
function createElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  if (text) element.textContent = text;
  return element;
}

// Собирает одну карточку щенка из его данных
function createPuppyCard(puppy) {
  const card = createElement('article', 'puppy');
  card.dataset.gender = puppy.gender; // нужно фильтру: boy или girl

  if (puppy.photo) {
    const photo = createElement('img', 'puppy__photo');
    photo.src = puppy.photo.replace(/^\//, ''); // убираем «/» в начале, чтобы путь работал в папке сайта
    photo.alt = `Щенок вельш-корги ${puppy.name}`;
    photo.loading = 'lazy'; // фото грузится, только когда до него долистали
    card.append(photo);
  } else {
    card.append(createElement('div', 'puppy__photo puppy__photo--empty', 'Фото щенка'));
  }

  const body = createElement('div', 'puppy__body');

  const top = createElement('div', 'puppy__top');
  top.append(createElement('h3', 'puppy__name', puppy.name));
  if (puppy.price) top.append(createElement('p', 'puppy__price', `${puppy.price} ₽`));

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

function showPuppiesMessage(text) {
  puppiesMessage.textContent = text;
  puppiesMessage.hidden = false;
}

// Загружаем файл с данными и рисуем карточки
fetch('data/puppies.json', { cache: 'no-cache' }) // no-cache: всегда берём свежую версию
  .then((response) => response.json())
  .then((data) => {
    const puppies = data.puppies || [];
    if (puppies.length === 0) {
      showPuppiesMessage('Сейчас свободных щенков нет. Напишите нам — расскажем о следующем помёте.');
      return;
    }
    puppies.forEach((puppy) => puppiesList.append(createPuppyCard(puppy)));
  })
  .catch(() => {
    showPuppiesMessage('Не получилось загрузить список щенков. Обновите страницу или напишите нам.');
  });

// ===== ФИЛЬТР ЩЕНКОВ =====
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
