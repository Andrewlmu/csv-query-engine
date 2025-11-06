# Phase 2 Implementation Plan: Agentic RAG with LangGraph

**Status**: Planning Phase - Awaiting Approval
**Created**: 2025-11-06
**Goal**: Transform linear RAG into autonomous agent with reasoning and tool use

---

## Executive Summary

Phase 2 will transform our basic RAG system into an **Agentic RAG** that can:
- 🧠 **Reason autonomously** - Decide which tools to use and when
- 🔧 **Use multiple tools** - Vector search, PDF parsing, Excel analysis, web search (future)
- 💭 **Plan and reflect** - Multi-step reasoning with ReAct pattern
- 🧩 **Self-correct** - Validate answers and retry with different approaches
- 💾 **Remember context** - Maintain conversation memory across queries

### Key Transformation

**Current System (Basic RAG)**:
```
User Question → Vector Search → GPT-5 → Answer
```

**Phase 2 (Agentic RAG)**:
```
User Question
    ↓
[Agent Reasoning Loop]
    ├─ Thought: "I need to search for PE deal information"
    ├─ Action: vector_search("PE deals 2024")
    ├─ Observation: "Found 5 relevant documents"
    ├─ Thought: "Let me parse the PDF for more details"
    ├─ Action: parse_pdf("deal_summary.pdf")
    ├─ Observation: "Extracted detailed terms"
    ├─ Thought: "Now I can answer comprehensively"
    └─ Action: finish(answer)
    ↓
Answer
```

---

## Architecture Design

### 1. High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│           QueryEngine (Frontend)                │
│  - Receives user questions                      │
│  - Routes to AgenticRAG or BasicRAG             │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
        ┌────────────────┐
        │ Feature Flag?  │
        └────────────────┘
         │             │
   YES   │             │  NO
         ↓             ↓
┌────────────────┐   ┌──────────────┐
│  AgenticRAG    │   │  BasicRAG    │
│  (LangGraph)   │   │  (Current)   │
└────────────────┘   └──────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│       ReAct Agent Graph             │
│  ┌─────────────────────────────┐   │
│  │  1. LLM Node (Reasoning)    │   │
│  │     - Analyze question      │   │
│  │     - Decide which tool     │   │
│  │     - Generate thoughts     │   │
│  └──────────┬──────────────────┘   │
│             │                       │
│             ↓                       │
│  ┌─────────────────────────────┐   │
│  │  2. Tool Node (Acting)      │   │
│  │     ├─ vector_search        │   │
│  │     ├─ parse_pdf (Reducto)  │   │
│  │     ├─ parse_excel (XLSX)   │   │
│  │     ├─ web_search (future)  │   │
│  │     └─ finish               │   │
│  └──────────┬──────────────────┘   │
│             │                       │
│             ↓                       │
│  ┌─────────────────────────────┐   │
│  │  3. Router Node             │   │
│  │     - Check if done         │   │
│  │     - Loop back to LLM      │   │
│  │     - Or finish             │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 2. Component Structure

```
src/
├── agents/
│   ├── agenticRAG.ts              [NEW] - Main agentic RAG controller
│   ├── react-agent.ts             [NEW] - ReAct pattern implementation
│   └── agent-state.ts             [NEW] - State management and types
├── tools/
│   ├── vector-search-tool.ts     [NEW] - Wrap VectorSearch as tool
│   ├── pdf-parse-tool.ts         [NEW] - Wrap Reducto/pdf-parse as tool
│   ├── excel-parse-tool.ts       [NEW] - Wrap XLSX parser as tool
│   └── tool-registry.ts          [NEW] - Tool discovery and management
├── services/
│   └── queryEngine.ts            [MODIFIED] - Add agentic routing
├── types/
│   └── agent.types.ts            [NEW] - Agent-specific types
└── config/
    └── agent.config.ts           [NEW] - Agent configuration
```

### 3. State Definition

