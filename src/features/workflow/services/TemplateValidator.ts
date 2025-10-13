/**
 * TemplateValidator - Validates workflow templates
 * 
 * Ensures templates are well-formed, have valid nodes and edges,
 * and meet all requirements for execution.
 */

import type {
  WorkflowTemplate,
  TemplateValidationResult,
  TemplateNode,
  TemplateEdge,
} from '../../../types/templates.js';
import { nodeRegistry } from './NodeRegistry.js';

export class TemplateValidator {
  /**
   * Validate a workflow template
   * 
   * @param template - Template to validate
   * @returns Validation result with errors and warnings
   */
  validate(template: WorkflowTemplate): TemplateValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate metadata
    this.validateMetadata(template, errors, warnings);
    
    // Validate nodes
    this.validateNodes(template, errors, warnings);
    
    // Validate edges
    this.validateEdges(template, errors, warnings);
    
    // Validate parameters
    this.validateParameters(template, errors, warnings);
    
    // Validate graph structure
    this.validateGraphStructure(template, errors, warnings);
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
  
  /**
   * Validate template metadata
   */
  private validateMetadata(
    template: WorkflowTemplate,
    errors: string[],
    warnings: string[]
  ): void {
    const { metadata } = template;
    
    if (!metadata.id || !metadata.id.trim()) {
      errors.push('Template ID is required');
    }
    
    if (!metadata.name || !metadata.name.trim()) {
      errors.push('Template name is required');
    }
    
    if (!metadata.description || !metadata.description.trim()) {
      errors.push('Template description is required');
    }
    
    if (!metadata.version || !this.isValidSemver(metadata.version)) {
      errors.push('Template version must be valid semver (e.g., 1.0.0)');
    }
    
    if (!metadata.author || !metadata.author.trim()) {
      warnings.push('Template author is recommended');
    }
    
    if (!metadata.category) {
      errors.push('Template category is required');
    }
  }
  
  /**
   * Validate template nodes
   */
  private validateNodes(
    template: WorkflowTemplate,
    errors: string[],
    warnings: string[]
  ): void {
    const { nodes } = template;
    
    if (!nodes || nodes.length === 0) {
      errors.push('Template must have at least one node');
      return;
    }
    
    const nodeIds = new Set<string>();
    
    for (const node of nodes) {
      // Check for duplicate IDs
      if (nodeIds.has(node.id)) {
        errors.push(`Duplicate node ID: ${node.id}`);
      }
      nodeIds.add(node.id);
      
      // Validate node type
      if (!node.type) {
        errors.push(`Node ${node.id} is missing type`);
      } else if (!nodeRegistry.has(node.type)) {
        errors.push(`Node ${node.id} has unknown type: ${node.type}`);
      }
      
      // Validate node config
      if (!node.config || typeof node.config !== 'object') {
        warnings.push(`Node ${node.id} is missing configuration`);
      }
      
      // Validate node label
      if (!node.label || !node.label.trim()) {
        warnings.push(`Node ${node.id} is missing label`);
      }
    }
  }
  
  /**
   * Validate template edges
   */
  private validateEdges(
    template: WorkflowTemplate,
    errors: string[],
    warnings: string[]
  ): void {
    const { nodes, edges } = template;
    const nodeIds = new Set(nodes.map(n => n.id));
    
    if (!edges || edges.length === 0) {
      warnings.push('Template has no edges (disconnected nodes)');
      return;
    }
    
    for (const edge of edges) {
      // Validate source node exists
      if (!nodeIds.has(edge.from)) {
        errors.push(`Edge references non-existent source node: ${edge.from}`);
      }
      
      // Validate target node exists
      if (!nodeIds.has(edge.to)) {
        errors.push(`Edge references non-existent target node: ${edge.to}`);
      }
      
      // Check for self-loops
      if (edge.from === edge.to) {
        warnings.push(`Self-loop detected on node ${edge.from}`);
      }
    }
  }
  
  /**
   * Validate template parameters
   */
  private validateParameters(
    template: WorkflowTemplate,
    errors: string[],
    _warnings: string[]
  ): void {
    const { parameters } = template;
    
    if (!parameters) {
      return;
    }
    
    const paramNames = new Set<string>();
    
    for (const param of parameters) {
      // Check for duplicate parameter names
      if (paramNames.has(param.name)) {
        errors.push(`Duplicate parameter name: ${param.name}`);
      }
      paramNames.add(param.name);
      
      // Validate parameter type
      const validTypes = ['string', 'number', 'boolean', 'array', 'object'];
      if (!validTypes.includes(param.type)) {
        errors.push(`Parameter ${param.name} has invalid type: ${param.type}`);
      }
      
      // Validate required parameters have no default
      if (param.required && param.default !== undefined) {
        errors.push(`Required parameter ${param.name} should not have a default value`);
      }
    }
  }
  
  /**
   * Validate graph structure (cycles, connectivity)
   */
  private validateGraphStructure(
    template: WorkflowTemplate,
    errors: string[],
    warnings: string[]
  ): void {
    const { nodes, edges } = template;
    
    // Build adjacency list
    const adj = new Map<string, string[]>();
    for (const node of nodes) {
      adj.set(node.id, []);
    }
    for (const edge of edges) {
      if (adj.has(edge.from)) {
        adj.get(edge.from)!.push(edge.to);
      }
    }
    
    // Check for cycles using DFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      for (const neighbor of adj.get(nodeId) || []) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id)) {
          errors.push('Template contains cycles (not a valid DAG)');
          break;
        }
      }
    }
    
    // Check for disconnected nodes
    const reachable = new Set<string>();
    const dfs = (nodeId: string) => {
      reachable.add(nodeId);
      for (const neighbor of adj.get(nodeId) || []) {
        if (!reachable.has(neighbor)) {
          dfs(neighbor);
        }
      }
    };
    
    // Find nodes with no incoming edges (potential starting points)
    const hasIncoming = new Set<string>();
    for (const edge of edges) {
      hasIncoming.add(edge.to);
    }
    
    const startNodes = nodes.filter(n => !hasIncoming.has(n.id));
    if (startNodes.length === 0 && nodes.length > 0) {
      warnings.push('No start nodes found (all nodes have incoming edges)');
    } else {
      for (const startNode of startNodes) {
        dfs(startNode.id);
      }
      
      const unreachable = nodes.filter(n => !reachable.has(n.id));
      if (unreachable.length > 0) {
        warnings.push(`${unreachable.length} node(s) are unreachable: ${unreachable.map(n => n.id).join(', ')}`);
      }
    }
  }
  
  /**
   * Check if version is valid semver
   */
  private isValidSemver(version: string): boolean {
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/;
    return semverRegex.test(version);
  }
}

/**
 * Global validator instance
 */
export const templateValidator = new TemplateValidator();
