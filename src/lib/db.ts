import { Pool, type PoolConfig } from 'pg';

const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error('DATABASE_URL is not set.');
}

const poolConfig: PoolConfig = {
  connectionString,
};

// Neon/Supabase managed Postgres typically require SSL.
if (!/localhost|127\.0\.0\.1/i.test(connectionString)) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(poolConfig);

export default pool;
