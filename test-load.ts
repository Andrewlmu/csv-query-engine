import { AutoLoader } from './src/utils/autoLoader.js';
import { DataProcessor } from './src/services/dataProcessor.js';
import { DocumentParser } from './src/services/documentParser.js';
import { Database } from 'duckdb-async';

async function testLoad() {
  try {
    console.log('🔧 Starting test load...');

    // Initialize DuckDB
    const db = await Database.create('./data/duckdb.db');
    console.log('✅ DuckDB created');

    // Create simple data processor and parser
    const dataProcessor = new DataProcessor();
    await dataProcessor.initialize();
    console.log('✅ Data processor initialized');

    const documentParser = new DocumentParser();
    console.log('✅ Document parser initialized');

    // Create autoloader
    const autoLoader = new AutoLoader(dataProcessor, documentParser);
    await autoLoader.initialize(db);
    console.log('✅ AutoLoader initialized');

    // Try to load
    console.log('📂 Starting auto-load...');
    await autoLoader.autoLoadDemoData();
    console.log('✅ Auto-load complete!');

    // Check what was loaded
    const tables = await db.all("SHOW TABLES");
    console.log('\n📊 Tables created:');
    tables.forEach((t: any) => console.log(`  - ${t.name}`));

    await db.close();
    console.log('\n✅ Test complete!');
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

testLoad();
