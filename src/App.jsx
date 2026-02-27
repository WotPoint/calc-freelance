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
function calculatePrice(projectId, complexityId, urgencyId, selectedExtras) {
  // .find() ищет в массиве первый элемент, у которого поле id совпадает с аргументом
  const project    = PROJECT_TYPES.find(p => p.id === projectId);
  const complexity = COMPLEXITY_LEVELS.find(c => c.id === complexityId);
  const urgency    = URGENCY_OPTIONS.find(u => u.id === urgencyId);

  // Шаг 1
  let price = project.basePrice * complexity.multiplier;

  // Шаг 2: суммируем проценты всех выбранных доп. услуг
  let totalExtrasPercent = 0;
  for (const extraId of selectedExtras) {
    const service = EXTRA_SERVICES.find(s => s.id === extraId);
    totalExtrasPercent += service.extra;
  }
  price = price * (1 + totalExtrasPercent);

  // Шаг 3
  price = price * (1 + urgency.extra);

  return Math.round(price); // убираем копейки
}

// =============================================================================
// ФУНКЦИЯ ФОРМИРОВАНИЯ ССЫЛКИ ДЛЯ ЗАКАЗА
//
// Собирает ссылку вида: mailto:email@example.com?subject=...&body=...
// При клике браузер откроет почтовый клиент с заполненным письмом.
// =============================================================================
function buildOrderLink(projectId, complexityId, urgencyId, selectedExtras, totalPrice) {
  const project    = PROJECT_TYPES.find(p => p.id === projectId);
  const complexity = COMPLEXITY_LEVELS.find(c => c.id === complexityId);
  const urgency    = URGENCY_OPTIONS.find(u => u.id === urgencyId);

  // Собираем названия доп. услуг через запятую, или 'нет' если ни одна не выбрана
  const extraNames = selectedExtras.length > 0
    ? selectedExtras.map(id => EXTRA_SERVICES.find(s => s.id === id).label).join(', ')
    : 'нет';

  // Текст письма — многострочная строка через шаблонный литерал (backtick ``)
  const emailText =
    `Тип проекта: ${project.label}\n` +
    `Сложность: ${complexity.label} (${complexity.description})\n` +
    `Срочность: ${urgency.label}\n` +
    `Доп. услуги: ${extraNames}\n\n` +
    `Примерная стоимость: ${totalPrice.toLocaleString('ru-RU')} ₽\n\n` +
    `---\nРасскажите подробнее о вашем проекте:`;

  // encodeURIComponent — кодирует спецсимволы (пробелы, кирилицу и т.д.)
  // чтобы они корректно передались в URL
  const subject = encodeURIComponent(`Заявка: ${project.label}`);
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

  // Добавляет или убирает услугу из массива extras при клике на чекбокс
  function toggleExtra(serviceId) {
    // setExtras принимает функцию: React передаёт в неё актуальный массив,
    // мы возвращаем новый — React обновляет состояние и перерисовывает страницу
    setExtras(function(currentExtras) {
      const isAlreadySelected = currentExtras.includes(serviceId);

      if (isAlreadySelected) {
        // Убираем: оставляем все элементы, кроме нажатого
        return currentExtras.filter(id => id !== serviceId);
      } else {
        // Добавляем: [...массив] — создаёт копию, затем добавляем новый id
        return [...currentExtras, serviceId];
      }
    });
  }

  // Считаем цену и ссылку при каждой перерисовке (мгновенно, данных мало)
  const totalPrice = calculatePrice(projectType, complexity, urgency, extras);
  const orderLink  = buildOrderLink(projectType, complexity, urgency, extras, totalPrice);

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

        {/* Шаг 1: Тип проекта
            .map() — проходит по массиву и для каждого элемента рисует кнопку.
            key — обязательный атрибут, React использует его для отслеживания элементов. */}
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

        {/* Шаг 4: Дополнительные услуги (чекбоксы)
            <label> оборачивает <input type="checkbox"> — клик по всему блоку
            переключает чекбокс, не только по самому квадратику. */}
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
          {/* toLocaleString('ru-RU') форматирует число: 25000 → "25 000" */}
          <span className="result-price">{totalPrice.toLocaleString('ru-RU')} ₽</span>
        </div>

        {/* <a href="mailto:..."> открывает почтовый клиент.
            Email и текст письма формирует buildOrderLink() выше. */}
        <a href={orderLink} className="order-btn">
          Оформить заказ
        </a>
      </div>

    </div>
  );
}
