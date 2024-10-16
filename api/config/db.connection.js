const mongoose = require("mongoose");
const { MONGODB_URI } = require("./config");

// Connect to MongoDB
mongoose.set("strictQuery", "throw");
mongoose.connect(MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected 🙌🏼 🙌🏼");
});

mongoose.connection.on("error", (err) => {
  console.log("MONGODB ERROR 🛑:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MONGODB disconnected ⚡️ 🔌 ⚡️");
});
