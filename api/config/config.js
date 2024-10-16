require("dotenv").config();

const { CALENDAR_ID, CLIENT_EMAIL, PRIVATE_KEY, MONGODB_URI, NODE_ENV } =
  process.env;
const isDev = NODE_ENV === "development";
const RATE_LIMIT_INTERVAL = isDev ? 1000 * 15 : 1000 * 60 * 60; // 1 hour

module.exports = {
  CALENDAR_ID,
  CLIENT_EMAIL,
  PRIVATE_KEY,
  MONGODB_URI,
  isDev,
  RATE_LIMIT_INTERVAL,
};

require("./db.connection");
