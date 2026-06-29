const postgres = require('postgres');

async function testConnection(name, uri) {
  console.log(`\nTesting ${name}...`);
  try {
    const sql = postgres(uri, { prepare: false, ssl: 'require', connect_timeout: 5 });
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
  const pwd = 'vRf4w!u-%40%23!dpWB';
  
  const ipv4Pooler = `postgresql://postgres.akqofrpshcqlcovgjcgg:${pwd}@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres`;
  const ipv6Pooler = `postgresql://postgres.akqofrpshcqlcovgjcgg:${pwd}@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres`;
  const ipv6Direct = `postgresql://postgres:${pwd}@db.akqofrpshcqlcovgjcgg.supabase.co:5432/postgres`;

  await testConnection('IPv4 Shared Pooler (aws-0)', ipv4Pooler);
  await testConnection('IPv6 Pooler (aws-1)', ipv6Pooler);
  await testConnection('IPv6 Direct (db.xxx)', ipv6Direct);
}

main();
