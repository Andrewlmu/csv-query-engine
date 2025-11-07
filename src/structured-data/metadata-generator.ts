import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { ParsedData, analyzeColumn } from './parsers/csv-parser.js';
import { DataProfiler } from './data-profiler.js';
import { DatasetProfile } from '../types/data-profile.types.js';

export interface DatasetMetadata {
  tableName: string;
  filename: string;
  description: string;
  rowCount: number;
  columnCount: number;
}

export interface EnhancedMetadata {
  basicDescription: string;
  statisticalSummary: string;
  insightsDocument: string;
  profile: DatasetProfile;
}

export class MetadataGenerator {
  private llm: ChatOpenAI;
  private profiler: DataProfiler;

  constructor(llm: ChatOpenAI) {
    this.llm = llm;
    this.profiler = new DataProfiler();
  }

  /**
   * Generate comprehensive metadata with statistical profiling
   */
  async generateEnhanced(data: ParsedData, tableName: string): Promise<EnhancedMetadata> {
    console.log(`🧠 Generating enhanced metadata for ${data.filename}...`);

    // Step 1: Profile the data (statistical analysis)
    const profile = await this.profiler.profile(data, tableName);

    // Step 2: Generate basic semantic description (for discovery)
    const basicDescription = await this.generateBasicDescription(data, tableName, profile);

    // Step 3: Generate statistical summary document
    const statisticalSummary = this.formatStatisticalSummary(profile);

    // Step 4: Generate insights document (gaps, trends, anomalies)
    const insightsDocument = this.formatInsightsDocument(profile);

    console.log(`✅ Enhanced metadata complete`);
    console.log(`   - ${profile.insights.length} insights`);
    console.log(`   - ${profile.gaps.length} gaps detected`);
    console.log(`   - ${profile.anomalies.length} anomalies found`);
    console.log(`   - Data quality: ${profile.dataQuality.completeness.toFixed(1)}%`);

    return {
      basicDescription,
      statisticalSummary,
      insightsDocument,
      profile,
    };
  }

  /**
   * Legacy method for backward compatibility
   */
  async generate(data: ParsedData, tableName: string): Promise<string> {
    const enhanced = await this.generateEnhanced(data, tableName);
    return enhanced.basicDescription;
  }

  /**
   * Generate basic semantic description using LLM
   */
  private async generateBasicDescription(
    data: ParsedData,
    tableName: string,
    profile: DatasetProfile
  ): Promise<string> {
    // Build schema description
    const schemaDescription = data.headers
      .map((header, i) => {
        const columnAnalysis = analyzeColumn(data.rows, header);
        return `- ${header} (${data.types[i]}): ${columnAnalysis}`;
      })
      .join('\n');

    // Format sample rows
    const sampleRowsFormatted = data.sampleRows
      .slice(0, 5)
      .map(row => {
        return data.headers.map(h => `${h}: ${row[h]}`).join(', ');
      })
      .join('\n');

    // Include key insights from profiling
    const keyInsights = profile.insights.slice(0, 3).join('\n- ');
    const keyGaps = profile.gaps.slice(0, 2).join('\n- ');

    // Build prompt
    const prompt = `You are analyzing a structured dataset for a Private Equity analysis system.

Dataset: ${data.filename}
Total Records: ${data.rowCount}
Columns: ${data.columnCount}
Data Quality: ${profile.dataQuality.completeness.toFixed(1)}% complete

Schema:
${schemaDescription}

Sample Data (first 5 rows):
${sampleRowsFormatted}

Key Insights from Statistical Analysis:
- ${keyInsights}

${keyGaps ? `Data Gaps:\n- ${keyGaps}` : 'No data gaps detected'}

Generate a comprehensive metadata description that includes:
1. **High-level description**: What this dataset contains (1-2 sentences)
2. **Structure**: Brief overview of dimensions (time periods, entities, metrics)
3. **Key Patterns**: Any trends, anomalies, or notable patterns in the data
4. **Coverage Analysis**: Completeness, gaps, or missing data
5. **Queryable For**: What types of questions can be answered with this data

Format your response as a clear, structured document that will help an AI agent understand this dataset.
Focus on business-relevant insights for PE analysis.
Keep it concise but informative.

Table Name: ${tableName}`;

    try {
      const messages = [
        new SystemMessage('You are a data analyst specializing in private equity portfolio data.'),
        new HumanMessage(prompt),
      ];

      const response = await this.llm.invoke(messages);

      const metadata =
        typeof response.content === 'string' ? response.content : String(response.content);

      return metadata;
    } catch (error: any) {
      console.error(`❌ Metadata generation failed: ${error.message}`);
      // Fallback to basic metadata
      return this.generateFallbackMetadata(data, tableName, profile);
    }
  }

