import { useState } from 'react';
import {
  PROJECT_TYPES,
  COMPLEXITY_LEVELS,
  URGENCY_OPTIONS,
  EXTRA_SERVICES,
  CONTACT_EMAIL,
} from './data';
import './App.css';

// =============================================================================
// ФУНКЦИЯ РАСЧЁТА ЦЕНЫ
//
// Принимает id выбранных параметров, возвращает итоговую цену в рублях.
//
// Формула (три шага):
//   Шаг 1: базовая цена × коэффициент сложности
//           Пример: 5 000 ₽ × 2 = 10 000 ₽
//
//   Шаг 2: прибавляем доп. услуги (каждая — процент от текущей цены)
//           Пример: 10 000 ₽ + 25% (дизайн) + 20% (SEO) = 14 500 ₽
//
//   Шаг 3: прибавляем наценку за срочность
//           Пример: 14 500 ₽ × 1.5 (срочно) = 21 750 ₽
// =============================================================================
// Вспомогательная функция: ищет элемент по id в массиве
// Если не нашла — бросает понятную ошибку вместо молчаливого краша
function lookupById(collection, id, label) {
  const item = collection.find(el => el.id === id);
  if (!item) throw new Error(`Unknown ${label} id: ${id}`);
  return item;
}

// Вспомогательная функция: считает суммарный процент всех выбранных доп. услуг
// Например: SEO (0.2) + копирайтинг (0.15) → вернёт 0.35
function calcExtrasPercent(selectedExtras) {
  // Защита: если передали не массив (null, undefined и т.д.) — возвращаем 0
  if (!Array.isArray(selectedExtras)) return 0;

  let total = 0;
  for (const extraId of selectedExtras) {
    // Находим услугу по id и берём её процент
    const service = lookupById(EXTRA_SERVICES, extraId, 'extra service');
    total += service.extra;
  }
  return total;
}

function calculatePrice(projectId, complexityId, urgencyId, selectedExtras) {
  // Находим полные объекты по переданным id
  // Если какой-то id не существует — lookupById бросит ошибку
  const project    = lookupById(PROJECT_TYPES,     projectId,    'project');
  const complexity = lookupById(COMPLEXITY_LEVELS, complexityId, 'complexity');
  const urgency    = lookupById(URGENCY_OPTIONS,    urgencyId,    'urgency');

  // Шаг 1: базовая цена проекта × коэффициент сложности
  // Например: 10 000 × 1.5 = 15 000
  const priceAfterComplexity = project.basePrice * complexity.multiplier;

  // Шаг 2: увеличиваем цену на суммарный процент доп. услуг
  // Например: 15 000 × (1 + 0.35) = 20 250
  const extrasPercent    = calcExtrasPercent(selectedExtras);
  const priceAfterExtras = priceAfterComplexity * (1 + extrasPercent);

  // Шаг 3: увеличиваем цену на процент срочности
  // Например: 20 250 × (1 + 0.5) = 30 375
  const finalPrice = priceAfterExtras * (1 + urgency.extra);

  // Убираем копейки — пользователь видит целое число
  return Math.round(finalPrice);
}

