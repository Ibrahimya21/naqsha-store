import dotenv from "dotenv";
import app from "./app.js";
import pool from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to Naqsha MySQL successfully");
    connection.release();

    app.listen(PORT, () => {
      console.log(`Naqsha server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error);
    process.exit(1);
  }
};

startServer();
