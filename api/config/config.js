require("dotenv").config();

const {
  CALENDAR_ID,
  CLIENT_EMAIL,
  CLIENT_ID,
  PRIVATE_KEY,
  MONGODB_URI,
  NODE_ENV,
} = process.env;

const isDev = NODE_ENV === "development";
const RATE_LIMIT_INTERVAL = isDev ? 1000 * 15 : 1000 * 60 * 60; // 1 hour

module.exports = {
  CALENDAR_ID,
  CLIENT_EMAIL,
  CLIENT_ID,
  MONGODB_URI,
  NODE_ENV,
  PRIVATE_KEY,
  RATE_LIMIT_INTERVAL,
};
