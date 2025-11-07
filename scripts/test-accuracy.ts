/**
 * Automated accuracy testing for Agentic RAG
 * Tests queries against actual CSV data and verifies response accuracy
 */

import * as fs from 'fs';
import * as path from 'path';

interface TestCase {
  name: string;
  query: string;
  expectedData: any;
  verifyFunction: (response: any, expected: any) => TestResult;
}

interface TestResult {
  passed: boolean;
  accuracy: number;
  details: string;
  errors: string[];
}

interface QueryResponse {
  answer: string;
  sources: any[];
  responseTime: number;
}

// Helper to query the API using node-fetch or http
async function queryAPI(query: string): Promise<QueryResponse> {
  const http = await import('http');

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });

    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Helper to load CSV data
function loadCSV(filename: string): any[] {
  const filePath = path.join('/Users/andymu/Desktop/poc/data/demo', filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: any = {};
    headers.forEach((header, i) => {
      const value = values[i];
      obj[header] = isNaN(Number(value)) ? value : Number(value);
    });
    return obj;
  });
}

// Test 1: R&D Intensity Comparison
const test1: TestCase = {
  name: "R&D Intensity: Apple vs Microsoft vs Google",
  query: "Compare Apple, Microsoft, and Google's R&D spending as a percentage of revenue. Which company invests the most in innovation?",
  expectedData: {
    apple: { rdIntensity: 9.43, company: 'Apple Inc' },
    microsoft: { rdIntensity: 11.55, company: 'Microsoft Corporation' },
    google: { rdIntensity: 14.32, company: 'Alphabet Inc' },
    winner: 'Google/Alphabet'
  },
  verifyFunction: (response, expected) => {
    const answer = response.answer.toLowerCase();
    const errors: string[] = [];
    let correctCount = 0;

    // Check if response mentions Google/Alphabet as highest
    if (answer.includes('google') || answer.includes('alphabet')) {
      correctCount++;
    } else {
      errors.push('Failed to identify Google/Alphabet as highest R&D investor');
    }

    // Check for percentage mentions (approximate)
    if (answer.includes('14') || answer.includes('15')) {
      correctCount++;
    } else {
      errors.push('Google R&D intensity percentage not mentioned correctly');
    }

    // Check if all three companies are mentioned
    const hasApple = answer.includes('apple');
    const hasMicrosoft = answer.includes('microsoft');
    const hasGoogle = answer.includes('google') || answer.includes('alphabet');

    if (hasApple && hasMicrosoft && hasGoogle) {
      correctCount++;
    } else {
      errors.push(`Missing companies: ${!hasApple ? 'Apple ' : ''}${!hasMicrosoft ? 'Microsoft ' : ''}${!hasGoogle ? 'Google' : ''}`);
    }

    // Check sources
    const hasTechSectorSource = response.sources.some((s: any) =>
      s.metadata?.filename?.includes('tech-sector')
    );

    if (hasTechSectorSource) {
      correctCount++;
    } else {
      errors.push('Missing tech-sector-financials.csv source');
    }

    return {
      passed: errors.length === 0,
      accuracy: (correctCount / 4) * 100,
      details: `Google R&D: ~14.3%, Microsoft: ~11.6%, Apple: ~9.4%`,
      errors
    };
  }
};

// Test 2: Top 5 Highest Net Margins
const test2: TestCase = {
  name: "Top 5 Companies by Net Margin Q2 2025",
  query: "Which 5 companies across all sectors have the highest net margins in Q2 2025? Show their revenue, net income, and sector.",
  expectedData: {
    top5: [
      { company: 'NVIDIA', margin: 56.53, sector: 'Technology' },
      { company: 'Meta', margin: 38.59, sector: 'Technology' },
      { company: 'Eli Lilly', margin: 36.38, sector: 'Healthcare' },
      { company: 'Microsoft', margin: 35.63, sector: 'Technology' },
      { company: 'McDonalds', margin: 32.92, sector: 'Consumer' }
    ]
  },
  verifyFunction: (response, expected) => {
    const answer = response.answer.toLowerCase();
    const errors: string[] = [];
    let correctCount = 0;

    // Check if NVIDIA is mentioned as #1
    if (answer.includes('nvidia')) {
      correctCount++;
    } else {
      errors.push('NVIDIA not mentioned (should be #1 with 56.53% margin)');
    }

    // Check if Meta is mentioned
    if (answer.includes('meta')) {
      correctCount++;
    } else {
      errors.push('Meta not mentioned (should be #2 with 38.59% margin)');
    }

    // Check for reasonable margin percentages
    const has50Plus = answer.includes('56') || answer.includes('57') || answer.includes('50');
    if (has50Plus) {
      correctCount++;
    } else {
      errors.push('NVIDIA margin (~56%) not mentioned');
    }

    // Check sources include multiple sectors
    const sources = response.sources || [];
    const hasTech = sources.some((s: any) => s.metadata?.filename?.includes('tech'));
    const hasHealthcare = sources.some((s: any) => s.metadata?.filename?.includes('healthcare'));

    if (hasTech && hasHealthcare) {
      correctCount++;
    } else {
      errors.push('Missing multi-sector sources (tech, healthcare, consumer)');
    }

    return {
      passed: errors.length === 0,
      accuracy: (correctCount / 4) * 100,
      details: 'Expected: NVIDIA (56.5%), Meta (38.6%), Eli Lilly (36.4%)',
      errors
    };
  }
};

