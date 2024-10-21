const { RateLimit } = require("../models");
const {
  CLIENT_ID,
  RATE_LIMIT_INTERVAL,
  CALENDAR_ID,
} = require("../config/config");
const { events } = require("../models/event.model");
const { google } = require("googleapis");

exports.rateLimiter = async (req, res, next) => {
  require("../config/db.connection");
  console.log(new Date().toString());
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
      await rateQuery.save();
    }

    next();
  } catch (err) {
    console.error("Error checking rate limit:", err);
    res.status(500).send("Internal server error.");
  }
};

exports.googleAuth = async (req, res, next) => {
  const OAuth2Client = google.auth.OAuth2;
  const client = new OAuth2Client(CLIENT_ID);
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: No token provided." });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload["email"];

    if (email !== CALENDAR_ID) {
      return res
        .status(403)
        .json({ message: "Access Denid: Unauthorized user." });
    }

    next();
  } catch (err) {
    console.error("Token verification error:", error);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
