# Spire.XLS MCP Server - Comprehensive Implementation Index

**Document Version**: 1.0
**Last Updated**: 2025-11-05
**Purpose**: Complete reference for implementing Phase 0B MVP with 100% accuracy

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Spire.XLS MCP Server Reference](#spirexls-mcp-server-reference)
3. [Complete Tool Reference](#complete-tool-reference)
4. [Model Context Protocol (MCP) Specification](#model-context-protocol-mcp-specification)
5. [TypeScript SDK Implementation Guide](#typescript-sdk-implementation-guide)
6. [SSE Transport Configuration](#sse-transport-configuration)
7. [Error Handling Patterns](#error-handling-patterns)
8. [Complete Working Examples](#complete-working-examples)
9. [Best Practices](#best-practices)

---

## Executive Summary

The Spire.XLS MCP Server is a Python-based Model Context Protocol server that exposes Excel manipulation capabilities to AI agents through standardized tool definitions. It runs as an HTTP server using Server-Sent Events (SSE) transport on port 8000 (configurable).

**Key Facts:**
- **Repository**: https://github.com/eiceblue/spire-xls-mcp-server
- **Protocol**: Model Context Protocol (MCP) over SSE/Streamable HTTP
- **Language**: Python 3.10+
- **License**: MIT
- **Default Port**: 8000
- **Default Path**: ./excel_files
- **Transport**: Server-Sent Events (SSE) - Note: Deprecated in MCP spec 2025-03-26, use Streamable HTTP

---

## Spire.XLS MCP Server Reference

### Installation & Setup

#### Prerequisites
```bash
# System requirements
- Python 3.10 or higher
- uv package manager (for installation)
```

#### Installation Steps
```bash
# Clone the repository
git clone https://github.com/eiceblue/spire-xls-mcp-server.git
cd spire-xls-mcp-server

# Install using uv
uv pip install -e .
```

#### Running the Server

**Default Configuration (Port 8000):**
```bash
uv run spire-xls-mcp-server
```

**Custom Port Configuration:**

Linux/macOS:
```bash
export FASTMCP_PORT=8080 && uv run spire-xls-mcp-server
```

Windows PowerShell:
```powershell
$env:FASTMCP_PORT = "8080"; uv run spire-xls-mcp-server
```

#### Environment Variables

| Variable | Purpose | Default Value | Type |
|----------|---------|---------------|------|
| `FASTMCP_PORT` | HTTP server port | 8000 | integer |
| `EXCEL_FILES_PATH` | Base directory for Excel files | ./excel_files | string (path) |

### Integration Configuration

#### Cursor IDE
```json
{
  "mcpServers": {
    "excel": {
      "url": "http://localhost:8000/sse",
      "env": {
        "EXCEL_FILES_PATH": "/absolute/path/to/excel/files"
      }
    }
  }
}
```

#### Important Notes
- Server uses SSE (Server-Sent Events) transport protocol
- SSE endpoint: `http://localhost:{PORT}/sse`
- For Claude Desktop (requires stdio), use Supergateway to convert SSE to stdio
- All file paths should be absolute or relative to `EXCEL_FILES_PATH`

---

## Complete Tool Reference

### Tool Categories

1. **Workbook Operations** - Create and manage workbooks
2. **Worksheet Operations** - Manipulate individual sheets
3. **Data Operations** - Read and write cell data
4. **Formula Operations** - Apply Excel formulas
5. **Formatting Operations** - Style and format cells
6. **Range Operations** - Copy, delete, and validate ranges
7. **Chart Operations** - Create visualizations
8. **Pivot Table Operations** - Create data analysis tables
9. **Filter Operations** - Apply autofilters
10. **Import/Export Operations** - JSON conversion
11. **Conversion Operations** - Convert to multiple formats

---

### 1. Workbook Operations

#### create_workbook
Creates a new Excel workbook at the specified location.

**Parameters:**
```typescript
{
  filepath: string;      // Path where workbook will be created
  sheet_name?: string;   // Optional: Name for the initial worksheet
}
```

**Returns:** `string` (success message)

**Example:**
```typescript
await client.callTool({
  name: "create_workbook",
  arguments: {
    filepath: "/path/to/workbooks/report.xlsx",
    sheet_name: "Q1 Data"
  }
});
```

---

#### create_worksheet
Adds a new worksheet to an existing workbook.

**Parameters:**
```typescript
{
  filepath: string;    // Path to existing workbook
  sheet_name: string;  // Name for the new worksheet
}
```

**Returns:** `string` (success message)

**Example:**
```typescript
await client.callTool({
  name: "create_worksheet",
  arguments: {
    filepath: "/path/to/workbooks/report.xlsx",
    sheet_name: "Q2 Data"
  }
});
```

---

#### get_workbook_metadata
Retrieves comprehensive information about a workbook.

**Parameters:**
```typescript
{
  filepath: string;          // Path to workbook
  include_ranges?: boolean;  // Optional: Include cell range data (default: false)
}
```

**Returns:** `dict` containing:
- Sheet names (array)
- File size (bytes)
- Modification timestamp
- Range data (if include_ranges=true)

**Example:**
```typescript
const metadata = await client.callTool({
  name: "get_workbook_metadata",
  arguments: {
    filepath: "/path/to/workbooks/report.xlsx",
    include_ranges: true
  }
});
```

---

### 2. Data Operations

#### write_data_to_excel
Writes tabular data to a worksheet starting at a specified cell.

**Parameters:**
```typescript
{
  filepath: string;           // Path to workbook
  sheet_name: string;         // Target worksheet name
  data: Array<Array<any>>;    // 2D array of data (rows × columns)
  start_cell?: string;        // Optional: Starting cell (default: "A1")
}
```

**Returns:** `string` (success message)

**Example:**
```typescript
await client.callTool({
  name: "write_data_to_excel",
  arguments: {
    filepath: "/path/to/workbooks/report.xlsx",
    sheet_name: "Q1 Data",
    data: [
      ["Product", "Sales", "Region"],
      ["Widget A", 1500, "North"],
      ["Widget B", 2300, "South"]
    ],
    start_cell: "A1"
  }
});
```

---

#### read_data_from_excel
Retrieves cell contents from a specified range.

**Parameters:**
```typescript
{
  filepath: string;        // Path to workbook
  sheet_name: string;      // Source worksheet name
  cell_range: string;      // Range in A1 notation (e.g., "A1:C10")
  preview_only?: boolean;  // Optional: Return limited data (default: false)
}
```

**Returns:** `dict` with data in column-first nested dictionary format

**Example:**
```typescript
const data = await client.callTool({
  name: "read_data_from_excel",
  arguments: {
    filepath: "/path/to/workbooks/report.xlsx",
    sheet_name: "Q1 Data",
    cell_range: "A1:C10",
    preview_only: false
  }
});
```

---

### 3. Formula Operations

#### apply_formula
Inserts an Excel formula into a specific cell.

**Parameters:**
```typescript
{
  filepath: string;    // Path to workbook
  sheet_name: string;  // Target worksheet name
  cell: string;        // Target cell (e.g., "D5")
  formula: string;     // Excel formula (must include "=" prefix)
}
```

**Returns:** `string` (success message)

**Important:** Formula must start with "=" (e.g., "=SUM(A1:A10)")

**Example:**
```typescript
await client.callTool({
  name: "apply_formula",
  arguments: {
    filepath: "/path/to/workbooks/report.xlsx",
    sheet_name: "Q1 Data",
    cell: "D2",
    formula: "=B2*C2"
  }
});
```

---

### 4. Formatting Operations

#### format_range
Applies comprehensive styling to a cell range.

**Parameters:**
```typescript
{
  filepath: string;            // Path to workbook
  sheet_name: string;          // Target worksheet name
  cell_range: string;          // Range in A1 notation

  // Optional formatting parameters:
  bold?: boolean;              // Bold text
  italic?: boolean;            // Italic text
  underline?: boolean;         // Underline text
  font_size?: number;          // Font size in points
  font_color?: string;         // Hex color (e.g., "#FF0000")
  bg_color?: string;           // Background color (hex)
  border_style?: string;       // Border style
  border_color?: string;       // Border color (hex)
  number_format?: string;      // Number format (e.g., "0.00")
  alignment?: string;          // Text alignment
  wrap_text?: boolean;         // Enable text wrapping
  merge_cells?: boolean;       // Merge the range
  protection?: boolean;        // Cell protection
  conditional_format?: object; // Conditional formatting rules
}
```

**Returns:** `string` (success message)

**Example:**
```typescript
await client.callTool({
  name: "format_range",
  arguments: {
    filepath: "/path/to/workbooks/report.xlsx",
    sheet_name: "Q1 Data",
    cell_range: "A1:C1",
    bold: true,
    font_size: 14,
    font_color: "#FFFFFF",
    bg_color: "#4472C4",
    alignment: "center"
  }
});
```

---

#### merge_cells
Combines multiple cell ranges into merged areas.

**Parameters:**
```typescript
{
  filepath: string;              // Path to workbook
  sheet_name: string;            // Target worksheet name
  cell_range_list: Array<string>; // Array of ranges to merge
}
```

**Returns:** `string` (success message)

**Example:**
```typescript
await client.callTool({
  name: "merge_cells",
  arguments: {
    filepath: "/path/to/workbooks/report.xlsx",
    sheet_name: "Q1 Data",
    cell_range_list: ["A1:C1", "A10:C10"]
  }
});
```

---

#### unmerge_cells
Separates previously merged cell ranges.

**Parameters:**
```typescript
{
  filepath: string;      // Path to workbook
  sheet_name: string;    // Target worksheet name
  cell_range: string;    // Range to unmerge
}
```

**Returns:** `string` (success message)

**Example:**
```typescript
await client.callTool({
  name: "unmerge_cells",
  arguments: {
    filepath: "/path/to/workbooks/report.xlsx",
    sheet_name: "Q1 Data",
    cell_range: "A1:C1"
  }
});
```

---

### 5. Chart Operations

#### create_chart
Generates a chart from a data range.

**Parameters:**
```typescript
{
  filepath: string;          // Path to workbook
  sheet_name: string;        // Target worksheet name
  data_range: string;        // Source data range
  chart_type: string;        // Chart type (see below)
  target_cell: string;       // Where to place chart
  title?: string;            // Optional: Chart title
  x_axis?: string;           // Optional: X-axis label
  y_axis?: string;           // Optional: Y-axis label
  style?: object;            // Optional: Style configuration
}
```

**Supported Chart Types:**
- `"column"` - Column chart
- `"line"` - Line chart
- `"pie"` - Pie chart
- `"bar"` - Bar chart
- `"scatter"` - Scatter plot

**Returns:** `string` (success message)

**Example:**
```typescript
await client.callTool({
  name: "create_chart",
  arguments: {
    filepath: "/path/to/workbooks/report.xlsx",
    sheet_name: "Q1 Data",
    data_range: "A1:C10",
    chart_type: "column",
    target_cell: "E2",
    title: "Quarterly Sales",
    x_axis: "Products",
    y_axis: "Revenue ($)"
  }
});
```

---

### 6. Pivot Table Operations

#### create_pivot_table
Constructs a pivot table for data analysis.

**Parameters:**
```typescript
{
  filepath: string;         // Path to workbook
  sheet_name: string;       // Target worksheet name
  pivot_name: string;       // Name for the pivot table
  data_range: string;       // Source data range
  locate_range: string;     // Where to place pivot table
  rows: Array<string>;      // Row field names
  values: object;           // Value fields with aggregation (e.g., {"Sales": "sum"})
  columns?: Array<string>;  // Optional: Column field names
  agg_func?: string;        // Optional: Default aggregation (default: "sum")
}
```

**Supported Aggregation Functions:**
- `"sum"` - Sum values
- `"count"` - Count values
- `"average"` - Average values
- `"min"` - Minimum value
- `"max"` - Maximum value

**Returns:** `string` (success message)

**Example:**
```typescript
await client.callTool({
  name: "create_pivot_table",
  arguments: {
    filepath: "/path/to/workbooks/report.xlsx",
    sheet_name: "Q1 Data",
    pivot_name: "SalesPivot",
    data_range: "A1:C100",
    locate_range: "F2",
    rows: ["Region", "Product"],
    values: {"Sales": "sum", "Units": "count"},
    columns: ["Quarter"],
    agg_func: "sum"
  }
});
```

---

### 7. Worksheet Operations

#### copy_worksheet
Duplicates a worksheet within the same workbook.

**Parameters:**
```typescript
{
  filepath: string;       // Path to workbook
  source_sheet: string;   // Name of sheet to copy
  target_sheet: string;   // Name for the new sheet
}
```

**Returns:** `string` (success message)

**Example:**
```typescript
await client.callTool({
  name: "copy_worksheet",
  arguments: {
    filepath: "/path/to/workbooks/report.xlsx",
    source_sheet: "Q1 Data",
    target_sheet: "Q1 Data Backup"
  }
});
```

---

#### delete_worksheet
Removes a worksheet from the workbook.

**Parameters:**
```typescript
{
  filepath: string;      // Path to workbook
  sheet_name: string;    // Name of sheet to delete
}
```

**Returns:** `string` (success message)

**Example:**
```typescript
await client.callTool({
  name: "delete_worksheet",
  arguments: {
    filepath: "/path/to/workbooks/report.xlsx",
    sheet_name: "Old Data"
  }
});
```

---

#### rename_worksheet
Changes a worksheet's name.

**Parameters:**
```typescript
{
  filepath: string;    // Path to workbook
  old_name: string;    // Current worksheet name
  new_name: string;    // New worksheet name
}
```

**Returns:** `string` (success message)

**Example:**
```typescript
await client.callTool({
  name: "rename_worksheet",
  arguments: {
    filepath: "/path/to/workbooks/report.xlsx",
    old_name: "Sheet1",
    new_name: "Q1 Summary"
  }
});
```

---

### 8. Range Operations

#### copy_range
Duplicates a cell range to a new location (optionally to a different sheet).

**Parameters:**
```typescript
{
  filepath: string;         // Path to workbook
  sheet_name: string;       // Source worksheet name
  source_range: string;     // Range to copy
  target_range: string;     // Destination range
  target_sheet?: string;    // Optional: Target sheet (default: same sheet)
}
```

**Returns:** `string` (success message)

**Example:**
```typescript
await client.callTool({
  name: "copy_range",
  arguments: {
    filepath: "/path/to/workbooks/report.xlsx",
    sheet_name: "Q1 Data",
    source_range: "A1:C10",
    target_range: "E1",
    target_sheet: "Q2 Data"
  }
});
```

---

#### delete_range
Removes cells and shifts remaining content.

**Parameters:**
```typescript
{
  filepath: string;           // Path to workbook
  sheet_name: string;         // Target worksheet name
  cell_range: string;         // Range to delete
  shift_direction?: string;   // Optional: "up" or "left" (default: "up")
}
```

**Returns:** `string` (success message)

**Example:**
```typescript
await client.callTool({
  name: "delete_range",
  arguments: {
    filepath: "/path/to/workbooks/report.xlsx",
    sheet_name: "Q1 Data",
    cell_range: "B5:B10",
    shift_direction: "up"
  }
});
```

---

#### validate_excel_range
Verifies range existence and returns actual data boundaries.

**Parameters:**
```typescript
{
  filepath: string;      // Path to workbook
  sheet_name: string;    // Target worksheet name
  cell_range: string;    // Range to validate
}
```

**Returns:** `string` (validation result with actual boundaries)

**Example:**
```typescript
const validation = await client.callTool({
  name: "validate_excel_range",
  arguments: {
    filepath: "/path/to/workbooks/report.xlsx",
    sheet_name: "Q1 Data",
    cell_range: "A1:Z1000"
  }
});
```

---

### 9. Filter Operations

#### apply_autofilter
Enables automatic filtering interface on a data range.

**Parameters:**
```typescript
{
  filepath: string;      // Path to workbook
  sheet_name: string;    // Target worksheet name
  cell_range: string;    // Range for autofilter
}
```

**Returns:** `string` (success message)

**Example:**
```typescript
await client.callTool({
  name: "apply_autofilter",
  arguments: {
    filepath: "/path/to/workbooks/report.xlsx",
    sheet_name: "Q1 Data",
    cell_range: "A1:C100"
  }
});
```

---

### 10. Import/Export Operations

#### export_to_json
Converts a worksheet range to JSON format.

**Parameters:**
```typescript
{
  filepath: string;             // Path to workbook
  sheet_name: string;           // Source worksheet name
  cell_range: string;           // Range to export
  output_filepath: string;      // Path for JSON output file
  include_headers?: boolean;    // Optional: Use first row as keys (default: true)
  options?: object;             // Optional: Additional formatting options
}
```

**Returns:** `string` (success message)

**Example:**
```typescript
await client.callTool({
  name: "export_to_json",
  arguments: {
    filepath: "/path/to/workbooks/report.xlsx",
    sheet_name: "Q1 Data",
    cell_range: "A1:C100",
    output_filepath: "/path/to/output/data.json",
    include_headers: true
  }
});
```

---

#### import_from_json
Populates a worksheet from JSON data.

**Parameters:**
```typescript
{
  json_filepath: string;      // Path to JSON source file
  excel_filepath: string;     // Path to target workbook
  sheet_name: string;         // Target worksheet name
  start_cell?: string;        // Optional: Starting cell (default: "A1")
  create_sheet?: boolean;     // Optional: Create sheet if missing (default: false)
  options?: object;           // Optional: Import options
}
```

**Returns:** `string` (success message)

**Example:**
```typescript
await client.callTool({
  name: "import_from_json",
  arguments: {
    json_filepath: "/path/to/data.json",
    excel_filepath: "/path/to/workbooks/report.xlsx",
    sheet_name: "Imported Data",
    start_cell: "A1",
    create_sheet: true
  }
});
```

---

### 11. Conversion Operations

#### convert_excel
Transforms workbook to different output formats.

**Parameters:**
```typescript
{
  filepath: string;           // Path to source workbook
  output_filepath: string;    // Path for converted file
  format_type: string;        // Output format (see below)
  options?: object;           // Optional: Conversion options
  sheet_name?: string;        // Optional: Convert specific sheet only
  cell_range?: string;        // Optional: Convert specific range only
}
```

**Supported Output Formats:**
- `"PDF"` - Portable Document Format
- `"HTML"` - HTML web page
- `"CSV"` - Comma-separated values
- `"XML"` - XML format
- `"image"` - Image formats (PNG, JPG)

**Returns:** `string` (success message)

**Example:**
```typescript
await client.callTool({
  name: "convert_excel",
  arguments: {
    filepath: "/path/to/workbooks/report.xlsx",
    output_filepath: "/path/to/output/report.pdf",
    format_type: "PDF",
    sheet_name: "Q1 Data"
  }
});
```

---

## Model Context Protocol (MCP) Specification

### Overview

The Model Context Protocol (MCP) is an open-source standard for connecting AI applications to external systems. It functions as a standardized interface (analogous to "USB-C for AI applications") that enables AI systems to access:

1. **Data Sources** - Local files, databases, APIs
2. **Tools** - Search engines, calculators, Excel manipulation
3. **Workflows** - Specialized prompts and procedures

### Key Concepts

#### Architecture
```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │ ◄─────► │ MCP Server  │ ◄─────► │  Resources  │
│ (AI Agent)  │         │             │         │   (Excel)   │
└─────────────┘         └─────────────┘         └─────────────┘
```

#### Protocol Features
- **JSON-RPC 2.0** - Message format specification
- **Bidirectional Communication** - Client and server can both initiate requests
- **Multiple Transports** - SSE, Streamable HTTP, stdio
- **Standardized Tool Definitions** - Consistent schema across implementations

### Transport Mechanisms

#### Server-Sent Events (SSE) - DEPRECATED
**Status:** Deprecated as of MCP specification version 2025-03-26

**Endpoint Format:**
```
http://localhost:{PORT}/sse
```

**Important Notes:**
- SSE transport is still supported for backward compatibility
- New implementations should use **Streamable HTTP** transport
- SSE provides unidirectional streaming from server to client
- Requires separate HTTP POST for client-to-server messages

#### Streamable HTTP Transport - RECOMMENDED
**Status:** Current standard as of 2025-03-26

**Advantages over SSE:**
- Unified request/response channel
- Simplified error handling
- Better debugging and monitoring
- Bidirectional communication in single connection

**Migration Path:**
Clients should attempt Streamable HTTP first, then fall back to SSE for legacy servers:

```typescript
let client: Client | undefined = undefined;
const baseUrl = new URL(url);

try {
  // Try Streamable HTTP first
  client = new Client({ name: 'streamable-http-client', version: '1.0.0' });
  const transport = new StreamableHTTPClientTransport(new URL(baseUrl));
  await client.connect(transport);
  console.log('Connected using Streamable HTTP transport');
} catch (error) {
  // Fall back to SSE for legacy servers
  console.log('Falling back to SSE transport');
  client = new Client({ name: 'sse-client', version: '1.0.0' });
  const sseTransport = new SSEClientTransport(baseUrl);
  await client.connect(sseTransport);
  console.log('Connected using SSE transport');
}
```

#### stdio Transport
Used for local process communication (e.g., Claude Desktop integration).

**Configuration:**
```typescript
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [serverScriptPath]
});
```

---

## TypeScript SDK Implementation Guide

### Installation

```bash
npm install @modelcontextprotocol/sdk
```

### Core Imports

```typescript
// Client and transport
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
```

### Client Architecture

#### Basic Client Setup

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

// Create MCP Client
const client = new Client({
  name: "spire-xls-client",
  version: "1.0.0"
});

// Create SSE transport
const transport = new SSEClientTransport(
  new URL("http://localhost:8000/sse")
);

// Connect to server
await client.connect(transport);

console.log("Connected to Spire.XLS MCP Server");
```

#### Client with Capabilities

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const transport = new SSEClientTransport(
  new URL("http://localhost:8000/sse")
);

const client = new Client(
  {
    name: "spire-xls-client",
    version: "1.0.0"
  },
  {
    capabilities: {
      prompts: {},      // Support for prompts
      resources: {},    // Support for resources
      tools: {},        // Support for tools
      logging: {}       // Support for logging
    }
  }
);

await client.connect(transport);
```

### Client API Methods

#### List Available Tools
```typescript
const toolsResult = await client.listTools();
console.log("Available tools:", toolsResult.tools);

// toolsResult.tools structure:
// [
//   {
//     name: "create_workbook",
//     description: "Creates a new Excel workbook",
//     inputSchema: { /* JSON Schema */ }
//   },
//   ...
// ]
```

#### Call a Tool
```typescript
const result = await client.callTool({
  name: "write_data_to_excel",
  arguments: {
    filepath: "/path/to/workbook.xlsx",
    sheet_name: "Sheet1",
    data: [
      ["Name", "Age", "City"],
      ["Alice", 30, "New York"],
      ["Bob", 25, "San Francisco"]
    ],
    start_cell: "A1"
  }
});

console.log("Tool result:", result);
```

#### List Available Resources
```typescript
const resourcesResult = await client.listResources();
console.log("Available resources:", resourcesResult.resources);
```

#### Read a Resource
```typescript
const resource = await client.readResource({
  uri: "file:///path/to/resource"
});
console.log("Resource content:", resource);
```

#### List Available Prompts
```typescript
const promptsResult = await client.listPrompts();
console.log("Available prompts:", promptsResult.prompts);
```

#### Get a Prompt
```typescript
const prompt = await client.getPrompt({
  name: "prompt-name",
  arguments: { /* prompt arguments */ }
});
console.log("Prompt:", prompt);
```

### Complete Working Example: Basic Client

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function main() {
  // Initialize client
  const client = new Client({
    name: "spire-xls-client",
    version: "1.0.0"
  });

  // Create transport
  const transport = new SSEClientTransport(
    new URL("http://localhost:8000/sse")
  );

  try {
    // Connect
    await client.connect(transport);
    console.log("Connected successfully");

    // List available tools
    const tools = await client.listTools();
    console.log(`Found ${tools.tools.length} tools`);

    // Create a workbook
    const createResult = await client.callTool({
      name: "create_workbook",
      arguments: {
        filepath: "/tmp/test.xlsx",
        sheet_name: "Data"
      }
    });
    console.log("Create workbook:", createResult);

    // Write data
    const writeResult = await client.callTool({
      name: "write_data_to_excel",
      arguments: {
        filepath: "/tmp/test.xlsx",
        sheet_name: "Data",
        data: [
          ["Product", "Price", "Quantity"],
          ["Widget", 19.99, 100],
          ["Gadget", 29.99, 50]
        ],
        start_cell: "A1"
      }
    });
    console.log("Write data:", writeResult);

    // Read data back
    const readResult = await client.callTool({
      name: "read_data_from_excel",
      arguments: {
        filepath: "/tmp/test.xlsx",
        sheet_name: "Data",
        cell_range: "A1:C3"
      }
    });
    console.log("Read data:", readResult);

  } catch (error) {
    console.error("Error:", error);
  }
}

main();
```

### Complete Working Example: AI Agent Integration

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { Anthropic } from "@anthropic-ai/sdk";

interface Tool {
  name: string;
  description: string;
  input_schema: any;
}

class SpireXLSAgent {
  private mcpClient: Client;
  private anthropic: Anthropic;
  private transport: SSEClientTransport | null = null;
  private tools: Tool[] = [];

  constructor(apiKey: string, serverUrl: string) {
    this.anthropic = new Anthropic({ apiKey });
    this.mcpClient = new Client({
      name: "spire-xls-agent",
      version: "1.0.0"
    });
    this.transport = new SSEClientTransport(new URL(serverUrl));
  }

  async connect() {
    await this.mcpClient.connect(this.transport!);

    // Load available tools
    const toolsResult = await this.mcpClient.listTools();
    this.tools = toolsResult.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema
    }));

    console.log(`Connected. Loaded ${this.tools.length} tools.`);
  }

  async processQuery(query: string): Promise<string> {
    const messages: any[] = [
      { role: "user", content: query }
    ];

    // Initial LLM call with tools
    const response = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages,
      tools: this.tools
    });

    const finalText: string[] = [];

    // Process response content
    for (const content of response.content) {
      if (content.type === "text") {
        finalText.push(content.text);
      } else if (content.type === "tool_use") {
        console.log(`Calling tool: ${content.name}`);

        // Execute tool via MCP
        const result = await this.mcpClient.callTool({
          name: content.name,
          arguments: content.input
        });

        console.log(`Tool result:`, result);

        // Add tool result to conversation
        messages.push({
          role: "assistant",
          content: response.content
        });
        messages.push({
          role: "user",
          content: [{
            type: "tool_result",
            tool_use_id: content.id,
            content: JSON.stringify(result)
          }]
        });

        // Get LLM's interpretation of results
        const followUp = await this.anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 4096,
          messages
        });

        if (followUp.content[0].type === "text") {
          finalText.push(followUp.content[0].text);
        }
      }
    }

    return finalText.join("\n");
  }
}

// Usage
async function main() {
  const agent = new SpireXLSAgent(
    process.env.ANTHROPIC_API_KEY!,
    "http://localhost:8000/sse"
  );

  await agent.connect();

  const result = await agent.processQuery(
    "Create a sales report in /tmp/report.xlsx with data for Q1 2024"
  );

  console.log("Agent response:", result);
}

main();
```

---

## SSE Transport Configuration

### Connection Setup

#### Basic SSE Connection
```typescript
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const transport = new SSEClientTransport(
  new URL("http://localhost:8000/sse")
);
```

#### With Custom Headers
```typescript
const transport = new SSEClientTransport(
  new URL("http://localhost:8000/sse"),
  {
    headers: {
      "Authorization": "Bearer token",
      "X-Custom-Header": "value"
    }
  }
);
```

### Connection Lifecycle

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const client = new Client({ name: "client", version: "1.0.0" });
const transport = new SSEClientTransport(new URL("http://localhost:8000/sse"));

// Connect
await client.connect(transport);

// Use client...
const tools = await client.listTools();

// Disconnect (cleanup)
await client.close();
```

### Environment-Based Configuration

```typescript
const SPIRE_XLS_PORT = process.env.SPIRE_XLS_PORT || "8000";
const SPIRE_XLS_HOST = process.env.SPIRE_XLS_HOST || "localhost";

const transport = new SSEClientTransport(
  new URL(`http://${SPIRE_XLS_HOST}:${SPIRE_XLS_PORT}/sse`)
);
```

---

## Error Handling Patterns

### Transport Connection Errors

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function connectWithRetry(
  url: string,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<Client> {
  const client = new Client({ name: "client", version: "1.0.0" });
  const transport = new SSEClientTransport(new URL(url));

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await client.connect(transport);
      console.log("Connected successfully");
      return client;
    } catch (error) {
      console.error(`Connection attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw new Error(`Failed to connect after ${maxRetries} attempts`);
      }
    }
  }

  throw new Error("Unexpected error in connectWithRetry");
}

// Usage
try {
  const client = await connectWithRetry("http://localhost:8000/sse");
  // Use client...
} catch (error) {
  console.error("Could not establish connection:", error);
}
```

### Tool Execution Errors

```typescript
async function executeToolSafely(
  client: Client,
  toolName: string,
  args: any
): Promise<any> {
  try {
    const result = await client.callTool({
      name: toolName,
      arguments: args
    });
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`Tool execution failed: ${toolName}`, error);

    // Parse error details
    const errorDetails = {
      success: false,
      error: {
        message: error.message || "Unknown error",
        code: error.code || -32000,
        toolName,
        arguments: args
      }
    };

    return errorDetails;
  }
}

// Usage
const result = await executeToolSafely(client, "write_data_to_excel", {
  filepath: "/tmp/test.xlsx",
  sheet_name: "Sheet1",
  data: [["A", "B"], [1, 2]]
});

if (result.success) {
  console.log("Success:", result.data);
} else {
  console.error("Error:", result.error);
}
```

### Comprehensive Error Handler

```typescript
interface ErrorContext {
  operation: string;
  toolName?: string;
  arguments?: any;
  timestamp: Date;
}

class MCPErrorHandler {
  private errorLog: Array<ErrorContext & { error: any }> = [];

  logError(context: ErrorContext, error: any) {
    this.errorLog.push({
      ...context,
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      }
    });
    console.error(`[${context.operation}] Error:`, error);
  }

  async withErrorHandling<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Partial<ErrorContext>
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      this.logError(
        {
          operation,
          timestamp: new Date(),
          ...context
        },
        error
      );
      return null;
    }
  }

  getErrorLog() {
    return this.errorLog;
  }

  clearErrorLog() {
    this.errorLog = [];
  }
}

