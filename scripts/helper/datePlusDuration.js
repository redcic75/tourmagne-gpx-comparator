const datePlusDuration = (date, duration, locale) => {
  const sumDate = new Date(date.getTime() + duration);
  const dateStr = sumDate.toLocaleDateString(
    locale,
    {
      weekday: 'long', year: 'numeric', month: 'short', day: 'numeric',
    },
  );
  const timeStr = sumDate.toLocaleTimeString(locale);

  return {
    dateStr,
    timeStr,
  };
};

module.exports = datePlusDuration;