```typescript
// Agent state flows through the graph
interface AgentState {
  // User input
  messages: BaseMessage[];  // Conversation history
  question: string;         // Current question

  // Agent reasoning
  thoughts: string[];       // Agent's reasoning steps
  actions: ToolCall[];      // Tools invoked
  observations: string[];   // Tool results

  // Results
  answer: string | null;    // Final answer
  sources: Source[];        // Source documents

  // Metadata
  loopCount: number;        // Prevent infinite loops
  error: string | null;     // Error tracking
}
```

### 4. Tool Definitions

```typescript
const tools = [
  {
    name: "vector_search",
    description: "Search existing documents for relevant information about PE deals, companies, and financial data",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        maxResults: { type: "number", default: 5 }
      },
      required: ["query"]
    },
    function: async (params) => vectorSearch.search(params.query, params.maxResults)
  },

  {
    name: "parse_pdf",
    description: "Parse and extract text from a PDF document using Reducto (with fallback to pdf-parse)",
    parameters: {
      type: "object",
      properties: {
        filePath: { type: "string", description: "Path to PDF file" }
      },
      required: ["filePath"]
    },
    function: async (params) => documentParser.parsePDF(params.filePath)
  },

  {
    name: "parse_excel",
    description: "Parse and extract data from Excel spreadsheet",
    parameters: {
      type: "object",
      properties: {
        filePath: { type: "string", description: "Path to Excel file" },
        sheetName: { type: "string", description: "Optional sheet name" }
      },
      required: ["filePath"]
    },
    function: async (params) => documentParser.parseExcel(params.filePath, params.sheetName)
  },

  {
    name: "finish",
    description: "Use this when you have enough information to answer the question",
    parameters: {
      type: "object",
      properties: {
        answer: { type: "string", description: "The final answer" }
      },
      required: ["answer"]
    },
    function: async (params) => ({ answer: params.answer })
  }
];
```

---

## ReAct Pattern Implementation

### 1. Graph Structure

```typescript
import { StateGraph, Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";

// Define state
const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  question: Annotation<string>(),
  answer: Annotation<string | null>(),
  loopCount: Annotation<number>(),
});

// Build graph
const workflow = new StateGraph(StateAnnotation)
  // Add nodes
  .addNode("llm", llmNode)           // Agent reasoning
  .addNode("tools", toolNode)        // Tool execution
  .addNode("router", routerNode)     // Continue or finish

  // Add edges
  .addEdge(START, "llm")             // Start with LLM
  .addConditionalEdges(
    "llm",
    shouldContinue,                   // Check if agent wants to use tools
    {
      continue: "tools",              // Use tools
      end: END                        // Finish
    }
  )
  .addEdge("tools", "router")        // After tools, route
  .addConditionalEdges(
    "router",
    checkLoopCount,                   // Prevent infinite loops
    {
      continue: "llm",                // Loop back for more reasoning
      end: END                        // Max loops reached
    }
  );

const graph = workflow.compile();
```

### 2. Node Functions

**LLM Node** (Reasoning):
```typescript
async function llmNode(state: typeof StateAnnotation.State) {
  const prompt = `You are a PE analysis assistant with access to these tools:
${tools.map(t => `- ${t.name}: ${t.description}`).join('\n')}

Question: ${state.question}

Previous thoughts: ${state.thoughts.join('\n')}
Previous observations: ${state.observations.join('\n')}

Think step by step:
1. What information do I need?
2. Which tool should I use?
3. What parameters should I provide?

Use tools to gather information, then call 'finish' with your answer.`;

  const response = await llm.invoke(prompt, {
    tools: tools,  // OpenAI function calling
  });

  return {
    messages: [response],
    thoughts: [...state.thoughts, response.content],
  };
}
```

**Tool Node** (Acting):
```typescript
const toolNode = new ToolNode(tools);  // LangGraph handles tool execution
```

