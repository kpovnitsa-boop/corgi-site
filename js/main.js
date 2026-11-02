// Здесь «живое» поведение сайта. Дальше добавим меню-бургер.

// ===== ФИЛЬТР ЩЕНКОВ =====
// Находим кнопки фильтра и карточки щенков
const filterButtons = document.querySelectorAll('.chip[data-filter]');
const puppyCards = document.querySelectorAll('.puppy');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter; // all, boy или girl

    // Подсвечиваем нажатую кнопку, с остальных подсветку снимаем
    filterButtons.forEach((other) => {
      other.classList.toggle('is-active', other === button);
      other.setAttribute('aria-pressed', String(other === button));
    });

    // Прячем карточки, которые не подходят под выбранный фильтр
    puppyCards.forEach((card) => {
      card.hidden = filter !== 'all' && card.dataset.gender !== filter;
    });
  });
});
