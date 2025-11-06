# Phase 0B Implementation Plan: Spire.XLS MCP Integration

**Status**: Planning Phase - Awaiting Approval
**Created**: 2025-11-06
**Goal**: Add Excel intelligence capabilities via Spire.XLS MCP server

---

## Executive Summary

Phase 0B will integrate the Spire.XLS MCP (Model Context Protocol) server to provide comprehensive Excel analysis capabilities without requiring Microsoft Office. This follows the same pattern as Phase 0A: **minimal changes, maximum safety, graceful fallback**.

### Key Decisions

| Decision | Rationale |
|----------|-----------|
| **Use MCP Standard** | Industry-backed protocol by Anthropic, adopted by Claude and ChatGPT |
| **Wrapper Pattern** | Abstract MCP complexity behind clean TypeScript interface |
| **Feature Flag** | `USE_SPIRE_XLS=true/false` for instant rollback |
| **Graceful Fallback** | Fall back to basic XLSX parsing if MCP server unavailable |
| **Async-First** | All operations async with timeout/retry/circuit breaker |

### Success Criteria

- ✅ Excel files parsed with advanced features (formulas, pivot tables, charts)
- ✅ MCP server managed gracefully (auto-start, health checks, recovery)
- ✅ Fallback to basic XLSX parsing works seamlessly
- ✅ Zero impact on existing PDF/Word/CSV parsing
- ✅ Clean, type-safe TypeScript API
- ✅ Comprehensive error handling and logging

---

## What is MCP?

**Model Context Protocol (MCP)** is like "USB-C for AI" - a standardized way to connect AI models to external tools and data sources.

```
┌─────────────┐
│ TypeScript  │
│ Application │
└──────┬──────┘
       │ MCP Client
       ├─────────────────────────────┐
       │                             │
       ↓                             ↓
┌─────────────┐              ┌─────────────┐
│ Spire.XLS   │              │ Other MCP   │
│ MCP Server  │              │ Servers     │
│ (Python)    │              │ (Future)    │
└─────────────┘              └─────────────┘
```

**Key Concepts:**
- **Resources**: Static data sources (e.g., files, databases)
- **Prompts**: Pre-defined templates for AI interactions
- **Tools**: Executable functions (e.g., `convert_excel_to_pdf`, `extract_data`)

**Transport**: Spire.XLS uses SSE (Server-Sent Events) over HTTP

---

## Architecture Design

### 1. Component Structure

```
src/
├── services/
│   ├── documentParser.ts           [Modified] - Add Excel MCP parsing
│   ├── spire-xls-client.ts         [NEW] - MCP client wrapper
│   └── spire-xls-server-manager.ts [NEW] - Server lifecycle management
├── types/
│   └── spire-xls.types.ts          [NEW] - TypeScript definitions
└── config/
    └── mcp.config.ts                [NEW] - MCP configuration
```

### 2. SpireXLSClient Interface

```typescript
interface SpireXLSClient {
  // Core Excel operations
  parseExcel(buffer: Buffer): Promise<ExcelParseResult>;
  extractData(file: Buffer, sheetName?: string): Promise<any[]>;

  // Conversion tools
  convertToPDF(buffer: Buffer): Promise<Buffer>;
  convertToHTML(buffer: Buffer): Promise<string>;
  convertToCSV(buffer: Buffer): Promise<string>;

  // Analysis tools
  getWorkbookInfo(buffer: Buffer): Promise<WorkbookInfo>;
  extractFormulas(buffer: Buffer): Promise<Formula[]>;
  analyzePivotTables(buffer: Buffer): Promise<PivotTableInfo[]>;

  // Server management
  isServerHealthy(): Promise<boolean>;
  getServerStats(): Promise<ServerStats>;
}
```

### 3. Server Lifecycle Management

```typescript
class SpireXLSServerManager {
  private process: ChildProcess | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isHealthy: boolean = false;

  async start(): Promise<void> {
    // 1. Check if already running
    if (await this.checkHealth()) return;

    // 2. Clone/pull repository
    await this.ensureRepository();

    // 3. Install Python dependencies
    await this.installDependencies();

    // 4. Start FastMCP server
    this.process = spawn('python', ['-m', 'spire_xls_server']);

    // 5. Wait for server to be ready
    await this.waitForHealthy(30000); // 30 second timeout

    // 6. Start health check monitoring
    this.startHealthChecks();
  }

  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill('SIGTERM');
      await this.waitForExit(5000);
    }
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  private async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:8001/health');
      return response.ok;
    } catch {
      return false;
    }
  }
}
```

### 4. Graceful Fallback Strategy

```typescript
async parseExcel(buffer: Buffer): Promise<ExcelParseResult> {
  // Try Spire.XLS MCP first if enabled
  if (this.spireXLSClient && process.env.USE_SPIRE_XLS === 'true') {
    try {
      console.log('🟢 Using Spire.XLS MCP for Excel parsing...');

      // Enhanced parsing with formulas, charts, etc.
      const result = await this.spireXLSClient.parseExcel(buffer);

      console.log('✅ Spire.XLS parsed successfully');
      return result;

    } catch (error) {
      console.error('❌ Spire.XLS failed:', error);
      console.log('📊 Falling back to basic XLSX parsing...');
      // Fall through to fallback
    }
  }

  // Fallback to basic XLSX parsing (current implementation)
  return this.parseExcelBasic(buffer);
}
```

