function to2Digits(num: number) {
  return num < 10 ? `0${num}` : num;
}

export function formatTime(date: Date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  if (!isNaN(hours) && !isNaN(minutes)) {
    return `${to2Digits(hours)}:${to2Digits(minutes)}`;
  }
  return `---`;
}

export function formatDateLong(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const week = date.getDay();
  const weekStr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  if (!isNaN(month) && !isNaN(day) && !isNaN(week)) {
    return `${month}/${day} ${weekStr[week]}`;
  }
  return `---`;
}
