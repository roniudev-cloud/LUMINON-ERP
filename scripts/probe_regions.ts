import postgres from "postgres";

const regions = [
  "ap-southeast-1",
  "us-east-1",
  "us-west-1",
  "us-west-2",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "eu-central-1",
  "ap-northeast-1",
  "ap-northeast-2",
  "ap-south-1",
  "sa-east-1",
  "ca-central-1"
];

async function probe() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    console.log(`Probing region ${region}...`);
    try {
      const sql = postgres(`postgresql://postgres.akqofrpshcqlcovgjcgg:vRf4w!u-%40%23!dpWB@${host}:6543/postgres?sslmode=require`, {
        timeout: 3,
        connect_timeout: 3,
      });
      await sql`SELECT 1`;
      console.log(`FOUND IT! Region is: ${region}`);
      await sql.end();
      process.exit(0);
    } catch (e: any) {
      console.log(`Region ${region} failed: ${e.message}`);
    }
  }
  console.log("All regions failed!");
  process.exit(1);
}

probe();
