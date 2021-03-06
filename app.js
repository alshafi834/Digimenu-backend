const express = require("express");
const mongoose = require("mongoose");
var cors = require("cors");

const mainRoute = require("./routes/main-route");
const userRoutes = require("./routes/user-route");

const HttpError = require("./models/http-error");

require("dotenv").config();

const app = express();

app.use(express.json());

app.use(cors());
/* app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
}); */

app.use(mainRoute);
app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not found this route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured" });
});

mongoose
  .connect(process.env.MongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(process.env.PORT || 8000);
  })
  .catch((err) => {
    console.log(err);
  });
