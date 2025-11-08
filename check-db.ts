import { Database } from 'duckdb-async';

async function checkDatabase() {
  try {
    const db = await Database.create('./data/duckdb.db');

    // List all tables using DuckDB syntax
    const tables = await db.all("SHOW TABLES");
    console.log('\n📊 Tables in database:');
    tables.forEach((table: any) => {
      console.log(`  - ${table.name}`);
    });
    console.log(`\nTotal tables: ${tables.length}`);

    // Check file tracking table
    if (tables.length > 0) {
      const tracking = await db.all("SELECT * FROM _file_tracking_metadata LIMIT 5");
      console.log('\n📋 File tracking (first 5):');
      console.log(tracking);
    }

    await db.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabase();
