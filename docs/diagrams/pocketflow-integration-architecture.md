# PocketFlow Integration Architecture Diagrams

## 1. Current Architecture (Before Integration)

```
┌─────────────────────────────────────────────────────────────┐
│                    Disco MCP Server                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Express.js  │  │   Next.js    │  │  WebContainer   │  │
│  │   Backend    │  │   Frontend   │  │    Manager      │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│         │                 │                    │            │
│  ┌──────┴─────────────────┴────────────────────┴─────┐     │
│  │          Workflow Builder (Visual Only)           │     │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐         │     │
│  │  │Input │→│Process│→│Output│  │Custom│         │     │
│  │  └──────┘  └──────┘  └──────┘  └──────┘         │     │
│  │            ❌ No Execution Engine                 │     │
│  │            ❌ No AI Node Types                    │     │
│  │            ❌ No Ready-Made Templates             │     │
│  └──────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 2. Enhanced Architecture (After Integration)

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Disco MCP Server + PocketFlow                  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────┐  │
│  │  Express.js  │  │   Next.js    │  │  WebContainer Manager   │  │
│  │   Backend    │  │   Frontend   │  │  + PocketFlow Executor  │  │
│  └──────────────┘  └──────────────┘  └─────────────────────────┘  │
│         │                 │                        │                │
│  ┌──────┴─────────────────┴────────────────────────┴──────────┐    │
│  │      Enhanced Workflow Builder (Visual + Execution)         │    │
│  │  ┌─────────────────────────────────────────────────────┐   │    │
│  │  │  PocketFlow Execution Engine (100 lines)            │   │    │
│  │  │  • DAG topological sort                             │   │    │
│  │  │  • Async execution                                  │   │    │
│  │  │  • Progress tracking                                │   │    │
│  │  └─────────────────────────────────────────────────────┘   │    │
│  │  ┌─────────────────────────────────────────────────────┐   │    │
│  │  │  AI Node Library (15+ types)                        │   │    │
│  │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │   │    │
│  │  │  │ LLM  │ │ RAG  │ │Agent │ │Multi │ │ Map  │     │   │    │
│  │  │  │Prompt│ │Retrie│ │Resear│ │Agent │ │Reduce│     │   │    │
│  │  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘     │   │    │
│  │  └─────────────────────────────────────────────────────┘   │    │
│  │  ┌─────────────────────────────────────────────────────┐   │    │
│  │  │  Template Marketplace (8+ ready-made)               │   │    │
│  │  │  • RAG Pipeline                                     │   │    │
│  │  │  • Multi-Agent Vote                                 │   │    │
│  │  │  • Research Agent                                   │   │    │
│  │  │  • Code Generation                                  │   │    │
│  │  └─────────────────────────────────────────────────────┘   │    │
│  │  ┌─────────────────────────────────────────────────────┐   │    │
│  │  │  Agentic Coder                                      │   │    │
│  │  │  • AI generates node implementations                │   │    │
│  │  │  • Natural language → TypeScript code               │   │    │
│  │  └─────────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## 3. RAG Pipeline Flow (Example)

```
User Query
    ↓
┌─────────────────────────────────────────────────────────┐
│                    Workflow Graph                       │
│                                                         │
│  ┌────────────┐      ┌────────────┐                   │
│  │   Input    │─────→│ RAG Retrieve│                   │
│  │   Node     │      │   (Vector   │                   │
│  └────────────┘      │   Search)   │                   │
│                      └─────┬───────┘                   │
│                            │                            │
│                      ┌─────▼───────┐                   │
│                      │ RAG Rerank  │                   │
│                      │ (Relevance) │                   │
│                      └─────┬───────┘                   │
│                            │                            │
│                      ┌─────▼───────┐                   │
│                      │ RAG Augment │                   │
│                      │  (Format)   │                   │
│                      └─────┬───────┘                   │
│                            │                            │
│                      ┌─────▼───────┐                   │
│                      │RAG Generate │                   │
│                      │  (LLM)      │                   │
│                      └─────┬───────┘                   │
│                            │                            │
│                      ┌─────▼───────┐                   │
│                      │   Output    │                   │
│                      │    Node     │                   │
│                      └─────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           ↓
                    Final Answer
```

## 4. Multi-Agent Voting Flow (Example)

```
Complex Question
       ↓
┌──────────────────────────────────────────────────────┐
│              Multi-Agent Voting System               │
│                                                      │
│  ┌────────┐                                         │
│  │ Input  │                                         │
│  │  Node  │                                         │
│  └────┬───┘                                         │
│       │                                              │
│  ┌────▼──────────────────────────────────┐          │
│  │       Map Node (Parallel)             │          │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │          │
│  │  │Agent│ │Agent│ │Agent│ │Agent│... │          │
│  │  │  1  │ │  2  │ │  3  │ │  4  │    │          │
│  │  └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘    │          │
│  └─────┼───────┼───────┼───────┼────────┘          │
│        └───────┴───────┴───────┘                    │
│                 │                                    │
│           ┌─────▼─────┐                             │
│           │ Vote Node │                             │
│           │ (Majority │                             │
│           │Consensus) │                             │
│           └─────┬─────┘                             │
│                 │                                    │
│           ┌─────▼─────┐                             │
│           │  Output   │                             │
│           │   Node    │                             │
│           └───────────┘                             │
│                                                      │
└──────────────────────────────────────────────────────┘
                ↓
      Consensus Answer
      (Improved Accuracy)
```

## 5. Integration with Existing Disco APIs

```
┌────────────────────────────────────────────────────────────┐
│            PocketFlow Workflow Execution                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────┐    Calls    ┌──────────────────────┐   │
│  │  RAG Node    │────────────→│ /api/v1/rag/search   │   │
│  │  (Retrieve)  │             │ (Existing Disco API)  │   │
│  └──────────────┘             └──────────────────────┘   │
│                                                            │
│  ┌──────────────┐    Calls    ┌──────────────────────┐   │
│  │ File Node    │────────────→│ /api/v1/files/write  │   │
│  │  (Write)     │             │ (Existing Disco API)  │   │
│  └──────────────┘             └──────────────────────┘   │
│                                                            │
│  ┌──────────────┐    Calls    ┌──────────────────────┐   │
│  │ Terminal Node│────────────→│ /api/v1/terminal/exec│   │
│  │  (Execute)   │             │ (Existing Disco API)  │   │
│  └──────────────┘             └──────────────────────┘   │
│                                                            │
│  ┌──────────────┐    Calls    ┌──────────────────────┐   │
│  │ Browser Node │────────────→│ /api/v1/computer-use │   │
│  │ (Screenshot) │             │ (Existing Disco API)  │   │
│  └──────────────┘             └──────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘

✅ PocketFlow nodes leverage ALL existing Disco capabilities
✅ No duplicate implementations needed
✅ Unified security and authentication
```

---

**Related Documents**:
- [Full Review](../DISCO_POCKETFLOW_INTEGRATION_REVIEW.md)
- [Quick Summary](../POCKETFLOW_INTEGRATION_SUMMARY.md)
