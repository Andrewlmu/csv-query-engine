import type { AgentTool } from '../../types/agent.types';
import { VectorSearch } from '../../services/vectorSearch';

export function createGetDatasetInsightsTool(vectorSearch: VectorSearch): AgentTool {
  return {
    name: 'get_dataset_insights',

    description: `Retrieve comprehensive insights and understanding about a dataset WITHOUT querying it.

Use this tool to:
- Get statistical summaries (ranges, averages, distributions)
- Understand data quality and completeness
- Discover temporal gaps or missing data
- Learn about patterns, trends, and anomalies
- Get a holistic view of what data is available

This tool is PROACTIVE - use it BEFORE querying to:
1. Understand what data exists and its quality
2. Identify gaps or limitations
3. Get statistical context for better answers
4. Determine if the data can answer the user's question

Example: User asks "What's our revenue trend?" → First use this tool to understand:
- What time periods are covered
- If there are any gaps
- Revenue ranges and typical values
- Data completeness

Returns: Comprehensive insights document with statistics, gaps, and patterns.`,

    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Semantic query to find relevant dataset insights (e.g., "revenue data", "company financials")',
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of datasets to get insights for (default: 2)',
          default: 2,
        },
      },
      required: ['query'],
    },

    async function(args: Record<string, any>) {
      const { query, maxResults = 2 } = args;

      try {
        console.log(`🔧 Tool: get_dataset_insights`);
        console.log(`   Query: "${query}"`);

        // Search for insights documents (type: dataset_insights)
        const insightsResults = await vectorSearch.search(query, maxResults * 3);

        // Filter to insights and statistics documents
        const relevantDocs = insightsResults.filter(
          r =>
            r.metadata?.type === 'dataset_insights' ||
            r.metadata?.type === 'dataset_statistics' ||
            r.metadata?.type === 'dataset_metadata'
        );

        if (relevantDocs.length === 0) {
          return {
            found: false,
            message: 'No dataset insights found matching your query',
          };
        }

        // Group by table name and aggregate all information
        const datasetInsights = new Map<
          string,
          {
            tableName: string;
            filename: string;
            description?: string;
            statistics?: string;
            insights?: string;
            gaps: string[];
            anomalies: string[];
            dataQuality?: {
              completeness: number;
              missingValues: number;
            };
            schema: any[];
          }
        >();

        for (const doc of relevantDocs) {
          const tableName = doc.metadata?.tableId || 'unknown';

          if (!datasetInsights.has(tableName)) {
            datasetInsights.set(tableName, {
              tableName,
              filename: doc.metadata?.filename || 'unknown',
              gaps: doc.metadata?.gaps || [],
              anomalies: doc.metadata?.anomalies || [],
              dataQuality: doc.metadata?.dataQuality,
              schema: doc.metadata?.schema || [],
            });
          }

          const dataset = datasetInsights.get(tableName)!;

          // Aggregate different document types
          if (doc.metadata?.type === 'dataset_metadata') {
            dataset.description = doc.content;
          } else if (doc.metadata?.type === 'dataset_statistics') {
            dataset.statistics = doc.content;
          } else if (doc.metadata?.type === 'dataset_insights') {
            dataset.insights = doc.content;
          }
        }

        // Format response
        const insights = Array.from(datasetInsights.values())
          .slice(0, maxResults)
          .map(dataset => {
            const sections: string[] = [];

            // Basic info
            sections.push(`Dataset: ${dataset.filename} (Table: ${dataset.tableName})`);

            // Data quality
            if (dataset.dataQuality) {
              sections.push(
                `Data Quality: ${dataset.dataQuality.completeness.toFixed(1)}% complete (${dataset.dataQuality.missingValues} missing values)`
              );
            }

            // Schema info
            if (dataset.schema && dataset.schema.length > 0) {
              const columns = dataset.schema.map(col => `${col.name} (${col.type})`).join(', ');
              sections.push(`Columns: ${columns}`);
            }

            // Gaps
            if (dataset.gaps && dataset.gaps.length > 0) {
              sections.push(`\nData Gaps:`);
              dataset.gaps.forEach(gap => sections.push(`  - ${gap}`));
            }

            // Anomalies
            if (dataset.anomalies && dataset.anomalies.length > 0) {
              sections.push(`\nAnomalies:`);
              dataset.anomalies.forEach(anomaly => sections.push(`  - ${anomaly}`));
            }

            // Include full insights if available
            if (dataset.insights) {
              sections.push(`\n${dataset.insights}`);
            }

            // Include statistics if available
            if (dataset.statistics) {
              sections.push(`\n${dataset.statistics}`);
            }

            return {
              tableName: dataset.tableName,
              filename: dataset.filename,
              summary: sections.join('\n'),
              dataQuality: dataset.dataQuality,
              gaps: dataset.gaps,
              schema: dataset.schema,
            };
          });

        console.log(`✅ Retrieved insights for ${insights.length} dataset(s)`);

        return {
          found: true,
          count: insights.length,
          insights,
        };
      } catch (error: any) {
        console.error(`❌ get_dataset_insights error: ${error.message}`);
        return {
          found: false,
          error: error.message,
        };
      }
    },
  };
}
