import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import matchRouter from "./routers/matchRouter.js";
import summonerRouter from "./routers/summonerRouter.js";
import userRouter from "./routers/userRouter.js";
import championRouter from "./routers/championRouter.js";

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

dotenv.config();

mongoose.connect(
  process.env.MONGODB_URL ||
    "mongodb+srv://project:project@cluster1.5qnah.mongodb.net/leaguer",
  {
    useNewUrlParser: true,
  }
);

app.use("/api/summoners", summonerRouter);
app.use("/api/matches", matchRouter);
app.use("/api/users", userRouter);
app.use("/api/champions", championRouter);

// Handle Production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("/public"));
  app.get(/.*/, (req, res) => res.sendFile("/public/index.html"));
}

const port = 8080;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
