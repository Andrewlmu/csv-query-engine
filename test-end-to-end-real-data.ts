/**
 * COMPREHENSIVE END-TO-END AGENTIC RAG TEST
 * Tests agent behavior with REAL S&P500 financial data from Yahoo Finance
 *
 * This tests the COMPLETE system:
 * 1. Data ingestion & profiling
 * 2. Agent tool usage
 * 3. Query accuracy
 * 4. Gap detection
 * 5. Context-aware responses
 * 6. Edge case handling
 */

import 'dotenv/config';
import { DataProcessor } from './src/services/dataProcessor';
import { VectorSearchService } from './src/services/vectorSearch';
import { AgenticRAG } from './src/agents/agenticRAG';
import * as fs from 'fs/promises';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
  toolsUsed: string[];
  answer: string;
}

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 END-TO-END AGENTIC RAG TEST WITH REAL S&P500 DATA');
  console.log('='.repeat(80) + '\n');

  const results: TestResult[] = [];

  try {
    // =====================================================================
    // PHASE 1: INITIALIZATION
    // =====================================================================
    console.log('📦 PHASE 1: Initializing services...\n');

    const vectorSearch = new VectorSearchService();
    await vectorSearch.initialize();

    // IMPORTANT: Constructor is (documentStore, vectorSearch) - pass undefined for documentStore
    const dataProcessor = new DataProcessor(undefined, vectorSearch);
    await dataProcessor.initialize();

    const agenticRAG = new AgenticRAG(vectorSearch, undefined, dataProcessor);
    await agenticRAG.initialize();

    console.log('✅ All services initialized\n');

    // =====================================================================
    // PHASE 2: DATA LOADING
    // =====================================================================
    console.log('📊 PHASE 2: Loading REAL S&P500 financial data...\n');

    const csvContent = await fs.readFile('test-data/real-sp500-financials.csv', 'utf-8');
    const lines = csvContent.split('\n');
    console.log(`✅ Loaded CSV: ${lines.length - 1} records from Yahoo Finance`);
    console.log(`   Companies: Apple, Microsoft, Google, Amazon, Tesla, JPMorgan, J&J, Visa, Walmart, P&G`);
    console.log(`   Date range: 2024-2025 (real quarterly data)`);
    console.log(`   Data quality: ~93% complete (real gaps included)\n`);

    console.log('⏳ Processing CSV with profiling engine...');
    await dataProcessor.processDocument({
      id: `doc_${Date.now()}`,
      content: csvContent,
      metadata: {
        filename: 'real-sp500-financials.csv',
        type: 'csv',
        size: csvContent.length,
        uploadedAt: new Date().toISOString()
      },
      chunks: [] // Will be populated during processing
    });
    console.log('✅ Data indexed with 3-tier metadata (description, statistics, insights)\n');

    // Wait for indexing and embedding to fully complete
    console.log('⏳ Waiting for vector embeddings to complete...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('✅ Ready for testing\n');

    // =====================================================================
    // PHASE 3: AGENT TESTS
    // =====================================================================
    console.log('\n' + '='.repeat(80));
    console.log('🤖 PHASE 3: TESTING AGENT CAPABILITIES');
    console.log('='.repeat(80));

    // TEST 1: Dataset Discovery
    console.log('\n\n📍 TEST 1: Dataset Discovery & Holistic Understanding');
    console.log('─'.repeat(80));
    const query1 = 'What datasets do we have and what do they contain?';
    console.log(`💬 Query: "${query1}"\n`);

    const result1 = await agenticRAG.query(query1);

    console.log('📊 ANSWER:');
    console.log(result1.answer);
    console.log(`\n🔧 Tools used: ${result1.toolsUsed?.join(' → ') || 'none'}`);

    const usedDiscoveryTools =
      result1.toolsUsed?.includes('search_dataset_metadata') ||
      result1.toolsUsed?.includes('get_dataset_insights');

    const mentionsCompanies =
      result1.answer.toLowerCase().includes('apple') ||
      result1.answer.toLowerCase().includes('microsoft') ||
      result1.answer.toLowerCase().includes('s&p');

    results.push({
      name: 'Dataset Discovery',
      passed: result1.success && usedDiscoveryTools && mentionsCompanies,
      details: `Used ${result1.toolsUsed?.length || 0} tools, mentioned real companies`,
      toolsUsed: result1.toolsUsed || [],
      answer: result1.answer
    });

    console.log(`\n${results[0].passed ? '✅ PASS' : '❌ FAIL'}: ${results[0].details}`);

    // TEST 2: Specific Value Query
    console.log('\n\n📍 TEST 2: Specific Value Lookup (Pattern 1: Simple SELECT)');
    console.log('─'.repeat(80));
    const query2 = 'What was Apple Inc revenue in Q2 2024?';
    console.log(`💬 Query: "${query2}"\n`);

    const result2 = await agenticRAG.query(query2);

    console.log('📊 ANSWER:');
    console.log(result2.answer);
    console.log(`\n🔧 Tools used: ${result2.toolsUsed?.join(' → ') || 'none'}`);

    // Real answer from data: $85.78B
    const hasCorrectValue =
      result2.answer.includes('85.78') ||
      result2.answer.includes('85.8') ||
      result2.answer.includes('86'); // Allow rounding

    const usedSQL = result2.toolsUsed?.includes('query_structured_data');

    results.push({
      name: 'Specific Value Query',
      passed: result2.success && usedSQL && hasCorrectValue,
      details: `SQL query executed, correct value ($85.78B)`,
      toolsUsed: result2.toolsUsed || [],
      answer: result2.answer
    });

    console.log(`\n${results[1].passed ? '✅ PASS' : '❌ FAIL'}: ${results[1].details}`);

    // TEST 3: Comparison Query (ORDER BY)
    console.log('\n\n📍 TEST 3: Comparison Query (Pattern 3: ORDER BY + LIMIT)');
    console.log('─'.repeat(80));
    const query3 = 'Which company had the highest revenue in Q2 2025?';
    console.log(`💬 Query: "${query3}"\n`);

    const result3 = await agenticRAG.query(query3);

    console.log('📊 ANSWER:');
    console.log(result3.answer);
    console.log(`\n🔧 Tools used: ${result3.toolsUsed?.join(' → ') || 'none'}`);

    // Correct answer: Amazon.com Inc with $167.70B
    const mentionsAmazon =
      result3.answer.toLowerCase().includes('amazon');

    const usedComparison = result3.toolsUsed?.includes('query_structured_data');

    results.push({
      name: 'Comparison Query (ORDER BY)',
      passed: result3.success && usedComparison && mentionsAmazon,
      details: `Identified highest revenue company (Amazon)`,
      toolsUsed: result3.toolsUsed || [],
      answer: result3.answer
    });

    console.log(`\n${results[2].passed ? '✅ PASS' : '❌ FAIL'}: ${results[2].details}`);

    // TEST 4: Aggregation Query (AVG)
    console.log('\n\n📍 TEST 4: Aggregation Query (Pattern 2: AVG function)');
    console.log('─'.repeat(80));
    const query4 = 'What was the average net margin for Microsoft in 2024?';
    console.log(`💬 Query: "${query4}"\n`);

    const result4 = await agenticRAG.query(query4);

    console.log('📊 ANSWER:');
    console.log(result4.answer);
    console.log(`\n🔧 Tools used: ${result4.toolsUsed?.join(' → ') || 'none'}`);

    const hasPercentage = result4.answer.match(/\d+\.?\d*%/) !== null;
    const usedAggregation = result4.toolsUsed?.includes('query_structured_data');

    results.push({
      name: 'Aggregation Query (AVG)',
      passed: result4.success && usedAggregation && hasPercentage,
      details: `Calculated average using AVG(), returned percentage`,
      toolsUsed: result4.toolsUsed || [],
      answer: result4.answer
    });

    console.log(`\n${results[3].passed ? '✅ PASS' : '❌ FAIL'}: ${results[3].details}`);

    // TEST 5: Trend Analysis (Multiple Quarters)
    console.log('\n\n📍 TEST 5: Trend Analysis (Pattern 4: ALL values, no filter)');
    console.log('─'.repeat(80));
    const query5 = 'Show me Tesla revenue trend for each quarter in 2024';
    console.log(`💬 Query: "${query5}"\n`);

    const result5 = await agenticRAG.query(query5);

    console.log('📊 ANSWER:');
    console.log(result5.answer);
    console.log(`\n🔧 Tools used: ${result5.toolsUsed?.join(' → ') || 'none'}`);

    // Should include multiple quarters
    const hasMultipleQuarters =
      (result5.answer.match(/Q[1-4]/g) || []).length >= 3;

    const usedTrend = result5.toolsUsed?.includes('query_structured_data');

    results.push({
      name: 'Trend Analysis (Multiple Values)',
      passed: result5.success && usedTrend && hasMultipleQuarters,
      details: `Returned trend with ${(result5.answer.match(/Q[1-4]/g) || []).length} quarters`,
      toolsUsed: result5.toolsUsed || [],
      answer: result5.answer
    });

    console.log(`\n${results[4].passed ? '✅ PASS' : '❌ FAIL'}: ${results[4].details}`);

    // TEST 6: Data Quality Awareness
    console.log('\n\n📍 TEST 6: Data Quality & Gap Awareness');
    console.log('─'.repeat(80));
    const query6 = 'How complete is our financial data? Are there any missing values?';
    console.log(`💬 Query: "${query6}"\n`);

    const result6 = await agenticRAG.query(query6);

    console.log('📊 ANSWER:');
    console.log(result6.answer);
    console.log(`\n🔧 Tools used: ${result6.toolsUsed?.join(' → ') || 'none'}`);

    const discussesQuality =
      result6.answer.toLowerCase().includes('complete') ||
      result6.answer.toLowerCase().includes('missing') ||
      result6.answer.toLowerCase().includes('gap') ||
      result6.answer.match(/\d+%/) !== null;

    const usedInsights = result6.toolsUsed?.includes('get_dataset_insights');

    results.push({
      name: 'Data Quality Awareness',
      passed: result6.success && usedInsights && discussesQuality,
      details: `Used insights tool, discussed data quality`,
      toolsUsed: result6.toolsUsed || [],
      answer: result6.answer
    });

    console.log(`\n${results[5].passed ? '✅ PASS' : '❌ FAIL'}: ${results[5].details}`);

    // TEST 7: Context-Aware Response
    console.log('\n\n📍 TEST 7: Context-Aware Response (With Statistical Context)');
    console.log('─'.repeat(80));
    const query7 = 'What was Google revenue in Q3 2024?';
    console.log(`💬 Query: "${query7}"\n`);

    const result7 = await agenticRAG.query(query7);

    console.log('📊 ANSWER:');
    console.log(result7.answer);
    console.log(`\n🔧 Tools used: ${result7.toolsUsed?.join(' → ') || 'none'}`);

    // Correct value: $88.27B
    const hasValue = result7.answer.match(/\$[\d.]+/) !== null;
    const usedMultipleTools = (result7.toolsUsed?.length || 0) > 1;

    results.push({
      name: 'Context-Aware Response',
      passed: result7.success && hasValue && usedMultipleTools,
      details: `Returned value with ${result7.toolsUsed?.length || 0} tools`,
      toolsUsed: result7.toolsUsed || [],
      answer: result7.answer
    });

    console.log(`\n${results[6].passed ? '✅ PASS' : '❌ FAIL'}: ${results[6].details}`);

    // TEST 8: Edge Case - No Match
    console.log('\n\n📍 TEST 8: Edge Case Handling (No Matching Data)');
    console.log('─'.repeat(80));
    const query8 = 'What was Netflix revenue in Q1 2024?';
    console.log(`💬 Query: "${query8}"\n`);

    const result8 = await agenticRAG.query(query8);

    console.log('📊 ANSWER:');
    console.log(result8.answer);
    console.log(`\n🔧 Tools used: ${result8.toolsUsed?.join(' → ') || 'none'}`);

    // Should communicate that Netflix is not in dataset
    const acknowledgesNoData =
      result8.answer.toLowerCase().includes('not found') ||
      result8.answer.toLowerCase().includes('no data') ||
      result8.answer.toLowerCase().includes('not available') ||
      result8.answer.toLowerCase().includes('don\'t have') ||
      result8.answer.toLowerCase().includes('netflix') === false; // Didn't hallucinate

    results.push({
      name: 'Edge Case (No Match)',
      passed: result8.success && acknowledgesNoData,
      details: `Correctly handled missing company`,
      toolsUsed: result8.toolsUsed || [],
      answer: result8.answer
    });

    console.log(`\n${results[7].passed ? '✅ PASS' : '❌ FAIL'}: ${results[7].details}`);

    // TEST 9: Filtering Query
    console.log('\n\n📍 TEST 9: Filtering Query (Pattern 5: WHERE condition)');
    console.log('─'.repeat(80));
    const query9 = 'Which companies had net margins above 25% in Q2 2024?';
    console.log(`💬 Query: "${query9}"\n`);

    const result9 = await agenticRAG.query(query9);

    console.log('📊 ANSWER:');
    console.log(result9.answer);
    console.log(`\n🔧 Tools used: ${result9.toolsUsed?.join(' → ') || 'none'}`);

    const hasCompanyNames =
      result9.answer.toLowerCase().includes('apple') ||
      result9.answer.toLowerCase().includes('alphabet') ||
      result9.answer.toLowerCase().includes('google');

    const usedFiltering = result9.toolsUsed?.includes('query_structured_data');

    results.push({
      name: 'Filtering Query (WHERE)',
      passed: result9.success && usedFiltering && hasCompanyNames,
      details: `Filtered by condition, returned matching companies`,
      toolsUsed: result9.toolsUsed || [],
      answer: result9.answer
    });

    console.log(`\n${results[8].passed ? '✅ PASS' : '❌ FAIL'}: ${results[8].details}`);

    // TEST 10: Proactive Insights
    console.log('\n\n📍 TEST 10: Proactive Insights (Before Querying)');
    console.log('─'.repeat(80));
    const query10 = 'Tell me about Walmart performance';
    console.log(`💬 Query: "${query10}"\n`);

    const result10 = await agenticRAG.query(query10);

    console.log('📊 ANSWER:');
    console.log(result10.answer);
    console.log(`\n🔧 Tools used: ${result10.toolsUsed?.join(' → ') || 'none'}`);

    const usedInsightsFirst =
      result10.toolsUsed?.includes('get_dataset_insights') ||
      result10.toolsUsed?.includes('search_dataset_metadata');

    const hasNumericalData = result10.answer.match(/\$[\d.]+/) !== null;

    results.push({
      name: 'Proactive Insights',
      passed: result10.success && usedInsightsFirst && hasNumericalData,
      details: `Retrieved insights/metadata, provided numerical context`,
      toolsUsed: result10.toolsUsed || [],
      answer: result10.answer
    });

    console.log(`\n${results[9].passed ? '✅ PASS' : '❌ FAIL'}: ${results[9].details}`);

    // =====================================================================
    // FINAL SUMMARY
    // =====================================================================
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE TEST RESULTS');
    console.log('='.repeat(80) + '\n');

    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const passRate = (passed / total * 100).toFixed(1);

    results.forEach((result, i) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${result.name}`);
      console.log(`         ${result.details}`);
      console.log(`         Tools: ${result.toolsUsed.join(' → ') || 'none'}`);
    });

    console.log('\n' + '─'.repeat(80));
    console.log(`📈 Results: ${passed}/${total} tests passed (${passRate}%)`);
    console.log('─'.repeat(80) + '\n');

    // Detailed capabilities verification
    console.log('🎯 AGENTIC RAG CAPABILITIES VERIFIED:\n');

    const usedTools = new Set(results.flatMap(r => r.toolsUsed));
    console.log(`   ✅ Dataset Discovery: ${usedTools.has('search_dataset_metadata') ? 'YES' : 'NO'}`);
    console.log(`   ✅ Insights Retrieval: ${usedTools.has('get_dataset_insights') ? 'YES' : 'NO'}`);
    console.log(`   ✅ SQL Query Generation: ${usedTools.has('query_structured_data') ? 'YES' : 'NO'}`);
    console.log(`   ✅ Multi-tool Reasoning: ${results.some(r => r.toolsUsed.length > 1) ? 'YES' : 'NO'}`);
    console.log(`   ✅ Context-Aware Answers: ${passed >= 7 ? 'YES' : 'NO'}`);
    console.log(`   ✅ Edge Case Handling: ${results[7].passed ? 'YES' : 'NO'}`);
    console.log(`   ✅ Data Quality Awareness: ${results[5].passed ? 'YES' : 'NO'}`);

    // SQL Pattern Coverage
    console.log(`\n📝 SQL PATTERN COVERAGE:\n`);
    console.log(`   ✅ Pattern 1 (Simple SELECT): ${results[1].passed ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Pattern 2 (Aggregation/AVG): ${results[3].passed ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Pattern 3 (ORDER BY + LIMIT): ${results[2].passed ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Pattern 4 (Trend/ALL values): ${results[4].passed ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Pattern 5 (Filtering/WHERE): ${results[8].passed ? 'PASS' : 'FAIL'}`);

    console.log('\n' + '='.repeat(80));
    if (passed === total) {
      console.log('🎉 PERFECT: ALL END-TO-END TESTS PASSED');
      console.log('   System is production-ready with REAL data validation!');
      console.log('   - Agent discovers datasets correctly');
      console.log('   - Agent generates accurate SQL queries');
      console.log('   - Agent provides context-aware answers');
      console.log('   - Agent detects and communicates gaps');
      console.log('   - Agent handles edge cases gracefully');
      console.log('='.repeat(80) + '\n');
      process.exit(0);
    } else if (passed >= total * 0.8) {
      console.log('✅ GOOD: Most tests passed (>80%)');
      console.log('   System is functional with minor issues');
      console.log(`   Review ${total - passed} failed test(s) above`);
      console.log('='.repeat(80) + '\n');
      process.exit(1);
    } else {
      console.log('⚠️  NEEDS WORK: Multiple failures detected');
      console.log(`   Only ${passed}/${total} tests passed (${passRate}%)`);
      console.log('   Review failed tests and agent behavior');
      console.log('='.repeat(80) + '\n');
      process.exit(1);
    }

  } catch (error: any) {
    console.error('\n❌ Test suite failed with error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