// Usage
const errorHandler = new MCPErrorHandler();

const client = await errorHandler.withErrorHandling(
  "connect",
  async () => {
    const c = new Client({ name: "client", version: "1.0.0" });
    const t = new SSEClientTransport(new URL("http://localhost:8000/sse"));
    await c.connect(t);
    return c;
  }
);

if (!client) {
  console.error("Failed to connect. Errors:", errorHandler.getErrorLog());
  process.exit(1);
}

const result = await errorHandler.withErrorHandling(
  "callTool",
  () => client.callTool({
    name: "create_workbook",
    arguments: { filepath: "/tmp/test.xlsx" }
  }),
  {
    toolName: "create_workbook",
    arguments: { filepath: "/tmp/test.xlsx" }
  }
);
```

### JSON-RPC Error Codes

The MCP protocol uses JSON-RPC 2.0 error codes:

| Code | Meaning | Description |
|------|---------|-------------|
| -32700 | Parse error | Invalid JSON |
| -32600 | Invalid Request | JSON is not a valid Request object |
| -32601 | Method not found | Method does not exist / is not available |
| -32602 | Invalid params | Invalid method parameters |
| -32603 | Internal error | Internal JSON-RPC error |
| -32000 | Server error | Generic server error (MCP-specific) |

```typescript
function handleMCPError(error: any) {
  switch (error.code) {
    case -32601:
      console.error("Tool not found. Available tools:", availableTools);
      break;
    case -32602:
      console.error("Invalid parameters:", error.data);
      break;
    case -32000:
      console.error("Server error:", error.message);
      break;
    default:
      console.error("Unknown error:", error);
  }
}
```

---

## Complete Working Examples

### Example 1: Create and Populate Workbook

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function createSalesReport() {
  // Setup
  const client = new Client({ name: "sales-report", version: "1.0.0" });
  const transport = new SSEClientTransport(
    new URL("http://localhost:8000/sse")
  );

  await client.connect(transport);

  const filepath = "/tmp/sales_report.xlsx";

  // Create workbook
  await client.callTool({
    name: "create_workbook",
    arguments: {
      filepath: filepath,
      sheet_name: "Q1 Sales"
    }
  });

  // Write data
  await client.callTool({
    name: "write_data_to_excel",
    arguments: {
      filepath: filepath,
      sheet_name: "Q1 Sales",
      data: [
        ["Date", "Product", "Quantity", "Revenue"],
        ["2024-01-15", "Widget A", 100, 1500],
        ["2024-01-20", "Widget B", 75, 2250],
        ["2024-02-10", "Widget A", 120, 1800],
        ["2024-02-15", "Widget B", 90, 2700],
        ["2024-03-05", "Widget A", 110, 1650],
        ["2024-03-12", "Widget B", 85, 2550]
      ],
      start_cell: "A1"
    }
  });

  // Format header
  await client.callTool({
    name: "format_range",
    arguments: {
      filepath: filepath,
      sheet_name: "Q1 Sales",
      cell_range: "A1:D1",
      bold: true,
      font_size: 12,
      bg_color: "#4472C4",
      font_color: "#FFFFFF"
    }
  });

  // Add totals formula
  await client.callTool({
    name: "apply_formula",
    arguments: {
      filepath: filepath,
      sheet_name: "Q1 Sales",
      cell: "D8",
      formula: "=SUM(D2:D7)"
    }
  });

  // Format totals row
  await client.callTool({
    name: "format_range",
    arguments: {
      filepath: filepath,
      sheet_name: "Q1 Sales",
      cell_range: "A8:D8",
      bold: true,
      bg_color: "#D9E1F2"
    }
  });

  console.log("Sales report created successfully!");
  await client.close();
}

createSalesReport();
```

