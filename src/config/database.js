import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const isCloudSqlSocket =
  process.env.DATABASE_URL &&
  process.env.DATABASE_URL.includes("host=/cloudsql/");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isCloudSqlSocket ? false : process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

export default pool;