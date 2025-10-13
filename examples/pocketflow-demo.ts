/**
 * PocketFlow Demo Examples
 * 
 * Demonstrates the usage of PocketFlow core engine, workflow executor,
 * and RAG retrieve node.
 */

import { PocketFlow } from '../src/lib/pocketflow.js';
import { PocketFlowExecutor } from '../src/features/workflow/services/PocketFlowExecutor.js';
import { RAGRetrieveNode } from '../src/features/workflow/nodes/RAGRetrieveNode.js';

// ============================================================================
// Example 1: Simple PocketFlow Workflow
// ============================================================================

async function example1_SimplePocketFlow() {
  console.log('\n=== Example 1: Simple PocketFlow Workflow ===\n');
  
  // Create a new PocketFlow instance
  const flow = new PocketFlow();
  
  // Add nodes
  flow.addNode('input', (state) => {
    console.log('📥 Input node executing...');
    return { query: 'How to use WebContainers?' };
  });
  
  flow.addNode('uppercase', (state) => {
    console.log('🔄 Uppercase node executing...');
    return { result: state.input.query.toUpperCase() };
  });
  
  flow.addNode('output', (state) => {
    console.log('📤 Output node executing...');
    console.log('Result:', state.uppercase.result);
    return { success: true, message: state.uppercase.result };
  });
  
  // Define execution order
  flow.addEdge('input', 'uppercase');
  flow.addEdge('uppercase', 'output');
  
  // Execute the workflow
  const result = await flow.execute({});
  
  console.log('\n✅ Workflow completed!');
  console.log('Execution time:', result.executionTime, 'ms');
  console.log('Nodes executed:', result.nodesExecuted);
  console.log('Success:', result.success);
}

// ============================================================================
// Example 2: Branching Workflow
// ============================================================================

async function example2_BranchingWorkflow() {
  console.log('\n=== Example 2: Branching Workflow ===\n');
  
  const flow = new PocketFlow();
  
  // Input splits into two branches
  flow.addNode('start', (state) => {
    console.log('🚀 Start node: value = 10');
    return { value: 10 };
  });
  
  flow.addNode('double', (state) => {
    const result = state.start.value * 2;
    console.log('×2 Branch: 10 × 2 =', result);
    return { result };
  });
  
  flow.addNode('triple', (state) => {
    const result = state.start.value * 3;
    console.log('×3 Branch: 10 × 3 =', result);
    return { result };
  });
  
  flow.addNode('sum', (state) => {
    const total = state.double.result + state.triple.result;
    console.log('➕ Sum: 20 + 30 =', total);
    return { total };
  });
  
  // Create diamond pattern
  flow.addEdge('start', 'double');
  flow.addEdge('start', 'triple');
  flow.addEdge('double', 'sum');
  flow.addEdge('triple', 'sum');
  
  const result = await flow.execute({});
  
  console.log('\n✅ Total:', result.outputs.sum.total);
  console.log('Execution time:', result.executionTime, 'ms');
}

// ============================================================================
// Example 3: Async Operations
// ============================================================================

async function example3_AsyncOperations() {
  console.log('\n=== Example 3: Async Operations ===\n');
  
  const flow = new PocketFlow();
  
  flow.addNode('fetch1', async (state) => {
    console.log('🌐 Fetching data 1...');
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('✓ Data 1 fetched');
    return { data: 'Result 1' };
  });
  
  flow.addNode('fetch2', async (state) => {
    console.log('🌐 Fetching data 2...');
    await new Promise(resolve => setTimeout(resolve, 150));
    console.log('✓ Data 2 fetched');
    return { data: 'Result 2' };
  });
  
  flow.addNode('combine', async (state) => {
    console.log('🔗 Combining results...');
    return {
      combined: `${state.fetch1.data} + ${state.fetch2.data}`
    };
  });
  
  flow.addEdge('fetch1', 'combine');
  flow.addEdge('fetch2', 'combine');
  
  const result = await flow.execute({});
  
  console.log('\n✅ Combined:', result.outputs.combine.combined);
  console.log('Execution time:', result.executionTime, 'ms');
}

// ============================================================================
// Example 4: Using Workflow Executor
// ============================================================================