### Example 2: Create Chart from Data

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function createChartReport() {
  const client = new Client({ name: "chart-report", version: "1.0.0" });
  const transport = new SSEClientTransport(
    new URL("http://localhost:8000/sse")
  );
  await client.connect(transport);

  const filepath = "/tmp/monthly_revenue.xlsx";

  // Create and populate
  await client.callTool({
    name: "create_workbook",
    arguments: { filepath, sheet_name: "Data" }
  });

  await client.callTool({
    name: "write_data_to_excel",
    arguments: {
      filepath,
      sheet_name: "Data",
      data: [
        ["Month", "Revenue"],
        ["January", 45000],
        ["February", 52000],
        ["March", 48000],
        ["April", 61000],
        ["May", 58000],
        ["June", 67000]
      ],
      start_cell: "A1"
    }
  });

  // Create chart
  await client.callTool({
    name: "create_chart",
    arguments: {
      filepath,
      sheet_name: "Data",
      data_range: "A1:B7",
      chart_type: "column",
      target_cell: "D2",
      title: "Monthly Revenue",
      x_axis: "Month",
      y_axis: "Revenue ($)"
    }
  });

  console.log("Chart report created!");
  await client.close();
}

createChartReport();
```

### Example 3: Create Pivot Table

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function createPivotReport() {
  const client = new Client({ name: "pivot-report", version: "1.0.0" });
  const transport = new SSEClientTransport(
    new URL("http://localhost:8000/sse")
  );
  await client.connect(transport);

  const filepath = "/tmp/sales_analysis.xlsx";

  // Create workbook with sales data
  await client.callTool({
    name: "create_workbook",
    arguments: { filepath, sheet_name: "Raw Data" }
  });

  // Large dataset
  const salesData = [
    ["Region", "Product", "Salesperson", "Amount"]
  ];

  const regions = ["North", "South", "East", "West"];
  const products = ["Widget A", "Widget B", "Widget C"];
  const salespeople = ["Alice", "Bob", "Charlie", "Diana"];

  for (let i = 0; i < 100; i++) {
    salesData.push([
      regions[Math.floor(Math.random() * regions.length)],
      products[Math.floor(Math.random() * products.length)],
      salespeople[Math.floor(Math.random() * salespeople.length)],
      Math.floor(Math.random() * 5000) + 1000
    ]);
  }

  await client.callTool({
    name: "write_data_to_excel",
    arguments: {
      filepath,
      sheet_name: "Raw Data",
      data: salesData,
      start_cell: "A1"
    }
  });

  // Create pivot table
  await client.callTool({
    name: "create_pivot_table",
    arguments: {
      filepath,
      sheet_name: "Raw Data",
      pivot_name: "SalesSummary",
      data_range: "A1:D101",
      locate_range: "F2",
      rows: ["Region", "Product"],
      values: { "Amount": "sum" },
      columns: ["Salesperson"]
    }
  });

  console.log("Pivot table created!");
  await client.close();
}

createPivotReport();
```