**Router Node** (Decision):
```typescript
function routerNode(state: typeof StateAnnotation.State) {
  const lastMessage = state.messages[state.messages.length - 1];

  // Check if agent called 'finish' tool
  if (lastMessage.tool_calls?.some(tc => tc.name === 'finish')) {
    return { answer: lastMessage.tool_calls[0].args.answer };
  }

  // Check loop limit
  if (state.loopCount >= 10) {
    return {
      answer: "Maximum reasoning loops reached. Unable to complete.",
      error: "MAX_LOOPS_EXCEEDED"
    };
  }

  return { loopCount: state.loopCount + 1 };
}
```

### 3. Conditional Edge Functions

```typescript
function shouldContinue(state: typeof StateAnnotation.State) {
  const lastMessage = state.messages[state.messages.length - 1];

  // If LLM wants to use tools
  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return "continue";
  }

  // Otherwise finish
  return "end";
}

function checkLoopCount(state: typeof StateAnnotation.State) {
  return state.loopCount < 10 ? "continue" : "end";
}
```

---

## Integration Strategy

### Phase 2A: Parallel Testing (Week 1)

**Keep both systems running side-by-side:**

```typescript
export class QueryEngine {
  private basicRAG: BasicRAG;      // Current system
  private agenticRAG: AgenticRAG;  // New system

  async query(question: string, useAgent: boolean = false): Promise<QueryResult> {
    // Feature flag: USE_AGENTIC_RAG=true/false
    if (process.env.USE_AGENTIC_RAG === 'true' && useAgent) {
      console.log('🤖 Using Agentic RAG');

      try {
        return await this.agenticRAG.query(question);
      } catch (error) {
        console.error('❌ Agentic RAG failed, falling back:', error);
        return await this.basicRAG.query(question);  // Graceful fallback
      }
    }

    // Default to basic RAG
    console.log('📄 Using Basic RAG');
    return await this.basicRAG.query(question);
  }
}
```

### Phase 2B: Gradual Rollout (Week 2)

**A/B Testing Pattern:**
```typescript
async query(question: string): Promise<QueryResult> {
  // Gradually increase agentic RAG usage
  const agenticPercentage = parseInt(process.env.AGENTIC_PERCENTAGE || '0');
  const useAgentic = Math.random() * 100 < agenticPercentage;

  // Log for comparison
  const start = Date.now();
  const result = await this.query(question, useAgentic);

  logMetric({
    method: useAgentic ? 'agentic' : 'basic',
    duration: Date.now() - start,
    success: !!result.answer,
    question: question.substring(0, 100),
  });

  return result;
}
```

### Phase 2C: Full Migration (Week 3)

**Make agentic RAG default:**
```typescript
// .env
USE_AGENTIC_RAG=true
AGENTIC_PERCENTAGE=100
```

---

## Memory & Conversation History

### Short-Term Memory (Within Query)

```typescript
// State automatically maintains message history
interface AgentState {
  messages: BaseMessage[];  // Full conversation context
  // LangGraph passes this to each node
}
```

### Long-Term Memory (Across Queries) - Phase 2.5

```typescript
import { MemorySaver } from "@langchain/langgraph";

const checkpointer = new MemorySaver();

const graph = workflow.compile({
  checkpointer,  // Enables persistence
});

// Query with thread ID for conversation continuity
await graph.invoke(
  { question: "What are the latest PE deals?" },
  { configurable: { thread_id: "user-123-session-abc" } }
);

// Next query in same thread remembers context
await graph.invoke(
  { question: "Tell me more about the first one" },  // Refers to previous answer
  { configurable: { thread_id: "user-123-session-abc" } }
);
```

---

## Error Handling & Resilience

### 1. Tool Execution Errors

```typescript
async function executeTool(toolCall: ToolCall): Promise<string> {
  try {
    const tool = toolRegistry.get(toolCall.name);
    const result = await tool.function(toolCall.args);
    return JSON.stringify(result);

  } catch (error) {
    console.error(`Tool ${toolCall.name} failed:`, error);

    // Return error as observation (agent can handle it)
    return `Error executing ${toolCall.name}: ${error.message}. Try a different approach.`;
  }
}
```

