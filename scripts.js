const rawExceptions = [
  "2024-9-6",
  "2024-9-30",
  "2024-12-13",
  "2024-12-18",
  "2025-2-19",
  "2025-2-26",
  "2025-3-5",
  "2025-3-14",
  "2025-3-19",
  "2025-3-26",
  "2025-4-2",
  "2025-4-9",
  "2025-4-16",
  "2025-4-23",
  "2025-4-30",
];
const exceptions = new Set(
  rawExceptions.flatMap((ex) => (Array.isArray(ex) ? ex : [ex]))
);

const weekDays = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const monthWeekDay = {
  "2020-01-01": [4, 2, 2, 4, 2, 2, 4, 2, 2, 4, 2, 2],
  "2025-06-01": [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  "2026-01-01": [[3,4], [3,4], [3,4], [3,4], [3,4], [3,4], [3,4], [3,4], [3,4], [3,4], [3,4], [3,4]],
};

const referenceDay = 2;

function setDay(date) {
  const workDate = getWorkDateOrException(date);
  const isToday = date.toDateString() === workDate.toDateString();
  document.getElementById("day").textContent = isToday
    ? "Hoje"
    : weekDays[workDate.getDay()];
  document.getElementById("date").textContent = `${workDate.getDate()}/${
    workDate.getMonth() + 1
  }/${workDate.getFullYear()}`;
}

function getWorkDateOrException(date) {
  const today = new Date(date);
  // Prefer explicit exception in the same week on or after today
  const weekException = getException(today, today);
  if (weekException) {
    return weekException;
  }
  const computeForWeek = (baseDate) => {
    const weekCandidates = getWorkDatesForWeek(baseDate);
    if (!weekCandidates || weekCandidates.length === 0) return null;
    const baseMid = new Date(baseDate);
    baseMid.setHours(0, 0, 0, 0);
    return (
      weekCandidates.find((d) => d.getTime() >= baseMid.getTime()) ||
      weekCandidates[0] ||
      null
    );
  };
  let workDate = computeForWeek(today);
  if (!workDate || workDate.getTime() < today.getTime()) {
    const nextWeekBase = new Date(today);
    nextWeekBase.setDate(nextWeekBase.getDate() + 7);
    workDate = computeForWeek(nextWeekBase);
  }
  // Final fallback: if an exception explicitly matches or follows the chosen workDate, use it
  if (workDate) {
    const exception = getException(workDate, workDate);
    if (exception) {
      workDate = exception;
    }
  }
  return workDate;
}

function getWorkDay(date) {
  const weekDates = getWeekDates(date);
  const referenceDate = weekDates[referenceDay];
  const currMonthWeekDay = Object.entries(monthWeekDay)
    .reverse()
    .find(([key]) => referenceDate >= new Date(key))[1];
  return currMonthWeekDay[referenceDate.getMonth()];
}

function getDayOfWeek(date, targetDay) {
  const targetDate = new Date(date);
  targetDate.setDate(targetDate.getDate() - targetDate.getDay() + targetDay);
  return targetDate;
}

function getException(date, onOrAfter) {
  const weekDates = getWeekDates(date);
  const matches = [];
  for (const value of weekDates) {
    const v = new Date(value);
    const stringDate = `${v.getFullYear()}-${v.getMonth() + 1}-${v.getDate()}`;
    if (exceptions.has(stringDate)) matches.push(v);
  }
  if (matches.length === 0) return undefined;
  if (onOrAfter) {
    const baseline = new Date(onOrAfter);
    baseline.setHours(0, 0, 0, 0);
    const found = matches.find((d) => d.getTime() >= baseline.getTime());
    return found || undefined;
  }
  return matches[0];
}

function getWeekDates(date = new Date()) {
  const weekDates = [];
  const dayOfWeek = date.getDay();
  const baseDate = new Date(date);
  baseDate.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const tempDate = new Date(baseDate);
    tempDate.setDate(baseDate.getDate() - dayOfWeek + i);
    weekDates.push(tempDate);
  }
  return weekDates;
}

function getWorkDatesForWeek(date = new Date()) {
  const weekDates = getWeekDates(date);
  const workDay = getWorkDay(date);
  // Collect exceptions in the week
  const weekStart = weekDates[0].toDateString();
  const weekExceptions = [];
  exceptions.forEach((ex) => {
    const parts = String(ex).split("-").map(Number);
    if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return;
    const [y, m, day] = parts;
    const exDate = new Date(y, m - 1, day);
    if (getWeekDates(exDate)[0].toDateString() === weekStart) {
      weekExceptions.push(exDate);
    }
  });
  if (weekExceptions.length > 0) {
    return weekExceptions.sort((a, b) => a.getTime() - b.getTime());
  }
  // Otherwise, collect scheduled weekday(s)
  const candidates = Array.isArray(workDay)
    ? workDay.map((d) => weekDates[d]).filter(Boolean)
    : [weekDates[workDay]].filter(Boolean);
  // Remove duplicates
  const unique = Array.from(
    new Map(candidates.map((d) => [d.toDateString(), d])).values()
  ).sort((a, b) => a.getTime() - b.getTime());
  return unique;
}

function createCalendar(date = new Date()) {
  const container = document.getElementById("calendars");
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

  const calendarContainer = document.createElement("div");
  calendarContainer.className = "calendar-container";
  container.appendChild(calendarContainer);

  const calendarTitle = document.createElement("h2");
  calendarTitle.className = "calendar-title";
  calendarTitle.textContent = `${months[currentMonth]} ${currentYear}`;
  calendarContainer.appendChild(calendarTitle);

  const calendarDiv = document.createElement("div");
  calendarDiv.className = "calendar";
  calendarContainer.appendChild(calendarDiv);

  weekDays.forEach((day) => {
    const headerDiv = document.createElement("div");
    headerDiv.className = "calendar-header";
    headerDiv.textContent = day[0];
    calendarDiv.appendChild(headerDiv);
  });

  let currentDate = new Date(firstDayOfMonth);
  for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
    calendarDiv.appendChild(document.createElement("div"));
  }

  const officeDatesCache = {};
  while (currentDate <= lastDayOfMonth) {
    const dayDiv = document.createElement("div");
    dayDiv.textContent = currentDate.getDate();
    dayDiv.className = "";
    if (new Date().toDateString() === currentDate.toDateString()) {
      dayDiv.classList.add("is-today");
    }
    const sundayOfWeek = new Date(currentDate);
    sundayOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const sundayStr = sundayOfWeek.toDateString();
    let officeWeek = officeDatesCache[sundayStr];
    if (!officeWeek) {
      officeWeek = getWorkDatesForWeek(sundayOfWeek).map((d) =>
        d.toDateString()
      );
      officeDatesCache[sundayStr] = officeWeek;
    }
    if (officeWeek.includes(currentDate.toDateString())) {
      dayDiv.classList.add("is-office");
    }
    calendarDiv.appendChild(dayDiv);
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

function createCalendars(firstMonth = new Date()) {
  for (let i = 0; i < 3; i++) {
    createCalendar(
      new Date(firstMonth.getFullYear(), firstMonth.getMonth() + i)
    );
  }
}

window.addEventListener("DOMContentLoaded", () => {
  setDay(new Date());
  createCalendars();
});