### Example 4: Convert to Multiple Formats

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function convertToMultipleFormats() {
  const client = new Client({ name: "converter", version: "1.0.0" });
  const transport = new SSEClientTransport(
    new URL("http://localhost:8000/sse")
  );
  await client.connect(transport);

  const filepath = "/tmp/report.xlsx";

  // Create source workbook
  await client.callTool({
    name: "create_workbook",
    arguments: { filepath, sheet_name: "Report" }
  });

  await client.callTool({
    name: "write_data_to_excel",
    arguments: {
      filepath,
      sheet_name: "Report",
      data: [
        ["Metric", "Value"],
        ["Total Sales", 125000],
        ["Total Units", 450],
        ["Avg Price", 277.78]
      ],
      start_cell: "A1"
    }
  });

  // Convert to PDF
  await client.callTool({
    name: "convert_excel",
    arguments: {
      filepath,
      output_filepath: "/tmp/report.pdf",
      format_type: "PDF"
    }
  });

  // Convert to CSV
  await client.callTool({
    name: "convert_excel",
    arguments: {
      filepath,
      output_filepath: "/tmp/report.csv",
      format_type: "CSV",
      sheet_name: "Report"
    }
  });

  // Convert to HTML
  await client.callTool({
    name: "convert_excel",
    arguments: {
      filepath,
      output_filepath: "/tmp/report.html",
      format_type: "HTML"
    }
  });

  console.log("Converted to PDF, CSV, and HTML!");
  await client.close();
}

