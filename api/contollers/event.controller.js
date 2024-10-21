// const { body, validationResult } = require("express-validator");
// const validator = require("validator");
// const eventValidationRules = [
//   body("startDate")
//     .isISO8601()
//     .withMessage("Invalid start date format.  Expected ISO 8601 format.")
//     .toDate(),
//   body("endDate")
//     .isISO8601()
//     .withMessage("Invalid end date format.  Expected ISO 8601 format.")
//     .toDate(),
//   body("timeZone")
//     .isString()
//     .withMessage("Time zone must be a string.")
//     .trim()
//     .escape(),
// ];

const { CALENDAR_ID, CLIENT_EMAIL, PRIVATE_KEY } = require("../config/config");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const auth = new google.auth.JWT({
  email: CLIENT_EMAIL,
  key: PRIVATE_KEY,
  scopes: SCOPES,
});

const calendar = google.calendar({ version: "v3", auth });
const calendarId = CALENDAR_ID;

exports.listEvents = async (req, res) => {
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
      const { id, summary, start, end } = event;
      eventData.push({ id, summary, start, end });
    });

    res.status(200).json(eventData);
  } catch (error) {
    console.log(error);
    res.status(500).send(`Error retriving events: ${error}`);
  }
};

exports.addEvent = async (req, res) => {
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
};

exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const response = await calendar.events.delete({
      auth,
      eventId,
      calendarId,
    });

    res
      .status(200)
      .send(JSON.stringify({ message: "DELETE SUCCESS !!", response }));
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
