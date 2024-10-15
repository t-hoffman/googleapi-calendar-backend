require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());

const { calendar_id, client_email, private_key, MONGODB_URI, NODE_ENV } =
  process.env;

// Rate limiter & MongoDB
const isDev = NODE_ENV === "development";
const RATE_LIMIT_INTERVAL = isDev ? 1000 * 15 : 1000 * 60 * 60; // 1 hour
console.log(RATE_LIMIT_INTERVAL, NODE_ENV);

const RateLimitSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  lastSubmission: { type: Date, required: true },
});

RateLimitSchema.index(
  { lastSubmission: 1 },
  { expireAfterSeconds: RATE_LIMIT_INTERVAL / 1000 }
);

const RateLimit = mongoose.model("RateLimit", RateLimitSchema);

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected 🙌🏼 🙌🏼"))
  .catch((err) => console.error("MongoDB connection error:", err));

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const auth = new google.auth.JWT({
  email: client_email,
  key: private_key,
  scopes: SCOPES,
});

const calendar = google.calendar({ version: "v3", auth });
const calendarId = calendar_id;

router.get("/events", async (req, res) => {
  try {
    const maxDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 2,
      0,
      23,
      59,
      59
    );
    const response = await calendar.events.list({
      calendarId,
      timeMin: new Date().toISOString(),
      timeMax: maxDate.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const eventData = [];
    response.data.items.map((event) => {
      const { summary, start, end } = event;
      eventData.push({ summary, start, end });
    });

    res.status(200).json(eventData);
  } catch (error) {
    console.log(error);
    res.status(500).send(`Error retriving events: ${error}`);
  }
});

// Middleware to check rate-limiting based on IP address
router.use("/events/add", async (req, res, next) => {
  const userIp = req.ip;
  const currentTime = Date.now();

  try {
    let rateLimitDoc = await RateLimit.findOne({ ip: userIp });

    if (rateLimitDoc) {
      if (currentTime - rateLimitDoc.lastSubmission < RATE_LIMIT_INTERVAL) {
        return res
          .status(429)
          .json({ message: "Too many submissions, please try again later." });
      }

      rateLimitDoc.lastSubmission = currentTime;
      await rateLimitDoc.save();
    } else {
      rateLimitDoc = new RateLimit({ ip: userIp, lastSubmission: currentTime });
      rateLimitDoc.save();
    }

    next();
  } catch (err) {
    console.error("Error checking rate limit:", err);
    res.status(500).send("Internal server error.");
  }
});

router.post("/events/add", async (req, res) => {
  const { startDate, endDate, summary, timeZone } = req.body;
  try {
    const event = {
      summary: summary,
      location: "Consult - Phone Call",
      start: {
        dateTime: startDate, // Start time in ISO format
        timeZone: timeZone,
      },
      end: {
        dateTime: endDate, // End time in ISO format
        timeZone: timeZone,
      },
      reminders: {
        useDefault: true,
      },
    };

    try {
      const response = await calendar.events.insert({
        auth,
        calendarId,
        resource: event,
      });
      console.log(response.data.htmlLink);
    } catch (err) {
      console.log(err);
    }

    res
      .status(200)
      .send(JSON.stringify({ message: "SUCCESS !!", body: req.body }));
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

app.use("/api", router);

module.exports = app;
