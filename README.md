# RAG Data Platform

A tool that lets you upload CSV files and query them using natural language. Built with a RAG pipeline that indexes your data into a vector store and uses an agentic approach to answer questions.

## Tech Stack

- **Backend**: Express, TypeScript, LangChain, OpenAI GPT-5
- **Frontend**: Next.js
- **Vector Store**: ChromaDB
- **Data Processing**: DuckDB, PapaParse

## How it works

1. Upload CSV/Excel files through the UI
2. Files are parsed and indexed into ChromaDB
3. Ask questions in natural language
4. The ReAct agent queries the vector store and generates answers with sources