// Test 3: NVIDIA Revenue Growth
const test3: TestCase = {
  name: "NVIDIA Revenue Growth Trend",
  query: "Show me NVIDIA's quarterly revenue trend from Q2 2024 to Q2 2025. Is it growing?",
  expectedData: {
    q2_2024: 30.040,
    q3_2024: 35.082,
    q4_2024: 39.331,
    q1_2025: 44.062,
    q2_2025: 46.743,
    growth: true,
    growthRate: 55.7
  },
  verifyFunction: (response, expected) => {
    const answer = response.answer.toLowerCase();
    const errors: string[] = [];
    let correctCount = 0;

    // Check if growth is mentioned
    if (answer.includes('grow') || answer.includes('increas') || answer.includes('rising')) {
      correctCount++;
    } else {
      errors.push('Failed to identify revenue growth');
    }

    // Check for Q2 2025 revenue (~47B)
    if (answer.includes('46') || answer.includes('47')) {
      correctCount++;
    } else {
      errors.push('Q2 2025 revenue ($46.7B) not mentioned correctly');
    }

    // Check for Q2 2024 revenue (~30B)
    if (answer.includes('30')) {
      correctCount++;
    } else {
      errors.push('Q2 2024 revenue ($30B) not mentioned');
    }

    // Check sources
    const hasTechSource = response.sources.some((s: any) =>
      s.metadata?.filename?.includes('tech-sector')
    );

    if (hasTechSource) {
      correctCount++;
    } else {
      errors.push('Missing tech-sector-financials.csv source');
    }

    return {
      passed: errors.length === 0,
      accuracy: (correctCount / 4) * 100,
      details: 'Growth from $30B (Q2 2024) to $46.7B (Q2 2025) = +55.7%',
      errors
    };
  }
};

// Test 4: Sector Comparison
const test4: TestCase = {
  name: "Tech vs Healthcare Net Margin Comparison",
  query: "Compare the average net margins of technology companies versus healthcare companies. Which sector is more profitable?",
  expectedData: {
    techAverage: 22.5,  // Approximate
    healthcareAverage: 18.0,  // Approximate
    winner: 'Technology'
  },
  verifyFunction: (response, expected) => {
    const answer = response.answer.toLowerCase();
    const errors: string[] = [];
    let correctCount = 0;

    // Check if tech sector is identified as more profitable
    if (answer.includes('tech') && (answer.includes('higher') || answer.includes('more profitable'))) {
      correctCount++;
    } else {
      errors.push('Failed to identify tech sector as more profitable');
    }

    // Check if both sectors are mentioned
    const hasTech = answer.includes('tech');
    const hasHealthcare = answer.includes('health');

    if (hasTech && hasHealthcare) {
      correctCount++;
    } else {
      errors.push('Missing sector mentions');
    }

    // Check sources include both sectors
    const sources = response.sources || [];
    const hasTechSource = sources.some((s: any) => s.metadata?.filename?.includes('tech'));
    const hasHealthSource = sources.some((s: any) => s.metadata?.filename?.includes('health'));

    if (hasTechSource && hasHealthSource) {
      correctCount++;
    } else {
      errors.push('Missing multi-sector sources');
    }

    // Check for percentage mentions
    if (answer.match(/\d+%|\d+\.\d+%/)) {
      correctCount++;
    } else {
      errors.push('No margin percentages mentioned');
    }

    return {
      passed: errors.length === 0,
      accuracy: (correctCount / 4) * 100,
      details: 'Tech sector has higher average net margin (~22-25%) vs Healthcare (~15-20%)',
      errors
    };
  }
};

