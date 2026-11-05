// Код страницы «Все щенки» (puppies.html). Меню, карточка щенка и фильтр лежат в common.js.

const puppiesList = document.querySelector('#puppies-list');
const puppiesMessage = document.querySelector('#puppies-message');

loadData('puppies')
  .then((data) => {
    const puppies = data.puppies || [];
    if (puppies.length === 0) {
      puppiesMessage.textContent = 'Сейчас свободных щенков нет. Напишите нам — расскажем о следующем помёте.';
      puppiesMessage.hidden = false;
      return;
    }
    puppies.forEach((puppy, index) => puppiesList.append(createPuppyCard(puppy, index)));
  })
  .catch(() => {
    puppiesMessage.textContent = 'Не получилось загрузить список щенков. Обновите страницу или напишите нам.';
    puppiesMessage.hidden = false;
  });

setupPuppyFilter(puppiesList);
loadData('contacts').then(renderFooter).catch(() => {});
