/**
 * Quick test script to verify Reducto API and see structured output
 */

import { Reducto } from 'reductoai';
import * as fs from 'fs';
import * as path from 'path';

async function testReducto() {
  console.log('🔵 Testing Reducto API...\n');

  const apiKey = 'f6cf3dc86a1e519abe5051ec76951b11';
  const reducto = new Reducto({ apiKey });

  // Check if we have any PDF files in test-data
  const testDataDir = path.join(__dirname, 'test-data');

  if (!fs.existsSync(testDataDir)) {
    console.error('❌ test-data directory not found');
    console.log('📝 Creating sample PDF for testing...');

    // For now, let's test with a simple text to verify API works
    console.log('\n🧪 Testing Reducto API availability...');
    try {
      // Just verify the client was created
      console.log('✅ Reducto client created successfully');
      console.log('   API Key:', apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4));
      console.log('\n⚠️  Need a PDF file to test actual parsing');
      console.log('   Please add a PDF to the test-data directory');
      return;
    } catch (error: any) {
      console.error('❌ Reducto client creation failed:', error.message);
      return;
    }
  }

  // Look for PDF files
  const files = fs.readdirSync(testDataDir);
  const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));

  if (pdfFiles.length === 0) {
    console.log('⚠️  No PDF files found in test-data directory');
    console.log('   Found:', files.join(', '));
    console.log('\n✅ Reducto client initialized, but no PDFs to test');
    return;
  }

  console.log(`📄 Found ${pdfFiles.length} PDF file(s):`);
  pdfFiles.forEach(f => console.log(`   - ${f}`));
  console.log('');

  // Test with first PDF
  const pdfPath = path.join(testDataDir, pdfFiles[0]);
  const pdfBuffer = fs.readFileSync(pdfPath);

  console.log(`🔵 Parsing: ${pdfFiles[0]} (${pdfBuffer.length} bytes)`);
  console.log('   This may take 10-30 seconds...\n');

  try {
    const startTime = Date.now();

    // Step 1: Upload the file
    console.log('📤 Step 1: Uploading PDF to Reducto...');
    const upload = await reducto.upload({
      file: pdfBuffer,
      extension: 'pdf',
    });
    console.log('✅ Upload complete\n');

    // Step 2: Parse the uploaded file
    console.log('🔄 Step 2: Parsing PDF...');
    const result = await reducto.parse.run({
      input: upload,
      retrieval: {
        chunking_mode: 'page_sections',
      },
      formatting: {
        table_output_format: 'markdown',
      },
      settings: {
        ocr_system: 'standard',
      },
    });

    const duration = Date.now() - startTime;

    console.log(`✅ Reducto parsing complete! (${duration}ms)\n`);

    // Examine structure
    console.log('📊 RESPONSE STRUCTURE:');
    console.log('========================\n');

    const parseResult = result.result;

    // Basic info
    console.log('Result type:', parseResult.type);
    console.log('Number of chunks:', parseResult.chunks?.length || 0);
    console.log('');

    // Examine first chunk in detail
    if (parseResult.chunks && parseResult.chunks.length > 0) {
      const firstChunk = parseResult.chunks[0];
      console.log('📦 FIRST CHUNK STRUCTURE:');
      console.log('========================\n');
      console.log('Keys:', Object.keys(firstChunk));
      console.log('');

      console.log('Content preview:', firstChunk.content?.substring(0, 200) || 'N/A');
      console.log('');

      if (firstChunk.blocks && firstChunk.blocks.length > 0) {
        console.log(`📦 BLOCKS (${firstChunk.blocks.length} blocks in first chunk):`);
        console.log('========================\n');

        firstChunk.blocks.slice(0, 3).forEach((block: any, i: number) => {
          console.log(`Block ${i + 1}:`);
          console.log('  Type:', block.type);
          console.log('  Content:', block.content?.substring(0, 100) || 'N/A');
          if (block.metadata) {
            console.log('  Metadata keys:', Object.keys(block.metadata));
          }
          console.log('');
        });

        if (firstChunk.blocks.length > 3) {
          console.log(`... and ${firstChunk.blocks.length - 3} more blocks`);
        }
      }
    }

    // Usage stats
    if (result.usage) {
      console.log('\n💰 USAGE STATS:');
      console.log('========================\n');
      console.log('Pages:', result.usage.num_pages);
      console.log('Credits:', result.usage.credits);
    }

    // Save full output to file for inspection
    const outputPath = path.join(__dirname, 'reducto-test-output.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`\n📝 Full output saved to: ${outputPath}`);
    console.log('   Inspect this file to see complete structure');

  } catch (error: any) {
    console.error('\n❌ Reducto parsing failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Body:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testReducto().catch(console.error);