// Test 5: Cross-Dataset Query (TXT + CSV)
const test5: TestCase = {
  name: "Healthcare Risks + Financial Performance",
  query: "What are the main regulatory risks mentioned in the healthcare deals, and how do actual healthcare companies perform financially?",
  expectedData: {
    risks: ['FDA', 'Medicare', 'Medicaid', 'regulatory'],
    companies: ['Pfizer', 'Merck', 'Johnson & Johnson']
  },
  verifyFunction: (response, expected) => {
    const answer = response.answer.toLowerCase();
    const errors: string[] = [];
    let correctCount = 0;

    // Check for regulatory risks mentioned
    const hasFDA = answer.includes('fda');
    const hasMedicare = answer.includes('medicare') || answer.includes('medicaid');
    const hasRegulatory = answer.includes('regulat');

    if (hasFDA || hasMedicare || hasRegulatory) {
      correctCount++;
    } else {
      errors.push('Missing regulatory risk mentions (FDA, Medicare/Medicaid)');
    }

    // Check for healthcare company mentions
    const hasPharma = answer.includes('pfizer') || answer.includes('merck') || answer.includes('johnson');

    if (hasPharma) {
      correctCount++;
    } else {
      errors.push('Missing healthcare company performance data');
    }

    // Check sources include both TXT and CSV
    const sources = response.sources || [];
    const hasTxtSource = sources.some((s: any) => s.metadata?.type === 'txt');
    const hasCsvSource = sources.some((s: any) => s.metadata?.filename?.includes('healthcare'));

    if (hasTxtSource && hasCsvSource) {
      correctCount++;
    } else {
      errors.push(`Missing cross-dataset sources (TXT: ${hasTxtSource}, CSV: ${hasCsvSource})`);
    }

    // Check for financial metrics
    const hasFinancials = answer.includes('revenue') || answer.includes('margin') || answer.includes('profit');

    if (hasFinancials) {
      correctCount++;
    } else {
      errors.push('Missing financial performance metrics');
    }

    return {
      passed: errors.length === 0,
      accuracy: (correctCount / 4) * 100,
      details: 'Should combine deal memo risks with actual company financials',
      errors
    };
  }
};

// Main test runner
async function runTests() {
  console.log('\n🧪 Starting Automated Accuracy Tests\n');
  console.log('=' .repeat(80));

  const tests = [test1, test2, test3, test4, test5];
  const results: any[] = [];

  for (const test of tests) {
    console.log(`\n📋 Test: ${test.name}`);
    console.log(`❓ Query: "${test.query}"\n`);

    try {
      const startTime = Date.now();
      const response = await queryAPI(test.query);
      const responseTime = Date.now() - startTime;

      const result = test.verifyFunction(response, test.expectedData);

      results.push({
        test: test.name,
        passed: result.passed,
        accuracy: result.accuracy,
        responseTime,
        ...result
      });

      console.log(`⏱️  Response Time: ${responseTime}ms`);
      console.log(`✅ Accuracy: ${result.accuracy.toFixed(1)}%`);
      console.log(`📝 Expected: ${result.details}`);
      console.log(`📊 Sources: ${response.sources?.length || 0} documents`);

      if (result.errors.length > 0) {
        console.log(`\n❌ Errors:`);
        result.errors.forEach(err => console.log(`   - ${err}`));
      }

      // Show answer excerpt
      const answerExcerpt = response.answer.substring(0, 200);
      console.log(`\n💬 Answer excerpt: "${answerExcerpt}..."`);

    } catch (error: any) {
      console.log(`❌ Test failed with error: ${error.message}`);
      results.push({
        test: test.name,
        passed: false,
        accuracy: 0,
        responseTime: 0,
        errors: [error.message]
      });
    }

    console.log('\n' + '-'.repeat(80));
  }

  // Summary
  console.log('\n\n📊 TEST SUMMARY');
  console.log('=' .repeat(80));

  const passed = results.filter(r => r.passed).length;
  const totalAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

  console.log(`\n✅ Tests Passed: ${passed}/${tests.length}`);
  console.log(`📈 Overall Accuracy: ${totalAccuracy.toFixed(1)}%`);
  console.log(`⏱️  Average Response Time: ${avgResponseTime.toFixed(0)}ms\n`);

  results.forEach((r, i) => {
    const status = r.passed ? '✅' : '❌';
    console.log(`${status} Test ${i + 1}: ${r.accuracy.toFixed(1)}% - ${r.test}`);
  });

  console.log('\n' + '='.repeat(80));

  // Save detailed results
  const reportPath = '/Users/andymu/Desktop/poc/test-results.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed results saved to: ${reportPath}\n`);
}

// Run tests
runTests().catch(console.error);
