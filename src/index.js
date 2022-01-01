const axios = require("axios");
const { splitEvery } = require("ramda");
const { computeStatistics } = require("./utils/statistics");

const { getDivisionMembers, getMemberAtcSessions } = require("./utils/vatsim");
require("dotenv").config();

const sessions = {};
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

  results
    .filter((result) => result.count > 0)
    .map((result) => [result.results[0].vatsim_id, result.results]);

  // TODO: finish
  // Object.entries(results).map((elem) => computeStatistics(elem[1]));
})();