convertToMultipleFormats();
```

### Example 5: JSON Import/Export

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import * as fs from "fs";

async function jsonWorkflow() {
  const client = new Client({ name: "json-workflow", version: "1.0.0" });
  const transport = new SSEClientTransport(
    new URL("http://localhost:8000/sse")
  );
  await client.connect(transport);

  const excelPath = "/tmp/data.xlsx";
  const jsonPath = "/tmp/data.json";

  // Create workbook with data
  await client.callTool({
    name: "create_workbook",
    arguments: { filepath: excelPath, sheet_name: "Users" }
  });

  await client.callTool({
    name: "write_data_to_excel",
    arguments: {
      filepath: excelPath,
      sheet_name: "Users",
      data: [
        ["Name", "Email", "Age"],
        ["Alice", "alice@example.com", 30],
        ["Bob", "bob@example.com", 25],
        ["Charlie", "charlie@example.com", 35]
      ],
      start_cell: "A1"
    }
  });

  // Export to JSON
  await client.callTool({
    name: "export_to_json",
    arguments: {
      filepath: excelPath,
      sheet_name: "Users",
      cell_range: "A1:C4",
      output_filepath: jsonPath,
      include_headers: true
    }
  });

  console.log("Exported to JSON:");
  console.log(fs.readFileSync(jsonPath, "utf-8"));

  // Import back to new sheet
  await client.callTool({
    name: "import_from_json",
    arguments: {
      json_filepath: jsonPath,
      excel_filepath: excelPath,
      sheet_name: "Imported",
      create_sheet: true,
      start_cell: "A1"
    }
  });

  console.log("Re-imported from JSON!");
  await client.close();
}

jsonWorkflow();
```

