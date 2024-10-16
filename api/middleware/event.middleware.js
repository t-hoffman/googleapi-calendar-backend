const { RateLimit } = require("../models");
const { RATE_LIMIT_INTERVAL } = require("../config/config");

exports.rateLimiter = async (req, res, next) => {
  const userIp = req.headers["x-forwarded-for"] || req.ip;
  console.log("USER IP:", userIp);
  const currentTime = Date.now();

  try {
    let rateQuery = await RateLimit.findOne({ ip: userIp });

    if (rateQuery) {
      if (currentTime - rateQuery.lastSubmission < RATE_LIMIT_INTERVAL) {
        return res
          .status(429)
          .json({ message: "Too many submissions, please try again later." });
      }

      rateQuery.lastSubmission = currentTime;
      await rateQuery.save();
    } else {
      rateQuery = new RateLimit({ ip: userIp, lastSubmission: currentTime });
      rateQuery.save();
    }

    next();
  } catch (err) {
    console.error("Error checking rate limit:", err);
    res.status(500).send("Internal server error.");
  }
};
