/**
 * TemplateImportExport - Import and export workflow templates
 * 
 * Supports multiple formats including JSON, TypeScript, Python, and Go.
 * Handles validation during import and code generation during export.
 */

import type {
  WorkflowTemplate,
  TemplateExportFormat,
  TemplateExportOptions,
  TemplateImportResult,
} from '../../../types/templates.js';
import { templateValidator } from './TemplateValidator.js';

export class TemplateImportExport {
  /**
   * Import template from JSON
   * 
   * @param json - JSON string or object
   * @returns Import result with template and warnings
   */
  importFromJSON(json: string | object): TemplateImportResult {
    const warnings: string[] = [];
    let template: WorkflowTemplate;
    
    try {
      // Parse JSON if string
      if (typeof json === 'string') {
        template = JSON.parse(json);
      } else {
        template = json as WorkflowTemplate;
      }
    } catch (error) {
      throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Validate template
    const validation = templateValidator.validate(template);
    if (!validation.valid) {
      throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
    }
    
    warnings.push(...validation.warnings);
    
    return {
      template,
      warnings,
      modified: false,
    };
  }
  
  /**
   * Export template to specified format
   * 
   * @param template - Template to export
   * @param options - Export options
   * @returns Exported content as string
   */
  export(template: WorkflowTemplate, options: TemplateExportOptions): string {
    // Validate template before export
    const validation = templateValidator.validate(template);
    if (!validation.valid) {
      throw new Error(`Cannot export invalid template: ${validation.errors.join(', ')}`);
    }
    
    switch (options.format) {
      case 'json':
        return this.exportToJSON(template, options);
      case 'typescript':
        return this.exportToTypeScript(template, options);
      case 'python':
        return this.exportToPython(template, options);
      case 'go':
        return this.exportToGo(template, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }
  
  /**
   * Export to JSON format
   */
  private exportToJSON(template: WorkflowTemplate, options: TemplateExportOptions): string {
    const exportData = {
      ...template,
    };
    
    if (!options.includeExamples) {
      delete exportData.examples;
    }
    
    if (!options.includeDocumentation) {
      delete exportData.metadata.longDescription;
      delete exportData.metadata.documentation;
    }
    
    const indent = options.minify ? 0 : 2;
    return JSON.stringify(exportData, null, indent);
  }
  
  /**
   * Export to TypeScript format
   */
  private exportToTypeScript(template: WorkflowTemplate, options: TemplateExportOptions): string {
    const { metadata, nodes, edges, parameters } = template;
    
    let code = `/**
 * ${metadata.name}
 * ${metadata.description}
 * 
 * @version ${metadata.version}
 * @author ${metadata.author}
 * @category ${metadata.category}
 */

import { PocketFlow } from './lib/pocketflow';
import { nodeRegistry } from './features/workflow/services/NodeRegistry';

`;
    
    // Add interface for parameters
    if (parameters && parameters.length > 0) {
      code += `export interface ${this.toPascalCase(metadata.id)}Params {\n`;
      for (const param of parameters) {
        const optional = param.required ? '' : '?';
        code += `  /** ${param.description} */\n`;
        code += `  ${param.name}${optional}: ${param.type};\n`;
      }
      code += `}\n\n`;
    }
    
    // Add main function
    const paramType = parameters && parameters.length > 0 
      ? `${this.toPascalCase(metadata.id)}Params`
      : 'Record<string, any>';
      
    code += `export async function ${this.toCamelCase(metadata.id)}(params: ${paramType}) {\n`;
    code += `  const flow = new PocketFlow();\n\n`;
    
    // Add nodes
    code += `  // Add nodes\n`;
    for (const node of nodes) {
      code += `  const ${node.id}Node = nodeRegistry.create('${node.type}');\n`;
      code += `  flow.addNode('${node.id}', ${node.id}Node.createPocketFlowFunction());\n`;
    }
    
    code += `\n  // Add edges\n`;
    for (const edge of edges) {
      code += `  flow.addEdge('${edge.from}', '${edge.to}');\n`;
    }
    
    code += `\n  // Execute workflow\n`;
    code += `  const result = await flow.execute(params);\n`;
    code += `  return result;\n`;
    code += `}\n`;
    
    // Add examples
    if (options.includeExamples && template.examples && template.examples.length > 0) {
      code += `\n// Usage Examples\n`;
      for (const example of template.examples) {
        code += `\n/**\n * ${example.title}\n * ${example.description}\n */\n`;
        code += `// const result = await ${this.toCamelCase(metadata.id)}(${JSON.stringify(example.inputs, null, 2)});\n`;
      }
    }
    
    return code;
  }
  
  /**
   * Export to Python format
   */
  private exportToPython(template: WorkflowTemplate, options: TemplateExportOptions): string {
    const { metadata, nodes, edges, parameters } = template;
    
    let code = `"""
${metadata.name}
${metadata.description}

Version: ${metadata.version}
Author: ${metadata.author}
Category: ${metadata.category}
"""

from typing import Dict, Any
from pocketflow import PocketFlow
from node_registry import node_registry

`;
    
    // Add function
    const paramList = parameters && parameters.length > 0
      ? parameters.map(p => p.name).join(', ')
      : '**params';
      
    code += `def ${this.toSnakeCase(metadata.id)}(${paramList}) -> Dict[str, Any]:\n`;
    code += `    """Execute ${metadata.name} workflow"""\n`;
    code += `    flow = PocketFlow()\n\n`;
    
    // Add nodes
    code += `    # Add nodes\n`;
    for (const node of nodes) {
      code += `    ${node.id}_node = node_registry.create('${node.type}')\n`;
      code += `    flow.add_node('${node.id}', ${node.id}_node.create_pocketflow_function())\n`;
    }
    
    code += `\n    # Add edges\n`;
    for (const edge of edges) {
      code += `    flow.add_edge('${edge.from}', '${edge.to}')\n`;
    }
    
    code += `\n    # Execute workflow\n`;
    if (parameters && parameters.length > 0) {
      code += `    params = {${parameters.map(p => `'${p.name}': ${p.name}`).join(', ')}}\n`;
    }
    code += `    result = flow.execute(params)\n`;
    code += `    return result\n`;
    
    // Add examples
    if (options.includeExamples && template.examples && template.examples.length > 0) {
      code += `\n\n# Usage Examples\n`;
      for (const example of template.examples) {
        code += `\n# ${example.title}\n`;
        code += `# ${example.description}\n`;
        const inputsStr = JSON.stringify(example.inputs, null, 2).replace(/"([^"]+)":/g, '$1=');
        code += `# result = ${this.toSnakeCase(metadata.id)}(${inputsStr})\n`;
      }
    }
    
    return code;
  }
  
  /**
   * Export to Go format
   */
  private exportToGo(template: WorkflowTemplate, options: TemplateExportOptions): string {
    const { metadata, nodes, edges, parameters } = template;
    
    let code = `package main

import (
\t"github.com/pocketflow/pocketflow-go"
\t"github.com/pocketflow/node-registry"
)

// ${metadata.name}
// ${metadata.description}
//
// Version: ${metadata.version}
// Author: ${metadata.author}
// Category: ${metadata.category}

`;
    
    // Add params struct
    if (parameters && parameters.length > 0) {
      code += `type ${this.toPascalCase(metadata.id)}Params struct {\n`;
      for (const param of parameters) {
        code += `\t${this.toPascalCase(param.name)} ${this.goType(param.type)} \`json:"${param.name}"\`\n`;
      }
      code += `}\n\n`;
    }
    
    // Add function
    const funcName = this.toPascalCase(metadata.id);
    const paramType = parameters && parameters.length > 0
      ? `params ${funcName}Params`
      : 'params map[string]interface{}';
      
    code += `func ${funcName}(${paramType}) (map[string]interface{}, error) {\n`;
    code += `\tflow := pocketflow.New()\n\n`;
    
    // Add nodes
    code += `\t// Add nodes\n`;
    for (const node of nodes) {
      code += `\t${node.id}Node := noderegistry.Create("${node.type}")\n`;
      code += `\tflow.AddNode("${node.id}", ${node.id}Node.CreatePocketFlowFunction())\n`;
    }
    
    code += `\n\t// Add edges\n`;
    for (const edge of edges) {
      code += `\tflow.AddEdge("${edge.from}", "${edge.to}")\n`;
    }
    
    code += `\n\t// Execute workflow\n`;
    code += `\tresult, err := flow.Execute(params)\n`;
    code += `\treturn result, err\n`;
    code += `}\n`;
    
    return code;
  }
  
  /**
   * Helper: Convert string to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[-_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }
  
  /**
   * Helper: Convert string to camelCase
   */
  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }
  
  /**
   * Helper: Convert string to snake_case
   */
  private toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '')
      .replace(/[-\s]/g, '_');
  }
  
  /**
   * Helper: Convert TypeScript type to Go type
   */
  private goType(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'float64',
      'boolean': 'bool',
      'array': '[]interface{}',
      'object': 'map[string]interface{}',
    };
    return typeMap[type] || 'interface{}';
  }
}

/**
 * Global import/export instance
 */
export const templateImportExport = new TemplateImportExport();
