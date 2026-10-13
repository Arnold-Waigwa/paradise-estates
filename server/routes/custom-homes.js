import express from "express";
import pool from "../data/pool-client.js";

const router = express.Router();

// Include the base home and selected finishes so saved designs can be displayed.
router.get("/", async (req, res) => {
  try {
    const homesResult = await pool.query(`
      SELECT custom_home.*, homes.name AS home_name, homes.image
      FROM custom_home
      JOIN homes ON homes.id = custom_home.home_id
      ORDER BY custom_home.id DESC
    `);
    const optionsResult = await pool.query(`
      SELECT custom_home_options.custom_home_id, options.*
      FROM custom_home_options
      JOIN options ON options.id = custom_home_options.option_id
      ORDER BY options.category
    `);
    for (const home of homesResult.rows) {
      home.options = optionsResult.rows.filter(
        option => option.custom_home_id === home.id,
      );
    }
    return res.json(homesResult.rows);
  } catch (error) {
    console.error("Error getting custom homes:", error);
    return res.status(500).json({ error: "Unable to load saved homes." });
  }
});

router.get("/:customHomeId", async (req, res) => {
  const { customHomeId } = req.params;
  if (!/^[1-9]\d*$/.test(customHomeId)) {
    return res.status(400).json({ error: "Invalid custom home ID." });
  }
  try {
    const homeResult = await pool.query(
      "SELECT * FROM custom_home WHERE id = $1",
      [customHomeId],
    );
    if (homeResult.rows.length === 0) {
      return res.status(404).json({ error: "Custom home not found." });
    }
    const optionsResult = await pool.query(
      `SELECT options.* FROM options
       JOIN custom_home_options ON options.id = custom_home_options.option_id
       WHERE custom_home_options.custom_home_id = $1
       ORDER BY options.category`,
      [customHomeId],
    );
    const home = homeResult.rows[0];
    home.options = optionsResult.rows;
    return res.json(home);
  } catch (error) {
    console.error("Error getting custom home:", error);
    return res.status(500).json({ error: "Unable to load this saved home." });
  }
});

// Body: { home_id: 4, name: "My home", options: [{ optionId: 2 }, ...] }
router.post("/", async (req, res) => {
  const { home_id, name, options } = req.body;
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

// Send the new name and the complete list of selected options.
router.put("/:customHomeId", async (req, res) => {
  const { customHomeId } = req.params;
  const { name, options } = req.body;

  if (!/^[1-9]\d*$/.test(customHomeId)) {
    return res.status(400).json({ error: "Invalid custom home ID." });
  }
  if (typeof name !== "string" || !name.trim() || name.trim().length > 255) {
    return res
      .status(400)
      .json({ error: "Provide a name between 1 and 255 characters." });
  }
  if (!Array.isArray(options)) {
    return res.status(400).json({ error: "Options must be an array." });
  }
  for (const option of options) {
    if (
      !option ||
      !Number.isSafeInteger(Number(option.optionId)) ||
      Number(option.optionId) <= 0
    ) {
      return res
        .status(400)
        .json({ error: "Each option needs a valid optionId." });
    }
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    // Lock this design while replacing its selections.
    const customHomeResult = await client.query(
      "SELECT home_id FROM custom_home WHERE id = $1 FOR UPDATE",
      [customHomeId],
    );
    if (customHomeResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Custom home not found." });
    }
    const homeId = customHomeResult.rows[0].home_id;
    const homeResult = await client.query(
      "SELECT price FROM homes WHERE id = $1",
      [homeId],
    );
    const optionsResult = await client.query(
      `SELECT options.id, options.name, options.price, options.category
       FROM options
       JOIN home_options ON options.id = home_options.option_id
       WHERE home_options.home_id = $1`,
      [homeId],
    );

    const availableOptions = optionsResult.rows;
    const selectedOptions = [];
    const selectedCategories = [];
    const requiredCategories = [];
    for (const option of availableOptions) {
      if (!requiredCategories.includes(option.category)) {
        requiredCategories.push(option.category);
      }
    }
    for (const choice of options) {
      const option = availableOptions.find(
        (available) => Number(available.id) === Number(choice.optionId),
      );
      if (!option) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ error: "A selected option is unavailable for this home." });
      }
      if (selectedCategories.includes(option.category)) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ error: `Choose only one option for ${option.category}.` });
      }
      selectedOptions.push(option);
      selectedCategories.push(option.category);
    }
    if (selectedCategories.length !== requiredCategories.length) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Choose one option for every category." });
    }

    // Recalculate from the base price, not the old customized price.
    let priceInCents = Math.round(Number(homeResult.rows[0].price) * 100);
    for (const option of selectedOptions) {
      priceInCents += Math.round(Number(option.price) * 100);
    }
    const price = (priceInCents / 100).toFixed(2);

    await client.query(
      "DELETE FROM custom_home_options WHERE custom_home_id = $1",
      [customHomeId],
    );
    const updatedResult = await client.query(
      `UPDATE custom_home SET name = $1, price = $2
       WHERE id = $3 RETURNING *`,
      [name.trim(), price, customHomeId],
    );
    for (const option of selectedOptions) {
      await client.query(
        `INSERT INTO custom_home_options (custom_home_id, home_id, option_id, category)
         VALUES ($1, $2, $3, $4)`,
        [customHomeId, homeId, option.id, option.category],
      );
    }
    await client.query("COMMIT");
    const updatedHome = updatedResult.rows[0];
    updatedHome.options = selectedOptions;
    return res.status(200).json(updatedHome);
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Error undoing custom home update:", rollbackError);
      }
    }
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ error: "A custom home with that name already exists." });
    }
    console.error("Error updating custom home:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    if (client) {
      client.release();
    }
  }
});

router.delete("/:customHomeId", async (req, res) => {
  const { customHomeId } = req.params;
  if (!/^[1-9]\d*$/.test(customHomeId)) {
    return res.status(400).json({ error: "Invalid custom home ID." });
  }

  try {
    // The database cascade removes this design's option selections too.
    const result = await pool.query(
      "DELETE FROM custom_home WHERE id = $1 RETURNING id",
      [customHomeId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Custom home not found." });
    }
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting custom home:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
