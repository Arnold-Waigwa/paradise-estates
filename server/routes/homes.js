import express from "express";
import pool from "../data/pool-client.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM homes;`);
    res.send(result.rows);
  } catch (error) {
    console.log("error getting homes", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

export default router;
