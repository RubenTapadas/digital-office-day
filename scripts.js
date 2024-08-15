const exceptions = [];

const weekDays = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

function setDay(date) {
  const today = date;
  let workDay = getWorkDay(today);
  let workDate = getDayOfWeek(today, workDay);

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

  let string =
    date.getDate() == workDate.getDate() ? "Hoje" : weekDays[workDay];
  document.getElementById("day").textContent = string;
  document.getElementById("date").textContent = `${workDate.getDate()}/${
    workDate.getMonth() + 1
  }/${workDate.getFullYear()}`;
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

window.onload = setDay(new Date());
