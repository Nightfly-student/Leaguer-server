import express from "express";
import expressAsyncHandler from "express-async-handler";
import axios from "axios";

const matchRouter = express.Router();

matchRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    var data = {};
    await axios
      .get(
        `https://${req.query.region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${req.query.puuid}/ids?start=${req.query.start}&count=${req.query.limit}`,
        {
          headers: {
            "Accept-Charset":
              "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Riot-Token": process.env.RIOT_API,
          },
        }
      )
      .then((res) => {
        data = res.data;
      })
      .catch(() => {
        res.status(400).send({ message: "Bad Request" });
      });
    res.status(200).send(data);
  })
);

matchRouter.get(
  "/info",
  expressAsyncHandler(async (req, res) => {
    const timeout = () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve("222"), 100);
      });
    };
    var matchInfo = [];
    var matches = req.query.matches.split(",");
    const promises = matches.map(async (data) => {
      let waitForThisData = await timeout(data);
      return axios
        .get(`https://${req.query.region}.api.riotgames.com/lol/match/v5/matches/${data}`, {
          headers: {
            "Accept-Charset":
              "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Riot-Token": process.env.RIOT_API,
          },
        })
        .then((res) => matchInfo.push(res.data))
        .catch((err) => console.log(err));
    });

    await Promise.all(promises);
    res.status(200).send(matchInfo);
  })
);
export default matchRouter;
