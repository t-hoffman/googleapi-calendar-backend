const { event } = require("../middleware");
const controller = require("../contollers/event.controller");

module.exports = (router) => {
  router.get("/events", controller.listEvents);
  router.post("/events/add", event.rateLimiter, controller.addEvent);
  router.delete("/events/delete", event.googleAuth, controller.deleteEvent);
};
