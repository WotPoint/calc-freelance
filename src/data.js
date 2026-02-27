// ─────────────────────────────────────────────────────────────────────────────
// data.js — все данные калькулятора в одном месте.
// Чтобы изменить цены или добавить новый тип — меняй только этот файл.
// ─────────────────────────────────────────────────────────────────────────────

// Типы проектов и их базовые цены (₽)
// basePrice — стартовая стоимость при минимальной сложности
export const PROJECT_TYPES = [
  { id: 'landing', label: 'Сайт / лендинг',        basePrice: 5_000  },
  { id: 'webapp',  label: 'Веб-приложение',          basePrice: 25_000 },
  { id: 'bot',     label: 'Бот (Telegram/Discord)',  basePrice: 10_000 },
];

// Уровни сложности — умножают базовую цену
export const COMPLEXITY_LEVELS = [
  { id: 'simple', label: 'Простой',  multiplier: 1.0 },
  { id: 'medium', label: 'Средний',  multiplier: 2.0 },
  { id: 'hard',   label: 'Сложный',  multiplier: 4.0 },
];

// Срочность — добавляет процент к итоговой цене
// extra: 0 = без наценки, 0.5 = +50%
export const URGENCY_OPTIONS = [
  { id: 'normal', label: 'Обычный срок',  extra: 0   },
  { id: 'urgent', label: 'Срочно (+50%)', extra: 0.5 },
];

// Дополнительные услуги — каждая добавляет процент к цене (после сложности)
// extra: 0.25 = +25%
export const EXTRA_SERVICES = [
  { id: 'design', label: 'Дизайн (макет)',    extra: 0.25 },
  { id: 'seo',    label: 'SEO-оптимизация',   extra: 0.20 },
  { id: 'qa',     label: 'Тестирование / QA', extra: 0.15 },
];