---

## Best Practices

### 1. Connection Management

**DO:**
```typescript
// Create single client instance
const client = new Client({ name: "app", version: "1.0.0" });
const transport = new SSEClientTransport(new URL("http://localhost:8000/sse"));
await client.connect(transport);

// Reuse for multiple operations
await client.callTool({ name: "tool1", arguments: {} });
await client.callTool({ name: "tool2", arguments: {} });

// Clean up when done
await client.close();
```

**DON'T:**
```typescript
// Don't create new client for each operation
for (const tool of tools) {
  const client = new Client({ name: "app", version: "1.0.0" });
  await client.connect(new SSEClientTransport(new URL("...")));
  await client.callTool({ name: tool.name, arguments: {} });
  await client.close(); // Wasteful
}
```

### 2. Error Handling

**DO:**
```typescript
try {
  const result = await client.callTool({
    name: "write_data_to_excel",
    arguments: args
  });
  return { success: true, data: result };
} catch (error) {
  console.error("Tool failed:", error);
  // Handle gracefully
  return { success: false, error: error.message };
}
```

**DON'T:**
```typescript
// Don't let errors crash the application
const result = await client.callTool({
  name: "write_data_to_excel",
  arguments: args
}); // Unhandled rejection!
```

### 3. File Paths

**DO:**
```typescript
import * as path from "path";

const EXCEL_BASE_DIR = process.env.EXCEL_FILES_PATH || "/tmp/excel";

function getExcelPath(filename: string): string {
  return path.join(EXCEL_BASE_DIR, filename);
}

await client.callTool({
  name: "create_workbook",
  arguments: {
    filepath: getExcelPath("report.xlsx")
  }
});
```