  /**
   * Format statistical summary as a document
   */
  private formatStatisticalSummary(profile: DatasetProfile): string {
    const sections: string[] = [];

    sections.push(`# Statistical Summary: ${profile.filename}\n`);
    sections.push(`**Table:** ${profile.tableName}`);
    sections.push(`**Rows:** ${profile.rowCount} | **Columns:** ${profile.columnCount}`);
    sections.push(
      `**Data Quality:** ${profile.dataQuality.completeness.toFixed(1)}% complete (${profile.dataQuality.completeRows}/${profile.dataQuality.totalRows} complete rows)\n`
    );

    // Numeric columns
    if (profile.numericProfiles.size > 0) {
      sections.push(`## Numeric Columns\n`);
      for (const [column, stats] of profile.numericProfiles) {
        sections.push(`**${column}:**`);
        sections.push(
          `  Range: ${this.formatNum(stats.min)} - ${this.formatNum(stats.max)} | Avg: ${this.formatNum(stats.mean)} | Median: ${this.formatNum(stats.median)}`
        );
        sections.push(
          `  Std Dev: ${this.formatNum(stats.stdDev)} | Missing: ${stats.missingCount} (${stats.missingPercent.toFixed(1)}%)`
        );
        if (stats.outliers.length > 0) {
          sections.push(`  ⚠️  ${stats.outliers.length} outlier(s) detected`);
        }
        sections.push('');
      }
    }

    // Categorical columns
    if (profile.categoricalProfiles.size > 0) {
      sections.push(`## Categorical Columns\n`);
      for (const [column, stats] of profile.categoricalProfiles) {
        sections.push(`**${column}:**`);
        sections.push(
          `  ${stats.uniqueCount} unique values | Missing: ${stats.missingCount} (${stats.missingPercent.toFixed(1)}%)`
        );
        if (stats.topValues.length > 0) {
          const topVals = stats.topValues
            .slice(0, 3)
            .map(v => `"${v.value}" (${v.count})`)
            .join(', ');
          sections.push(`  Top values: ${topVals}`);
        }
        sections.push('');
      }
    }

    // Temporal columns
    if (profile.temporalProfiles.size > 0) {
      sections.push(`## Temporal Coverage\n`);
      for (const [column, stats] of profile.temporalProfiles) {
        sections.push(`**${column}:** ${stats.range} (${stats.frequency})`);
        sections.push(`  Coverage: ${stats.coverage.toFixed(1)}%`);
        if (stats.gaps.length > 0) {
          stats.gaps.forEach(gap => {
            sections.push(`  ⚠️  Gap: Missing ${gap.missing.join(', ')}`);
          });
        }
        sections.push('');
      }
    }

    // Correlations
    if (profile.correlations.length > 0) {
      sections.push(`## Correlations\n`);
      profile.correlations.forEach(corr => {
        sections.push(
          `- ${corr.column1} ↔ ${corr.column2}: ${corr.correlation.toFixed(3)} (${corr.strength})`
        );
      });
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Format insights document
   */
  private formatInsightsDocument(profile: DatasetProfile): string {
    const sections: string[] = [];

    sections.push(`# Data Insights: ${profile.filename}\n`);

    // Key insights
    if (profile.insights.length > 0) {
      sections.push(`## Key Insights\n`);
      profile.insights.forEach(insight => {
        sections.push(`- ${insight}`);
      });
      sections.push('');
    }

    // Data gaps
    if (profile.gaps.length > 0) {
      sections.push(`## Data Gaps\n`);
      profile.gaps.forEach(gap => {
        sections.push(`- ⚠️  ${gap}`);
      });
      sections.push('');
    }

    // Anomalies
    if (profile.anomalies.length > 0) {
      sections.push(`## Anomalies & Warnings\n`);
      profile.anomalies.forEach(anomaly => {
        sections.push(`- 🔍 ${anomaly}`);
      });
      sections.push('');
    }

    // Data quality summary
    sections.push(`## Data Quality Summary\n`);
    sections.push(`- Overall completeness: ${profile.dataQuality.completeness.toFixed(1)}%`);
    sections.push(
      `- Complete rows: ${profile.dataQuality.completeRows}/${profile.dataQuality.totalRows}`
    );
    sections.push(`- Missing values: ${profile.dataQuality.totalMissingValues}`);
    if (profile.dataQuality.duplicateRows > 0) {
      sections.push(`- ⚠️  Duplicate rows: ${profile.dataQuality.duplicateRows}`);
    }
    sections.push('');

    return sections.join('\n');
  }

  /**
   * Fallback metadata if LLM fails
   */
  private generateFallbackMetadata(
    data: ParsedData,
    tableName: string,
    profile: DatasetProfile
  ): string {
    return `Dataset: ${data.filename}

Structure:
- ${data.rowCount} records
- ${data.columnCount} columns
- Columns: ${data.headers.join(', ')}
- Data Quality: ${profile.dataQuality.completeness.toFixed(1)}% complete

Key Insights:
${profile.insights
  .slice(0, 5)
  .map(i => `- ${i}`)
  .join('\n')}

${profile.gaps.length > 0 ? `Data Gaps:\n${profile.gaps.map(g => `- ${g}`).join('\n')}` : ''}

Table Name: ${tableName}

This is a structured dataset that can be queried using SQL.`;
  }

  private formatNum(num: number): string {
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
