
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_IrWQBC3GYT4A@ep-winter-surf-aebwgg7p-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false, // necesario para conexiones externas
  },
});

export default pool;
