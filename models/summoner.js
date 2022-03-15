import mongoose from "mongoose";

const summonerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    region: { type: String, required: true},
  },
  {
    timestamps: true,
  }
);

const Summoner = mongoose.model("Summoner", summonerSchema);
export default Summoner;