---

## Implementation Steps

### Step 1: Install Dependencies

```bash
# TypeScript MCP SDK
npm install @modelcontextprotocol/sdk

# Server management
npm install execa@8.0.1  # Async child process execution

# Clone Spire.XLS MCP repository
cd ~
git clone https://github.com/eiceblue/spire-xls-mcp-server.git
cd spire-xls-mcp-server
pip install -r requirements.txt
```

### Step 2: Create Type Definitions

**File**: `src/types/spire-xls.types.ts`

```typescript
// MCP Configuration
export interface SpireXLSConfig {
  serverUrl: string;
  serverPort: number;
  timeout: number;
  retryAttempts: number;
  autoStart: boolean;
}

// Excel Parse Result
export interface ExcelParseResult {
  content: string;
  metadata: ExcelMetadata;
  sheets: SheetInfo[];
  formulas?: Formula[];
  charts?: ChartInfo[];
  pivotTables?: PivotTableInfo[];
}

// Workbook Information
export interface WorkbookInfo {
  sheetCount: number;
  sheetNames: string[];
  totalRows: number;
  totalColumns: number;
  hasFormulas: boolean;
  hasCharts: boolean;
  hasPivotTables: boolean;
}

// Formula Information
export interface Formula {
  sheet: string;
  cell: string;
  formula: string;
  value: any;
}

// Tool Response Types
export interface MCPToolResponse<T = any> {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}
```

### Step 3: Build MCP Client Wrapper

**File**: `src/services/spire-xls-client.ts`

Key features:
- SSE transport connection to MCP server
- Tool discovery and invocation
- Timeout and retry logic
- Circuit breaker pattern (fail fast after 5 consecutive failures)
- Statistics tracking
- Clean async API

### Step 4: Build Server Manager

**File**: `src/services/spire-xls-server-manager.ts`

Responsibilities:
- Start/stop/restart Spire.XLS Python server
- Health check monitoring (every 30 seconds)
- Automatic recovery on failure
- Graceful shutdown on application exit
- Logging and metrics

### Step 5: Integrate into DocumentParser

**File**: `src/services/documentParser.ts`

Changes:
```typescript
export class DocumentParser {
  private spireXLSClient: SpireXLSClient | null = null;

  constructor() {
    // Initialize Spire.XLS if enabled
    if (process.env.USE_SPIRE_XLS === 'true') {
      this.spireXLSClient = new SpireXLSClient({
        serverUrl: 'http://localhost',
        serverPort: 8001,
        timeout: 30000,
        retryAttempts: 3,
        autoStart: true,
      });
    }
  }

  private async parseExcel(buffer: Buffer): Promise<ExcelData> {
    // Try Spire.XLS MCP first
    if (this.spireXLSClient) {
      try {
        const result = await this.spireXLSClient.parseExcel(buffer);
        return this.convertToExcelData(result);
      } catch (error) {
        console.error('Spire.XLS failed, using fallback:', error);
      }
    }

    // Fallback to current XLSX implementation
    return this.parseExcelBasic(buffer);
  }
}
```

### Step 6: Add Environment Configuration

**File**: `.env.example` and `.env`

```bash
# Spire.XLS MCP Configuration
USE_SPIRE_XLS=false
SPIRE_XLS_SERVER_PORT=8001
SPIRE_XLS_REPO_PATH=~/spire-xls-mcp-server
SPIRE_XLS_TIMEOUT=30000
```

### Step 7: Testing Strategy

```typescript
// Unit Tests
describe('SpireXLSClient', () => {
  it('should parse Excel with formulas');
  it('should handle server timeout gracefully');
  it('should fall back on error');
  it('should track statistics correctly');
});

// Integration Tests
describe('Excel Parsing Integration', () => {
  it('should parse real Excel file via MCP');
  it('should extract formulas and charts');
  it('should handle large files (10MB+)');
  it('should recover from server crash');
});
```

---

## Key Challenges & Solutions

### Challenge 1: Port Conflict (Both use 8000)

**Problem**: Backend runs on port 8000, Spire.XLS MCP also defaults to 8000

**Solution**: Run Spire.XLS on port 8001
```bash
fastmcp run spire_xls_server.py --port 8001
```

### Challenge 2: Server Lifecycle Management

**Problem**: Python server needs to start before TypeScript app, stay healthy, and shut down gracefully

**Solution**: `SpireXLSServerManager` with:
- Auto-start on first use (lazy initialization)
- Health check monitoring every 30s
- Auto-recovery on failure (max 3 restart attempts)
- Graceful shutdown on SIGTERM/SIGINT

### Challenge 3: Security (File System Access)

**Problem**: Spire.XLS reads/writes files to disk, potential security risk

