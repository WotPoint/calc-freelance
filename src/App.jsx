import { useState } from 'react';
import { PROJECT_TYPES, COMPLEXITY_LEVELS, URGENCY_OPTIONS, EXTRA_SERVICES } from './data';
import './App.css';

// ─────────────────────────────────────────────────────────────────────────────
// Функция расчёта итоговой цены (вынесена отдельно — легко тестировать)
//
// Формула:
//   1. base = basePrice × complexityMultiplier
//   2. base = base × (1 + сумма процентов доп. услуг)
//   3. итог = base × (1 + процент срочности)
// ─────────────────────────────────────────────────────────────────────────────
function calculatePrice(projectId, complexityId, urgencyId, selectedExtras) {
  const project    = PROJECT_TYPES.find(p => p.id === projectId);
  const complexity = COMPLEXITY_LEVELS.find(c => c.id === complexityId);
  const urgency    = URGENCY_OPTIONS.find(u => u.id === urgencyId);

  // Шаг 1: базовая цена × сложность
  let price = project.basePrice * complexity.multiplier;

  // Шаг 2: суммируем проценты выбранных доп. услуг и применяем их разом
  const extrasPercent = selectedExtras.reduce((sum, extraId) => {
    const service = EXTRA_SERVICES.find(s => s.id === extraId);
    return sum + service.extra;
  }, 0);
  price = price * (1 + extrasPercent);

  // Шаг 3: наценка за срочность
  price = price * (1 + urgency.extra);

  return Math.round(price);
}

// ─────────────────────────────────────────────────────────────────────────────
// Главный компонент — весь интерфейс калькулятора
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  // useState хранит текущий выбор пользователя.
  // Начальные значения — первые элементы из массивов data.js
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0].id);
  const [complexity,  setComplexity]  = useState(COMPLEXITY_LEVELS[0].id);
  const [urgency,     setUrgency]     = useState(URGENCY_OPTIONS[0].id);
  const [extras,      setExtras]      = useState([]); // массив id выбранных услуг

  // Переключаем доп. услугу: если уже выбрана — убираем, иначе — добавляем
  function toggleExtra(id) {
    setExtras(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  }

  // Считаем цену при каждом рендере (мгновенно, данных мало)
  const totalPrice = calculatePrice(projectType, complexity, urgency, extras);

  return (
    <div className="calculator">

      {/* ── Заголовок ─────────────────────────────────────────────────── */}
      <header className="header">
        <h1>Калькулятор стоимости</h1>
        <p>Выберите параметры — цена обновится автоматически</p>
      </header>

      <div className="sections">

        {/* ── Шаг 1: Тип проекта ───────────────────────────────────────── */}
        <section className="section">
          <h2 className="section-title">1. Тип проекта</h2>
          <div className="cards">
            {PROJECT_TYPES.map(type => (
              <button
                key={type.id}
                className={`card ${projectType === type.id ? 'card--selected' : ''}`}
                onClick={() => setProjectType(type.id)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Шаг 2: Сложность ─────────────────────────────────────────── */}
        <section className="section">
          <h2 className="section-title">2. Сложность</h2>
          <div className="cards">
            {COMPLEXITY_LEVELS.map(level => (
              <button
                key={level.id}
                className={`card ${complexity === level.id ? 'card--selected' : ''}`}
                onClick={() => setComplexity(level.id)}
              >
                {level.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Шаг 3: Срочность ─────────────────────────────────────────── */}
        <section className="section">
          <h2 className="section-title">3. Срочность</h2>
          <div className="cards">
            {URGENCY_OPTIONS.map(option => (
              <button
                key={option.id}
                className={`card ${urgency === option.id ? 'card--selected' : ''}`}
                onClick={() => setUrgency(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Шаг 4: Дополнительные услуги ─────────────────────────────── */}
        <section className="section">
          <h2 className="section-title">4. Дополнительные услуги</h2>
          <div className="extras">
            {EXTRA_SERVICES.map(service => (
              <label
                key={service.id}
                className={`extra-item ${extras.includes(service.id) ? 'extra-item--checked' : ''}`}
              >
                {/* Стандартный checkbox — доступность из коробки */}
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

      {/* ── Итоговая цена ────────────────────────────────────────────────── */}
      {/* toLocaleString('ru-RU') форматирует число: 25000 → 25 000 */}
      <div className="result">
        <span className="result-label">Итоговая стоимость:</span>
        <span className="result-price">{totalPrice.toLocaleString('ru-RU')} ₽</span>
      </div>

    </div>
  );
}
