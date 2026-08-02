const mongoose = require("mongoose"); //mongodb://127.0.0.1:27017

async function connectDB() {
  await mongoose.connect(process.env.DB_URL);
  console.log("Connected to Database safely!");
}

module.exports = {
  connectDB,
};
