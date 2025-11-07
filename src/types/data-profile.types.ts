/**
 * Type definitions for data profiling and statistical analysis
 */

export interface NumericProfile {
  columnName: string;
  count: number;
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  percentile25: number;
  percentile75: number;
  missingCount: number;
  missingPercent: number;
  outliers: Array<{ value: number; rowIndex: number }>;
}

export interface CategoricalProfile {
  columnName: string;
  uniqueCount: number;
  totalCount: number;
  missingCount: number;
  missingPercent: number;
  cardinalityRatio: number; // uniqueCount / totalCount
  topValues: Array<{ value: string; count: number; percentage: number }>;
  distribution: Map<string, number>;
}

export interface TemporalProfile {
  columnName: string;
  type: 'date' | 'quarter' | 'year' | 'datetime';
  minValue: string;
  maxValue: string;
  range: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'irregular';
  gaps: Array<{ expected: string; actual: string; missing: string[] }>;
  coverage: number; // percentage of expected periods present
}

export interface DataQualityMetrics {
  totalRows: number;
  totalColumns: number;
  completeRows: number;
  completeness: number; // percentage of complete rows
  duplicateRows: number;
  totalMissingValues: number;
  columnCompleteness: Map<string, number>; // column -> completeness percentage
}

export interface CorrelationInfo {
  column1: string;
  column2: string;
  correlation: number;
  strength: 'strong' | 'moderate' | 'weak' | 'none';
}

export interface DatasetProfile {
  // Basic info
  tableName: string;
  filename: string;
  rowCount: number;
  columnCount: number;

  // Statistical profiles
  numericProfiles: Map<string, NumericProfile>;
  categoricalProfiles: Map<string, CategoricalProfile>;
  temporalProfiles: Map<string, TemporalProfile>;

  // Data quality
  dataQuality: DataQualityMetrics;

  // Relationships
  correlations: CorrelationInfo[];

  // Generated insights
  insights: string[];
  anomalies: string[];
  gaps: string[];

  // Timestamp
  profiledAt: Date;
}

export interface ProfilerOptions {
  maxTopValues?: number; // default: 5
  outlierThreshold?: number; // std dev threshold, default: 3
  minCorrelation?: number; // minimum correlation to report, default: 0.5
  detectTemporal?: boolean; // default: true
}
