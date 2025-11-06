/**
 * Type definitions for Agentic RAG with LangGraph
 * Based on LangGraph API and ReAct pattern
 */

import { BaseMessage } from '@langchain/core/messages';

/**
 * Tool call from LLM (OpenAI function calling format)
 */
export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
}

/**
 * Tool result after execution
 */
export interface ToolResult {
  toolCallId: string;
  toolName: string;
  content: string;
  isError?: boolean;
}

/**
 * Tool definition for agent
 */
export interface AgentTool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<
      string,
      {
        type: string;
        description: string;
        default?: any;
      }
    >;
    required: string[];
  };
  function: (args: Record<string, any>) => Promise<any>;
}

/**
 * Agent state that flows through LangGraph
 */
export interface AgentState {
  // Input
  messages: BaseMessage[]; // Full conversation history
  question: string; // Current user question

  // Agent reasoning (ReAct pattern)
  thoughts: string[]; // Agent's reasoning steps
  actions: ToolCall[]; // Tools invoked
  observations: string[]; // Tool results

  // Output
  answer: string | null; // Final answer
  sources: Source[]; // Source documents used

  // Control flow
  loopCount: number; // Number of reasoning loops
  shouldContinue: boolean; // Continue reasoning or finish

  // Error handling
  error: string | null; // Error message if any
}

/**
 * Source document reference
 */
export interface Source {
  filename: string;
  chunk: string;
  similarity: number;
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  maxLoops: number; // Maximum reasoning loops
  timeout: number; // Timeout in milliseconds

  tools: {
    vectorSearch: {
      enabled: boolean;
      maxResults: number;
    };
    pdfParse: {
      enabled: boolean;
      useReducto: boolean;
    };
    excelParse: {
      enabled: boolean;
    };
  };

  llm: {
    model: string;
    temperature: number;
    maxTokens: number;
  };

  memory: {
    enabled: boolean;
    type: 'in-memory' | 'postgres';
  };
}

/**
 * Query result from agent
 */
export interface AgenticQueryResult {
  answer: string;
  sources: Source[];
  reasoning: {
    thoughts: string[];
    toolsUsed: string[];
    loopCount: number;
  };
  metadata: {
    duration: number;
    tokensUsed?: number;
    model: string;
  };
  error?: string;
}

/**
 * Tool execution context
 */
export interface ToolExecutionContext {
  toolName: string;
  args: Record<string, any>;
  startTime: number;
}

/**
 * Router decision
 */
export type RouterDecision = 'continue' | 'finish' | 'error';

/**
 * Node names in the graph
 */
export const NODE_NAMES = {
  LLM: 'llm',
  TOOLS: 'tools',
  ROUTER: 'router',
} as const;

/**
 * Edge names in the graph
 */
export const EDGE_NAMES = {
  CONTINUE: 'continue',
  FINISH: 'finish',
  ERROR: 'error',
} as const;
