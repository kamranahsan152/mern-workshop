const mongoose = require("mongoose"); //mongodb://127.0.0.1:27017

// Serverless invocations reuse a warm module but not a warm connection, so the
// promise is cached and awaited per request instead of fired once at startup.
let pending;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!pending) {
    pending = mongoose.connect(process.env.DB_URL).then(() => {
      console.log("Connected to Database safely!");
    });
    pending.catch(() => {
      pending = null; // let the next request retry a failed dial
    });
  }
  await pending;
}

module.exports = {
  connectDB,
};
