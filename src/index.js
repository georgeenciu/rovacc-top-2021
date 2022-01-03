const { splitEvery } = require("ramda");
const { computeStatistics } = require("./utils/statistics");
const { getDivisionMembers, getMemberAtcSessions } = require("./utils/vatsim");
require("dotenv").config();

(async () => {
  const members = await getDivisionMembers("ROM");
  const memberChunks = splitEvery(
    10,
    members.filter((member) => member.rating > 0).map((member) => member.id)
  );

  const chunkPromises = memberChunks.map((chunk) =>
    Promise.all(chunk.map((cid) => getMemberAtcSessions(cid)))
  );

  const results = (await Promise.all(chunkPromises)).flat();

  const indexedSessions = results
    .filter((result) => result.count > 0)
    .map((result) => [result.results[0].vatsim_id, result.results])
    .reduce((acc, elem) => {
      acc[elem[0]] = elem[1];
      return acc;
    }, {});

  const interm = Object.entries(indexedSessions)
    .map((elem) => {
      const stats = computeStatistics(elem[1]);
      return [elem[0], stats];
    })
    .filter((elem) => elem[1]["TOTAL"] > 0);

  interm.sort((a, b) => (a[1]["TOTAL"] < b[1]["TOTAL"] ? 1 : -1));

  console.log(JSON.stringify(interm.slice(0, 10), null, 2));
})();
