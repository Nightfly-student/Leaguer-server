import express from "express";
import expressAsyncHandler from "express-async-handler";
import axios from "axios";

const championRouter = express.Router();

championRouter.get(
  "/",
  expressAsyncHandler(async (req, res, next) => {
    await axios
      .get(
        `https://euw1.api.riotgames.com/lol/platform/v3/champion-rotations`,
        {
          headers: {
            "Accept-Charset":
              "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Riot-Token": process.env.RIOT_API,
          },
        }
      )
      .then((response) => {
        res.status(200).send({
          regular: response.data.freeChampionIds,
          free: response.data.freeChampionIdsForNewPlayers,
        });
      })
      .catch((err) => {
        next(err);
      });
  })
);

export default championRouter;
