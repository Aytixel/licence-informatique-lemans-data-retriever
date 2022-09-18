/*
first more recent   : +
second more recent  : -
first = second      : 0
*/
const compare_date = (first_date: Date, second_date: Date) =>
  first_date.getTime() - second_date.getTime();

// keep only the date part
const keep_only_date = (date: Date) =>
  new Date(date.getTime() - (date.getTime() % (1000 * 60 * 60 * 24)));

export { compare_date, keep_only_date };
