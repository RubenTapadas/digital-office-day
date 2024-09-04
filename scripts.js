const exceptions = ["2024-9-6"];

const weekDays = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
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

function setDay(date) {
  const workDate = getWorkDateOrException(date);

  let string =
    date.getDate() == workDate.getDate() ? "Hoje" : weekDays[workDate.getDay()];
  document.getElementById("day").textContent = string;
  document.getElementById("date").textContent = `${workDate.getDate()}/${
    workDate.getMonth() + 1
  }/${workDate.getFullYear()}`;
}

function getWorkDateOrException(date) {
  const today = date;
  const dateException = getException(date, exceptions);
  let workDay = getWorkDay(today);
  let workDate = dateException ?? getDayOfWeek(today, workDay);

  if (workDate.getTime() < today.getTime()) {
    const nextWeekDate = new Date(new Date(today).setDate(today.getDate() + 7));
    workDay = getWorkDay(nextWeekDate);
    workDate = getDayOfWeek(nextWeekDate, workDay);
  }

  const exception = getException(workDate, exceptions);
  if (exception) {
    workDate = exception;
    workDay = exception.getDay();
  }

  return workDate;
}

function getWorkDay(date) {
  const weekDates = getWeekDates(date);
  const workDay = isFirstMonthOfQuarter(weekDates[2]) ? 4 : 2;

  return workDay;
}

function getDayOfWeek(date, targetDay) {
  const targetDate = new Date(date);
  targetDate.setDate(targetDate.getDate() - targetDate.getDay() + targetDay);

  return targetDate;
}

function isFirstMonthOfQuarter(date) {
  const month = date.getMonth();
  return month % 3 === 0;
}

function getException(date, exceptions) {
  const weekDates = getWeekDates(date);

  const exception = Object.entries(weekDates).find(([key, value]) => {
    value = new Date(value);
    const stringDate = `${value.getFullYear()}-${
      value.getMonth() + 1
    }-${value.getDate()}`;
    if (exceptions.includes(stringDate)) {
      return true;
    }
  });

  return exception?.[1];
}

function getWeekDates(date = new Date()) {
  const weekDates = [];
  const dayOfWeek = date.getDay();

  for (let i = 0; i < 7; i++) {
    const tempDate = new Date(date);
    tempDate.setDate(date.getDate() - dayOfWeek + i);
    weekDates.push(tempDate);
  }

  return weekDates;
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

  for (const day of weekDays) {
    const headerDiv = document.createElement("div");
    headerDiv.className = "calendar-header";
    headerDiv.textContent = day[0];
    calendarDiv.appendChild(headerDiv);
  }

  let currentDate = firstDayOfMonth;

  for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
    const emptyDiv = document.createElement("div");
    calendarDiv.appendChild(emptyDiv);
  }

  const officeDates = {};

  while (currentDate <= lastDayOfMonth) {
    const dayDiv = document.createElement("div");
    dayDiv.textContent = currentDate.getDate();
    dayDiv.className = "";

    if (new Date().toDateString() === currentDate.toDateString()) {
      dayDiv.className += " is-today";
    }

    const sundayOfWeek = new Date(
      new Date(currentDate).setDate(
        currentDate.getDate() - currentDate.getDay()
      )
    ).toDateString();
    let officeDate = officeDates[sundayOfWeek];

    if (!officeDate) {
      officeDates[sundayOfWeek] = getWorkDateOrException(
        new Date(sundayOfWeek)
      );
      officeDate = officeDates[sundayOfWeek];
    }

    if (officeDate.toDateString() === currentDate.toDateString()) {
      dayDiv.className += " is-office";
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

window.onload = setDay(new Date());
window.onload = createCalendars();
