import express from "express";
import cors from "cors";
import homesRouter from "./routes/homes.js";
import customHomeRouter from "./routes/custom-homes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/homes", homesRouter);
app.use("/custom-homes", customHomeRouter);

app.listen(process.env.PORT, () => console.log("started server"));
