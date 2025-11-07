# Persistence Implementation Guide
**Goal:** Enable persistent storage for ChromaDB and DuckDB to achieve fast startup times (~2-5 seconds instead of 5+ minutes)

**Current Status:**
- ✅ .env updated with persistence configuration
- ✅ Data directories created (`./data/chroma_db`)
- ⏳ Core services need modification
- ⏳ File tracking system needs implementation

**Expected Outcome:**
- First run: ~5 minutes (process all files)
- Subsequent runs: ~2-5 seconds (load from persistent DB)
- Smart file tracking: only process new/changed files

---

## Phase 1: Persistent Storage Layer

### Step 1: Modify VectorSearch for Persistent ChromaDB

**File:** `src/services/vectorSearch.ts`

**Current code (~line 20-30):**
```typescript
this.client = new ChromaClient();
this.collection = await this.client.getOrCreateCollection({
  name: 'pe_documents',
  embeddingFunction: this.embedder,
});
```

**Replace with:**
```typescript
import * as fs from 'fs';
import * as path from 'path';

// In constructor, before creating client:
const chromaPath = process.env.CHROMADB_PATH || './data/chroma_db';
const enablePersistence = process.env.ENABLE_PERSISTENCE === 'true';

// Create directory if it doesn't exist
if (enablePersistence && !fs.existsSync(chromaPath)) {
  fs.mkdirSync(chromaPath, { recursive: true });
  console.log(`📁 Created ChromaDB directory: ${chromaPath}`);
}

// Initialize client with persistence
if (enablePersistence) {
  this.client = new ChromaClient({
    path: chromaPath,
  });
  console.log(`💾 Using persistent ChromaDB at: ${chromaPath}`);
} else {
  this.client = new ChromaClient();
  console.log(`🔄 Using in-memory ChromaDB`);
}

this.collection = await this.client.getOrCreateCollection({
  name: 'pe_documents',
  embeddingFunction: this.embedder,
});
```

**Test after this step:**
```bash
# Start server - should create ChromaDB files in ./data/chroma_db
npm run dev:backend

# Check that files were created
ls -la ./data/chroma_db/

# Restart server - should load existing data (faster startup)
```

---

### Step 2: Modify DataProcessor for Persistent DuckDB

**File:** `src/services/dataProcessor.ts`

**Current code (~line 50-60):**
```typescript
this.db = await Database.create(':memory:');
console.log('✅ DuckDB initialized (in-memory)');
```

**Replace with:**
```typescript
const duckdbPath = process.env.DUCKDB_PATH || './data/duckdb.db';
const enablePersistence = process.env.ENABLE_PERSISTENCE === 'true';

if (enablePersistence) {
  // Ensure directory exists
  const dbDir = path.dirname(duckdbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  this.db = await Database.create(duckdbPath);
  console.log(`💾 DuckDB initialized (persistent): ${duckdbPath}`);
} else {
  this.db = await Database.create(':memory:');
  console.log('✅ DuckDB initialized (in-memory)');
}
```

**Add import at top of file:**
```typescript
import * as fs from 'fs';
import * as path from 'path';
```

**Test after this step:**
```bash
# Restart server
npm run dev:backend

# Check that DuckDB file was created
ls -la ./data/duckdb.db

# Query the database to verify tables exist
# (tables should persist across restarts now)
```

---

## Phase 2: File Tracking System

### Step 3: Create FileTracker Service

**Create new file:** `src/services/fileTracker.ts`

