const postgres = require('postgres');

async function main() {
  const opts = {
    host: 'aws-1-ap-southeast-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    username: 'postgres.akqofrpshcqlcovgjcgg',
    password: 'vRf4w!u-@#!dpWB', // URL DECODED password
    ssl: 'require',
    prepare: false, // REQUIRED for pgbouncer/supavisor
    connect_timeout: 10
  };

  try {
    console.log(`Connecting to aws-1...`);
    const sql = postgres(opts);
    const [{ '?column?': result }] = await sql`SELECT 1`;
    console.log(`✅ Success! Result: ${result}`);
    await sql.end();
  } catch (error) {
    console.error(`❌ Failed:`, error.message);
  }
}

main();