### 2. LLM Failures

```typescript
async function llmNode(state: AgentState) {
  const maxRetries = 3;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await llm.invoke(prompt, { tools });
      return { messages: [response] };

    } catch (error) {
      console.error(`LLM attempt ${i + 1} failed:`, error);

      if (i === maxRetries - 1) {
        // Final failure - graceful degradation
        return {
          answer: "I'm having trouble processing your question. Please try again.",
          error: "LLM_FAILURE"
        };
      }

      await sleep(Math.pow(2, i) * 1000);  // Exponential backoff
    }
  }
}
```

### 3. Infinite Loop Protection

```typescript
const MAX_LOOPS = 10;

function routerNode(state: AgentState) {
  if (state.loopCount >= MAX_LOOPS) {
    console.warn('⚠️  Max loops reached, forcing completion');

    return {
      answer: `Based on the information gathered: ${summarize(state.observations)}`,
      error: "MAX_LOOPS_EXCEEDED"
    };
  }

  return { loopCount: state.loopCount + 1 };
}
```

### 4. Graceful Fallback to Basic RAG

```typescript
async query(question: string): Promise<QueryResult> {
  try {
    return await this.agenticRAG.query(question);

  } catch (error) {
    console.error('Agentic RAG failed:', error);

    // Automatic fallback
    console.log('📄 Falling back to Basic RAG');
    return await this.basicRAG.query(question);
  }
}
```

---

## Implementation Steps

### Week 1: Foundation

**Day 1-2: Dependencies & Types**
- [ ] Install LangGraph and dependencies
- [ ] Create agent state types
- [ ] Create tool interface definitions
- [ ] Set up agent configuration

**Day 3-4: Tool Wrappers**
- [ ] Wrap VectorSearch as tool
- [ ] Wrap DocumentParser (PDF/Excel) as tools
- [ ] Create tool registry
- [ ] Add tool validation

**Day 5: Basic Graph**
- [ ] Implement simple LangGraph with one tool
- [ ] Test graph execution
- [ ] Verify state flow

### Week 2: ReAct Agent

**Day 6-7: LLM Node**
- [ ] Implement reasoning node
- [ ] Add ReAct prompt template
- [ ] Test with OpenAI function calling

**Day 8-9: Tool Node & Router**
- [ ] Implement ToolNode
- [ ] Add router with loop detection
- [ ] Test multi-step reasoning

**Day 10: Integration**
- [ ] Integrate into QueryEngine
- [ ] Add feature flag
- [ ] Test graceful fallback

### Week 3: Polish & Production

**Day 11-12: Error Handling**
- [ ] Add retry logic
- [ ] Implement timeout handling
- [ ] Test edge cases

**Day 13: Memory (Optional)**
- [ ] Add MemorySaver checkpointing
- [ ] Test conversation continuity

**Day 14: Testing & Documentation**
- [ ] Comprehensive integration tests
- [ ] Performance benchmarks
- [ ] Update documentation

---

## Configuration

### Environment Variables

```bash
# Agent Configuration
USE_AGENTIC_RAG=true
AGENTIC_PERCENTAGE=100            # 0-100, for gradual rollout
AGENT_MAX_LOOPS=10                # Prevent infinite loops
AGENT_TIMEOUT=60000               # 60 seconds

# Memory (Optional)
AGENT_MEMORY_ENABLED=false
AGENT_MEMORY_TYPE=in-memory       # in-memory or postgres

# Observability
AGENT_LOGGING_ENABLED=true
AGENT_TRACE_STEPS=true            # Log each thought-action-observation
```

### Agent Config

