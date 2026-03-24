export function stripTime(d) {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd;
}

export function sameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function buildCalendar(viewDate) {
  const base = stripTime(viewDate || new Date());
  const year = base.getFullYear();
  const month = base.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  const startWeekday = start.getDay();
  const totalDays = end.getDate();

  const monthLabel = base.toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const days = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    days.push({
      date,
      isToday: sameDay(date, new Date()),
      isCurrentMonth: true,
    });
  }
  while (days.length % 7 !== 0) days.push(null);

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return { monthLabel, weeks };
}

export function parseDateInput(raw) {
  const value = String(raw || '').trim();
  if (!value) return undefined;

  let match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    match = value.match(/^(\d{4})(\d{2})(\d{2})$/);
  }
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;

  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return undefined;
  }

  return stripTime(parsed);
}

export function formatDate(d) {
  const date = stripTime(d);
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
