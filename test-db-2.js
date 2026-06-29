const postgres = require('postgres');

async function testConnection(name, opts) {
  console.log(`\nTesting ${name}...`);
  try {
    const sql = postgres(opts);
    const [{ '?column?': result }] = await sql`SELECT 1`;
    console.log(`✅ Success! Result: ${result}`);
    await sql.end();
    return true;
  } catch (error) {
    console.error(`❌ Failed:`, error.message);
    return false;
  }
}

async function main() {
  const opts = {
    host: 'db.akqofrpshcqlcovgjcgg.supabase.co',
    port: 5432,
    database: 'postgres',
    username: 'postgres',
    password: 'vRf4w!u-@#!dpWB', // URL DECODED password
    ssl: 'require',
    prepare: false,
    connect_timeout: 10
  };

  await testConnection('IPv6 Direct with Decoded Password', opts);
}

main();