**DON'T:**
```typescript
// Don't use relative paths or assume locations
await client.callTool({
  name: "create_workbook",
  arguments: {
    filepath: "./report.xlsx" // May fail!
  }
});
```

### 4. Data Validation

**DO:**
```typescript
function validateData(data: any[][]): boolean {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  const columnCount = data[0].length;
  for (const row of data) {
    if (!Array.isArray(row) || row.length !== columnCount) {
      return false;
    }
  }

  return true;
}

if (validateData(myData)) {
  await client.callTool({
    name: "write_data_to_excel",
    arguments: { /* ... */ data: myData }
  });
}
```

**DON'T:**
```typescript
// Don't send unvalidated data
await client.callTool({
  name: "write_data_to_excel",
  arguments: { data: unknownData } // Could be malformed!
});
```

### 5. Tool Discovery

**DO:**
```typescript
async function getAvailableTools(client: Client): Promise<Set<string>> {
  const result = await client.listTools();
  return new Set(result.tools.map(t => t.name));
}

const availableTools = await getAvailableTools(client);

if (availableTools.has("create_chart")) {
  // Use the tool
} else {
  console.warn("Chart creation not available");
}
```

**DON'T:**
```typescript
// Don't assume tools exist
await client.callTool({
  name: "hypothetical_tool" // May not exist!
});
```

