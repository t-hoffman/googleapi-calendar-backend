const mongoose = require("mongoose");
const { RATE_LIMIT_INTERVAL } = require("../config/config");

const rateLimitSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  lastSubmission: { type: Date, required: true },
});

rateLimitSchema.index(
  { lastSubmission: 1 },
  { expireAfterSeconds: RATE_LIMIT_INTERVAL / 1000 }
);

const RateLimit = mongoose.model("RateLimit", rateLimitSchema);

module.exports = RateLimit;
