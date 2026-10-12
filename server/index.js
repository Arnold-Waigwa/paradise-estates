import express from "express";
import cors from "cors";
import homesRouter from "./routes/homes.js";

const app = express();

app.use(cors());
app.use("/homes", homesRouter);

app.listen(process.env.PORT, () => console.log("started server"));