```typescript
import * as crypto from 'crypto';
import * as fs from 'fs';
import { Database } from 'duckdb-async';

export interface FileRecord {
  filepath: string;
  hash: string;
  lastModified: Date;
  fileSize: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  processedAt?: Date;
  errorMessage?: string;
}

export class FileTracker {
  private db: Database;
  private tableName = '_file_tracking_metadata';

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Initialize tracking table
   */
  async initialize(): Promise<void> {
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        filepath VARCHAR PRIMARY KEY,
        hash VARCHAR NOT NULL,
        last_modified TIMESTAMP NOT NULL,
        file_size BIGINT NOT NULL,
        status VARCHAR NOT NULL,
        processed_at TIMESTAMP,
        error_message VARCHAR
      )
    `);
    console.log('✅ File tracking table initialized');
  }

  /**
   * Calculate SHA-256 hash of file
   */
  async calculateFileHash(filepath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filepath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Check if file needs processing
   * Returns true if file is new or has been modified
   */
  async needsProcessing(filepath: string): Promise<boolean> {
    try {
      const stats = fs.statSync(filepath);
      const currentHash = await this.calculateFileHash(filepath);

      const result = await this.db.all(`
        SELECT hash, status
        FROM ${this.tableName}
        WHERE filepath = ?
      `, filepath);

      // File not in database - needs processing
      if (result.length === 0) {
        console.log(`📄 New file detected: ${filepath}`);
        return true;
      }

      const record = result[0];

      // File hash changed - needs reprocessing
      if (record.hash !== currentHash) {
        console.log(`🔄 File modified: ${filepath}`);
        return true;
      }

      // File previously failed - needs reprocessing
      if (record.status === 'error') {
        console.log(`⚠️  Retrying failed file: ${filepath}`);
        return true;
      }

      // File already processed successfully
      console.log(`✓ Skipping already-processed file: ${filepath}`);
      return false;

    } catch (error) {
      console.error(`Error checking file ${filepath}:`, error);
      return true; // Process on error to be safe
    }
  }

  /**
   * Mark file as being processed
   */
  async markProcessing(filepath: string): Promise<void> {
    const stats = fs.statSync(filepath);
    const hash = await this.calculateFileHash(filepath);

    await this.db.exec(`
      INSERT OR REPLACE INTO ${this.tableName}
      (filepath, hash, last_modified, file_size, status)
      VALUES (?, ?, ?, ?, 'processing')
    `, filepath, hash, stats.mtime, stats.size);
  }

  /**
   * Mark file as successfully processed
   */
  async markCompleted(filepath: string): Promise<void> {
    await this.db.exec(`
      UPDATE ${this.tableName}
      SET status = 'completed', processed_at = CURRENT_TIMESTAMP
      WHERE filepath = ?
    `, filepath);
  }

  /**
   * Mark file as failed
   */
  async markError(filepath: string, errorMessage: string): Promise<void> {
    await this.db.exec(`
      UPDATE ${this.tableName}
      SET status = 'error',
          error_message = ?,
          processed_at = CURRENT_TIMESTAMP
      WHERE filepath = ?
    `, errorMessage, filepath);
  }

  /**
   * Get processing statistics
   */
  async getStats(): Promise<{ total: number; completed: number; error: number; pending: number }> {
    const result = await this.db.all(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM ${this.tableName}
    `);

    return result[0] || { total: 0, completed: 0, error: 0, pending: 0 };
  }
}
```

---

### Step 4: Update AutoLoader to Use File Tracking

**File:** `src/services/autoLoader.ts`

**Add at top of file:**
```typescript
import { FileTracker } from './fileTracker';
```

**In the AutoLoader class, add property:**
```typescript
private fileTracker?: FileTracker;
```

**In constructor or init method:**
```typescript
async initialize() {
  // Only initialize file tracker if persistence is enabled
  if (process.env.ENABLE_PERSISTENCE === 'true') {
    this.fileTracker = new FileTracker(this.dataProcessor.db);
    await this.fileTracker.initialize();
  }
}
```

**In loadDemoFiles() method, wrap the file processing loop:**

**Current code:**
```typescript
for (const filename of files) {
  const filePath = path.join(demoDataPath, filename);
  // ... process file ...
}
```

**Replace with:**
```typescript
let processedCount = 0;
let skippedCount = 0;

for (const filename of files) {
  const filePath = path.join(demoDataPath, filename);

  // Check if file needs processing
  if (this.fileTracker) {
    const needsProcessing = await this.fileTracker.needsProcessing(filePath);
    if (!needsProcessing) {
      skippedCount++;
      continue; // Skip this file
    }

    // Mark as processing
    await this.fileTracker.markProcessing(filePath);
  }

  try {
    // ... existing file processing code ...

    // Mark as completed
    if (this.fileTracker) {
      await this.fileTracker.markCompleted(filePath);
    }
    processedCount++;

  } catch (error) {
    // Mark as error
    if (this.fileTracker) {
      await this.fileTracker.markError(filePath, error.message);
    }
    console.error(`❌ Error processing ${filename}:`, error);
  }
}

console.log(`📊 Auto-load complete: ${processedCount} processed, ${skippedCount} skipped`);
```

---

### Step 5: Add AUTO_LOAD_DEMO Control

**File:** `src/backend/server.ts`

**Find the auto-loader call (around line 80-90):**

**Current code:**
```typescript
await autoLoader.loadDemoFiles();
```

**Replace with:**
```typescript
if (process.env.AUTO_LOAD_DEMO === 'true') {
  await autoLoader.loadDemoFiles();
} else {
  console.log('⏭️  Auto-load disabled (AUTO_LOAD_DEMO=false)');
}
```

---

## Phase 3: Testing & Validation

### Test 1: First Run (Full Processing)

```bash
# Delete existing databases to start fresh
rm -rf ./data/chroma_db ./data/duckdb.db

# Start server
npm run dev:backend

# Expected: Processes all 19 files (~5 minutes)
# Look for logs:
# - "📁 Created ChromaDB directory"
# - "💾 Using persistent ChromaDB"
# - "💾 DuckDB initialized (persistent)"
# - "📄 New file detected: ..." (for each file)
# - "📊 Auto-load complete: 19 processed, 0 skipped"
```

### Test 2: Second Run (Fast Startup)

```bash
# Restart server (Ctrl+C and restart)
npm run dev:backend

# Expected: Skips all files (~2-5 seconds)
# Look for logs:
# - "💾 Using persistent ChromaDB" (no "Created" message)
# - "✓ Skipping already-processed file: ..." (for each file)
# - "📊 Auto-load complete: 0 processed, 19 skipped"
# - Server ready in <5 seconds
```

### Test 3: Modified File Detection

```bash
# Modify one file
echo "# Test modification" >> ./data/demo/acme-deal-memo.txt

# Restart server
npm run dev:backend

# Expected: Reprocesses only modified file
# - "🔄 File modified: ./data/demo/acme-deal-memo.txt"
# - "📊 Auto-load complete: 1 processed, 18 skipped"
```

### Test 4: New File Addition

```bash
# Add a new file
cp ./data/demo/acme-deal-memo.txt ./data/demo/test-new-file.txt

# Restart server
npm run dev:backend

# Expected: Processes only new file
# - "📄 New file detected: ./data/demo/test-new-file.txt"
# - "📊 Auto-load complete: 1 processed, 19 skipped"
```

### Test 5: Disable Auto-Load

```bash
# Edit .env
AUTO_LOAD_DEMO=false

# Restart server
npm run dev:backend

# Expected: Instant startup, no processing
# - "⏭️  Auto-load disabled (AUTO_LOAD_DEMO=false)"
# - Server ready in <2 seconds
```

---

## Verification Checklist

After implementation, verify:

- [ ] ChromaDB files created in `./data/chroma_db/`
- [ ] DuckDB file created at `./data/duckdb.db`
- [ ] First run processes all files
- [ ] Second run skips all files (fast startup)
- [ ] Modified files are detected and reprocessed
- [ ] New files are detected and processed
- [ ] File tracking table exists in DuckDB
- [ ] Can query data after restart (persistence works)
- [ ] AUTO_LOAD_DEMO=false disables auto-loading
- [ ] No errors in console logs
- [ ] Can still upload files via API (existing functionality)

---

## Troubleshooting

### Issue: "Cannot create collection" error
**Fix:** Delete `./data/chroma_db` and restart

### Issue: DuckDB file locked
**Fix:** Make sure only one server instance is running

### Issue: Files reprocessing every time
**Fix:** Check file tracker table exists:
```sql
SELECT * FROM _file_tracking_metadata;
```

### Issue: Slow startup even with persistence
**Fix:** Check if AUTO_LOAD_DEMO is enabled and files are being skipped:
```bash
grep "skipped" logs
```

---

## Rollback Plan

If anything breaks:

1. **Disable persistence:**
```env
ENABLE_PERSISTENCE=false
```

2. **Delete databases:**
```bash
rm -rf ./data/chroma_db ./data/duckdb.db
```

3. **Restart server** - will work like before (in-memory)

---

## Next Steps (Future Enhancements)

After basic persistence works:

1. **Background job queue** - Process files asynchronously
2. **Progress tracking** - Real-time upload progress
3. **Managed vector DB** - Pinecone/Weaviate for production
4. **Incremental embeddings** - Only re-embed changed chunks
5. **Data versioning** - Track schema migrations

---

## Files Modified Summary

1. ✅ `.env` - Added persistence configuration
2. ⏳ `src/services/vectorSearch.ts` - Persistent ChromaDB
3. ⏳ `src/services/dataProcessor.ts` - Persistent DuckDB
4. ⏳ `src/services/fileTracker.ts` - New file (tracking system)
5. ⏳ `src/services/autoLoader.ts` - Smart file loading
6. ⏳ `src/backend/server.ts` - AUTO_LOAD_DEMO control

---

## Current Session Status

**Completed:**
- Phase 1 Step 1: .env configuration ✅
- Phase 1 Step 2: Data directories ✅

**Remaining:**
- Phase 1 Steps 3-4: Modify VectorSearch and DataProcessor
- Phase 2: FileTracker service + AutoLoader updates
- Phase 3: Testing and validation

**Ready for fresh session implementation!**
