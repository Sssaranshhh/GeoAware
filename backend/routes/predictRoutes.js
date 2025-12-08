import express from "express";
import {
  predictCyclone,
  predictEarthquake,
  predictFlood,
  predictForestFire,
} from "../controllers/predictController.js";

export const predictRouter = express.Router();

predictRouter.post("/cyclone", predictCyclone);
predictRouter.post("/earthquake", predictEarthquake);
predictRouter.post("/flood", predictFlood);
predictRouter.post("/forestfire", predictForestFire);

predictRouter.get("/", (req, res) => {
  res.json({
    ok: true,
    routes: ["/cyclone", "/earthquake", "/flood", "/forestfire"],
  });
});
