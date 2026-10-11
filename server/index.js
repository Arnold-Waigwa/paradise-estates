import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

app.get("/estates", (req, res) => {
  res.send("Connected to the server successfully");
});

app.listen(3000, () => console.log("started server"));
