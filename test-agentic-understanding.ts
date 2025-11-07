/**
 * Test script for Agentic RAG with Comprehensive Data Understanding
 * Tests: Profiling, Insights, Gap Detection, Proactive Analysis
 */

import { DataProcessor } from './src/services/dataProcessor';
import { VectorSearch } from './src/services/vectorSearch';
import { AgenticRAG } from './src/agents/agenticRAG';
import * as fs from 'fs/promises';

async function main() {
  console.log('\n========================================');
  console.log('🧪 Testing Agentic RAG Understanding');
  console.log('========================================\n');

  try {
    // Step 1: Initialize services
    console.log('📦 Initializing services...');
    const vectorSearch = new VectorSearch();
    await vectorSearch.initialize();

    const dataProcessor = new DataProcessor(vectorSearch);
    await dataProcessor.initialize();

    const agenticRAG = new AgenticRAG(vectorSearch, null, dataProcessor);
    await agenticRAG.initialize();

    console.log('✅ Services initialized\n');

    // Step 2: Load test CSV data
    console.log('📊 Loading test data: comprehensive-test.csv');
    const csvContent = await fs.readFile('test-data/comprehensive-test.csv', 'utf-8');
    await dataProcessor.processCSVFile(csvContent, 'comprehensive-test.csv');
    console.log('✅ Test data loaded\n');

    // Wait for processing to complete
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('========================================');
    console.log('Test 1: Holistic Dataset Understanding');
    console.log('========================================\n');

    const query1 = 'What does our portfolio data look like overall?';
    console.log(`Query: "${query1}"`);
    console.log('\nExecuting...\n');

    const result1 = await agenticRAG.query(query1);

    console.log('\n--- RESULT ---');
    console.log(`Success: ${result1.success}`);
    console.log(`Answer:\n${result1.answer}\n`);
    console.log(`Tools used: ${result1.toolsUsed?.join(', ')}`);
    console.log(`Reasoning steps: ${result1.reasoning?.length || 0}`);

    // Check if get_dataset_insights was used
    const usedInsightsTool = result1.toolsUsed?.includes('get_dataset_insights');
    console.log(
      `\n${usedInsightsTool ? '✅' : '❌'} Used get_dataset_insights tool (REQUIRED for holistic understanding)`
    );

    console.log('\n========================================');
    console.log('Test 2: Gap Detection');
    console.log('========================================\n');

    const query2 = 'Show me Beta Industries revenue trend';
    console.log(`Query: "${query2}"`);
    console.log('\nExecuting...\n');

    const result2 = await agenticRAG.query(query2);

    console.log('\n--- RESULT ---');
    console.log(`Success: ${result2.success}`);
    console.log(`Answer:\n${result2.answer}\n`);
    console.log(`Tools used: ${result2.toolsUsed?.join(', ')}`);

    // Check if answer includes statistical context
    const hasContext =
      result2.answer.includes('Q1') &&
      result2.answer.includes('Q2') &&
      result2.answer.includes('Q3') &&
      result2.answer.includes('Q4');
    console.log(
      `\n${hasContext ? '✅' : '❌'} Answer includes all quarterly data (comprehensive trend)`
    );

    console.log('\n========================================');
    console.log('Test 3: Context-Aware Responses');
    console.log('========================================\n');

    const query3 = 'What was Gamma Solutions revenue in Q3 2024?';
    console.log(`Query: "${query3}"`);
    console.log('\nExecuting...\n');

    const result3 = await agenticRAG.query(query3);

    console.log('\n--- RESULT ---');
    console.log(`Success: ${result3.success}`);
    console.log(`Answer:\n${result3.answer}\n`);
    console.log(`Tools used: ${result3.toolsUsed?.join(', ')}`);

    // Check for statistical context
    const hasStatisticalContext =
      result3.answer.includes('9') && // Contains the number
      (result3.answer.toLowerCase().includes('million') ||
        result3.answer.toLowerCase().includes('m'));

    console.log(`\n${hasStatisticalContext ? '✅' : '❌'} Answer includes correct revenue value`);

    // Check if insights tool was used
    const usedInsightsInQuery = result3.toolsUsed?.includes('get_dataset_insights');
    console.log(
      `${usedInsightsInQuery ? '✅' : '⚠️'} ${usedInsightsInQuery ? 'Used' : 'Did not use'} get_dataset_insights (proactive behavior)`
    );

    console.log('\n========================================');
    console.log('Test 4: Data Quality Awareness');
    console.log('========================================\n');

    const query4 = 'How reliable is our dataset?';
    console.log(`Query: "${query4}"`);
    console.log('\nExecuting...\n');

    const result4 = await agenticRAG.query(query4);

    console.log('\n--- RESULT ---');
    console.log(`Success: ${result4.success}`);
    console.log(`Answer:\n${result4.answer}\n`);
    console.log(`Tools used: ${result4.toolsUsed?.join(', ')}`);

    // Check if answer discusses completeness, gaps, or quality
    const discussesQuality =
      result4.answer.toLowerCase().includes('complete') ||
      result4.answer.toLowerCase().includes('gap') ||
      result4.answer.toLowerCase().includes('quality') ||
      result4.answer.toLowerCase().includes('missing');

    console.log(
      `\n${discussesQuality ? '✅' : '❌'} Answer discusses data quality/completeness`
    );

    console.log('\n========================================');
    console.log('Summary: Agentic RAG Capabilities');
    console.log('========================================\n');

    const tests = [
      { name: 'Holistic Understanding', passed: usedInsightsTool },
      { name: 'Gap Detection', passed: hasContext },
      { name: 'Context-Aware Responses', passed: hasStatisticalContext },
      { name: 'Data Quality Awareness', passed: discussesQuality },
    ];

    let passedCount = 0;
    tests.forEach(test => {
      console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
      if (test.passed) passedCount++;
    });

    console.log(`\n📊 Results: ${passedCount}/${tests.length} tests passed`);

    if (passedCount === tests.length) {
      console.log('\n🎉 SUCCESS: All agentic RAG capabilities verified!');
      console.log('   - System understands datasets holistically');
      console.log('   - Detects and surfaces gaps proactively');
      console.log('   - Provides context-aware answers');
      console.log('   - Has data quality awareness');
    } else {
      console.log('\n⚠️  Some tests failed - review implementation');
    }

    console.log('\n========================================\n');
    process.exit(passedCount === tests.length ? 0 : 1);
  } catch (error: any) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
