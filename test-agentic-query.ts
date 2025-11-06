/**
 * Test script to verify Agentic RAG with LangGraph ReAct agent
 */

import { AgenticRAG } from './src/agents/agenticRAG';
import { VectorSearchService } from './src/services/vectorSearch';
import { InMemoryVectorStore } from './src/storage/inMemoryVectorStore';

async function testAgenticRAG() {
  console.log('🧪 Testing Agentic RAG with ReAct Pattern\n');
  console.log('='.repeat(60));

  try {
    // Initialize services
    const vectorStore = new InMemoryVectorStore();
    const vectorSearch = new VectorSearchService(vectorStore);

    // Add some test documents to vector store
    console.log('\n📝 Adding test documents to vector store...');
    await vectorStore.addDocuments([
      {
        id: 'doc1',
        content: 'Private equity firms typically invest in established companies with proven business models.',
        metadata: { filename: 'pe-basics.pdf', page: 1 },
        embedding: new Array(1536).fill(0),
      },
      {
        id: 'doc2',
        content: 'The average holding period for PE investments is 4-7 years.',
        metadata: { filename: 'pe-timeline.pdf', page: 2 },
        embedding: new Array(1536).fill(0),
      },
      {
        id: 'doc3',
        content: 'LBO (Leveraged Buyout) is a common PE acquisition strategy using significant debt financing.',
        metadata: { filename: 'pe-strategies.pdf', page: 5 },
        embedding: new Array(1536).fill(0),
      },
    ]);

    console.log('✅ Test documents added\n');

    // Initialize AgenticRAG
    const agenticRAG = new AgenticRAG(vectorSearch);
    await agenticRAG.initialize();

    // Test query
    const testQuestion = 'What is the typical holding period for private equity investments?';

    console.log(`\n❓ Question: "${testQuestion}"\n`);
    console.log('='.repeat(60));
    console.log('🤖 Agent starting ReAct loop...\n');

    const result = await agenticRAG.query(testQuestion);

    // Display results
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTS\n');
    console.log(`Answer: ${result.answer}\n`);
    console.log(`Reasoning:`);
    console.log(`  - Thoughts: ${result.reasoning.thoughts.length} reasoning steps`);
    console.log(`  - Tools used: ${result.reasoning.toolsUsed.join(', ')}`);
    console.log(`  - Loop count: ${result.reasoning.loopCount}`);
    console.log(`\nMetadata:`);
    console.log(`  - Duration: ${result.metadata.duration}ms`);
    console.log(`  - Model: ${result.metadata.model}`);
    console.log('\n' + '='.repeat(60));

    // Verify agentic behavior
    const usedTools = result.reasoning.toolsUsed.length > 0;
    const hasReasoningSteps = result.reasoning.thoughts.length > 0;
    const hasAnswer = result.answer.length > 0;

    console.log('\n✅ Agentic RAG Test Results:');
    console.log(`   ${usedTools ? '✅' : '❌'} Agent used tools`);
    console.log(`   ${hasReasoningSteps ? '✅' : '❌'} Agent performed reasoning`);
    console.log(`   ${hasAnswer ? '✅' : '❌'} Agent provided answer`);

    if (usedTools && hasReasoningSteps && hasAnswer) {
      console.log('\n🎉 SUCCESS: Agentic RAG with ReAct pattern is working!\n');
      process.exit(0);
    } else {
      console.log('\n⚠️  WARNING: Some agentic features may not be working correctly\n');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run test
testAgenticRAG();
