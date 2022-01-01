const axios = require("axios");
const { constants } = require("fs");
const fs = require("fs").promises;

const DIVISION_DIRECTORY = "./data/division/";
const MEMBER_DIRECTORY = "./data/members/";

const getDivisionPath = (division) => `${DIVISION_DIRECTORY}${division}.json`;
const getMembersPath = (cid) => `${MEMBER_DIRECTORY}${cid}.json`;

const getDivisionMembers = async (division) => {
  const response = await getDivisionMembersFromCache(division);
  return response !== false
    ? JSON.parse(response.toString())
    : await getDivisionMembersFromVatsim(division);
};

const getDivisionMembersFromCache = async (division) => {
  try {
    const file = getDivisionPath(division);
    await fs.access(file, constants.F_OK);
    return await fs.readFile(file);
  } catch (ex) {
    return false;
  }
};
const getDivisionMembersFromVatsim = async (division) => {
  const url = `${process.env.VATSIM_API_URL}/subdivisions/${division}/members/`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Token ${process.env.VATSIM_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  const data = response.data;
  await fs.writeFile(getDivisionPath(division), JSON.stringify(data));
};

// const getMemberAtcSessions = (cid) => {
//   const response = await getMemberAtcSessionsFromCache(cid);
//   return response !== false
//     ? JSON.parse(response.toString())
//     : await getMemberAtcSessionsFromVatsim(cid);
// };

const getMemberAtcSessions = (cid) =>
  new Promise((resolve, reject) =>
    getMemberAtcSessionsFromCache(cid).then((response) => {
      if (response !== false) {
        resolve(JSON.parse(response.toString()));
      } else {
        getMemberAtcSessionsFromVatsim(cid).then(resolve).catch(reject);
      }
    })
  );

const getMemberAtcSessionsFromCache = async (cid) => {
  try {
    const file = getMembersPath(cid);
    await fs.access(file, constants.F_OK);
    return await fs.readFile(file);
  } catch (ex) {
    return false;
  }
};

const getMemberAtcSessionsFromVatsim = async (cid) => {
  const url = `${process.env.VATSIM_API_URL}/ratings/${cid}/atcsessions/`;
  const response = await axios.get(url);
  const data = response.data;
  await fs.writeFile(getMembersPath(cid), JSON.stringify(data));
};

module.exports = {
  getDivisionMembers,
  getMemberAtcSessions,
};
