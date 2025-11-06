# Agentic RAG Implementation Index
## Comprehensive Guide for Phase 2: Agentic RAG with LangGraph

**Generated:** 2025-11-06
**Purpose:** Complete reference for implementing sophisticated agentic RAG system using LangGraph, ReAct pattern, and modern AI agent architectures.

---

## Table of Contents

1. [LangGraph Core Concepts](#1-langgraph-core-concepts)
2. [Agent Architecture Design](#2-agent-architecture-design)
3. [ReAct Pattern Implementation](#3-react-pattern-implementation)
4. [Tool Definition and Management](#4-tool-definition-and-management)
5. [State and Memory Management](#5-state-and-memory-management)
6. [Error Handling and Resilience](#6-error-handling-and-resilience)
7. [Complete Code Examples](#7-complete-code-examples)
8. [Best Practices and Gotchas](#8-best-practices-and-gotchas)
9. [Integration Strategy](#9-integration-strategy)
10. [Testing Approaches](#10-testing-approaches)

---

## 1. LangGraph Core Concepts

### 1.1 Overview

**LangGraph** is "a low-level orchestration framework and runtime for building, managing, and deploying long-running, stateful agents" trusted by companies like Klarna, Replit, and Elastic.

**Three Critical Components:**
- **Nodes**: TypeScript functions that encapsulate business logic and process state data
- **Edges**: Functions determining which node executes next, enabling conditional routing
- **State**: A shared data structure representing the application's current snapshot

**Core Principles:**
1. **Controllability**: Low-level architecture provides high control over workflows, crucial for managing non-deterministic LLM outputs
2. **Human-in-the-Loop**: Built-in persistence enables workflows pausing for human decision-making
3. **Streaming First**: Native streaming support enables real-time updates during long-running operations

### 1.2 StateGraph API Reference

#### Constructor Signatures

```typescript
// Using Annotation.Root (Recommended for TypeScript)
new StateGraph(state: AnnotationRoot<SD>, options?: {
  context?: C | AnnotationRoot<ToStateDefinition<C>>
  input?: I | AnnotationRoot<ToStateDefinition<I>>
  output?: O | AnnotationRoot<ToStateDefinition<O>>
  interrupt?: InterruptType
  nodes?: N[]
  writer?: WriterType
})

// Using Zod schema
new StateGraph(state: InteropZodObject, options?: {...})

// With input/output schemas
new StateGraph(
  fields: StateGraphArgsWithInputOutputSchemas<SD, O>,
  contextSchema?: C
)
```

#### State Definition with Annotation

```typescript
import { StateGraph, Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

// Define state with reducers
const StateAnnotation = Annotation.Root({
  sentiment: Annotation<string>,
  messages: Annotation<BaseMessage[]>({
    reducer: (left: BaseMessage[], right: BaseMessage | BaseMessage[]) => {
      if (Array.isArray(right)) {
        return left.concat(right);
      }
      return left.concat([right]);
    },
    default: () => [],
  }),
});
```

#### Core Methods

**addNode() - Add Nodes to Graph**

```typescript
// Single node with object
addNode<K extends string, NodeMap>(nodes: NodeMap): StateGraph<...>

// Multiple nodes as tuples
addNode<K extends string>(
  nodes: [key: K, action: NodeAction, options?: StateGraphAddNodeOptions][]
): StateGraph<...>

// Single named node
addNode<K extends string>(
  key: K,
  action: NodeAction,
  options?: StateGraphAddNodeOptions
): StateGraph<...>
```

**addEdge() - Connect Nodes**

```typescript
addEdge(
  startKey: "__start__" | N | N[],
  endKey: "__end__" | N
): this
```

Links nodes sequentially. Use `"__start__"` for entry points and `"__end__"` for exit points.

**addConditionalEdges() - Branching Logic**

```typescript
addConditionalEdges(
  source: BranchOptions<S, N, LangGraphRunnableConfig>
): this

addConditionalEdges(
  source: N,
  path: RunnableLike<S, BranchPathReturnValue, LangGraphRunnableConfig>,
  pathMap?: Record<string, "__end__" | N> | ("__end__" | N)[]
): this
```

Enables conditional routing to different nodes based on state values or computed conditions.

**addSequence() - Chain Nodes**

```typescript
addSequence<K extends string>(
  nodes: [key: K, action: NodeAction, options?: StateGraphAddNodeOptions][]
): StateGraph<...>
```

Creates sequential node connections automatically.

**compile() - Produce Executable Graph**

```typescript
compile(options?: {
  cache?: BaseCache<unknown>
  checkpointer?: boolean | BaseCheckpointSaver<number>
  description?: string
  interruptAfter?: "*" | N[]
  interruptBefore?: "*" | N[]
  name?: string
  store?: BaseStore
}): CompiledStateGraph<{...}, {...}, N, I, O, C, NodeReturnType, InterruptType, WriterType>
```

Finalizes graph structure for execution. Must be called before invoking the graph.

### 1.3 Installation and Setup

```bash
# Install core packages
npm install @langchain/langgraph @langchain/core

# Install LLM providers
npm install @langchain/openai      # For OpenAI/GPT models
npm install @langchain/anthropic   # For Claude models

# Install checkpointing (for memory)
npm install @langchain/langgraph-checkpoint

# Install tools
npm install @langchain/community   # For various tools
```

### 1.4 Basic Graph Structure

```typescript
import { StateGraph, START, END, MessagesAnnotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

// Simple graph with MessagesAnnotation
const model = new ChatOpenAI({ temperature: 0 });

const graph = new StateGraph(MessagesAnnotation)
  .addNode("llm", async (state) => {
    const response = await model.invoke(state.messages);
    return { messages: [response] };
  })
  .addEdge(START, "llm")
  .addEdge("llm", END)
  .compile();

// Invoke the graph
const result = await graph.invoke({
  messages: [{ role: "user", content: "Hello!" }]
});
```

### 1.5 Key Capabilities

1. **Durable Execution** — Agents persist through failures
2. **Human-in-the-Loop** — Inspect and modify agent state during execution
3. **Comprehensive Memory** — Both session and cross-session state management
4. **LangSmith Integration** — Debugging and observability tools
5. **Production Deployment** — Scalable infrastructure for stateful workflows

---

## 2. Agent Architecture Design

### 2.1 Agentic RAG Architecture

Agentic RAG "transcends traditional RAG limitations by embedding autonomous AI agents into the RAG pipeline," enabling dynamic decision-making and workflow optimization.

**Three Core Stages:**

#### 1. Intelligent Storage
- Dynamic indexing decisions (agents decide what and how to store)
- High-precision document parsing
- Rich metadata creation
- Adaptive chunking strategies
- Embedding model selection

#### 2. Dynamic Retrieval
A "Retriever Router" component enables agents to autonomously select appropriate tools by "analyzing the incoming query and deciding the best course of action. This might mean querying a SQL database, using a web search API, or searching internal product documentation."

**Key capabilities:**
- Multi-source data access (vector stores, SQL databases, web APIs)
- Intent classification before retrieval
- Query-specific strategy selection

#### 3. Verified Generation
An "Answer Critic" function evaluates completeness, iteratively retrieving information until the response fully addresses the original query.

### 2.2 Core Agent Design Patterns

Four key agentic design patterns enable sophisticated behavior:

**1. Reflection**
- Self-evaluation of outputs
- Iterative refinement based on criteria
- Quality validation before final response

**2. Planning**
"Planning is a key design pattern in agentic workflows that enables agents to autonomously decompose complex tasks into smaller, manageable subtasks. This capability is essential for multi-hop reasoning and iterative problem-solving in dynamic and uncertain scenarios."

**3. Tool Use**
"Modern agentic workflows incorporate tool use for a variety of applications, including information retrieval, computational reasoning, and interfacing with external systems. These developments facilitate sophisticated workflows where agents autonomously select and execute the most relevant tools for a given task."

**4. Multi-agent Collaboration**
"Multi-agent collaboration is a key design pattern in agentic workflows that enables task specialization and parallel processing" through coordination between specialized agents.

### 2.3 Agentic RAG vs Traditional RAG

| Aspect | Simple RAG | Agentic RAG |
|--------|-----------|------------|
| Workflow | Fixed retrieve-then-read | Dynamic, multi-step |
| Decision-making | Predetermined path | Agent-driven routing |
| Sources | Single knowledge base | Multiple diverse sources |
| Adaptability | Rigid one-size-fits-all | Query-specific strategies |
| Retrieval | Static preprocessing step | Adaptive, sequenced operation in reasoning loop |

### 2.4 ReAct Agent Architecture

ReAct (Reasoning + Acting) agents follow an iterative "think, act, observe" cycle:

**Components:**
- **LLM Core**: Makes decisions about tool usage
- **Tool Environment**: Executes requested actions
- **Message Loop**: Maintains conversation history and state

**Basic Flow:**
```
User Query → LLM Reasoning → Tool Invocation → Result Observation → Repeat until completion
```

"In Agentic RAG, retrieval is no longer a static preprocessing step—it becomes an adaptive, sequenced operation embedded in the reasoning loop. This aligns closely with emerging patterns like ReAct (Reasoning + Acting) and LangGraph's agent state machines, where large language models generate thought-action-observation cycles to navigate complex tasks."

### 2.5 Production Architecture Patterns

**Modular Design:**
"To deploy a high-performance, production-ready RAG system, teams should adopt modular RAG patterns by separating retriever, generator, and orchestration logic for easier updates and debugging."

**Hybrid Search:**
"Leverage hybrid indexing by blending semantic and keyword-based search for flexible and robust content retrieval."

**Multi-Agent Systems:**
- **Document Agents**: Assigned to individual documents for specialized handling
- **Meta-agent**: Orchestrates interactions between document agents
- **RAG Agents**: Combine retrieval of enterprise knowledge with generative reasoning
- **Orchestrator Agents**: Manage multi-agent workflows, dependencies, retries, and governance

---

## 3. ReAct Pattern Implementation

### 3.1 ReAct Pattern Overview

ReAct uses "chain-of-thought reasoning and tool-using actions in aggregation. The approach uses LLMs to generate both reasoning traces and task-specific actions in an interleaved manner, allowing for greater synergy between the two: reasoning traces help the model induce, track, and update action plans as well as handle exceptions, while actions allow it to interface with external sources, such as knowledge bases or environments, to gather additional information."

**Key Characteristics:**
- "Think, act, observe" loop
- Dynamic workflow adjustments based on observations
- Function-calling to implement reasoning cycles
- Prompting technique that guides LLMs through thought-action-observation loops

### 3.2 ReAct Agent Node Functions

#### 1. LLM Node - Reasoning

```typescript
async function callLlm(state: MessagesState) {
  const systemMessage = {
    role: "system",
    content: "You are a helpful assistant. Use available tools to answer questions."
  };

  const messages = [systemMessage, ...state.messages];
  const response = await modelWithTools.invoke(messages);

  return { messages: [response] };
}
```

#### 2. Tool Node - Acting

```typescript
async function callTool(state: MessagesState) {
  const lastMessage = state.messages[state.messages.length - 1];
  const toolCalls = lastMessage.tool_calls || [];

  const toolMessages = [];
  for (const toolCall of toolCalls) {
    const tool = toolsByName[toolCall.name];
    try {
      const observation = await tool.invoke(toolCall.args);
      toolMessages.push({
        role: "tool",
        content: observation,
        tool_call_id: toolCall.id
      });
    } catch (error) {
      toolMessages.push({
        role: "tool",
        content: `Error: ${error.message}`,
        tool_call_id: toolCall.id
      });
    }
  }

  return { messages: toolMessages };
}
```

#### 3. Router Node - Control Flow

```typescript
function shouldContinue(state: MessagesState): "tools" | typeof END {
  const lastMessage = state.messages[state.messages.length - 1];

  // If there are tool calls, continue to tools
  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return "tools";
  }

  // Otherwise, end the workflow
  return END;
}
```

### 3.3 Graph Construction

```typescript
import { StateGraph, START, END, MessagesAnnotation } from "@langchain/langgraph";

const graphBuilder = new StateGraph(MessagesAnnotation);

// Add nodes
graphBuilder.addNode("llm", callLlm);
graphBuilder.addNode("tools", callTool);

// Add edges
graphBuilder.addEdge(START, "llm");
graphBuilder.addConditionalEdges("llm", shouldContinue, {
  tools: "tools",
  [END]: END
});
graphBuilder.addEdge("tools", "llm");

// Compile
const reactAgent = graphBuilder.compile();
```

### 3.4 Official LangGraph ReAct Template

**File Structure:**
```
src/react_agent/
├── graph.ts          # Core ReAct agent logic and workflow
├── tools.ts          # Tool definitions and implementations
├── prompts.ts        # System prompt configuration
└── configuration.ts  # Model and runtime settings
```

**Core Loop Pattern:**
The agent implements a cycle where it "Reasons about the query and decides on an action," then "Executes the chosen action using available tools," followed by observation and iteration until task completion.

### 3.5 Vanilla Implementation (Without LangGraph)

For comparison, here's a basic ReAct loop without graph structure:

```typescript
async function runAgent(question: string) {
  const messages = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: question }
  ];

  let response = await modelWithTools.invoke(messages);
  messages.push(response);

  while (response.tool_calls && response.tool_calls.length > 0) {
    // Execute all tool calls
    for (const toolCall of response.tool_calls) {
      const tool = toolsMapping[toolCall.name];
      const result = await tool.invoke(toolCall.args);
      messages.push({
        role: "tool",
        content: result,
        tool_call_id: toolCall.id
      });
    }

    // Get next response
    response = await modelWithTools.invoke(messages);
    messages.push(response);
  }

  return messages;
}
```

### 3.6 Adaptive RAG Strategy

Multi-stage workflow for intelligent retrieval:

**1. Intent Classification**
Classify user intent into categories:
- Factual (direct knowledge retrieval)
- Analytical (reasoning over data)
- Opinion (subjective assessment)
- Contextual (requires situational understanding)

**2. Route to Specialized Strategies**
Use decision nodes to route to appropriate retrieval methods

**3. Transform Queries**
Adapt queries specific to each category for optimal results

**4. Generate with Tailored Prompts**
Use specialized system prompts matching the query type

---

## 4. Tool Definition and Management

### 4.1 OpenAI Function Calling Schema (2025 Best Practices)

#### Strict Mode (Recommended)

"Setting strict: true in your function definition ensures that arguments generated by the model for a function call exactly match the JSON Schema you provided. Setting strict to true will ensure function calls reliably adhere to the function schema, and it's recommended to turn it on whenever possible."

```typescript
const tools = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get the current weather for a location",
      strict: true,  // Enforces exact schema adherence
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "City name, e.g., 'San Francisco'"
          },
          unit: {
            type: "string",
            enum: ["celsius", "fahrenheit"],
            description: "Temperature unit"
          }
        },
        required: ["location"],
        additionalProperties: false  // Required with strict mode
      }
    }
  }
];
```

#### Schema Complexity Guidelines

"As of May 2025, any setup with fewer than ~100 tools and fewer than ~20 arguments per tool is considered in-distribution and should perform within expected reliability bounds."

**Best Practices:**
- "Err on the side of making arguments flat, as flat structures are often easier for the model to reason about, reducing the need for internal parsing and helping prevent issues like partially filled nested objects."
- Use clear, specific descriptions for each parameter
- Minimize nesting in parameter structures
- Keep enum values explicit and descriptive

### 4.2 LangChain Tool Definition

```typescript
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

// Define tool with Zod schema
const calculatorTool = new DynamicStructuredTool({
  name: "calculator",
  description: "Perform basic arithmetic operations. Use this when you need to calculate mathematical expressions.",
  schema: z.object({
    operation: z.enum(["add", "subtract", "multiply", "divide"])
      .describe("The arithmetic operation to perform"),
    a: z.number().describe("First operand"),
    b: z.number().describe("Second operand")
  }),
  func: async ({ operation, a, b }) => {
    switch (operation) {
      case "add": return (a + b).toString();
      case "subtract": return (a - b).toString();
      case "multiply": return (a * b).toString();
      case "divide":
        if (b === 0) return "Error: Division by zero";
        return (a / b).toString();
    }
  }
});
```

### 4.3 Tool Binding to Models

```typescript
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  modelName: "gpt-4-turbo-preview",
  temperature: 0
});

// Bind tools to the model
const modelWithTools = model.bindTools([
  calculatorTool,
  weatherTool,
  searchTool
]);

// Optional: Force tool usage
const modelWithForcedTools = model.bindTools(tools, {
  tool_choice: "required"  // Must use at least one tool
});

// Optional: Force specific tool
const modelWithSpecificTool = model.bindTools(tools, {
  tool_choice: {
    type: "function",
    function: { name: "calculator" }
  }
});
```

### 4.4 Tool Implementation Patterns

#### Search Tool Example

```typescript
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

const searchTool = new TavilySearchResults({
  maxResults: 5,
  apiKey: process.env.TAVILY_API_KEY
});
```

#### Custom Tool with Error Handling

```typescript
const databaseQueryTool = new DynamicStructuredTool({
  name: "query_database",
  description: "Query the product database for information about products",
  schema: z.object({
    query: z.string().describe("SQL query to execute"),
  }),
  func: async ({ query }) => {
    try {
      // Validate query (prevent SQL injection)
      if (!/^SELECT/i.test(query)) {
        return "Error: Only SELECT queries are allowed";
      }

      // Execute query
      const results = await database.query(query);
      return JSON.stringify(results, null, 2);
    } catch (error) {
      return `Database error: ${error.message}`;
    }
  }
});
```

#### Tool with Async Operations

```typescript
const emailTool = new DynamicStructuredTool({
  name: "send_email",
  description: "Send an email to a specified recipient",
  schema: z.object({
    to: z.string().email().describe("Recipient email address"),
    subject: z.string().describe("Email subject line"),
    body: z.string().describe("Email body content")
  }),
  func: async ({ to, subject, body }) => {
    try {
      await emailService.send({
        to,
        subject,
        body,
        from: "assistant@example.com"
      });
      return `Successfully sent email to ${to}`;
    } catch (error) {
      return `Failed to send email: ${error.message}`;
    }
  }
});
```

### 4.5 Tool Registry Pattern

```typescript
// Create tool registry for easy management
class ToolRegistry {
  private tools: Map<string, DynamicStructuredTool> = new Map();

  register(tool: DynamicStructuredTool) {
    this.tools.set(tool.name, tool);
  }

  get(name: string): DynamicStructuredTool | undefined {
    return this.tools.get(name);
  }

  getAll(): DynamicStructuredTool[] {
    return Array.from(this.tools.values());
  }

  async invoke(name: string, args: any): Promise<string> {
    const tool = this.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }
    return await tool.invoke(args);
  }
}

// Usage
const registry = new ToolRegistry();
registry.register(calculatorTool);
registry.register(searchTool);
registry.register(databaseQueryTool);

// Bind all tools
const modelWithTools = model.bindTools(registry.getAll());
```

### 4.6 Tool Selection Best Practices

"Function description clarity becomes critical, as multiple tools with overlapping purposes or vague descriptions may cause models to call the wrong one."

**Guidelines:**
1. **Clear Naming**: Use descriptive, action-oriented names (e.g., `search_products`, not `search`)
2. **Detailed Descriptions**: Explain when and why to use the tool
3. **Specific Parameters**: Provide clear parameter descriptions with examples
4. **Minimal Overlap**: Avoid tools with similar functionality
5. **Error Messages**: Return actionable error messages the LLM can understand

### 4.7 Tool Security Considerations

"When integrating with external APIs, ensure that they are secure and reliable."

**Security Checklist:**
- ✓ Validate all inputs before execution
- ✓ Implement rate limiting for API calls
- ✓ Sanitize user inputs (prevent injection attacks)
- ✓ Use environment variables for API keys
- ✓ Implement proper error handling (don't expose secrets)
- ✓ Log tool usage for audit trails
- ✓ Set timeouts for long-running operations
- ✓ Implement proper access controls

---

## 5. State and Memory Management

### 5.1 State Management with Reducers

State management leverages a reducer pattern similar to Redux:

```typescript
import { Annotation } from "@langchain/langgraph";

interface GraphState {
  name: string;
  count: number;
  items: string[];
}

const StateAnnotation = Annotation.Root({
  name: Annotation<string>({
    reducer: (prev: string, next: string) => next,
    default: () => "default"
  }),
  count: Annotation<number>({
    reducer: (prev: number, next: number) => prev + next,
    default: () => 0
  }),
  items: Annotation<string[]>({
    reducer: (prev: string[], next: string[]) => [...prev, ...next],
    default: () => []
  })
});
```

**Key Features:**
- `reducer` function: Defines how updates merge with current state
- `default` function: Establishes initial values
- Nodes return partial state objects—only modified fields need inclusion
- Multiple nodes can update the same field using consistent reducer logic

### 5.2 Message State Management

For conversational agents, use `MessagesAnnotation`:

```typescript
import { MessagesAnnotation } from "@langchain/langgraph";

// MessagesAnnotation provides built-in message handling
const graph = new StateGraph(MessagesAnnotation)
  .addNode("llm", async (state) => {
    // Access messages
    const messages = state.messages;

    // Add new messages
    const response = await model.invoke(messages);
    return { messages: [response] };
  });
```

**Built-in Message Reducer:**
```typescript
// Custom message reducer example
const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (left: BaseMessage[], right: BaseMessage | BaseMessage[]) => {
      if (Array.isArray(right)) {
        return left.concat(right);
      }
      return left.concat([right]);
    },
    default: () => [],
  })
});
```

### 5.3 Checkpointing for Persistence

LangGraph provides "built-in persistence using checkpointers that save snapshots of the graph state at every superstep, allowing resumption at any time and enabling features like human-in-the-loop interactions, memory management, and fault-tolerance."

#### In-Memory Checkpointer (Development)

```typescript
import { MemorySaver } from "@langchain/langgraph-checkpoint";

const checkpointer = new MemorySaver();

const graph = graphBuilder.compile({
  checkpointer: checkpointer
});

// Invoke with thread ID for conversation persistence
const config = {
  configurable: {
    thread_id: "conversation-123"
  }
};

const result1 = await graph.invoke(
  { messages: [{ role: "user", content: "Hi, I'm Alice" }] },
  config
);

// Same thread ID retrieves previous state
const result2 = await graph.invoke(
  { messages: [{ role: "user", content: "What's my name?" }] },
  config
);
```

#### PostgreSQL Checkpointer (Production)

"For production use in 2025, durability is achieved by employing persistent checkpointers such as PostgresSaver, which ensures data integrity during process restarts."

```typescript
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { Pool } from "pg";

// Create connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: 5432,
  database: "langgraph",
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  max: 10  // Connection pool size
});

// Initialize checkpointer
const checkpointer = new PostgresSaver(pool);
await checkpointer.setup();

// Use with graph
const graph = graphBuilder.compile({
  checkpointer: checkpointer
});
```

### 5.4 Thread Management and Namespacing

"Isolate checkpoints by thread ID to prevent state conflicts in concurrent environments. Use explicit namespace parameters to organize related checkpoints logically."

```typescript
// Thread-based isolation
const userThread = {
  configurable: {
    thread_id: `user-${userId}`,
    checkpoint_ns: "conversations"
  }
};

// Session-based isolation
const sessionThread = {
  configurable: {
    thread_id: `session-${sessionId}`,
    checkpoint_ns: "sessions"
  }
};

// Context-specific isolation
const contextThread = {
  configurable: {
    thread_id: `context-${contextId}`,
    checkpoint_ns: "contexts",
    checkpoint_id: previousCheckpointId  // Resume from specific checkpoint
  }
};
```

### 5.5 Memory Management Strategies

#### Conversation Buffer Memory

```typescript
import { BufferMemory } from "langchain/memory";

const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "chat_history",
  inputKey: "input",
  outputKey: "output"
});

// Store conversation
await memory.saveContext(
  { input: "What's the weather?" },
  { output: "The weather is sunny." }
);

// Load conversation history
const history = await memory.loadMemoryVariables({});
```

#### Summary Memory (For Long Conversations)

```typescript
import { ConversationSummaryMemory } from "langchain/memory";
import { ChatOpenAI } from "@langchain/openai";

const memory = new ConversationSummaryMemory({
  llm: new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0 }),
  returnMessages: true
});

// Automatically summarizes old messages
await memory.saveContext(
  { input: "Long conversation..." },
  { output: "Response..." }
);
```

#### Vector Store Memory (Semantic Retrieval)

```typescript
import { VectorStoreRetrieverMemory } from "langchain/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());

const memory = new VectorStoreRetrieverMemory({
  vectorStoreRetriever: vectorStore.asRetriever(5),
  memoryKey: "history",
});

// Stores and retrieves semantically relevant memories
await memory.saveContext(
  { input: "My favorite color is blue" },
  { output: "That's nice!" }
);
```

### 5.6 Long-Term Memory Architecture

"The 2025 best practice is a hybrid approach: vector search for semantic retrieval, knowledge graphs for factual accuracy and updates, and decay strategies to manage growth."

```typescript
interface LongTermMemory {
  // Vector store for semantic retrieval
  vectorStore: VectorStore;

  // Knowledge graph for facts
  knowledgeGraph: KnowledgeGraph;

  // Decay strategy for old memories
  decayStrategy: DecayStrategy;

  // Store new memory
  async store(memory: Memory): Promise<void> {
    // Add to vector store
    await this.vectorStore.addDocuments([memory.toDocument()]);

    // Extract and store facts in knowledge graph
    const facts = await extractFacts(memory);
    await this.knowledgeGraph.addFacts(facts);

    // Apply decay to old memories
    await this.decayStrategy.apply();
  }

  // Retrieve relevant memories
  async retrieve(query: string, k: number = 5): Promise<Memory[]> {
    // Semantic search
    const vectorResults = await this.vectorStore.similaritySearch(query, k);

    // Knowledge graph traversal
    const graphResults = await this.knowledgeGraph.query(query);

    // Combine and rank results
    return this.rankAndMerge(vectorResults, graphResults);
  }
}
```

### 5.7 State Validation

"Verify checkpoint consistency before agent resumption."

```typescript
function validateCheckpoint(checkpoint: Checkpoint): boolean {
  // Validate required fields
  if (!checkpoint.thread_id || !checkpoint.checkpoint_id) {
    return false;
  }

  // Validate state schema
  if (!isValidState(checkpoint.state)) {
    return false;
  }

  // Validate timestamp
  if (checkpoint.timestamp > Date.now()) {
    return false;
  }

  return true;
}

// Use before resuming
const checkpoint = await checkpointer.get(config);
if (!validateCheckpoint(checkpoint)) {
  throw new Error("Invalid checkpoint state");
}
```

### 5.8 Observability and Monitoring

"Implement tracking for: checkpoint creation frequency, state serialization timing, recovery success rates, database connection pool utilization."

```typescript
class MonitoredCheckpointer implements BaseCheckpointSaver {
  constructor(
    private underlying: BaseCheckpointSaver,
    private metrics: MetricsCollector
  ) {}

  async put(config: CheckpointConfig, checkpoint: Checkpoint): Promise<void> {
    const start = Date.now();
    try {
      await this.underlying.put(config, checkpoint);
      this.metrics.recordCheckpointWrite(Date.now() - start, "success");
    } catch (error) {
      this.metrics.recordCheckpointWrite(Date.now() - start, "failure");
      throw error;
    }
  }

  async get(config: CheckpointConfig): Promise<Checkpoint> {
    const start = Date.now();
    try {
      const checkpoint = await this.underlying.get(config);
      this.metrics.recordCheckpointRead(Date.now() - start, "success");
      return checkpoint;
    } catch (error) {
      this.metrics.recordCheckpointRead(Date.now() - start, "failure");
      throw error;
    }
  }
}
```

---

## 6. Error Handling and Resilience

### 6.1 Node-Level Error Handling

#### Try-Catch in Nodes

```typescript
async function robustNode(state: GraphState) {
  try {
    // Attempt operation
    const result = await riskyOperation(state);
    return { result: result };
  } catch (error) {
    // Log error
    console.error("Node failed:", error);

    // Return error state
    return {
      error: error.message,
      failed: true
    };
  }
}
```

#### Error State Pattern

```typescript
const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (left, right) => left.concat(right),
    default: () => []
  }),
  errors: Annotation<string[]>({
    reducer: (left, right) => left.concat(right),
    default: () => []
  }),
  retryCount: Annotation<number>({
    reducer: (_, next) => next,
    default: () => 0
  })
});
```

### 6.2 Retry Patterns

#### Node-Specific Retry Policies

LangGraph supports "node-specific retry policies where you can configure retries for individual nodes using the RetryPolicy with parameters like `retry_on` (to specify which errors to retry) and `max_attempts`."

```typescript
import { RetryPolicy } from "@langchain/langgraph";

graphBuilder.addNode(
  "flaky_operation",
  flakyOperationNode,
  {
    retry: new RetryPolicy({
      retryOn: [NetworkError, TimeoutError],
      maxAttempts: 3,
      backoff: "exponential",  // exponential backoff
      initialDelay: 1000,       // 1 second
      maxDelay: 10000           // 10 seconds max
    })
  }
);
```

#### Manual Retry Logic

```typescript
async function retryableNode(state: GraphState) {
  const maxRetries = 3;
  const retryDelay = 1000;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await operation(state);
      return { result, retryCount: attempt };
    } catch (error) {
      if (attempt === maxRetries - 1) {
        // Last attempt failed
        return {
          error: `Failed after ${maxRetries} attempts: ${error.message}`,
          failed: true
        };
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve =>
        setTimeout(resolve, retryDelay * Math.pow(2, attempt))
      );
    }
  }
}
```

### 6.3 Tool Error Handling

"The ToolNode in LangGraph automatically captures tool errors and reports them to the model, which is particularly useful for tool-calling errors."

```typescript
async function callToolWithErrorHandling(state: MessagesState) {
  const lastMessage = state.messages[state.messages.length - 1];
  const toolCalls = lastMessage.tool_calls || [];

  const toolMessages = [];

  for (const toolCall of toolCalls) {
    const tool = toolRegistry.get(toolCall.name);

    if (!tool) {
      // Tool not found error
      toolMessages.push({
        role: "tool",
        content: `Error: Tool '${toolCall.name}' not found. Available tools: ${toolRegistry.getAll().map(t => t.name).join(", ")}`,
        tool_call_id: toolCall.id,
        name: toolCall.name
      });
      continue;
    }

    try {
      // Execute tool with timeout
      const result = await Promise.race([
        tool.invoke(toolCall.args),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Tool timeout")), 30000)
        )
      ]);

      toolMessages.push({
        role: "tool",
        content: String(result),
        tool_call_id: toolCall.id,
        name: toolCall.name
      });
    } catch (error) {
      // Tool execution error - return to LLM for handling
      toolMessages.push({
        role: "tool",
        content: `Error executing tool: ${error.message}. Please try a different approach or ask for clarification.`,
        tool_call_id: toolCall.id,
        name: toolCall.name
      });
    }
  }

  return { messages: toolMessages };
}
```

### 6.4 Validation and Re-prompting

"A common pattern involves a looping graph that prompts the LLM to respond, validates tool calls, and if validation fails, formats the validation error as a new ToolMessage and prompts the LLM to fix the errors."

```typescript
function validateToolCall(toolCall: ToolCall): ValidationResult {
  const tool = toolRegistry.get(toolCall.name);

  if (!tool) {
    return { valid: false, error: `Tool ${toolCall.name} not found` };
  }

  // Validate arguments against schema
  try {
    tool.schema.parse(toolCall.args);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Invalid arguments: ${error.message}`
    };
  }
}

async function validatingToolNode(state: MessagesState) {
  const lastMessage = state.messages[state.messages.length - 1];
  const toolCalls = lastMessage.tool_calls || [];

  const messages = [];

  for (const toolCall of toolCalls) {
    // Validate before execution
    const validation = validateToolCall(toolCall);

    if (!validation.valid) {
      // Return validation error to LLM
      messages.push({
        role: "tool",
        content: `Validation error: ${validation.error}. Please correct your tool call.`,
        tool_call_id: toolCall.id,
        name: toolCall.name
      });
    } else {
      // Execute valid tool
      const tool = toolRegistry.get(toolCall.name);
      const result = await tool.invoke(toolCall.args);
      messages.push({
        role: "tool",
        content: result,
        tool_call_id: toolCall.id,
        name: toolCall.name
      });
    }
  }

  return { messages };
}
```

### 6.5 Graceful Degradation

```typescript
function routeWithFallback(state: GraphState): string {
  // Check for errors
  if (state.errors && state.errors.length > 0) {
    // Too many errors, go to fallback
    if (state.retryCount >= 3) {
      return "fallback_handler";
    }
    return "retry_operation";
  }

  // Check for missing data
  if (!state.requiredData) {
    return "fetch_data";
  }

  // Normal flow
  return "continue";
}

// Fallback node
async function fallbackHandler(state: GraphState) {
  return {
    messages: [{
      role: "assistant",
      content: "I encountered some difficulties. Let me try a simpler approach..."
    }],
    fallbackActive: true
  };
}
```

### 6.6 Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: "closed" | "open" | "half-open" = "closed";

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000  // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      // Check if timeout has passed
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = "half-open";
      } else {
        throw new Error("Circuit breaker is open");
      }
    }

    try {
      const result = await operation();

      // Success - reset if half-open
      if (this.state === "half-open") {
        this.state = "closed";
        this.failures = 0;
      }

      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.threshold) {
        this.state = "open";
      }

      throw error;
    }
  }
}

// Usage in node
const breaker = new CircuitBreaker();

async function protectedNode(state: GraphState) {
  try {
    return await breaker.execute(async () => {
      return await riskyOperation(state);
    });
  } catch (error) {
    return { error: error.message, circuitOpen: true };
  }
}
```

### 6.7 Error Recovery with Checkpoints

"Wrap database operations in try-catch blocks, implement exponential backoff for connection retries, validate checkpoint integrity before resumption."

```typescript
async function recoverFromCheckpoint(
  graph: CompiledStateGraph,
  config: CheckpointConfig
): Promise<GraphState> {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Try to load checkpoint
      const checkpoint = await checkpointer.get(config);

      // Validate checkpoint
      if (!validateCheckpoint(checkpoint)) {
        throw new Error("Invalid checkpoint");
      }

      // Resume from checkpoint
      return await graph.invoke(
        { messages: [] },  // Empty input - will use checkpoint state
        config
      );
    } catch (error) {
      console.error(`Recovery attempt ${attempt + 1} failed:`, error);

      if (attempt === maxRetries - 1) {
        // All retries failed - start fresh
        console.warn("Starting fresh conversation");
        return await graph.invoke({ messages: [] }, {
          configurable: {
            thread_id: `${config.configurable.thread_id}-recovery`
          }
        });
      }

      // Exponential backoff
      await new Promise(resolve =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt))
      );
    }
  }
}
```

### 6.8 Observability for Error Tracking

```typescript
interface ErrorMetrics {
  errorCount: number;
  errorRate: number;
  errorsByType: Record<string, number>;
  recentErrors: Error[];
}

class ErrorTracker {
  private metrics: ErrorMetrics = {
    errorCount: 0,
    errorRate: 0,
    errorsByType: {},
    recentErrors: []
  };

  trackError(error: Error, context: Record<string, any>) {
    // Increment counts
    this.metrics.errorCount++;
    this.metrics.errorsByType[error.name] =
      (this.metrics.errorsByType[error.name] || 0) + 1;

    // Store recent errors
    this.metrics.recentErrors.push(error);
    if (this.metrics.recentErrors.length > 100) {
      this.metrics.recentErrors.shift();
    }

    // Log to monitoring service
    console.error("Error tracked:", {
      error: error.message,
      stack: error.stack,
      type: error.name,
      context
    });

    // Alert if error rate is high
    if (this.metrics.errorCount > 10) {
      this.alertHighErrorRate();
    }
  }

  private alertHighErrorRate() {
    // Send alert to monitoring service
    console.error("HIGH ERROR RATE DETECTED", this.metrics);
  }

  getMetrics(): ErrorMetrics {
    return { ...this.metrics };
  }
}
```

---

## 7. Complete Code Examples

### 7.1 Basic Agentic RAG System

```typescript
import { StateGraph, START, END, MessagesAnnotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { z } from "zod";

// Initialize vector store
const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());

// Add documents
await vectorStore.addDocuments([
  { pageContent: "LangGraph is a framework for building agents", metadata: {} },
  { pageContent: "Agents can use tools to accomplish tasks", metadata: {} },
  // ... more documents
]);

// Define RAG retrieval tool
const retrievalTool = new DynamicStructuredTool({
  name: "search_knowledge_base",
  description: "Search the knowledge base for relevant information. Use this when you need to find specific information from the documentation.",
  schema: z.object({
    query: z.string().describe("The search query")
  }),
  func: async ({ query }) => {
    const results = await vectorStore.similaritySearch(query, 5);
    return results.map(doc => doc.pageContent).join("\n\n");
  }
});

// Define web search tool
const webSearchTool = new DynamicStructuredTool({
  name: "web_search",
  description: "Search the web for current information. Use this when the knowledge base doesn't have the answer or when you need recent information.",
  schema: z.object({
    query: z.string().describe("The search query")
  }),
  func: async ({ query }) => {
    // Implement web search (e.g., using Tavily)
    const results = await webSearch(query);
    return results;
  }
});

// Initialize model with tools
const model = new ChatOpenAI({
  modelName: "gpt-4-turbo-preview",
  temperature: 0
});

const modelWithTools = model.bindTools([retrievalTool, webSearchTool]);

// Define nodes
async function callLlm(state: typeof MessagesAnnotation.State) {
  const response = await modelWithTools.invoke(state.messages);
  return { messages: [response] };
}

async function callTools(state: typeof MessagesAnnotation.State) {
  const lastMessage = state.messages[state.messages.length - 1];
  const toolCalls = lastMessage.tool_calls || [];

  const toolMessages = [];
  for (const toolCall of toolCalls) {
    let result: string;

    if (toolCall.name === "search_knowledge_base") {
      result = await retrievalTool.invoke(toolCall.args);
    } else if (toolCall.name === "web_search") {
      result = await webSearchTool.invoke(toolCall.args);
    } else {
      result = `Error: Unknown tool ${toolCall.name}`;
    }

    toolMessages.push({
      role: "tool",
      content: result,
      tool_call_id: toolCall.id,
      name: toolCall.name
    });
  }

  return { messages: toolMessages };
}

function shouldContinue(state: typeof MessagesAnnotation.State) {
  const lastMessage = state.messages[state.messages.length - 1];
  return lastMessage.tool_calls && lastMessage.tool_calls.length > 0
    ? "tools"
    : END;
}

// Build graph
const graph = new StateGraph(MessagesAnnotation)
  .addNode("llm", callLlm)
  .addNode("tools", callTools)
  .addEdge(START, "llm")
  .addConditionalEdges("llm", shouldContinue, {
    tools: "tools",
    [END]: END
  })
  .addEdge("tools", "llm")
  .compile();

// Use the agent
const result = await graph.invoke({
  messages: [{
    role: "user",
    content: "What is LangGraph and how do agents use tools?"
  }]
});

console.log(result.messages[result.messages.length - 1].content);
```

### 7.2 Advanced Agentic RAG with Query Classification

```typescript
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

// Define enhanced state
const AgenticRAGState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (left, right) => left.concat(right),
    default: () => []
  }),
  queryType: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "unknown"
  }),
  retrievalStrategy: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "default"
  }),
  context: Annotation<string[]>({
    reducer: (left, right) => left.concat(right),
    default: () => []
  }),
  confidence: Annotation<number>({
    reducer: (_, next) => next,
    default: () => 0
  })
});

// Classification node
async function classifyQuery(state: typeof AgenticRAGState.State) {
  const lastMessage = state.messages[state.messages.length - 1];
  const userQuery = lastMessage.content;

  const classificationPrompt = `Classify the following query into one of these categories:
- FACTUAL: Asking for specific facts or definitions
- ANALYTICAL: Requiring analysis or reasoning over data
- PROCEDURAL: Asking how to do something
- CONVERSATIONAL: General chat or clarification

Query: ${userQuery}

Respond with just the category name.`;

  const response = await model.invoke([
    { role: "system", content: classificationPrompt },
    { role: "user", content: userQuery }
  ]);

  const queryType = response.content.trim().toUpperCase();

  return { queryType };
}

// Route based on query type
function routeQuery(state: typeof AgenticRAGState.State): string {
  const queryType = state.queryType;

  switch (queryType) {
    case "FACTUAL":
      return "factual_retrieval";
    case "ANALYTICAL":
      return "analytical_retrieval";
    case "PROCEDURAL":
      return "procedural_retrieval";
    default:
      return "default_retrieval";
  }
}

// Factual retrieval node
async function factualRetrieval(state: typeof AgenticRAGState.State) {
  const lastMessage = state.messages[state.messages.length - 1];
  const query = lastMessage.content;

  // Use vector similarity for factual queries
  const results = await vectorStore.similaritySearch(query, 3);
  const context = results.map(doc => doc.pageContent);

  return {
    context,
    retrievalStrategy: "vector_similarity",
    confidence: 0.9
  };
}

// Analytical retrieval node
async function analyticalRetrieval(state: typeof AgenticRAGState.State) {
  const lastMessage = state.messages[state.messages.length - 1];
  const query = lastMessage.content;

  // Use broader retrieval + web search for analytical queries
  const vectorResults = await vectorStore.similaritySearch(query, 5);
  const webResults = await webSearch(query);

  const context = [
    ...vectorResults.map(doc => doc.pageContent),
    webResults
  ];

  return {
    context,
    retrievalStrategy: "hybrid_search",
    confidence: 0.8
  };
}

// Procedural retrieval node
async function proceduralRetrieval(state: typeof AgenticRAGState.State) {
  const lastMessage = state.messages[state.messages.length - 1];
  const query = lastMessage.content;

  // Search for step-by-step guides
  const results = await vectorStore.similaritySearch(query, 5);
  const context = results
    .filter(doc => doc.metadata.type === "tutorial" || doc.metadata.type === "guide")
    .map(doc => doc.pageContent);

  return {
    context,
    retrievalStrategy: "procedural_search",
    confidence: 0.85
  };
}

// Default retrieval node
async function defaultRetrieval(state: typeof AgenticRAGState.State) {
  const lastMessage = state.messages[state.messages.length - 1];
  const query = lastMessage.content;

  const results = await vectorStore.similaritySearch(query, 3);
  const context = results.map(doc => doc.pageContent);

  return {
    context,
    retrievalStrategy: "default",
    confidence: 0.7
  };
}

// Generate response with context
async function generateResponse(state: typeof AgenticRAGState.State) {
  const lastMessage = state.messages[state.messages.length - 1];
  const userQuery = lastMessage.content;
  const context = state.context.join("\n\n");

  const systemPrompt = `You are a helpful assistant. Answer the user's question based on the following context.
If the context doesn't contain enough information, say so clearly.

Context:
${context}

Query Type: ${state.queryType}
Retrieval Strategy: ${state.retrievalStrategy}
Confidence: ${state.confidence}`;

  const response = await model.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: userQuery }
  ]);

  return { messages: [response] };
}

// Critic node - validates answer completeness
async function answerCritic(state: typeof AgenticRAGState.State) {
  const lastMessage = state.messages[state.messages.length - 1];
  const answer = lastMessage.content;
  const originalQuery = state.messages[0].content;

  const criticPrompt = `Evaluate if this answer fully addresses the question.

Question: ${originalQuery}
Answer: ${answer}

Does the answer:
1. Directly address the question?
2. Provide sufficient detail?
3. Use the available context effectively?

Respond with: COMPLETE or INCOMPLETE (and explain why)`;

  const response = await model.invoke([
    { role: "system", content: criticPrompt }
  ]);

  return {
    messages: [{
      role: "system",
      content: `Evaluation: ${response.content}`
    }]
  };
}

// Router for critic feedback
function shouldRetrieve(state: typeof AgenticRAGState.State): string {
  const lastMessage = state.messages[state.messages.length - 1];

  if (lastMessage.content.includes("INCOMPLETE")) {
    return "retry_retrieval";
  }

  return END;
}

// Build the advanced graph
const advancedGraph = new StateGraph(AgenticRAGState)
  .addNode("classify", classifyQuery)
  .addNode("factual_retrieval", factualRetrieval)
  .addNode("analytical_retrieval", analyticalRetrieval)
  .addNode("procedural_retrieval", proceduralRetrieval)
  .addNode("default_retrieval", defaultRetrieval)
  .addNode("generate", generateResponse)
  .addNode("critic", answerCritic)
  .addEdge(START, "classify")
  .addConditionalEdges("classify", routeQuery, {
    factual_retrieval: "factual_retrieval",
    analytical_retrieval: "analytical_retrieval",
    procedural_retrieval: "procedural_retrieval",
    default_retrieval: "default_retrieval"
  })
  .addEdge("factual_retrieval", "generate")
  .addEdge("analytical_retrieval", "generate")
  .addEdge("procedural_retrieval", "generate")
  .addEdge("default_retrieval", "generate")
  .addEdge("generate", "critic")
  .addConditionalEdges("critic", shouldRetrieve, {
    retry_retrieval: "classify",
    [END]: END
  })
  .compile();

// Use the advanced agent
const result = await advancedGraph.invoke({
  messages: [{
    role: "user",
    content: "How do I implement error handling in LangGraph?"
  }]
});
```

### 7.3 Multi-Agent RAG System

```typescript
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";

// Define multi-agent state
const MultiAgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (left, right) => left.concat(right),
    default: () => []
  }),
  currentAgent: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "supervisor"
  }),
  taskQueue: Annotation<string[]>({
    reducer: (left, right) => left.concat(right),
    default: () => []
  }),
  results: Annotation<Record<string, any>>({
    reducer: (left, right) => ({ ...left, ...right }),
    default: () => ({})
  })
});

// Supervisor agent - coordinates other agents
async function supervisor(state: typeof MultiAgentState.State) {
  const lastMessage = state.messages[state.messages.length - 1];
  const userQuery = lastMessage.content;

  const supervisorPrompt = `You are a supervisor coordinating specialized agents.
Available agents:
- researcher: Searches and retrieves information
- analyzer: Analyzes and synthesizes information
- writer: Writes clear, comprehensive responses

Break down this query into tasks for each agent:
${userQuery}

Respond with a JSON array of tasks: [{"agent": "researcher", "task": "..."}]`;

  const response = await model.invoke([
    { role: "system", content: supervisorPrompt }
  ]);

  const tasks = JSON.parse(response.content);

  return {
    taskQueue: tasks.map((t: any) => JSON.stringify(t)),
    messages: [{
      role: "system",
      content: `Supervisor assigned ${tasks.length} tasks`
    }]
  };
}

// Researcher agent
async function researcher(state: typeof MultiAgentState.State) {
  const task = JSON.parse(state.taskQueue[0]);

  // Perform research
  const results = await vectorStore.similaritySearch(task.task, 5);
  const webResults = await webSearch(task.task);

  return {
    results: {
      research: {
        vectorResults: results.map(r => r.pageContent),
        webResults
      }
    },
    messages: [{
      role: "system",
      content: "Research completed"
    }]
  };
}

// Analyzer agent
async function analyzer(state: typeof MultiAgentState.State) {
  const task = JSON.parse(state.taskQueue[1] || "{}");
  const researchData = state.results.research;

  const analysisPrompt = `Analyze this research data and extract key insights:
${JSON.stringify(researchData, null, 2)}

Task: ${task.task}`;

  const response = await model.invoke([
    { role: "system", content: analysisPrompt }
  ]);

  return {
    results: {
      analysis: response.content
    },
    messages: [{
      role: "system",
      content: "Analysis completed"
    }]
  };
}

// Writer agent
async function writer(state: typeof MultiAgentState.State) {
  const originalQuery = state.messages[0].content;
  const analysis = state.results.analysis;

  const writerPrompt = `Write a comprehensive response to this query:
${originalQuery}

Based on this analysis:
${analysis}`;

  const response = await model.invoke([
    { role: "system", content: writerPrompt }
  ]);

  return {
    messages: [response]
  };
}

// Route to appropriate agent
function routeToAgent(state: typeof MultiAgentState.State): string {
  if (state.taskQueue.length === 0) {
    return "writer";
  }

  const currentTask = JSON.parse(state.taskQueue[0]);
  return currentTask.agent;
}

// Build multi-agent graph
const multiAgentGraph = new StateGraph(MultiAgentState)
  .addNode("supervisor", supervisor)
  .addNode("researcher", researcher)
  .addNode("analyzer", analyzer)
  .addNode("writer", writer)
  .addEdge(START, "supervisor")
  .addConditionalEdges("supervisor", routeToAgent, {
    researcher: "researcher",
    analyzer: "analyzer",
    writer: "writer"
  })
  .addEdge("researcher", "analyzer")
  .addEdge("analyzer", "writer")
  .addEdge("writer", END)
  .compile();
```

### 7.4 Production-Ready RAG with All Features

```typescript
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

// Production state with full tracking
const ProductionRAGState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (left, right) => left.concat(right),
    default: () => []
  }),
  context: Annotation<string[]>({
    reducer: (left, right) => left.concat(right),
    default: () => []
  }),
  errors: Annotation<string[]>({
    reducer: (left, right) => left.concat(right),
    default: () => []
  }),
  metadata: Annotation<Record<string, any>>({
    reducer: (left, right) => ({ ...left, ...right }),
    default: () => ({})
  }),
  retryCount: Annotation<number>({
    reducer: (_, next) => next,
    default: () => 0
  }),
  startTime: Annotation<number>({
    reducer: (prev, next) => prev || next,
    default: () => Date.now()
  })
});

// Tool registry
class ProductionToolRegistry {
  private tools = new Map<string, DynamicStructuredTool>();
  private metrics = new Map<string, { calls: number; errors: number; totalTime: number }>();

  register(tool: DynamicStructuredTool) {
    this.tools.set(tool.name, tool);
    this.metrics.set(tool.name, { calls: 0, errors: 0, totalTime: 0 });
  }

  async invoke(name: string, args: any): Promise<string> {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Tool ${name} not found`);

    const metrics = this.metrics.get(name)!;
    metrics.calls++;

    const start = Date.now();
    try {
      const result = await tool.invoke(args);
      metrics.totalTime += Date.now() - start;
      return result;
    } catch (error) {
      metrics.errors++;
      throw error;
    }
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  getAll() {
    return Array.from(this.tools.values());
  }
}

// Initialize production components
const toolRegistry = new ProductionToolRegistry();
const checkpointer = new MemorySaver();
const errorTracker = new ErrorTracker();

// Register tools
toolRegistry.register(retrievalTool);
toolRegistry.register(webSearchTool);

// Production nodes with full error handling
async function productionLlmNode(state: typeof ProductionRAGState.State) {
  try {
    const response = await modelWithTools.invoke(state.messages);

    return {
      messages: [response],
      metadata: {
        ...state.metadata,
        lastLlmCall: Date.now(),
        tokensUsed: response.response_metadata?.tokenUsage || 0
      }
    };
  } catch (error) {
    errorTracker.trackError(error, { node: "llm", state });

    return {
      errors: [`LLM error: ${error.message}`],
      retryCount: state.retryCount + 1
    };
  }
}

async function productionToolNode(state: typeof ProductionRAGState.State) {
  const lastMessage = state.messages[state.messages.length - 1];
  const toolCalls = lastMessage.tool_calls || [];

  const toolMessages = [];

  for (const toolCall of toolCalls) {
    try {
      const result = await Promise.race([
        toolRegistry.invoke(toolCall.name, toolCall.args),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Tool timeout")), 30000)
        )
      ]);

      toolMessages.push({
        role: "tool",
        content: String(result),
        tool_call_id: toolCall.id,
        name: toolCall.name
      });
    } catch (error) {
      errorTracker.trackError(error, {
        node: "tool",
        toolName: toolCall.name,
        toolArgs: toolCall.args
      });

      toolMessages.push({
        role: "tool",
        content: `Error: ${error.message}`,
        tool_call_id: toolCall.id,
        name: toolCall.name
      });
    }
  }

  return {
    messages: toolMessages,
    metadata: {
      ...state.metadata,
      toolCalls: (state.metadata.toolCalls || 0) + toolCalls.length
    }
  };
}

function productionRouter(state: typeof ProductionRAGState.State): string {
  // Check for too many errors
  if (state.errors.length > 3) {
    return "error_handler";
  }

  // Check for retry limit
  if (state.retryCount > 3) {
    return "fallback";
  }

  // Check for tool calls
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return "tools";
  }

  return END;
}

async function errorHandler(state: typeof ProductionRAGState.State) {
  return {
    messages: [{
      role: "assistant",
      content: "I encountered some difficulties processing your request. Let me try a different approach."
    }],
    errors: []  // Clear errors
  };
}

async function fallbackNode(state: typeof ProductionRAGState.State) {
  return {
    messages: [{
      role: "assistant",
      content: "I apologize, but I'm having trouble completing this request. Could you try rephrasing your question?"
    }]
  };
}

// Build production graph
const productionGraph = new StateGraph(ProductionRAGState)
  .addNode("llm", productionLlmNode, {
    retry: new RetryPolicy({
      retryOn: [NetworkError, TimeoutError],
      maxAttempts: 3,
      backoff: "exponential"
    })
  })
  .addNode("tools", productionToolNode)
  .addNode("error_handler", errorHandler)
  .addNode("fallback", fallbackNode)
  .addEdge(START, "llm")
  .addConditionalEdges("llm", productionRouter, {
    tools: "tools",
    error_handler: "error_handler",
    fallback: "fallback",
    [END]: END
  })
  .addEdge("tools", "llm")
  .addEdge("error_handler", "llm")
  .addEdge("fallback", END)
  .compile({
    checkpointer,
    interruptBefore: ["tools"]  // Enable human-in-the-loop
  });

// Production usage with monitoring
async function invokeWithMonitoring(query: string, threadId: string) {
  const start = Date.now();

  try {
    const result = await productionGraph.invoke(
      {
        messages: [{ role: "user", content: query }]
      },
      {
        configurable: { thread_id: threadId }
      }
    );

    const duration = Date.now() - start;

    // Log metrics
    console.log("Metrics:", {
      duration,
      messageCount: result.messages.length,
      errorCount: result.errors?.length || 0,
      toolMetrics: toolRegistry.getMetrics(),
      metadata: result.metadata
    });

    return result;
  } catch (error) {
    errorTracker.trackError(error, { query, threadId });
    throw error;
  }
}
```

---

## 8. Best Practices and Gotchas

### 8.1 LangGraph Best Practices

#### Graph Design
- **Always establish a path from START to END**: Ensure every possible execution path leads to a terminal state
- **Name nodes descriptively**: Use clear, action-oriented names (e.g., `retrieve_documents`, not `node1`)
- **Keep nodes focused**: Each node should have a single responsibility
- **Use conditional routing for decision logic**: Don't try to handle branching within nodes

#### State Management
- **Define clear reducer logic**: Ensure state updates are predictable and consistent
- **Keep state flat when possible**: Nested state makes debugging harder
- **Use TypeScript interfaces**: Define state shape explicitly for type safety
- **Return only modified fields**: Nodes should return partial state updates

#### Performance
- **Use async patterns for I/O**: All external calls should be async
- **Implement timeouts**: Prevent hanging on external service calls
- **Cache when appropriate**: Reduce redundant API calls
- **Monitor token usage**: Track and optimize LLM token consumption

### 8.2 ReAct Agent Best Practices

"Use function-calling over prompt-based tool selection for reliability."

**Tool Design:**
- **Provide detailed docstrings**: These become the LLM's tool descriptions
- **Limit tool scope**: Each tool should perform one clear function
- **Validate inputs**: Check parameters before execution
- **Return meaningful errors**: Help the LLM understand what went wrong
- **Test tool outputs**: Verify they provide sufficient information for reasoning

**Agent Behavior:**
- **Set clear system prompts**: Define role, capabilities, and limitations
- **Use examples in prompts**: Show the desired reasoning pattern
- **Implement answer validation**: Use critic patterns to check completeness
- **Handle tool errors gracefully**: Return errors as messages, not exceptions

### 8.3 Production RAG Best Practices

#### Architecture
"To deploy a high-performance, production-ready RAG system, teams should adopt modular RAG patterns by separating retriever, generator, and orchestration logic for easier updates and debugging."

**Key Principles:**
- Modular design for easier maintenance
- Hybrid search (semantic + keyword)
- Multi-source retrieval capabilities
- Answer validation and critic patterns
- Iterative refinement loops

#### Monitoring and Optimization
"Key practices include monitoring precision and recall to track how often retrieved content improves generation quality, and fine-tuning retrieval on usage patterns to adapt the system to user behavior and domain trends."

**Metrics to Track:**
- Retrieval precision and recall
- Answer relevance scores
- Token usage per query
- Response latency
- Error rates by type
- Tool usage patterns
- User satisfaction metrics

#### Memory Management
"The 2025 best practice is a hybrid approach: vector search for semantic retrieval, knowledge graphs for factual accuracy and updates, and decay strategies to manage growth."

**Implementation:**
- Vector stores for semantic search
- Knowledge graphs for structured facts
- Decay/archiving for old memories
- Thread-based isolation for conversations
- Persistent checkpointing for reliability

### 8.4 Common Gotchas

#### LangGraph Gotchas

**1. Forgetting to Compile**
```typescript
// WRONG - won't work
const graph = new StateGraph(StateAnnotation)
  .addNode("myNode", myNodeFn);
await graph.invoke(...);  // Error!

// RIGHT
const graph = new StateGraph(StateAnnotation)
  .addNode("myNode", myNodeFn)
  .compile();  // Must compile!
await graph.invoke(...);
```

**2. State Reducer Not Handling Arrays**
```typescript
// WRONG - will replace array
messages: Annotation<BaseMessage[]>({
  reducer: (left, right) => right  // Loses history!
})

// RIGHT - concatenates arrays
messages: Annotation<BaseMessage[]>({
  reducer: (left, right) => left.concat(right)
})
```

**3. Not Handling Empty Tool Calls**
```typescript
// WRONG - will crash if no tool calls
const toolCalls = lastMessage.tool_calls;
for (const call of toolCalls) { ... }

// RIGHT - use optional chaining and defaults
const toolCalls = lastMessage.tool_calls || [];
for (const call of toolCalls) { ... }
```

**4. Thread ID Management**
```typescript
// WRONG - same thread ID for different users
const config = { configurable: { thread_id: "default" } };

// RIGHT - unique thread per user/session
const config = {
  configurable: {
    thread_id: `user-${userId}-${sessionId}`
  }
};
```

#### Tool Calling Gotchas

**1. Vague Tool Descriptions**
```typescript
// WRONG - ambiguous
description: "Search for things"

// RIGHT - specific
description: "Search the product database for items matching the query. Use this when users ask about product availability, features, or specifications."
```

**2. Complex Nested Parameters**
"Err on the side of making arguments flat, as flat structures are often easier for the model to reason about."

```typescript
// LESS IDEAL - nested structure
schema: z.object({
  search: z.object({
    query: z.string(),
    filters: z.object({
      category: z.string(),
      priceRange: z.object({
        min: z.number(),
        max: z.number()
      })
    })
  })
})

// BETTER - flat structure
schema: z.object({
  query: z.string(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional()
})
```

**3. Not Using Strict Mode**
"Setting strict to true will ensure function calls reliably adhere to the function schema, and it's recommended to turn it on whenever possible."

```typescript
// Enable strict mode for reliability
const tools = [
  {
    type: "function",
    function: {
      strict: true,  // Add this!
      // ... rest of definition
    }
  }
];
```

#### Error Handling Gotchas

**1. Silent Failures**
```typescript
// WRONG - errors disappear
async function myNode(state) {
  try {
    return await operation();
  } catch (error) {
    return {};  // Silent failure!
  }
}

// RIGHT - track errors
async function myNode(state) {
  try {
    return await operation();
  } catch (error) {
    return {
      errors: [error.message],
      retryCount: state.retryCount + 1
    };
  }
}
```

**2. No Timeout on External Calls**
```typescript
// WRONG - can hang forever
const result = await externalAPI.call();

// RIGHT - always use timeouts
const result = await Promise.race([
  externalAPI.call(),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), 30000)
  )
]);
```

**3. Not Validating Checkpoints**
```typescript
// WRONG - assume checkpoint is valid
const checkpoint = await checkpointer.get(config);
const result = await graph.invoke({}, config);

// RIGHT - validate before using
const checkpoint = await checkpointer.get(config);
if (!validateCheckpoint(checkpoint)) {
  // Handle invalid checkpoint
  throw new Error("Invalid checkpoint");
}
```

### 8.5 Security Best Practices

**API Key Management:**
```typescript
// WRONG - hardcoded keys
const apiKey = "sk-abc123...";

// RIGHT - environment variables
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}
```

**Input Validation:**
```typescript
// Validate all user inputs
function validateUserInput(input: string): boolean {
  // Check for injection attempts
  if (input.includes("<script>") || input.includes("DROP TABLE")) {
    return false;
  }

  // Check length
  if (input.length > 10000) {
    return false;
  }

  return true;
}
```

**Tool Sandboxing:**
"The example tool executes arbitrary Python—unsuitable for production use without sandboxing."

- Never execute arbitrary code without sandboxing
- Implement proper access controls for tool execution
- Validate all inputs to tools
- Use allowlists, not denylists
- Log all tool executions for audit trails

### 8.6 Testing Best Practices

"Unit test the graph routing logic and reducers by replacing the nodes with mock implementations but using the same routing logic."

**Unit Testing:**
```typescript
// Mock LLM for testing
class MockChatModel {
  async invoke(messages: BaseMessage[]) {
    return {
      content: "Test response",
      tool_calls: []
    };
  }
}

// Test graph structure
describe("AgenticRAG Graph", () => {
  it("should route to tools when tool calls are present", () => {
    const state = {
      messages: [{
        role: "assistant",
        content: "I'll search for that",
        tool_calls: [{ name: "search", args: {} }]
      }]
    };

    expect(shouldContinue(state)).toBe("tools");
  });
});
```

**Integration Testing:**
"Integration/e2e tests validate the entire flow where you cache your model outputs for each test, so a test rerun would not call the actual model but read the output from cache to speed up testing and keep costs low."

```typescript
// Cache LLM responses for testing
class CachedChatModel {
  private cache = new Map<string, any>();

  async invoke(messages: BaseMessage[]) {
    const key = JSON.stringify(messages);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const result = await realModel.invoke(messages);
    this.cache.set(key, result);
    return result;
  }
}
```

---

## 9. Integration Strategy

### 9.1 Integrating with Existing RAG System

#### Phase 1: Add Agent Layer

```typescript
// Existing RAG system
class ExistingRAGSystem {
  async query(userQuery: string): Promise<string> {
    const context = await this.retrieve(userQuery);
    return await this.generate(context, userQuery);
  }

  async retrieve(query: string): Promise<string[]> {
    return await this.vectorStore.similaritySearch(query, 5);
  }

  async generate(context: string[], query: string): Promise<string> {
    return await this.llm.invoke([...]);
  }
}

// Wrap with agentic layer
class AgenticRAGWrapper {
  constructor(private existingRAG: ExistingRAGSystem) {}

  async query(userQuery: string): Promise<string> {
    // Use LangGraph to orchestrate
    const graph = this.buildAgenticGraph();
    const result = await graph.invoke({
      messages: [{ role: "user", content: userQuery }]
    });

    return result.messages[result.messages.length - 1].content;
  }

  private buildAgenticGraph() {
    // Convert existing methods to tools
    const retrievalTool = new DynamicStructuredTool({
      name: "retrieve_context",
      description: "Retrieve relevant context from the knowledge base",
      schema: z.object({ query: z.string() }),
      func: async ({ query }) => {
        const context = await this.existingRAG.retrieve(query);
        return context.join("\n\n");
      }
    });

    // Build graph with existing system as tools
    return new StateGraph(MessagesAnnotation)
      .addNode("llm", callLlm)
      .addNode("tools", callTools)
      // ... rest of graph
      .compile();
  }
}
```

#### Phase 2: Add Multi-Source Retrieval

```typescript
// Extend with multiple retrievers
class EnhancedRetrieval {
  constructor(
    private vectorStore: VectorStore,
    private sqlDatabase: Database,
    private webSearch: WebSearchTool
  ) {}

  async retrieve(query: string, strategy: string): Promise<string[]> {
    switch (strategy) {
      case "vector":
        return await this.vectorStore.similaritySearch(query, 5);

      case "sql":
        const sqlQuery = await this.generateSQLQuery(query);
        return await this.sqlDatabase.query(sqlQuery);

      case "web":
        return await this.webSearch.search(query);

      case "hybrid":
        const [vector, web] = await Promise.all([
          this.vectorStore.similaritySearch(query, 3),
          this.webSearch.search(query)
        ]);
        return [...vector, ...web];

      default:
        return await this.vectorStore.similaritySearch(query, 5);
    }
  }
}
```

#### Phase 3: Add Query Classification

```typescript
// Add intelligent routing
class IntelligentRouter {
  async classifyAndRoute(query: string): Promise<string> {
    const classification = await this.classifyQuery(query);

    switch (classification) {
      case "FACTUAL":
        return "vector";
      case "CURRENT_EVENTS":
        return "web";
      case "DATA_ANALYSIS":
        return "sql";
      default:
        return "hybrid";
    }
  }

  private async classifyQuery(query: string): Promise<string> {
    // Use LLM to classify
    const response = await model.invoke([
      { role: "system", content: "Classify query type..." },
      { role: "user", content: query }
    ]);

    return response.content.trim().toUpperCase();
  }
}
```

### 9.2 Migration Path

**Step 1: Parallel Testing**
```typescript
class MigrationSystem {
  constructor(
    private oldSystem: ExistingRAGSystem,
    private newSystem: AgenticRAGWrapper
  ) {}

  async query(userQuery: string): Promise<string> {
    // Run both systems in parallel
    const [oldResult, newResult] = await Promise.all([
      this.oldSystem.query(userQuery),
      this.newSystem.query(userQuery)
    ]);

    // Log for comparison
    console.log("Comparison:", {
      query: userQuery,
      oldResult,
      newResult,
      timestamp: Date.now()
    });

    // Return old result (safe during migration)
    return oldResult;
  }
}
```

**Step 2: Gradual Rollout**
```typescript
class GradualRollout {
  constructor(
    private oldSystem: ExistingRAGSystem,
    private newSystem: AgenticRAGWrapper,
    private rolloutPercentage: number = 10
  ) {}

  async query(userQuery: string, userId: string): Promise<string> {
    // Use hash to deterministically assign users
    const hash = this.hashUserId(userId);
    const useNewSystem = (hash % 100) < this.rolloutPercentage;

    if (useNewSystem) {
      return await this.newSystem.query(userQuery);
    } else {
      return await this.oldSystem.query(userQuery);
    }
  }

  private hashUserId(userId: string): number {
    // Simple hash function
    return userId.split('').reduce((acc, char) =>
      acc + char.charCodeAt(0), 0
    );
  }
}
```

**Step 3: Full Migration**
```typescript
// Once validated, fully migrate
class FinalSystem {
  constructor(private agenticSystem: AgenticRAGWrapper) {}

  async query(userQuery: string): Promise<string> {
    return await this.agenticSystem.query(userQuery);
  }
}
```

### 9.3 Integration with MCP Server

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Create MCP server with agentic RAG
class MCPAgenticRAGServer {
  private server: Server;
  private agenticRAG: AgenticRAGWrapper;

  constructor() {
    this.server = new Server({
      name: "agentic-rag-server",
      version: "1.0.0"
    }, {
      capabilities: {
        tools: {},
        resources: {}
      }
    });

    this.setupHandlers();
  }

  private setupHandlers() {
    // Register RAG tool
    this.server.setRequestHandler("tools/list", async () => ({
      tools: [
        {
          name: "query_knowledge_base",
          description: "Query the agentic RAG system",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The query to search for"
              }
            },
            required: ["query"]
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler("tools/call", async (request) => {
      if (request.params.name === "query_knowledge_base") {
        const result = await this.agenticRAG.query(
          request.params.arguments.query
        );

        return {
          content: [
            {
              type: "text",
              text: result
            }
          ]
        };
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log("Agentic RAG MCP server running");
  }
}

// Start server
const server = new MCPAgenticRAGServer();
await server.start();
```

---

## 10. Testing Approaches

### 10.1 Unit Testing

"Unit tests exercise small, deterministic pieces of your agent in isolation using in-memory fakes so you can assert exact behavior quickly and deterministically."

#### Testing Graph Routing

```typescript
import { describe, it, expect } from "vitest";

describe("AgenticRAG Routing", () => {
  it("should route to tools when tool calls are present", () => {
    const state = {
      messages: [{
        role: "assistant",
        content: "I'll search for that",
        tool_calls: [{ name: "search", id: "1", args: {} }]
      }]
    };

    expect(shouldContinue(state)).toBe("tools");
  });

  it("should end when no tool calls", () => {
    const state = {
      messages: [{
        role: "assistant",
        content: "Here's your answer"
      }]
    };

    expect(shouldContinue(state)).toBe(END);
  });

  it("should route to error handler after max retries", () => {
    const state = {
      messages: [],
      retryCount: 4,
      errors: ["error1", "error2", "error3"]
    };

    expect(productionRouter(state)).toBe("fallback");
  });
});
```

#### Testing State Reducers

```typescript
describe("State Reducers", () => {
  it("should concatenate messages", () => {
    const StateAnnotation = Annotation.Root({
      messages: Annotation<BaseMessage[]>({
        reducer: (left, right) => left.concat(right),
        default: () => []
      })
    });

    const initial = [{ role: "user", content: "Hello" }];
    const update = [{ role: "assistant", content: "Hi" }];

    const reducer = StateAnnotation.spec.messages.reducer;
    const result = reducer(initial, update);

    expect(result).toHaveLength(2);
    expect(result[1].content).toBe("Hi");
  });

  it("should increment counter", () => {
    const StateAnnotation = Annotation.Root({
      count: Annotation<number>({
        reducer: (prev, next) => prev + next,
        default: () => 0
      })
    });

    const reducer = StateAnnotation.spec.count.reducer;
    expect(reducer(5, 3)).toBe(8);
  });
});
```

#### Testing Nodes with Mocks

```typescript
describe("Agent Nodes", () => {
  it("should call LLM with correct messages", async () => {
    const mockModel = {
      invoke: vi.fn().mockResolvedValue({
        content: "Test response",
        tool_calls: []
      })
    };

    const state = {
      messages: [{ role: "user", content: "Test query" }]
    };

    const result = await callLlm(state, mockModel);

    expect(mockModel.invoke).toHaveBeenCalledWith(state.messages);
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content).toBe("Test response");
  });

  it("should execute tools correctly", async () => {
    const mockTool = {
      invoke: vi.fn().mockResolvedValue("Tool result")
    };

    const state = {
      messages: [{
        role: "assistant",
        content: "Using tool",
        tool_calls: [
          { name: "test_tool", id: "1", args: { query: "test" } }
        ]
      }]
    };

    const result = await callTools(state, { test_tool: mockTool });

    expect(mockTool.invoke).toHaveBeenCalledWith({ query: "test" });
    expect(result.messages[0].role).toBe("tool");
    expect(result.messages[0].content).toBe("Tool result");
  });
});
```

### 10.2 Integration Testing

"Integration/e2e tests validate the entire flow where you cache your model outputs for each test, so a test rerun would not call the actual model but read the output from cache to speed up testing and keep costs low."

#### Cached Model Testing

```typescript
class CachedModel {
  private cache: Map<string, any> = new Map();
  private cacheFile = "./test-cache.json";

  constructor(private realModel: ChatModel) {
    this.loadCache();
  }

  async invoke(messages: BaseMessage[]): Promise<any> {
    const key = this.generateKey(messages);

    if (this.cache.has(key)) {
      console.log("Using cached response");
      return this.cache.get(key);
    }

    console.log("Calling real model");
    const result = await this.realModel.invoke(messages);
    this.cache.set(key, result);
    this.saveCache();

    return result;
  }

  private generateKey(messages: BaseMessage[]): string {
    return JSON.stringify(messages);
  }

  private loadCache() {
    try {
      const data = fs.readFileSync(this.cacheFile, "utf-8");
      this.cache = new Map(JSON.parse(data));
    } catch {
      // Cache file doesn't exist yet
    }
  }

  private saveCache() {
    fs.writeFileSync(
      this.cacheFile,
      JSON.stringify(Array.from(this.cache.entries()))
    );
  }
}

describe("Agentic RAG Integration", () => {
  const cachedModel = new CachedModel(realModel);

  it("should complete a full query cycle", async () => {
    const graph = buildGraphWithModel(cachedModel);

    const result = await graph.invoke({
      messages: [{ role: "user", content: "What is LangGraph?" }]
    });

    expect(result.messages.length).toBeGreaterThan(1);
    expect(result.messages[result.messages.length - 1].role).toBe("assistant");
  });
});
```

#### End-to-End Testing

```typescript
describe("E2E: Complete RAG Flow", () => {
  it("should handle factual query with retrieval", async () => {
    const result = await agenticRAG.query(
      "What is the capital of France?"
    );

    expect(result).toContain("Paris");
  });

  it("should handle multi-hop reasoning", async () => {
    const result = await agenticRAG.query(
      "Compare the populations of the two largest cities in California"
    );

    expect(result).toContain("Los Angeles");
    expect(result).toContain("San Diego");
  });

  it("should recover from tool errors", async () => {
    // Mock tool that fails first time
    let attemptCount = 0;
    const flakyTool = {
      invoke: async () => {
        attemptCount++;
        if (attemptCount === 1) {
          throw new Error("Temporary failure");
        }
        return "Success";
      }
    };

    const result = await graphWithFlakyTool.invoke({
      messages: [{ role: "user", content: "Test query" }]
    });

    expect(attemptCount).toBe(2);
    expect(result.messages.some(m => m.content.includes("Success"))).toBe(true);
  });
});
```

### 10.3 Performance Testing

```typescript
describe("Performance Tests", () => {
  it("should complete queries within time limit", async () => {
    const start = Date.now();

    await agenticRAG.query("Test query");

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000);  // 5 seconds
  });

  it("should handle concurrent queries", async () => {
    const queries = Array(10).fill(null).map((_, i) =>
      agenticRAG.query(`Query ${i}`)
    );

    const results = await Promise.all(queries);

    expect(results).toHaveLength(10);
    results.forEach(result => {
      expect(result).toBeTruthy();
    });
  });

  it("should maintain memory under load", async () => {
    const initialMemory = process.memoryUsage().heapUsed;

    // Run 100 queries
    for (let i = 0; i < 100; i++) {
      await agenticRAG.query(`Query ${i}`);
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be reasonable (< 100MB)
    expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
  });
});
```

### 10.4 Testing Best Practices

"Unit test the graph routing logic and reducers by replacing the nodes with mock implementations but using the same routing logic, where you can specify what the result of each node is and check whether the flow and overall result is as expected."

**Key Testing Principles:**

1. **Test routing logic separately from LLM calls**
2. **Cache LLM responses for consistent integration tests**
3. **Mock external dependencies (databases, APIs)**
4. **Test error paths thoroughly**
5. **Validate state transitions**
6. **Test with realistic data**
7. **Measure performance metrics**
8. **Test concurrency and race conditions**

**Testing Framework Structure:**
"The testing framework validates both the core graph functionality and configuration system through unit and integration tests. The implementation includes: The testing framework uses anyio for async test support with asyncio as the backend, with configuration centralized in conftest.py where the anyio_backend fixture is session-scoped."

---

## Appendix A: Key Resources

### Official Documentation
- **LangGraph.js**: https://langchain-ai.github.io/langgraphjs/
- **LangGraph API Reference**: https://langchain-ai.github.io/langgraphjs/reference/
- **LangChain.js**: https://js.langchain.com/
- **OpenAI Function Calling**: https://platform.openai.com/docs/guides/function-calling

### Templates and Examples
- **Official ReAct Agent Template**: https://github.com/langchain-ai/react-agent-js
- **Agents from Scratch TypeScript**: https://github.com/langchain-ai/agents-from-scratch-ts

### Research Papers
- **ReAct: Synergizing Reasoning and Acting**: https://arxiv.org/abs/2210.03629
- **Agentic RAG Survey**: https://arxiv.org/abs/2501.09136

### Community Resources
- **LangGraph Discussions**: https://github.com/langchain-ai/langgraph/discussions
- **LangChain Community**: https://github.com/langchain-ai/langchain/discussions

### Best Practices Guides
- **Mastering LangGraph Checkpointing (2025)**: https://sparkco.ai/blog/mastering-langgraph-checkpointing-best-practices-for-2025
- **Building ReAct Agents with LangGraph**: https://dylancastillo.co/posts/react-agent-langgraph.html
- **Agentic RAG Guide**: https://blog.n8n.io/agentic-rag/

---

## Appendix B: Quick Reference

### Essential Imports

```typescript
// LangGraph Core
import { StateGraph, START, END, Annotation, MessagesAnnotation } from "@langchain/langgraph";

// LLM Providers
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";

// Tools
import { DynamicStructuredTool } from "@langchain/core/tools";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

// Memory
import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

// Schema
import { z } from "zod";

// Messages
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
```

### Common Patterns

#### Basic Graph
```typescript
const graph = new StateGraph(MessagesAnnotation)
  .addNode("node_name", nodeFunction)
  .addEdge(START, "node_name")
  .addEdge("node_name", END)
  .compile();
```

#### Conditional Routing
```typescript
.addConditionalEdges("source_node", routerFunction, {
  option1: "node1",
  option2: "node2",
  [END]: END
})
```

#### State with Reducer
```typescript
const State = Annotation.Root({
  field: Annotation<type>({
    reducer: (prev, next) => prev + next,
    default: () => initialValue
  })
});
```

#### Tool Definition
```typescript
const tool = new DynamicStructuredTool({
  name: "tool_name",
  description: "Clear description",
  schema: z.object({
    param: z.string().describe("Parameter description")
  }),
  func: async ({ param }) => {
    return "result";
  }
});
```

---

**End of Document**

This comprehensive index covers all essential aspects of implementing Phase 2: Agentic RAG with LangGraph. Use this as your primary reference for architecture decisions, implementation patterns, and best practices.

For questions or clarifications, refer to the official documentation links in Appendix A or consult the community resources.