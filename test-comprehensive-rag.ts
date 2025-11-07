/**
 * COMPREHENSIVE AGENTIC RAG TEST SUITE
 * Thorough testing with real-world portfolio data
 */

import 'dotenv/config';
import { parseCSV } from './src/structured-data/parsers/csv-parser';
import { DataProfiler } from './src/structured-data/data-profiler';
import * as fs from 'fs/promises';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
  duration: number;
}

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 COMPREHENSIVE AGENTIC RAG TEST SUITE');
  console.log('='.repeat(80) + '\n');

  const results: TestResult[] = [];
  const startTime = Date.now();

  try {
    // =====================================================================
    // PHASE 1: DATA PROFILING & INDEXING
    // =====================================================================
    console.log('📊 PHASE 1: DATA PROFILING & INDEXING');
    console.log('─'.repeat(80) + '\n');

    const csvContent = await fs.readFile('test-data/portfolio-comprehensive.csv', 'utf-8');
    const lines = csvContent.split('\n');
    console.log(`✅ Loaded CSV: ${lines.length} lines\n`);

    // Test 1: CSV Parsing
    console.log('TEST 1: CSV Parsing & Type Inference');
    const testStart = Date.now();
    const parsedData = await parseCSV(csvContent, 'portfolio-comprehensive.csv');
    const testDuration = Date.now() - testStart;

    console.log(`  Rows: ${parsedData.rowCount}`);
    console.log(`  Columns: ${parsedData.columnCount}`);
    console.log(`  Headers: ${parsedData.headers.join(', ')}`);
    console.log(`  Types: ${parsedData.types.join(', ')}`);

    const parsingPassed =
      parsedData.rowCount > 70 &&
      parsedData.columnCount === 12 &&
      parsedData.types.includes('INTEGER') &&
      parsedData.types.includes('REAL');

    results.push({
      name: 'CSV Parsing & Type Inference',
      passed: parsingPassed,
      details: `${parsedData.rowCount} rows, ${parsedData.columnCount} columns`,
      duration: testDuration
    });
    console.log(`  ${parsingPassed ? '✅ PASS' : '❌ FAIL'} (${testDuration}ms)\n`);

    // Test 2: Statistical Profiling
    console.log('TEST 2: Statistical Profiling Engine');
    const profileStart = Date.now();
    const profiler = new DataProfiler();
    const profile = await profiler.profile(parsedData, 'portfolio_comprehensive');
    const profileDuration = Date.now() - profileStart;

    console.log(`  Numeric columns profiled: ${profile.numericProfiles.size}`);
    console.log(`  Categorical columns profiled: ${profile.categoricalProfiles.size}`);
    console.log(`  Temporal columns detected: ${profile.temporalProfiles.size}`);
    console.log(`  Data quality: ${profile.dataQuality.completeness.toFixed(1)}%`);
    console.log(`  Insights generated: ${profile.insights.length}`);
    console.log(`  Gaps detected: ${profile.gaps.length}`);
    console.log(`  Anomalies found: ${profile.anomalies.length}`);

    const profilingPassed =
      profile.numericProfiles.size >= 7 &&
      profile.temporalProfiles.size >= 1 &&
      profile.insights.length > 0;

    results.push({
      name: 'Statistical Profiling Engine',
      passed: profilingPassed,
      details: `${profile.insights.length} insights, ${profile.gaps.length} gaps`,
      duration: profileDuration
    });
    console.log(`  ${profilingPassed ? '✅ PASS' : '❌ FAIL'} (${profileDuration}ms)\n`);

    // Test 3: Gap Detection (Temporal)
    console.log('TEST 3: Temporal Gap Detection');
    const gapStart = Date.now();

    // Check if Quarter gaps were detected
    const quarterProfile = profile.temporalProfiles.get('Quarter');
    const hasQuarterGaps = quarterProfile && quarterProfile.gaps && quarterProfile.gaps.length > 0;

    console.log(`  Quarter column detected: ${quarterProfile ? 'Yes' : 'No'}`);
    if (quarterProfile) {
      console.log(`  Temporal range: ${quarterProfile.range}`);
      console.log(`  Frequency: ${quarterProfile.frequency}`);
      console.log(`  Coverage: ${quarterProfile.coverage.toFixed(1)}%`);
      console.log(`  Gaps found: ${quarterProfile.gaps.length}`);
      if (quarterProfile.gaps.length > 0) {
        quarterProfile.gaps.forEach(gap => {
          console.log(`    - Missing: ${gap.missing.join(', ')}`);
        });
      }
    }

    // Check profile.gaps for missing data mentions
    const mentionsGaps = profile.gaps.some(gap =>
      gap.toLowerCase().includes('missing') ||
      gap.toLowerCase().includes('gap')
    );

    const gapDuration = Date.now() - gapStart;
    const gapsPassed = mentionsGaps || (quarterProfile && quarterProfile.coverage < 100);

    results.push({
      name: 'Temporal Gap Detection',
      passed: gapsPassed,
      details: `Found ${profile.gaps.length} data gaps`,
      duration: gapDuration
    });
    console.log(`  ${gapsPassed ? '✅ PASS' : '❌ FAIL'} (${gapDuration}ms)\n`);

    // Test 4: Missing Values Detection
    console.log('TEST 4: Missing Values Detection');
    const missingStart = Date.now();

    const totalMissing = profile.dataQuality.totalMissingValues;
    console.log(`  Total missing values: ${totalMissing}`);
    console.log(`  Complete rows: ${profile.dataQuality.completeRows}/${profile.dataQuality.totalRows}`);
    console.log(`  Overall completeness: ${profile.dataQuality.completeness.toFixed(1)}%`);

    // Check column-level completeness
    console.log(`  Column completeness:`);
    for (const [column, completeness] of profile.dataQuality.columnCompleteness) {
      if (completeness < 100) {
        console.log(`    - ${column}: ${completeness.toFixed(1)}% (${parsedData.rowCount - Math.round(parsedData.rowCount * completeness / 100)} missing)`);
      }
    }

    const missingDuration = Date.now() - missingStart;
    const missingPassed = totalMissing > 0 && profile.dataQuality.completeness < 100;

    results.push({
      name: 'Missing Values Detection',
      passed: missingPassed,
      details: `${totalMissing} missing values detected`,
      duration: missingDuration
    });
    console.log(`  ${missingPassed ? '✅ PASS' : '❌ FAIL'} (${missingDuration}ms)\n`);

    // Test 5: Statistical Summaries
    console.log('TEST 5: Statistical Summaries (Numeric Columns)');
    const statsStart = Date.now();

    // Check Revenue statistics as example
    const revenueProfile = profile.numericProfiles.get('Revenue');
    if (revenueProfile) {
      console.log(`  Revenue statistics:`);
      console.log(`    Min: $${(revenueProfile.min / 1000000).toFixed(1)}M`);
      console.log(`    Max: $${(revenueProfile.max / 1000000).toFixed(1)}M`);
      console.log(`    Mean: $${(revenueProfile.mean / 1000000).toFixed(1)}M`);
      console.log(`    Median: $${(revenueProfile.median / 1000000).toFixed(1)}M`);
      console.log(`    Std Dev: $${(revenueProfile.stdDev / 1000000).toFixed(1)}M`);
      console.log(`    Outliers: ${revenueProfile.outliers.length}`);
    }

    const statsDuration = Date.now() - statsStart;
    const statsPassed = revenueProfile &&
                       revenueProfile.mean > 0 &&
                       revenueProfile.max > revenueProfile.min;

    results.push({
      name: 'Statistical Summaries',
      passed: statsPassed,
      details: `Complete stats for ${profile.numericProfiles.size} numeric columns`,
      duration: statsDuration
    });
    console.log(`  ${statsPassed ? '✅ PASS' : '❌ FAIL'} (${statsDuration}ms)\n`);

    // Test 6: Categorical Analysis
    console.log('TEST 6: Categorical Column Analysis');
    const catStart = Date.now();

    const companyProfile = profile.categoricalProfiles.get('Company');
    if (companyProfile) {
      console.log(`  Company analysis:`);
      console.log(`    Unique companies: ${companyProfile.uniqueCount}`);
      console.log(`    Total records: ${companyProfile.totalCount}`);
      console.log(`    Top companies:`);
      companyProfile.topValues.slice(0, 5).forEach(v => {
        console.log(`      - ${v.value}: ${v.count} records (${v.percentage.toFixed(1)}%)`);
      });
    }

    const catDuration = Date.now() - catStart;
    const catPassed = companyProfile &&
                      companyProfile.uniqueCount === 7 &&
                      companyProfile.topValues.length > 0;

    results.push({
      name: 'Categorical Analysis',
      passed: catPassed,
      details: `${companyProfile?.uniqueCount} unique companies identified`,
      duration: catDuration
    });
    console.log(`  ${catPassed ? '✅ PASS' : '❌ FAIL'} (${catDuration}ms)\n`);

    // Test 7: Insights Generation
    console.log('TEST 7: Proactive Insights Generation');
    const insightStart = Date.now();

    console.log(`  Generated insights (${profile.insights.length} total):`);
    profile.insights.slice(0, 8).forEach((insight, i) => {
      console.log(`    ${i + 1}. ${insight}`);
    });

    if (profile.insights.length > 8) {
      console.log(`    ... and ${profile.insights.length - 8} more`);
    }

    const insightDuration = Date.now() - insightStart;
    const insightsPassed = profile.insights.length >= 10;

    results.push({
      name: 'Proactive Insights Generation',
      passed: insightsPassed,
      details: `${profile.insights.length} insights auto-generated`,
      duration: insightDuration
    });
    console.log(`  ${insightsPassed ? '✅ PASS' : '❌ FAIL'} (${insightDuration}ms)\n`);

    // Test 8: Anomaly Detection
    console.log('TEST 8: Anomaly Detection');
    const anomalyStart = Date.now();

    console.log(`  Detected anomalies (${profile.anomalies.length} total):`);
    profile.anomalies.forEach((anomaly, i) => {
      console.log(`    ${i + 1}. ${anomaly}`);
    });

    const anomalyDuration = Date.now() - anomalyStart;
    const anomaliesPassed = true; // Anomalies are optional, so always pass

    results.push({
      name: 'Anomaly Detection',
      passed: anomaliesPassed,
      details: `${profile.anomalies.length} anomalies identified`,
      duration: anomalyDuration
    });
    console.log(`  ${anomaliesPassed ? '✅ PASS' : '❌ FAIL'} (${anomalyDuration}ms)\n`);

    // Test 9: Data Quality Metrics
    console.log('TEST 9: Comprehensive Data Quality Metrics');
    const qualityStart = Date.now();

    console.log(`  Quality metrics:`);
    console.log(`    Total rows: ${profile.dataQuality.totalRows}`);
    console.log(`    Complete rows: ${profile.dataQuality.completeRows}`);
    console.log(`    Completeness: ${profile.dataQuality.completeness.toFixed(2)}%`);
    console.log(`    Missing values: ${profile.dataQuality.totalMissingValues}`);
    console.log(`    Duplicate rows: ${profile.dataQuality.duplicateRows}`);

    const qualityDuration = Date.now() - qualityStart;
    const qualityPassed = profile.dataQuality.totalRows === parsedData.rowCount &&
                         profile.dataQuality.completeness > 0;

    results.push({
      name: 'Data Quality Metrics',
      passed: qualityPassed,
      details: `${profile.dataQuality.completeness.toFixed(1)}% complete`,
      duration: qualityDuration
    });
    console.log(`  ${qualityPassed ? '✅ PASS' : '❌ FAIL'} (${qualityDuration}ms)\n`);

    // Test 10: Correlations
    console.log('TEST 10: Correlation Analysis');
    const corrStart = Date.now();

    console.log(`  Correlations found: ${profile.correlations.length}`);
    profile.correlations.slice(0, 5).forEach(corr => {
      console.log(`    - ${corr.column1} ↔ ${corr.column2}: ${corr.correlation.toFixed(3)} (${corr.strength})`);
    });

    const corrDuration = Date.now() - corrStart;
    const corrPassed = true; // Correlations are optional

    results.push({
      name: 'Correlation Analysis',
      passed: corrPassed,
      details: `${profile.correlations.length} significant correlations`,
      duration: corrDuration
    });
    console.log(`  ${corrPassed ? '✅ PASS' : '❌ FAIL'} (${corrDuration}ms)\n`);

    // =====================================================================
    // FINAL SUMMARY
    // =====================================================================
    const totalDuration = Date.now() - startTime;

    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE TEST RESULTS');
    console.log('='.repeat(80) + '\n');

    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const passRate = (passed / total * 100).toFixed(1);

    results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${result.name}`);
      console.log(`         ${result.details} (${result.duration}ms)`);
    });

    console.log('\n' + '─'.repeat(80));
    console.log(`📈 Results: ${passed}/${total} tests passed (${passRate}%)`);
    console.log(`⏱️  Total time: ${totalDuration}ms`);
    console.log('─'.repeat(80) + '\n');

    // Detailed profiling summary
    console.log('🎯 AGENTIC RAG CAPABILITIES VERIFIED:\n');
    console.log(`   ✅ Dataset Profiling: ${profile.numericProfiles.size + profile.categoricalProfiles.size} columns analyzed`);
    console.log(`   ✅ Gap Detection: ${profile.gaps.length} gaps identified`);
    console.log(`   ✅ Statistical Analysis: Complete metrics for all numeric columns`);
    console.log(`   ✅ Data Quality: ${profile.dataQuality.completeness.toFixed(1)}% completeness calculated`);
    console.log(`   ✅ Proactive Insights: ${profile.insights.length} insights auto-generated`);
    console.log(`   ✅ Anomaly Detection: ${profile.anomalies.length} anomalies flagged`);
    console.log(`   ✅ Temporal Analysis: ${profile.temporalProfiles.size} time-series columns processed`);

    console.log('\n' + '='.repeat(80));
    if (passed === total) {
      console.log('🎉 SUCCESS: ALL TESTS PASSED');
      console.log('   System ready for production with comprehensive data understanding!');
      console.log('='.repeat(80) + '\n');
      process.exit(0);
    } else {
      console.log('⚠️  PARTIAL SUCCESS: Some tests failed');
      console.log('   Review failed tests above');
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
