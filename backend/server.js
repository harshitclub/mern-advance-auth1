require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const userRoute = require("./routes/userRoute");
const errorHandler = require("./middleware/errorMiddleware");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("This is MERN Stack Auth Backend");
});
app.use("/api/users", userRoute);

// Error Handler
app.use(errorHandler);

mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGOURL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is Running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
