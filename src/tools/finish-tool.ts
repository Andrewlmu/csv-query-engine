/**
 * FinishTool - Signals agent to complete and return answer
 * Required for ReAct pattern - agent calls this when ready to answer
 */

import type { AgentTool } from '../types/agent.types';

/**
 * Create finish tool
 */
export function createFinishTool(): AgentTool {
  return {
    name: 'finish',

    description: `Use this tool when you have gathered enough information to provide a comprehensive answer to the user's question.
Call this tool with your final answer after you have:
1. Searched for relevant information using available tools
2. Analyzed the results
3. Formulated a complete response

Do NOT call this tool if you still need more information - continue using other tools instead.`,

    parameters: {
      type: 'object',
      properties: {
        answer: {
          type: 'string',
          description: `Your comprehensive final answer to the user's question. Include:
- Direct response to the question
- Supporting evidence from sources
- Source citations (filename, page/sheet if applicable)
- Any relevant caveats or limitations`,
        },
      },
      required: ['answer'],
    },

    async function(args: Record<string, any>) {
      const { answer } = args;

      console.log(`🏁 Agent calling finish with answer (${answer.length} chars)`);

      // Simply return the answer
      // The graph router will detect this tool call and end the loop
      return {
        finished: true,
        answer: answer,
      };
    },
  };
}