async function example4_WorkflowExecutor() {
  console.log('\n=== Example 4: Workflow Executor ===\n');
  
  const executor = new PocketFlowExecutor();
  
  // Define a workflow using Disco's workflow definition format
  const workflow = {
    id: 'demo-workflow',
    name: 'Demo Calculation Workflow',
    description: 'A simple calculation workflow',
    nodes: [
      {
        id: 'n1',
        type: 'input',
        label: 'Number Input',
        data: { value: 5 }
      },
      {
        id: 'n2',
        type: 'process',
        label: 'Square',
        data: { operation: 'square' }
      },
      {
        id: 'n3',
        type: 'output',
        label: 'Result',
        data: {}
      }
    ],
    connections: [
      { id: 'c1', sourceNodeId: 'n1', targetNodeId: 'n2' },
      { id: 'c2', sourceNodeId: 'n2', targetNodeId: 'n3' }
    ]
  };
  
  // Execute with progress tracking
  const result = await executor.executeWorkflow(workflow, {
    inputs: { multiplier: 2 },
    onProgress: (nodeId, nodeName, nodeResult) => {
      console.log(`✓ Node "${nodeName}" (${nodeId}) completed`);
    }
  });
  
  console.log('\n✅ Workflow completed!');
  console.log('Workflow ID:', result.workflowId);
  console.log('Workflow Name:', result.workflowName);
  console.log('Success:', result.success);
  console.log('Execution time:', result.executionTime, 'ms');
}

// ============================================================================
// Example 5: RAG Node (Demonstration)
// ============================================================================

async function example5_RAGNode() {
  console.log('\n=== Example 5: RAG Retrieve Node ===\n');
  
  const ragNode = new RAGRetrieveNode();
  
  console.log('📚 RAG Retrieve Node Configuration:');
  console.log('- Integrates with /api/v1/rag/:containerId/search');
  console.log('- Supports AST analysis, semantic search, code suggestions');
  console.log('- Input validation and error handling');
  console.log('- PocketFlow-compatible function generation');
  
  // Create a PocketFlow-compatible function
  const ragFunction = ragNode.createPocketFlowFunction();
  console.log('\n✅ RAG function created for PocketFlow integration');
  
  console.log('\nExample usage:');
  console.log(`
  const result = await ragNode.execute({
    containerId: 'container-123',
    query: 'Find all React components',
    limit: 5,
    useAST: true,
    semanticSearch: true
  });
  
  // Result contains:
  // - documents: Array of retrieved code snippets
  // - totalResults: Number of matches found
  // - query: The executed query
  // - containerId: The searched container
  // - features: Enabled features (AST, semantic search, etc.)
  `);
}

// ============================================================================
// Example 6: Error Handling
// ============================================================================

async function example6_ErrorHandling() {
  console.log('\n=== Example 6: Error Handling ===\n');
  
  const flow = new PocketFlow();
  
  flow.addNode('good1', (state) => {
    console.log('✓ Node 1 succeeded');
    return { value: 1 };
  });
  
  flow.addNode('bad', (state) => {
    console.log('⚠️  Node 2 will fail...');
    throw new Error('Intentional error for demo');
  });
  
  flow.addNode('good2', (state) => {
    console.log('✓ Node 3 succeeded');
    return { value: 3 };
  });
  
  flow.addEdge('good1', 'bad');
  flow.addEdge('bad', 'good2');
  
  console.log('\nWith stopOnError=false (continue on errors):');
  const result1 = await flow.execute({}, { stopOnError: false });
  console.log('Success:', result1.success);
  console.log('Nodes executed:', result1.nodesExecuted);
  console.log('Error in output:', result1.outputs.bad);
  
  console.log('\nWith stopOnError=true (stop on first error):');
  const result2 = await flow.execute({}, { stopOnError: true });
  console.log('Success:', result2.success);
  console.log('Error:', result2.error);
}

// ============================================================================
// Run All Examples
// ============================================================================

async function runAllExamples() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║     PocketFlow Integration - Demo Examples        ║');
  console.log('╚════════════════════════════════════════════════════╝');
  
  try {
    await example1_SimplePocketFlow();
    await example2_BranchingWorkflow();
    await example3_AsyncOperations();
    await example4_WorkflowExecutor();
    await example5_RAGNode();
    await example6_ErrorHandling();
    
    console.log('\n' + '═'.repeat(54));
    console.log('✅ All examples completed successfully!');
    console.log('═'.repeat(54) + '\n');
  } catch (error) {
    console.error('\n❌ Error running examples:', error);
    process.exit(1);
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}

export {
  example1_SimplePocketFlow,
  example2_BranchingWorkflow,
  example3_AsyncOperations,
  example4_WorkflowExecutor,
  example5_RAGNode,
  example6_ErrorHandling,
  runAllExamples
};
