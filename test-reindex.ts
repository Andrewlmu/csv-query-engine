/**
 * Temporary script to test re-indexing with schema metadata
 */
import { DataProcessor } from './src/services/dataProcessor';
import { VectorSearch } from './src/services/vectorSearch';
import { readFileSync } from 'fs';

async function testReindex() {
  console.log('🧪 Testing re-indexing with schema metadata...\n');

  // Initialize services
  const vectorSearch = new VectorSearch();
  await vectorSearch.initialize();

  const dataProcessor = new DataProcessor(vectorSearch);
  await dataProcessor.initialize();

  // Load CSV files
  const files = [
    'test-data/comprehensive-test.csv',
    'test-data/portfolio-metrics.csv'
  ];

  for (const filePath of files) {
    console.log(`\n📊 Processing: ${filePath}`);
    const content = readFileSync(filePath, 'utf-8');
    const filename = filePath.split('/').pop()!;

    await dataProcessor.processDocument({
      id: `test_${Date.now()}_${filename}`,
      content,
      metadata: {
        filename,
        type: 'csv',
        createdAt: new Date().toISOString()
      },
      chunks: []
    });
  }

  console.log('\n✅ Re-indexing complete!');
  console.log('\n📊 Testing metadata search...');

  // Test that schema is returned
  const results = await vectorSearch.search('quarterly financial data', 3);
  const metadataResults = results.filter(r => r.metadata?.type === 'dataset_metadata');

  for (const result of metadataResults) {
    console.log(`\n📄 Dataset: ${result.metadata?.tableId}`);
    console.log(`   Schema: ${JSON.stringify(result.metadata?.schema, null, 2)}`);
  }
}

testReindex().catch(console.error);