### 6. Batch Operations

**DO:**
```typescript
async function batchWrite(
  client: Client,
  filepath: string,
  sheets: Array<{ name: string; data: any[][] }>
) {
  for (const sheet of sheets) {
    await client.callTool({
      name: "create_worksheet",
      arguments: { filepath, sheet_name: sheet.name }
    });

    await client.callTool({
      name: "write_data_to_excel",
      arguments: {
        filepath,
        sheet_name: sheet.name,
        data: sheet.data
      }
    });
  }
}
```

**DON'T:**
```typescript
// Don't create multiple connections for batch operations
for (const sheet of sheets) {
  const client = new Client(/* ... */);
  await client.connect(/* ... */);
  // ... operations ...
  await client.close();
}
```

### 7. Transport Fallback

**DO:**
```typescript
async function connectWithFallback(url: string): Promise<Client> {
  const client = new Client({ name: "app", version: "1.0.0" });

  try {
    // Try Streamable HTTP first
    const transport = new StreamableHTTPClientTransport(new URL(url));
    await client.connect(transport);
    return client;
  } catch {
    // Fall back to SSE
    const transport = new SSEClientTransport(new URL(url + "/sse"));
    await client.connect(transport);
    return client;
  }
}
```

**DON'T:**
```typescript
// Don't hardcode single transport
const transport = new SSEClientTransport(new URL(url));
await client.connect(transport); // May fail with newer servers
```

### 8. Logging and Debugging

**DO:**
```typescript
class MCPLogger {
  log(operation: string, details: any) {
    console.log(`[${new Date().toISOString()}] ${operation}`, details);
  }

  error(operation: string, error: any) {
    console.error(`[${new Date().toISOString()}] ERROR: ${operation}`, error);
  }
}

const logger = new MCPLogger();

logger.log("callTool", { name: "create_workbook", args });
const result = await client.callTool({ name: "create_workbook", arguments: args });
logger.log("callTool:success", result);
```

**DON'T:**
```typescript
// Don't operate blindly without logging
await client.callTool({ /* ... */ });
// Did it work? Who knows!
```

### 9. Configuration Management

**DO:**
```typescript
interface MCPConfig {
  serverUrl: string;
  excelBasePath: string;
  timeout: number;
  retries: number;
}

function loadConfig(): MCPConfig {
  return {
    serverUrl: process.env.MCP_SERVER_URL || "http://localhost:8000/sse",
    excelBasePath: process.env.EXCEL_FILES_PATH || "/tmp/excel",
    timeout: parseInt(process.env.MCP_TIMEOUT || "30000"),
    retries: parseInt(process.env.MCP_RETRIES || "3")
  };
}

const config = loadConfig();
```

**DON'T:**
```typescript
// Don't hardcode configuration
const url = "http://localhost:8000/sse"; // Not configurable!
```

### 10. Resource Cleanup

**DO:**
```typescript
class MCPClientManager {
  private client: Client | null = null;

  async connect(url: string) {
    this.client = new Client({ name: "app", version: "1.0.0" });
    const transport = new SSEClientTransport(new URL(url));
    await this.client.connect(transport);
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }
}

const manager = new MCPClientManager();
try {
  await manager.connect("http://localhost:8000/sse");
  // ... operations ...
} finally {
  await manager.close(); // Always cleanup
}
```

**DON'T:**
```typescript
// Don't leave connections open
const client = new Client(/* ... */);
await client.connect(/* ... */);
// ... operations ...
// Connection never closed!
```

---

## Quick Reference Card

### Essential Imports
```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
```

### Basic Connection
```typescript
const client = new Client({ name: "app", version: "1.0.0" });
const transport = new SSEClientTransport(new URL("http://localhost:8000/sse"));
await client.connect(transport);
```

### Core Operations
```typescript
// List tools
const tools = await client.listTools();

// Call tool
const result = await client.callTool({
  name: "tool_name",
  arguments: { /* args */ }
});

// Cleanup
await client.close();
```

### Most Common Tools
1. `create_workbook` - Create new Excel file
2. `write_data_to_excel` - Write data to cells
3. `read_data_from_excel` - Read cell data
4. `format_range` - Apply styling
5. `apply_formula` - Insert formulas
6. `create_chart` - Generate charts
7. `convert_excel` - Export to other formats

### Environment Variables
```bash
FASTMCP_PORT=8000              # Server port
EXCEL_FILES_PATH=/path/to/dir  # Base directory
```

---

## Appendix: Complete Tool List

1. create_workbook
2. create_worksheet
3. get_workbook_metadata
4. write_data_to_excel
5. read_data_from_excel
6. format_range
7. merge_cells
8. unmerge_cells
9. apply_formula
10. create_chart
11. create_pivot_table
12. copy_worksheet
13. delete_worksheet
14. rename_worksheet
15. copy_range
16. delete_range
17. validate_excel_range
18. apply_autofilter
19. export_to_json
20. import_from_json
21. convert_excel

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-05 | Initial comprehensive index created |

---

**End of Document**
