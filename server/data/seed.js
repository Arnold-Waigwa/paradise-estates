// Rebuild the schema and seed the catalog in a single transaction.
import pool from "./pool-client.js";
import { homeData, optionsData, homeOptionsData } from "./models.js";

const createTables = async (client) => {
  await client.query(`
    DROP TABLE IF EXISTS custom_home_options;
    DROP TABLE IF EXISTS home_options;
    DROP TABLE IF EXISTS custom_home;
    DROP TABLE IF EXISTS homes;
    DROP TABLE IF EXISTS options;

    CREATE TABLE homes (
      id BIGINT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      image TEXT NOT NULL
    );

    CREATE TABLE options (
      id BIGINT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      image TEXT NOT NULL,
      preview JSONB NOT NULL,
      UNIQUE (id, category)
    );

    CREATE TABLE home_options (
      home_id BIGINT NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
      option_id BIGINT NOT NULL REFERENCES options(id) ON DELETE CASCADE,
      PRIMARY KEY (home_id, option_id)
    );

    CREATE TABLE custom_home (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      home_id BIGINT NOT NULL REFERENCES homes(id),
      name VARCHAR(255) NOT NULL UNIQUE,
      price NUMERIC(10, 2) NOT NULL,
      UNIQUE (id, home_id)
    );

    CREATE TABLE custom_home_options (
      custom_home_id BIGINT NOT NULL,
      home_id BIGINT NOT NULL,
      option_id BIGINT NOT NULL,
      category VARCHAR(255) NOT NULL,
      PRIMARY KEY (custom_home_id, option_id),
      UNIQUE (custom_home_id, category),
      FOREIGN KEY (custom_home_id, home_id)
        REFERENCES custom_home(id, home_id) ON DELETE CASCADE,
      FOREIGN KEY (home_id, option_id)
        REFERENCES home_options(home_id, option_id),
      FOREIGN KEY (option_id, category)
        REFERENCES options(id, category)
    );
  `);
};

const seedHomeData = async (client) => {
  const query = `
    INSERT INTO homes (id, name, description, price, image)
    VALUES ($1, $2, $3, $4, $5)
  `;
  for (const home of homeData) {
    const values = [home.id, home.name, home.description, home.price, home.image];
    await client.query(query, values);
  }
};

const seedOptionsData = async (client) => {
  const query = `
    INSERT INTO options (id, name, description, category, price, image, preview)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  for (const option of optionsData) {
    const values = [
      option.id,
      option.name,
      option.description,
      option.category,
      option.price,
      option.image,
      JSON.stringify(option.preview),
    ];
    await client.query(query, values);
  }
};

const seedHomeOptionsData = async (client) => {
  const query = `
    INSERT INTO home_options (home_id, option_id)
    VALUES ($1, $2)
  `;
  for (const homeOption of homeOptionsData) {
    const values = [homeOption.home_id, homeOption.option_id];
    await client.query(query, values);
  }
};

const seedAll = async () => {
  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    await createTables(client);
    await seedHomeData(client);
    await seedOptionsData(client);
    await seedHomeOptionsData(client);
    await client.query("COMMIT");
    console.log(
      `Seeded ${homeData.length} homes, ${optionsData.length} options, and ${homeOptionsData.length} home-option assignments.`,
    );
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Error rolling back seed transaction:", rollbackError);
      }
    }
    console.error("Error seeding database:", error);
    process.exitCode = 1;
  } finally {
    client?.release();
    await pool.end();
  }
};

await seedAll();
