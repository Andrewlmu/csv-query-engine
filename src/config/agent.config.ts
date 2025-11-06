/**
 * Agent configuration for Agentic RAG
 * Centralized settings for agent behavior and tools
 */

import type { AgentConfig } from '../types/agent.types';

export const agentConfig: AgentConfig = {
  // Reasoning loop control
  maxLoops: parseInt(process.env.AGENT_MAX_LOOPS || '10'),
  timeout: parseInt(process.env.AGENT_TIMEOUT || '60000'), // 60 seconds

  // Tool configuration
  tools: {
    vectorSearch: {
      enabled: true,
      maxResults: parseInt(process.env.AGENT_VECTOR_SEARCH_MAX || '5'),
    },
    pdfParse: {
      enabled: true,
      useReducto: process.env.USE_REDUCTO === 'true',
    },
    excelParse: {
      enabled: true,
    },
  },

  // LLM configuration
  llm: {
    model: process.env.LLM_MODEL || 'gpt-5',
    temperature: 0, // Deterministic reasoning
    maxTokens: parseInt(process.env.MAX_TOKENS || '2000'),
  },

  // Memory configuration
  memory: {
    enabled: process.env.AGENT_MEMORY_ENABLED === 'true',
    type: (process.env.AGENT_MEMORY_TYPE as 'in-memory' | 'postgres') || 'in-memory',
  },
};

/**
 * System prompt for ReAct agent
 * Instructs the agent on how to use tools and reason
 */
export const REACT_SYSTEM_PROMPT = `You are an intelligent PE (Private Equity) analysis assistant with access to multiple tools.

Your goal is to answer questions about PE deals, companies, financial data, and documents by using the available tools strategically.

Available Tools:
- vector_search: Search the document database for relevant information
- parse_pdf: Extract and analyze content from PDF documents
- parse_excel: Extract and analyze data from Excel spreadsheets
- finish: Use this when you have gathered enough information to answer

ReAct Pattern Instructions:
1. THINK: Analyze what information you need
2. ACT: Choose the most appropriate tool and use it
3. OBSERVE: Carefully review the tool's output
4. REPEAT: Continue until you have sufficient information
5. FINISH: Call the 'finish' tool with your comprehensive answer

Important Guidelines:
- Always start by searching the vector database with vector_search
- Use parse_pdf or parse_excel only if you need specific document analysis
- Be concise but thorough in your reasoning
- Cite sources when providing information
- If a tool fails, try an alternative approach
- Call 'finish' when you have a complete answer - don't loop unnecessarily

Answer Format:
When calling finish, provide a well-structured answer with:
- Direct response to the question
- Supporting evidence from sources
- Source citations (filename, page/sheet if applicable)`;

/**
 * User message template
 */
export const formatUserMessage = (question: string, context?: string): string => {
  let message = `Question: ${question}`;

  if (context) {
    message += `\n\nContext from previous conversation:\n${context}`;
  }

  return message;
};

/**
 * Logging configuration
 */
export const loggingConfig = {
  enabled: process.env.AGENT_LOGGING_ENABLED !== 'false',
  traceSteps: process.env.AGENT_TRACE_STEPS === 'true',
  verbose: process.env.NODE_ENV === 'development',
};
