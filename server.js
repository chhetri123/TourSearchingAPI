const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");
const mongoose = require("mongoose");

const port = process.env.PORT || 3000;
const DB = process.env.DB.replace("<PASSWORD>", process.env.DB_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("db connected successfully"))
  .catch();

const server = app.listen(port, () => {
  console.log(`App running in port ${port}`);
});

// this runs when unhandle promise rejection is found in the code
// Like while connecting DB if pass is incorrect than mongoose throw rejection promise which if unhandled than this block of code runs
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  process.exit();
});
