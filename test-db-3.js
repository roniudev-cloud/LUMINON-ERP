const postgres = require('postgres');

async function main() {
  const uri = 'postgresql://postgres:vRf4w!u-%40%23!dpWB@db.akqofrpshcqlcovgjcgg.supabase.co:5432/postgres';
  try {
    const sql = postgres(uri, { prepare: false, ssl: 'require', connect_timeout: 10 });
    const [{ '?column?': result }] = await sql`SELECT 1`;
    console.log(`✅ String Connection Success! Result: ${result}`);
    await sql.end();
  } catch (error) {
    console.error(`❌ String Connection Failed:`, error.message);
  }
}

main();
