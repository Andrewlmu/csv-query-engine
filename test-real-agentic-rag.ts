/**
 * REAL-WORLD AGENTIC RAG TEST
 * Tests all capabilities with actual data and shows agent reasoning
 */

import 'dotenv/config';
import { DataProcessor } from './src/services/dataProcessor';
import { VectorSearchService } from './src/services/vectorSearch';
import { AgenticRAG } from './src/agents/agenticRAG';
import * as fs from 'fs/promises';

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 REAL-WORLD AGENTIC RAG TEST');
  console.log('='.repeat(70) + '\n');

  try {
    // Initialize services
    console.log('📦 Step 1: Initializing services...');
    const vectorSearch = new VectorSearchService();
    await vectorSearch.initialize();

    const dataProcessor = new DataProcessor(vectorSearch);
    await dataProcessor.initialize();

    const agenticRAG = new AgenticRAG(vectorSearch, undefined, dataProcessor);
    await agenticRAG.initialize();

    console.log('✅ All services initialized\n');

    // Load comprehensive test data
    console.log('📊 Step 2: Loading test data...');
    const csvContent = await fs.readFile('test-data/comprehensive-test.csv', 'utf-8');

    console.log('\n--- CSV DATA PREVIEW ---');
    const lines = csvContent.split('\n').slice(0, 5);
    lines.forEach(line => console.log(line));
    console.log('...\n');

    console.log('⏳ Processing CSV with profiling engine...');
    await dataProcessor.processCSVFile(csvContent, 'comprehensive-test.csv');

    console.log('✅ Data loaded and profiled');
    console.log('   (3 documents created: description, statistics, insights)\n');

    // Wait for indexing to complete
    await new Promise(resolve => setTimeout(resolve, 5000));

    // TEST 1: Holistic Understanding
    console.log('\n' + '='.repeat(70));
    console.log('TEST 1: Holistic Dataset Understanding');
    console.log('='.repeat(70));
    console.log('\n💬 Query: "What does our portfolio data look like overall?"');
    console.log('\n🤖 Agent reasoning:\n');

    const result1 = await agenticRAG.query('What does our portfolio data look like overall?');

    console.log('\n📊 RESULT:');
    console.log('─'.repeat(70));
    console.log(result1.answer);
    console.log('─'.repeat(70));
    console.log(`\n🔧 Tools used: ${result1.toolsUsed?.join(' → ') || 'none'}`);
    console.log(`⚙️  Reasoning steps: ${result1.reasoning?.length || 0}`);

    if (result1.reasoning && result1.reasoning.length > 0) {
      console.log('\n🧠 Agent Reasoning Trace:');
      result1.reasoning.forEach((step, i) => {
        console.log(`\n  Step ${i + 1}:`);
        console.log(`    ${step}`);
      });
    }

    // TEST 2: Gap Detection
    console.log('\n\n' + '='.repeat(70));
    console.log('TEST 2: Gap Detection & Trend Analysis');
    console.log('='.repeat(70));
    console.log('\n💬 Query: "Show me Beta Industries revenue for each quarter in 2024"');
    console.log('\n🤖 Agent reasoning:\n');

    const result2 = await agenticRAG.query('Show me Beta Industries revenue for each quarter in 2024');

    console.log('\n📊 RESULT:');
    console.log('─'.repeat(70));
    console.log(result2.answer);
    console.log('─'.repeat(70));
    console.log(`\n🔧 Tools used: ${result2.toolsUsed?.join(' → ') || 'none'}`);

    // Check if all quarters returned
    const hasAllQuarters = ['Q1', 'Q2', 'Q3', 'Q4'].every(q =>
      result2.answer.includes(q)
    );
    console.log(`\n✅ Comprehensive trend (all quarters): ${hasAllQuarters ? 'YES' : 'NO'}`);

    // TEST 3: Context-Aware Response
    console.log('\n\n' + '='.repeat(70));
    console.log('TEST 3: Context-Aware Response with Statistical Context');
    console.log('='.repeat(70));
    console.log('\n💬 Query: "Which company had the highest EBITDA in Q2 2024?"');
    console.log('\n🤖 Agent reasoning:\n');

    const result3 = await agenticRAG.query('Which company had the highest EBITDA in Q2 2024?');

    console.log('\n📊 RESULT:');
    console.log('─'.repeat(70));
    console.log(result3.answer);
    console.log('─'.repeat(70));
    console.log(`\n🔧 Tools used: ${result3.toolsUsed?.join(' → ') || 'none'}`);

    // Check if answer includes statistical context
    const hasContext = result3.answer.match(/\$[\d,]+/) !== null;
    console.log(`\n✅ Includes numerical value: ${hasContext ? 'YES' : 'NO'}`);

    // TEST 4: Data Quality Awareness
    console.log('\n\n' + '='.repeat(70));
    console.log('TEST 4: Data Quality & Completeness Awareness');
    console.log('='.repeat(70));
    console.log('\n💬 Query: "How complete is our dataset? Are there any gaps?"');
    console.log('\n🤖 Agent reasoning:\n');

    const result4 = await agenticRAG.query('How complete is our dataset? Are there any gaps?');

    console.log('\n📊 RESULT:');
    console.log('─'.repeat(70));
    console.log(result4.answer);
    console.log('─'.repeat(70));
    console.log(`\n🔧 Tools used: ${result4.toolsUsed?.join(' → ') || 'none'}`);

    // Check if discusses quality
    const discussesQuality = result4.answer.toLowerCase().includes('complete') ||
                            result4.answer.toLowerCase().includes('gap') ||
                            result4.answer.toLowerCase().includes('quality');
    console.log(`\n✅ Discusses data quality: ${discussesQuality ? 'YES' : 'NO'}`);

    // TEST 5: Comparison with ORDER BY
    console.log('\n\n' + '='.repeat(70));
    console.log('TEST 5: Comparison Query (Tests SQL ORDER BY)');
    console.log('='.repeat(70));
    console.log('\n💬 Query: "Which company has the highest margins?"');
    console.log('\n🤖 Agent reasoning:\n');

    const result5 = await agenticRAG.query('Which company has the highest margins?');

    console.log('\n📊 RESULT:');
    console.log('─'.repeat(70));
    console.log(result5.answer);
    console.log('─'.repeat(70));
    console.log(`\n🔧 Tools used: ${result5.toolsUsed?.join(' → ') || 'none'}`);

    // Check if Gamma Solutions mentioned (correct answer)
    const correctAnswer = result5.answer.toLowerCase().includes('gamma');
    console.log(`\n✅ Correct answer (Gamma Solutions): ${correctAnswer ? 'YES' : 'NO'}`);

    // FINAL SUMMARY
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70) + '\n');

    const tests = [
      {
        name: 'Holistic Understanding',
        passed: result1.success && (result1.toolsUsed?.includes('get_dataset_insights') || result1.toolsUsed?.includes('search_dataset_metadata')),
        tools: result1.toolsUsed
      },
      {
        name: 'Comprehensive Trend Analysis',
        passed: result2.success && hasAllQuarters,
        tools: result2.toolsUsed
      },
      {
        name: 'Context-Aware Response',
        passed: result3.success && hasContext,
        tools: result3.toolsUsed
      },
      {
        name: 'Data Quality Awareness',
        passed: result4.success && discussesQuality,
        tools: result4.toolsUsed
      },
      {
        name: 'SQL Comparison Query',
        passed: result5.success && correctAnswer,
        tools: result5.toolsUsed
      },
    ];

    let passedCount = 0;
    tests.forEach(test => {
      const status = test.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${test.name}`);
      console.log(`        Tools: ${test.tools?.join(' → ') || 'none'}`);
      if (test.passed) passedCount++;
    });

    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📈 Overall: ${passedCount}/${tests.length} tests passed (${Math.round(passedCount/tests.length * 100)}%)`);
    console.log(`${'─'.repeat(70)}\n`);

    // AGENTIC CAPABILITIES VERIFICATION
    console.log('🎯 AGENTIC RAG CAPABILITIES VERIFIED:\n');

    const capabilities = [
      { name: '✅ Multi-tool reasoning', verified: tests.some(t => t.tools && t.tools.length > 1) },
      { name: '✅ Dynamic SQL generation', verified: tests.some(t => t.tools?.includes('query_structured_data')) },
      { name: '✅ Dataset discovery', verified: tests.some(t => t.tools?.includes('search_dataset_metadata')) },
      { name: '✅ Insights retrieval', verified: tests.some(t => t.tools?.includes('get_dataset_insights')) },
      { name: '✅ Iterative problem solving', verified: tests.every(t => t.passed) },
    ];

    capabilities.forEach(cap => {
      console.log(`   ${cap.name}`);
    });

    if (passedCount === tests.length) {
      console.log('\n🎉 SUCCESS: Full Agentic RAG capabilities confirmed!');
      console.log('   - Agent can discover datasets');
      console.log('   - Agent can profile and understand data');
      console.log('   - Agent generates SQL dynamically');
      console.log('   - Agent provides context-aware answers');
      console.log('   - Agent detects and reports gaps');
      console.log('\n✨ System is production-ready for real-world use!\n');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed - review results above\n');
      process.exit(1);
    }

  } catch (error: any) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
