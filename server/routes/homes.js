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

router.get("/:homeId/options", async (req, res) => {
  const { homeId } = req.params;

  if (!/^[1-9]\d*$/.test(homeId)) {
    return res.status(400).json({ error: "Invalid home ID" });
  }

  try {
    const result = await pool.query(
      `
        SELECT options.*
        FROM options
        JOIN home_options
          ON options.id = home_options.option_id
        WHERE home_options.home_id = $1
        ORDER BY options.category, options.price, options.id
      `,
      [homeId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting home options:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