```typescript
// src/config/agent.config.ts
export const agentConfig = {
  maxLoops: parseInt(process.env.AGENT_MAX_LOOPS || '10'),
  timeout: parseInt(process.env.AGENT_TIMEOUT || '60000'),

  tools: {
    vectorSearch: { enabled: true, maxResults: 5 },
    pdfParse: { enabled: true, useReducto: true },
    excelParse: { enabled: true },
  },

  llm: {
    model: process.env.LLM_MODEL || 'gpt-5',
    temperature: 0,  // Deterministic for reasoning
    maxTokens: 2000,
  },

  memory: {
    enabled: process.env.AGENT_MEMORY_ENABLED === 'true',
    type: process.env.AGENT_MEMORY_TYPE || 'in-memory',
  },
};
```

---

## Testing Strategy

### 1. Unit Tests

```typescript
describe('AgenticRAG', () => {
  it('should route to vector_search tool for document questions');
  it('should handle tool execution errors gracefully');
  it('should prevent infinite loops with max loop count');
  it('should fall back to basic RAG on critical errors');
});

describe('ReActAgent', () => {
  it('should complete simple single-tool queries');
  it('should handle multi-step reasoning');
  it('should call finish when answer is ready');
});

describe('Tools', () => {
  it('vector_search should return relevant documents');
  it('parse_pdf should handle Reducto fallback');
  it('parse_excel should extract data correctly');
});
```

### 2. Integration Tests

```typescript
describe('End-to-End Agent Queries', () => {
  it('should answer document search question', async () => {
    const result = await agenticRAG.query('What are the top PE deals?');
    expect(result.answer).toBeTruthy();
    expect(result.sources.length).toBeGreaterThan(0);
  });

  it('should use multiple tools for complex questions', async () => {
    const result = await agenticRAG.query(
      'Parse deal_summary.pdf and tell me the top 3 deals'
    );
    expect(result.toolsUsed).toContain('parse_pdf');
    expect(result.toolsUsed).toContain('vector_search');
  });

  it('should fall back to basic RAG on agent failure', async () => {
    // Simulate agent failure
    jest.spyOn(agenticRAG, 'query').mockRejectedValue(new Error('Agent error'));

    const result = await queryEngine.query('Test question');
    expect(result.answer).toBeTruthy();  // Basic RAG succeeded
  });
});
```

### 3. Comparison Testing

```typescript
// Compare agentic vs basic RAG
const testQuestions = [
  'What are the latest PE deals?',
  'Analyze the Q1 2024 financial data',
  'What companies did Blackstone invest in?',
];

for (const question of testQuestions) {
  const basicResult = await basicRAG.query(question);
  const agenticResult = await agenticRAG.query(question);

  console.log(`
Question: ${question}
Basic RAG: ${basicResult.answer.substring(0, 200)}...
Agentic RAG: ${agenticResult.answer.substring(0, 200)}...
Agentic Tools: ${agenticResult.toolsUsed.join(', ')}
  `);
}
```

---

## Success Metrics

### Functionality
- ✅ Agent successfully uses tools autonomously
- ✅ Multi-step reasoning works (2+ tool calls per query)
- ✅ Graceful fallback to basic RAG on failures
- ✅ No infinite loops (max loop protection works)
- ✅ Answers are as good or better than basic RAG

### Performance
- ⏱️ Agentic queries < 10 seconds (95th percentile)
- ⏱️ Tool calls < 2 seconds each
- ⏱️ Fallback latency < 100ms

### Reliability
- 🛡️ 99%+ success rate (with fallback)
- 🛡️ Zero application crashes
- 🛡️ Proper error handling for all edge cases

### Observability
- 📊 Every reasoning step logged
- 📊 Tool usage metrics tracked
- 📊 Performance compared to basic RAG

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Agent makes poor tool choices | Medium | Medium | Add validation, test with diverse questions |
| Infinite reasoning loops | High | Low | Max loop protection, timeout |
| Increased latency | Medium | High | Async tools, caching, timeouts |
| LLM costs increase (more tokens) | Medium | High | Monitor usage, set limits, optimize prompts |
| Complex debugging | Medium | Medium | Structured logging, trace visualization |
| Breaking changes in LangGraph | Low | Low | Pin versions, monitor updates |

---

## Cost Implications

### Token Usage Increase