// =============================================================================
// ФУНКЦИЯ ФОРМИРОВАНИЯ ССЫЛКИ ДЛЯ ЗАКАЗА
//
// Теперь принимает также данные из формы: имя, телефон, почта, удобное время.
// Собирает ссылку вида: mailto:email@example.com?subject=...&body=...
// При клике браузер откроет почтовый клиент с заполненным письмом.
// =============================================================================
function buildOrderLink(projectId, complexityId, urgencyId, selectedExtras, totalPrice, contactInfo) {
  const project    = PROJECT_TYPES.find(p => p.id === projectId);
  const complexity = COMPLEXITY_LEVELS.find(c => c.id === complexityId);
  const urgency    = URGENCY_OPTIONS.find(u => u.id === urgencyId);

  // Собираем названия доп. услуг через запятую, или 'нет' если ни одна не выбрана
  const extraNames = selectedExtras.length > 0
    ? selectedExtras.map(id => EXTRA_SERVICES.find(s => s.id === id).label).join(', ')
    : 'нет';

  // Текст письма: сначала данные клиента, потом параметры заказа
  const emailText =
    `Имя: ${contactInfo.name}\n` +
    `Телефон: ${contactInfo.phone}\n` +
    `Email: ${contactInfo.email}\n` +
    `Удобное время для связи: ${contactInfo.time}\n\n` +
    `--- Параметры проекта ---\n` +
    `Тип проекта: ${project.label}\n` +
    `Сложность: ${complexity.label} (${complexity.description})\n` +
    `Срочность: ${urgency.label}\n` +
    `Доп. услуги: ${extraNames}\n\n` +
    `Примерная стоимость: ${totalPrice.toLocaleString('ru-RU')} ₽\n\n` +
    `---\nРасскажите подробнее о вашем проекте:`;

  // encodeURIComponent — кодирует спецсимволы (пробелы, кирилицу и т.д.)
  // чтобы они корректно передались в URL
  const subject = encodeURIComponent(`Заявка: ${project.label} от ${contactInfo.name}`);
  const body    = encodeURIComponent(emailText);

  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

// =============================================================================
// ГЛАВНЫЙ КОМПОНЕНТ — App
//
// В React компонент — это функция, которая возвращает JSX (HTML-подобный синтаксис).
// useState — хук, который хранит данные между перерисовками.
//   const [значение, изменитель] = useState(начальноеЗначение)
//   Когда вызываем изменитель — React перерисовывает компонент с новым значением.
// =============================================================================
export default function App() {
  // Храним id выбранного варианта для каждого параметра.
  // Начальное значение — id первого элемента из массива в data.js.
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0].id);
  const [complexity,  setComplexity]  = useState(COMPLEXITY_LEVELS[0].id);
  const [urgency,     setUrgency]     = useState(URGENCY_OPTIONS[0].id);

  // extras — массив id выбранных доп. услуг. Начально пуст: []
  const [extras, setExtras] = useState([]);

  // showModal — открыто ли модальное окно (true/false)
  const [showModal, setShowModal] = useState(false);

  // Данные формы обратной связи: имя, телефон, почта, удобное время
  const [contactInfo, setContactInfo] = useState({
    name:  '',
    phone: '',
    email: '',
    time:  '',
  });

  // Добавляет или убирает услугу из массива extras при клике на чекбокс
  function toggleExtra(serviceId) {
    setExtras(function(currentExtras) {
      const isAlreadySelected = currentExtras.includes(serviceId);
      if (isAlreadySelected) {
        return currentExtras.filter(id => id !== serviceId);
      } else {
        return [...currentExtras, serviceId];
      }
    });
  }

  // Обновляет одно поле формы, не трогая остальные.
  // event.target.name — атрибут name у <input>, event.target.value — введённое значение.
  // Запись { ...contactInfo, [fieldName]: newValue } — копирует объект и меняет одно поле.
  function handleFieldChange(event) {
    const fieldName = event.target.name;
    const newValue  = event.target.value;
    setContactInfo({ ...contactInfo, [fieldName]: newValue });
  }

  // Вызывается при нажатии "Отправить" в модальном окне.
  // Формирует mailto-ссылку и программно "кликает" по ней — браузер откроет почту.
  function handleSubmit(event) {
    // Отменяем стандартное поведение формы (перезагрузку страницы)
    event.preventDefault();

    const link = buildOrderLink(projectType, complexity, urgency, extras, totalPrice, contactInfo);

    // Создаём невидимую ссылку, кликаем по ней, удаляем — стандартный способ открыть mailto из JS
    const a = document.createElement('a');
    a.href = link;
    a.click();

    // Закрываем модальное окно и очищаем форму
    setShowModal(false);
    setContactInfo({ name: '', phone: '', email: '', time: '' });
  }

  // Считаем цену при каждой перерисовке (мгновенно, данных мало)
  const totalPrice = calculatePrice(projectType, complexity, urgency, extras);

  // JSX: выглядит как HTML, но это JavaScript.
  // Фигурные скобки {} — "вставить значение JS-переменной или выражения"
  return (
    <div className="calculator">

      {/* Заголовок */}
      <header className="header">
        <h1>Калькулятор стоимости</h1>
        <p>Выберите параметры — цена обновится автоматически</p>
      </header>

      <div className="sections">

        {/* Шаг 1: Тип проекта */}
        <section className="section">
          <h2 className="section-title">1. Тип проекта</h2>
          <div className="cards">
            {PROJECT_TYPES.map(type => (
              <button
                key={type.id}
                className={`card ${projectType === type.id ? 'card--selected' : ''}`}
                onClick={() => setProjectType(type.id)}
              >
                <span className="card-label">{type.label}</span>
                <span className="card-desc">{type.description}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Шаг 2: Сложность */}
        <section className="section">
          <h2 className="section-title">2. Сложность</h2>
          <div className="cards">
            {COMPLEXITY_LEVELS.map(level => (
              <button
                key={level.id}
                className={`card ${complexity === level.id ? 'card--selected' : ''}`}
                onClick={() => setComplexity(level.id)}
              >
                <span className="card-label">{level.label}</span>
                <span className="card-desc">{level.description}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Шаг 3: Срочность */}
        <section className="section">
          <h2 className="section-title">3. Срочность</h2>
          <div className="cards">
            {URGENCY_OPTIONS.map(option => (
              <button
                key={option.id}
                className={`card ${urgency === option.id ? 'card--selected' : ''}`}
                onClick={() => setUrgency(option.id)}
              >
                <span className="card-label">{option.label}</span>
                <span className="card-desc">{option.description}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Шаг 4: Дополнительные услуги (чекбоксы) */}
        <section className="section">
          <h2 className="section-title">4. Дополнительно</h2>
          <div className="extras">
            {EXTRA_SERVICES.map(service => (
              <label
                key={service.id}
                className={`extra-item ${extras.includes(service.id) ? 'extra-item--checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={extras.includes(service.id)}
                  onChange={() => toggleExtra(service.id)}
                />
                <span className="extra-label">{service.label}</span>
                <span className="extra-percent">+{service.extra * 100}%</span>
              </label>
            ))}
          </div>
        </section>

      </div>

      {/* Итоговая цена + кнопка заказа */}
      <div className="result">
        <div className="result-price-block">
          <span className="result-label">Примерная стоимость</span>
          <span className="result-price">{totalPrice.toLocaleString('ru-RU')} ₽</span>
        </div>

        {/* Кнопка открывает модальное окно вместо прямой ссылки */}
        <button className="order-btn" onClick={() => setShowModal(true)}>
          Оформить заказ
        </button>
      </div>

      {/* =================================================================
          МОДАЛЬНОЕ ОКНО
          Показываем только если showModal === true.
          Конструкция: {условие && <JSX>} — рендерит JSX только когда условие истинно.
          ================================================================= */}
      {showModal && (
        // Затемнённый фон (overlay). Клик по нему закрывает окно.
        <div className="modal-overlay" onClick={() => setShowModal(false)}>

          {/* Само окно. event.stopPropagation() — чтобы клик внутри окна
              не всплывал до overlay и не закрывал его. */}
          <div className="modal" onClick={event => event.stopPropagation()}>

            <div className="modal-header">
              <h2 className="modal-title">Оформление заказа</h2>
              {/* Крестик закрытия */}
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <p className="modal-subtitle">
              Укажите контактные данные — мы свяжемся с вами для уточнения деталей
            </p>

            {/* Форма. onSubmit вызовет handleSubmit при нажатии кнопки "Отправить". */}
            <form className="modal-form" onSubmit={handleSubmit}>

              {/* Поле "Имя" */}
              <div className="form-field">
                <label className="form-label" htmlFor="name">Имя *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="Как к вам обращаться?"
                  value={contactInfo.name}
                  onChange={handleFieldChange}
                  required  // браузер не отправит форму, если поле пустое
                />
              </div>

              {/* Поле "Телефон" */}
              <div className="form-field">
                <label className="form-label" htmlFor="phone">Телефон *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form-input"
                  placeholder="+7 (___) ___-__-__"
                  value={contactInfo.phone}
                  onChange={handleFieldChange}
                  required
                />
              </div>

              {/* Поле "Email" */}
              <div className="form-field">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="example@mail.ru"
                  value={contactInfo.email}
                  onChange={handleFieldChange}
                />
              </div>

              {/* Поле "Удобное время" */}
              <div className="form-field">
                <label className="form-label" htmlFor="time">Удобное время для связи</label>
                <input
                  id="time"
                  name="time"
                  type="text"
                  className="form-input"
                  placeholder="Например: будни с 10 до 18"
                  value={contactInfo.time}
                  onChange={handleFieldChange}
                />
              </div>

              {/* Итоговая цена внутри модального окна — для напоминания */}
              <div className="modal-price">
                <span>Итого:</span>
                <span className="modal-price-value">{totalPrice.toLocaleString('ru-RU')} ₽</span>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Отмена
                </button>
                <button type="submit" className="btn-submit">
                  Отправить заявку
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
