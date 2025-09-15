import { Pool } from 'pg';

const pool = new Pool({
  host: 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.ljveqfmifeqquebjvwau',
  password: 'sugihmanik1',
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;