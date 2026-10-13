import express from "express";
import pool from "../data/pool-client.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const results = await pool.query(`SELECT * FROM custom_home_options`);
    if (!results)
      return res.status(404).send("No currently saved custom homes");
    res.send(results.rows);
  } catch (error) {
    console.log("Error getting custom homes", error);
    res.status(500).send("Internal server error");
  }
});

// Body: { home_id: 4, name: "My home", options: [{ optionId: 2 }, ...] }
router.post("/", async (req, res) => {
  const { home_id, name, options } = req.body ?? {};
  const validId = (value) =>
    (typeof value === "string" && /^[1-9]\d*$/.test(value)) ||
    (typeof value === "number" && Number.isSafeInteger(value) && value > 0);

  if (
    !validId(home_id) ||
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 255
  ) {
    return res.status(400).json({
      error: "Provide a valid home ID and a name of 1-255 characters.",
    });
  }
  if (
    !Array.isArray(options) ||
    !options.every((option) => validId(option?.optionId))
  ) {
    return res.status(400).json({
      error: "Options must be an array of objects with valid optionId values.",
    });
  }
  // Normalize IDs so the number 2 and string "2" count as the same selection.
  const optionIds = options.map((option) => BigInt(option.optionId).toString());
  if (new Set(optionIds).size !== optionIds.length) {
    return res
      .status(400)
      .json({ error: "An option cannot be selected more than once." });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    const homeResult = await client.query(
      "SELECT price FROM homes WHERE id = $1",
      [home_id],
    );
    if (homeResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Home not found." });
    }

    const availableResult = await client.query(
      `SELECT options.id, options.name, options.price, options.category
       FROM options
       JOIN home_options ON options.id = home_options.option_id
       WHERE home_options.home_id = $1`,
      [home_id],
    );
    const availableById = new Map(
      availableResult.rows.map((option) => [String(option.id), option]),
    );
    if (optionIds.some((id) => !availableById.has(id))) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "One or more options are unavailable for this home." });
    }
    const selectedOptions = optionIds.map((id) => availableById.get(id));
    const requiredCategories = new Set(
      availableResult.rows.map((option) => option.category),
    );
    const selectedCategories = new Set(
      selectedOptions.map((option) => option.category),
    );
    if (
      selectedCategories.size !== selectedOptions.length ||
      selectedCategories.size !== requiredCategories.size
    ) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Select exactly one option for each customization category.",
      });
    }

    // Calculate from database prices in cents; client prices and categories are ignored.
    const totalCents = selectedOptions.reduce(
      (total, option) => total + Math.round(Number(option.price) * 100),
      Math.round(Number(homeResult.rows[0].price) * 100),
    );
    const price = (totalCents / 100).toFixed(2);
    const savedResult = await client.query(
      `INSERT INTO custom_home (home_id, name, price)
       VALUES ($1, $2, $3) RETURNING *`,
      [home_id, name.trim(), price],
    );
    const savedHome = savedResult.rows[0];
    for (const option of selectedOptions) {
      await client.query(
        `INSERT INTO custom_home_options (custom_home_id, home_id, option_id, category)
         VALUES ($1, $2, $3, $4)`,
        [savedHome.id, home_id, option.id, option.category],
      );
    }
    await client.query("COMMIT");
    return res.status(201).json({ ...savedHome, options: selectedOptions });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Error rolling back custom home:", rollbackError);
      }
    }
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ error: "A custom home with that name already exists." });
    }
    console.error("Error creating custom home and options:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client?.release();
  }
});

export default router;
