/**
 * Data Profiler - Comprehensive statistical analysis of structured data
 * Generates rich profiles including statistics, quality metrics, and insights
 */

import { ParsedData } from './parsers/csv-parser.js';
import {
  DatasetProfile,
  NumericProfile,
  CategoricalProfile,
  TemporalProfile,
  DataQualityMetrics,
  CorrelationInfo,
  ProfilerOptions,
} from '../types/data-profile.types.js';

const DEFAULT_OPTIONS: ProfilerOptions = {
  maxTopValues: 5,
  outlierThreshold: 3,
  minCorrelation: 0.5,
  detectTemporal: true,
};

export class DataProfiler {
  private options: ProfilerOptions;

  constructor(options: Partial<ProfilerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Generate comprehensive profile for a dataset
   */
  async profile(data: ParsedData, tableName: string): Promise<DatasetProfile> {
    console.log(`📊 Profiling dataset: ${tableName}...`);

    const numericProfiles = new Map<string, NumericProfile>();
    const categoricalProfiles = new Map<string, CategoricalProfile>();
    const temporalProfiles = new Map<string, TemporalProfile>();

    // Profile each column based on its type
    for (let i = 0; i < data.headers.length; i++) {
      const header = data.headers[i];
      const type = data.types[i];

      if (type === 'INTEGER' || type === 'REAL') {
        const profile = this.profileNumericColumn(data.rows, header, type);
        numericProfiles.set(header, profile);
      } else if (type === 'TEXT') {
        // Check if it's a temporal column
        if (this.options.detectTemporal && this.isTemporalColumn(data.rows, header)) {
          const tempProfile = this.profileTemporalColumn(data.rows, header);
          if (tempProfile) {
            temporalProfiles.set(header, tempProfile);
          }
        } else {
          const profile = this.profileCategoricalColumn(data.rows, header);
          categoricalProfiles.set(header, profile);
        }
      } else if (type === 'BOOLEAN') {
        const profile = this.profileCategoricalColumn(data.rows, header);
        categoricalProfiles.set(header, profile);
      }
    }

    // Calculate data quality metrics
    const dataQuality = this.calculateDataQuality(data, numericProfiles, categoricalProfiles);

    // Calculate correlations between numeric columns
    const correlations = this.calculateCorrelations(data.rows, Array.from(numericProfiles.keys()));

    // Generate insights, anomalies, and gaps
    const insights = this.generateInsights(numericProfiles, categoricalProfiles, temporalProfiles);
    const anomalies = this.generateAnomalies(numericProfiles, dataQuality);
    const gaps = this.generateGaps(temporalProfiles, dataQuality);

    console.log(`✅ Profile complete: ${insights.length} insights, ${gaps.length} gaps detected`);

    return {
      tableName,
      filename: data.filename,
      rowCount: data.rowCount,
      columnCount: data.columnCount,
      numericProfiles,
      categoricalProfiles,
      temporalProfiles,
      dataQuality,
      correlations,
      insights,
      anomalies,
      gaps,
      profiledAt: new Date(),
    };
  }

  /**
   * Profile a numeric column
   */
  private profileNumericColumn(rows: any[], header: string, type: string): NumericProfile {
    const values = rows
      .map(row => row[header])
      .filter(v => v !== null && v !== undefined && v !== '')
      .map(v => Number(v));

    const missingCount = rows.length - values.length;
    const missingPercent = (missingCount / rows.length) * 100;

    if (values.length === 0) {
      return {
        columnName: header,
        count: 0,
        mean: 0,
        median: 0,
        stdDev: 0,
        min: 0,
        max: 0,
        percentile25: 0,
        percentile75: 0,
        missingCount,
        missingPercent,
        outliers: [],
      };
    }

    // Sort for percentile calculations
    const sorted = [...values].sort((a, b) => a - b);

    // Calculate statistics
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const median = this.calculatePercentile(sorted, 50);
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Detect outliers (values > threshold * stdDev from mean)
    const outlierThreshold = this.options.outlierThreshold || 3;
    const outliers = rows
      .map((row, idx) => ({ value: Number(row[header]), rowIndex: idx }))
      .filter(
        item => !isNaN(item.value) && Math.abs(item.value - mean) > outlierThreshold * stdDev
      );

    return {
      columnName: header,
      count: values.length,
      mean,
      median,
      stdDev,
      min: Math.min(...values),
      max: Math.max(...values),
      percentile25: this.calculatePercentile(sorted, 25),
      percentile75: this.calculatePercentile(sorted, 75),
      missingCount,
      missingPercent,
      outliers,
    };
  }

  /**
   * Profile a categorical column
   */
  private profileCategoricalColumn(rows: any[], header: string): CategoricalProfile {
    const allValues = rows.map(row => row[header]);
    const values = allValues.filter(v => v !== null && v !== undefined && v !== '');

    const missingCount = allValues.length - values.length;
    const missingPercent = (missingCount / allValues.length) * 100;

    // Calculate frequency distribution
    const distribution = new Map<string, number>();
    for (const value of values) {
      const key = String(value);
      distribution.set(key, (distribution.get(key) || 0) + 1);
    }

    // Get top N values
    const topValues = Array.from(distribution.entries())
      .map(([value, count]) => ({
        value,
        count,
        percentage: (count / values.length) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, this.options.maxTopValues || 5);

    return {
      columnName: header,
      uniqueCount: distribution.size,
      totalCount: values.length,
      missingCount,
      missingPercent,
      cardinalityRatio: distribution.size / values.length,
      topValues,
      distribution,
    };
  }

  /**
   * Check if a column contains temporal data
   */
  private isTemporalColumn(rows: any[], header: string): boolean {
    const sampleSize = Math.min(10, rows.length);
    const samples = rows
      .slice(0, sampleSize)
      .map(row => row[header])
      .filter(v => v !== null && v !== undefined && v !== '');

    if (samples.length === 0) return false;

    // Check for common temporal patterns
    const patterns = {
      quarter: /^Q[1-4]$/i,
      year: /^\d{4}$/,
      date: /^\d{4}-\d{2}-\d{2}$/,
      datetime: /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}/,
    };

    for (const sample of samples) {
      const str = String(sample).trim();
      const isTemporalValue = Object.values(patterns).some(pattern => pattern.test(str));
      if (!isTemporalValue) return false;
    }

    return true;
  }

  /**
   * Profile a temporal column
   */
  private profileTemporalColumn(rows: any[], header: string): TemporalProfile | null {
    const values = rows
      .map(row => row[header])
      .filter(v => v !== null && v !== undefined && v !== '')
      .map(v => String(v).trim());

    if (values.length === 0) return null;

    // Detect temporal type
    const sampleValue = values[0];
    let type: 'date' | 'quarter' | 'year' | 'datetime';

    if (/^Q[1-4]$/i.test(sampleValue)) {
      type = 'quarter';
    } else if (/^\d{4}$/.test(sampleValue)) {
      type = 'year';
    } else if (/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}/.test(sampleValue)) {
      type = 'datetime';
    } else if (/^\d{4}-\d{2}-\d{2}/.test(sampleValue)) {
      type = 'date';
    } else {
      return null;
    }

    // Get min and max
    const sorted = [...values].sort();
    const minValue = sorted[0];
    const maxValue = sorted[sorted.length - 1];

    // Detect gaps and frequency
    let gaps: Array<{ expected: string; actual: string; missing: string[] }> = [];
    let frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'irregular' =
      'irregular';
    let coverage = 100;

    if (type === 'quarter') {
      frequency = 'quarterly';
      gaps = this.detectQuarterGaps(values);
      const expectedCount = this.calculateExpectedQuarters(values);
      coverage = (values.length / expectedCount) * 100;
    } else if (type === 'year') {
      frequency = 'yearly';
      gaps = this.detectYearGaps(values);
      const expectedCount = parseInt(maxValue) - parseInt(minValue) + 1;
      coverage = (new Set(values).size / expectedCount) * 100;
    }

    return {
      columnName: header,
      type,
      minValue,
      maxValue,
      range: `${minValue} to ${maxValue}`,
      frequency,
      gaps,
      coverage,
    };
  }

  /**
   * Detect gaps in quarterly data
   */
  private detectQuarterGaps(
    values: string[]
  ): Array<{ expected: string; actual: string; missing: string[] }> {
    // Extract unique quarters and sort
    const quarters = [...new Set(values)].sort();

    if (quarters.length <= 1) return [];

    const gaps: Array<{ expected: string; actual: string; missing: string[] }> = [];
    const allQuarters = ['Q1', 'Q2', 'Q3', 'Q4'];

    for (let i = 0; i < quarters.length - 1; i++) {
      const current = quarters[i];
      const next = quarters[i + 1];
      const currentIndex = allQuarters.indexOf(current.toUpperCase());
      const nextIndex = allQuarters.indexOf(next.toUpperCase());

      // Check if there's a gap
      if (currentIndex !== -1 && nextIndex !== -1) {
        const expectedNextIndex = (currentIndex + 1) % 4;
        if (nextIndex !== expectedNextIndex) {
          const missing = [];
          let idx = expectedNextIndex;
          while (idx !== nextIndex) {
            missing.push(allQuarters[idx]);
            idx = (idx + 1) % 4;
          }
          if (missing.length > 0) {
            gaps.push({
              expected: `${current} → ${allQuarters[expectedNextIndex]}`,
              actual: `${current} → ${next}`,
              missing,
            });
          }
        }
      }
    }

    return gaps;
  }

  /**
   * Detect gaps in yearly data
   */
  private detectYearGaps(
    values: string[]
  ): Array<{ expected: string; actual: string; missing: string[] }> {
    const years = [...new Set(values)].map(v => parseInt(v)).sort((a, b) => a - b);

    if (years.length <= 1) return [];

    const gaps: Array<{ expected: string; actual: string; missing: string[] }> = [];

    for (let i = 0; i < years.length - 1; i++) {
      const current = years[i];
      const next = years[i + 1];

      if (next - current > 1) {
        const missing = [];
        for (let year = current + 1; year < next; year++) {
          missing.push(String(year));
        }
        gaps.push({
          expected: `${current} → ${current + 1}`,
          actual: `${current} → ${next}`,
          missing,
        });
      }
    }

    return gaps;
  }

  /**
   * Calculate expected number of quarters based on data
   */
  private calculateExpectedQuarters(values: string[]): number {
    const uniqueQuarters = new Set(values);
    return Math.max(4, uniqueQuarters.size);
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(sortedValues: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (lower === upper) {
      return sortedValues[lower];
    }

    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }

  /**
   * Calculate data quality metrics
   */
  private calculateDataQuality(
    data: ParsedData,
    numericProfiles: Map<string, NumericProfile>,
    categoricalProfiles: Map<string, CategoricalProfile>
  ): DataQualityMetrics {
    const columnCompleteness = new Map<string, number>();
    let totalMissingValues = 0;

    // Calculate completeness per column
    for (const [column, profile] of numericProfiles) {
      const completeness = (profile.count / data.rowCount) * 100;
      columnCompleteness.set(column, completeness);
      totalMissingValues += profile.missingCount;
    }

    for (const [column, profile] of categoricalProfiles) {
      const completeness = (profile.totalCount / data.rowCount) * 100;
      columnCompleteness.set(column, completeness);
      totalMissingValues += profile.missingCount;
    }

    // Calculate complete rows (rows with no missing values)
    let completeRows = 0;
    for (const row of data.rows) {
      const isComplete = data.headers.every(
        header => row[header] !== null && row[header] !== undefined && row[header] !== ''
      );
      if (isComplete) completeRows++;
    }

    // Detect duplicate rows
    const rowStrings = data.rows.map(row => JSON.stringify(row));
    const uniqueRows = new Set(rowStrings);
    const duplicateRows = rowStrings.length - uniqueRows.size;

    const completeness = (completeRows / data.rowCount) * 100;

    return {
      totalRows: data.rowCount,
      totalColumns: data.columnCount,
      completeRows,
      completeness,
      duplicateRows,
      totalMissingValues,
      columnCompleteness,
    };
  }

  /**
   * Calculate correlations between numeric columns
   */
  private calculateCorrelations(rows: any[], numericColumns: string[]): CorrelationInfo[] {
    const correlations: CorrelationInfo[] = [];

    if (numericColumns.length < 2) return correlations;

    // Calculate correlation for each pair
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const col1 = numericColumns[i];
        const col2 = numericColumns[j];

        const correlation = this.calculatePearsonCorrelation(rows, col1, col2);

        if (Math.abs(correlation) >= (this.options.minCorrelation || 0.5)) {
          correlations.push({
            column1: col1,
            column2: col2,
            correlation,
            strength: this.getCorrelationStrength(correlation),
          });
        }
      }
    }

    return correlations;
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  private calculatePearsonCorrelation(rows: any[], col1: string, col2: string): number {
    const pairs = rows
      .map(row => ({
        x: Number(row[col1]),
        y: Number(row[col2]),
      }))
      .filter(pair => !isNaN(pair.x) && !isNaN(pair.y));

    if (pairs.length < 2) return 0;

    const n = pairs.length;
    const sumX = pairs.reduce((sum, p) => sum + p.x, 0);
    const sumY = pairs.reduce((sum, p) => sum + p.y, 0);
    const sumXY = pairs.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumX2 = pairs.reduce((sum, p) => sum + p.x * p.x, 0);
    const sumY2 = pairs.reduce((sum, p) => sum + p.y * p.y, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return 0;

    return numerator / denominator;
  }

  /**
   * Get correlation strength label
   */
  private getCorrelationStrength(correlation: number): 'strong' | 'moderate' | 'weak' | 'none' {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return 'strong';
    if (abs >= 0.5) return 'moderate';
    if (abs >= 0.3) return 'weak';
    return 'none';
  }

  /**
   * Generate insights from profiles
   */
  private generateInsights(
    numericProfiles: Map<string, NumericProfile>,
    categoricalProfiles: Map<string, CategoricalProfile>,
    temporalProfiles: Map<string, TemporalProfile>
  ): string[] {
    const insights: string[] = [];

    // Numeric insights
    for (const [column, profile] of numericProfiles) {
      if (profile.count > 0) {
        insights.push(
          `${column} ranges from ${this.formatNumber(profile.min)} to ${this.formatNumber(profile.max)} (avg: ${this.formatNumber(profile.mean)})`
        );

        if (profile.outliers.length > 0) {
          insights.push(`${column} has ${profile.outliers.length} outlier value(s)`);
        }
      }
    }

    // Categorical insights
    for (const [column, profile] of categoricalProfiles) {
      if (profile.uniqueCount > 0 && profile.topValues.length > 0) {
        const topValue = profile.topValues[0];
        insights.push(
          `${column} has ${profile.uniqueCount} unique values, most common: "${topValue.value}" (${topValue.count} occurrences)`
        );
      }
    }

    // Temporal insights
    for (const [column, profile] of temporalProfiles) {
      insights.push(`${column} coverage: ${profile.range} (${profile.frequency})`);
      if (profile.coverage < 100) {
        insights.push(`${column} is ${profile.coverage.toFixed(1)}% complete`);
      }
    }

    return insights;
  }

  /**
   * Generate anomaly alerts
   */
  private generateAnomalies(
    numericProfiles: Map<string, NumericProfile>,
    dataQuality: DataQualityMetrics
  ): string[] {
    const anomalies: string[] = [];

    // Check for high missing data
    for (const [column, completeness] of dataQuality.columnCompleteness) {
      if (completeness < 90) {
        anomalies.push(`${column} has low completeness (${completeness.toFixed(1)}%)`);
      }
    }

    // Check for duplicate rows
    if (dataQuality.duplicateRows > 0) {
      anomalies.push(`Found ${dataQuality.duplicateRows} duplicate row(s)`);
    }

    // Check for outliers
    for (const [column, profile] of numericProfiles) {
      if (profile.outliers.length > 0) {
        anomalies.push(
          `${column} has ${profile.outliers.length} outlier(s) beyond ${this.options.outlierThreshold}σ`
        );
      }
    }

    return anomalies;
  }

  /**
   * Generate gap alerts
   */
  private generateGaps(
    temporalProfiles: Map<string, TemporalProfile>,
    dataQuality: DataQualityMetrics
  ): string[] {
    const gaps: string[] = [];

    // Temporal gaps
    for (const [column, profile] of temporalProfiles) {
      for (const gap of profile.gaps) {
        gaps.push(`Missing ${column}: ${gap.missing.join(', ')}`);
      }
    }

    // Overall data completeness gaps
    if (dataQuality.completeness < 100) {
      gaps.push(
        `Overall data completeness: ${dataQuality.completeness.toFixed(1)}% (${dataQuality.totalMissingValues} missing values)`
      );
    }

    return gaps;
  }

  /**
   * Format number for display
   */
  private formatNumber(num: number): string {
    if (Math.abs(num) >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (Math.abs(num) >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    } else if (num % 1 === 0) {
      return num.toString();
    } else {
      return num.toFixed(2);
    }
  }
}
