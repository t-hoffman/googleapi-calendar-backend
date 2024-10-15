require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const { calendar_id, client_email, private_key } = process.env;

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const auth = new google.auth.JWT({
  email: client_email,
  key: private_key,
  scopes: SCOPES,
});

const calendar = google.calendar({ version: "v3", auth });
const calendarId = calendar_id;

app.get("/events", async (req, res) => {
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

    res.status(200).json(response.data.items);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retriving events");
  }
});

app.post("/events/add", async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
