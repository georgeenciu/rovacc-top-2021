const { DateTime } = require("luxon");
const positions = require("../../data/positions.json");

const computeStatistics = (data) => {
  const statistics = data
    .map(formatObject)
    .filter(filterYear("2021"))
    .reduce((acc, elem) => {
      const position = positions.find((pos) => pos.callsign === elem.callsign);
      if (position) {
        if (!acc.hasOwnProperty(position.facility)) {
          acc[position.facility] = 0;
        }
        acc[position.facility] += +elem.time;
      }
      return acc;
    }, {});

  return Object.entries(statistics).reduce(
    (acc, element) => {
      const hours = element[1] / 60;
      acc[element[0]] = hours;
      acc.TOTAL += hours;
      return acc;
    },
    { TOTAL: 0 }
  );
};

const formatObject = (element) => {
  const dateStart = DateTime.fromISO(element.start);
  const dateStop = DateTime.fromISO(element.end);
  return {
    dateStart,
    dateStop,
    callsign: element.callsign,
    time: +element.minutes_on_callsign,
  };
};

const filterYear = (year) => (element) =>
  element.dateStart.toFormat("y") === year;

module.exports = {
  computeStatistics,
};