**Solution**:
```typescript
// Strict path validation
class PathValidator {
  private allowedDir = '/tmp/spire-xls-uploads';

  validatePath(path: string): boolean {
    const resolved = resolve(path);
    return resolved.startsWith(this.allowedDir);
  }
}

// Use temporary files
const tempPath = `/tmp/spire-xls-uploads/${uuid()}.xlsx`;
await writeFile(tempPath, buffer);
const result = await spireXLS.parseExcel(tempPath);
await unlink(tempPath); // Clean up
```

### Challenge 4: Performance (Large Files)

**Problem**: Large Excel files (50MB+) can timeout

**Solution**:
- Configurable timeouts (default 30s, max 120s)
- Stream processing for large files
- Progress callbacks for long operations
- File size limits (warn >10MB, reject >50MB)

### Challenge 5: Observability

**Problem**: Hard to debug MCP server issues

**Solution**:
```typescript
// Structured logging
logger.info('spire_xls.parse.start', { file, size });
logger.info('spire_xls.parse.success', { duration, sheets });
logger.error('spire_xls.parse.error', { error, context });

// Metrics
metrics.increment('spire_xls.requests.total');
metrics.timing('spire_xls.parse.duration', duration);
metrics.gauge('spire_xls.server.healthy', isHealthy ? 1 : 0);
```

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| MCP server crash | Medium | Low | Auto-recovery, fallback to XLSX |
| Port conflict | Low | Medium | Use port 8001, make configurable |
| Performance issues | Medium | Medium | Timeouts, file size limits |
| Security vulnerabilities | High | Low | Path validation, temp files |
| Breaking changes in MCP | Medium | Low | Pin versions, monitor updates |

---

## Phase 0B Timeline

### Week 1: Foundation
- ✅ Research MCP and Spire.XLS (COMPLETED)
- [ ] Install dependencies and test basic MCP connection
- [ ] Create type definitions
- [ ] Build basic SpireXLSClient skeleton

### Week 2: Core Implementation
- [ ] Implement SpireXLSServerManager
- [ ] Complete SpireXLSClient with all tools
- [ ] Integrate into DocumentParser
- [ ] Add feature flag and configuration

### Week 3: Testing & Refinement
- [ ] Unit tests for all components
- [ ] Integration tests with real Excel files
- [ ] Performance testing (large files)
- [ ] Security hardening (path validation)

### Week 4: Production Readiness
- [ ] Monitoring and observability
- [ ] Documentation and examples
- [ ] Load testing
- [ ] Final review and deployment

**Estimated Effort**: 15-20 hours

---

## Rollback Plan

If Phase 0B causes issues:

1. **Immediate**: Set `USE_SPIRE_XLS=false` → Instant rollback to XLSX
2. **Quick**: Stop Spire.XLS server → Zero impact on app
3. **Full**: `git revert` → Remove all Phase 0B code

---

## Success Metrics

After Phase 0B completion, we should see:

1. **Functionality**
   - Excel files parsed with advanced features (formulas, charts, pivot tables)
   - No regression in PDF/Word/CSV parsing
   - Fallback works seamlessly on MCP failures

2. **Performance**
   - Excel parsing < 5s for files under 10MB
   - Server startup < 10s
   - Health checks < 100ms

3. **Reliability**
   - 99%+ uptime for MCP server
   - Graceful degradation on failures
   - Zero application crashes

4. **Observability**
   - Structured logs for all operations
   - Metrics tracked (requests, duration, errors)
   - Health status visible in application

---

## Future Enhancements (Phase 1+)

Once Phase 0B is stable, we can leverage Spire.XLS for:

1. **Agentic RAG** (Phase 2)
   - Agent uses Spire.XLS tools dynamically
   - Example: "Extract Q1 revenue from sales.xlsx"

2. **Advanced Analysis**
   - Chart data extraction for visualizations
   - Pivot table insights
   - Formula dependency analysis

3. **Multi-Format Workflows**
   - Excel → PDF conversion
   - Excel → HTML for web display
   - Excel → CSV for data processing

---

## Discussion Points

Before implementation, let's discuss:

1. **Port Configuration**: Use 8001 for Spire.XLS MCP? Or different approach?
2. **Server Management**: Auto-start on first use? Or manual start script?
3. **File Handling**: Temporary files in `/tmp` or dedicated directory?
4. **Feature Scope**: Full 30+ tools or subset for Phase 0B?
5. **Testing**: What Excel files should we use for testing?
6. **Timeline**: 4 weeks reasonable? Or prioritize faster MVP?

---

## Recommendation

✅ **Proceed with Phase 0B** with these parameters:

- **Scope**: Core Excel parsing + 5 most useful tools (extract data, convert to CSV/PDF, get workbook info, extract formulas)
- **Timeline**: 2 weeks for MVP, 2 weeks for refinement
- **Risk**: Low (graceful fallback ensures zero downtime)
- **Value**: High (enables comprehensive Excel intelligence for RAG)

This follows the proven Phase 0A pattern: **minimal changes, maximum safety, incremental value**.

---

**Next Step**: Review this plan and approve to begin implementation.
