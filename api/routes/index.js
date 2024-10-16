const express = require("express");
const router = express.Router();

require("./event.routes")(router);

module.exports = router;