**Basic RAG**:
- Input: ~1,500 tokens (context + question)
- Output: ~300 tokens (answer)
- **Total**: ~1,800 tokens per query

**Agentic RAG** (estimated):
- Input: ~3,000 tokens (reasoning steps + tool results)
- Output: ~800 tokens (thoughts + actions + answer)
- **Total**: ~3,800 tokens per query

**Cost Impact**: ~2.1x increase

**Mitigation**:
- Optimize prompts (shorter system prompts)
- Use GPT-4o-mini for tool selection (cheaper)
- Cache frequently accessed context
- Set max loops to prevent runaway costs

---

## Future Enhancements (Phase 3+)

Once Phase 2 is stable:

1. **Advanced Memory** (Phase 2.5)
   - PostgreSQL checkpointing
   - Conversation threads
   - User preference learning

2. **More Tools** (Phase 3)
   - Web search (Tavily, Perplexity)
   - Data visualization generation
   - Email/Slack notifications
   - API integrations

3. **Multi-Agent Collaboration** (Phase 4)
   - Specialist agents (Finance, Legal, Technical)
   - Agent handoff and collaboration
   - Parallel tool execution

4. **Advanced Planning** (Phase 5)
   - Long-term task decomposition
   - Proactive information gathering
   - Hypothesis-driven reasoning

---

## Discussion Points

Before implementation, let's discuss:

### 1. **Scope of Phase 2**
- **Option A**: Minimal MVP (3 tools, basic ReAct, no memory) - 1 week
- **Option B**: Standard (3 tools, full ReAct, optional memory) - 2 weeks ⭐ RECOMMENDED
- **Option C**: Advanced (5+ tools, memory, monitoring) - 3 weeks

### 2. **Tool Selection for MVP**
- ✅ vector_search (essential)
- ✅ parse_pdf (Reducto with fallback)
- ✅ parse_excel (basic XLSX)
- ❓ web_search (adds complexity, but high value)
- ❓ finish (required for ReAct pattern)

### 3. **Memory Strategy**
- **Option A**: No memory (stateless) - Simplest
- **Option B**: In-memory MemorySaver - Good for testing ⭐
- **Option C**: PostgreSQL checkpointing - Production-ready

### 4. **Rollout Strategy**
- **Option A**: Feature flag only (manual toggle) - Safest
- **Option B**: A/B testing with percentage rollout ⭐ RECOMMENDED
- **Option C**: Immediate full migration - Risky

### 5. **Prompt Engineering**
- Start with simple ReAct prompt or advanced chain-of-thought?
- How verbose should agent reasoning be?
- Should we show reasoning to users or hide it?

### 6. **Performance vs Intelligence**
- Prioritize speed (max 2 loops) or thoroughness (max 10 loops)?
- Use GPT-5 for all reasoning or GPT-4o-mini for tool selection?

---

## Recommendation

**Proceed with Option B: Standard Implementation (2 weeks)**

**Scope**:
- 4 tools: vector_search, parse_pdf, parse_excel, finish
- Full ReAct pattern with LangGraph
- In-memory MemorySaver (for testing)
- A/B testing rollout (0% → 25% → 50% → 100%)
- Comprehensive error handling
- Graceful fallback to basic RAG

**Why**:
- ✅ Proven ReAct pattern (industry standard)
- ✅ Manageable complexity
- ✅ Real agent capabilities (tool use, reasoning, memory)
- ✅ Safe rollout strategy
- ✅ Foundation for future enhancements

**Timeline**:
- Week 1: Dependencies, tools, basic graph
- Week 2: ReAct agent, integration, testing

**Risk**: Low (graceful fallback ensures zero downtime)

**Value**: High (autonomous reasoning, tool use, better answers)

---

## Next Steps

1. **Review this plan** - Discuss scope, tools, memory, rollout
2. **Approve to proceed** - Confirm recommendations
3. **Begin implementation** - Start with Week 1, Day 1

---

**Questions or concerns? Let's discuss before starting implementation.**
