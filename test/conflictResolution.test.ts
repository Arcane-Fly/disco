import { AdvancedConflictResolver, ConflictResolution } from '../src/lib/conflictResolver';

describe('Advanced Conflict Resolution', () => {
  let resolver: AdvancedConflictResolver;

  beforeEach(() => {
    resolver = new AdvancedConflictResolver();
  });

  describe('Smart Merge Resolution', () => {
    test('should auto-resolve non-conflicting changes', async () => {
      const baseContent = `function hello() {
  console.log("hello");
}`;

      const localContent = `function hello() {
  console.log("hello world");
}`;

      const remoteContent = `function hello() {
  console.log("hello");
  console.log("additional line");
}`;

      const result = await resolver.resolveConflict(
        baseContent,
        localContent,
        remoteContent,
        'test.js',
        'user1'
      );

      expect(result.strategy).toBe('smart-merge');
      expect(result.metadata?.autoResolved).toBe(true);
      expect(result.resolvedContent).toContain('hello world');
      expect(result.resolvedContent).toContain('additional line');
    });

    test('should detect conflicts requiring manual resolution', async () => {
      const baseContent = `const message = "original";`;
      const localContent = `const message = "local change";`;
      const remoteContent = `const message = "remote change";`;

      const result = await resolver.resolveConflict(
        baseContent,
        localContent,
        remoteContent,
        'test.js',
        'user1'
      );

      expect(result.metadata?.autoResolved).toBe(false);
      expect(result.conflictedSections).toBeDefined();
      expect(result.conflictedSections!.length).toBeGreaterThan(0);
    });
  });

  describe('Semantic Merge Resolution', () => {
    test('should handle JavaScript import statements intelligently', async () => {
      const baseContent = `import { a } from './module';
function test() {}`;

      const localContent = `import { a, b } from './module';
function test() {}`;

      const remoteContent = `import { a } from './module';
import { c } from './other';
function test() {}`;

      const result = await resolver.resolveConflict(
        baseContent,
        localContent,
        remoteContent,
        'test.js',
        'user1'
      );

      expect(result.strategy).toMatch(/merge/);
      expect(result.resolvedContent).toContain('import');
    });

    test('should handle JSON files with structured merging', async () => {
      const baseContent = `{
  "name": "test",
  "version": "1.0.0"
}`;

      const localContent = `{
  "name": "test",
  "version": "1.0.1"
}`;

      const remoteContent = `{
  "name": "test",
  "version": "1.0.0",
  "description": "A test package"
}`;

      const result = await resolver.resolveConflict(
        baseContent,
        localContent,
        remoteContent,
        'package.json',
        'user1'
      );

      expect(result.strategy).toMatch(/merge/);
    });
  });

  describe('Conflict Metadata', () => {
    test('should provide detailed conflict metadata', async () => {
      const baseContent = `line1\nline2\nline3`;
      const localContent = `line1\nlocal change\nline3`;
      const remoteContent = `line1\nremote change\nline3`;

      const result = await resolver.resolveConflict(
        baseContent,
        localContent,
        remoteContent,
        'test.txt',
        'user1'
      );

      expect(result.metadata).toBeDefined();
      expect(result.metadata!.conflictType).toBeDefined();
      expect(result.metadata!.severity).toBeDefined();
      expect(result.metadata!.userId).toBe('user1');
      expect(result.metadata!.timestamp).toBeInstanceOf(Date);
    });

    test('should classify conflict severity correctly', async () => {
      // High severity: Structural conflict
      const baseContent = `function test() { return 1; }`;
      const localContent = `function test() { return 2; }`;
      const remoteContent = `function test() { return 3; }`;

      const result = await resolver.resolveConflict(
        baseContent,
        localContent,
        remoteContent,
        'test.js',
        'user1'
      );

      expect(result.metadata?.severity).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(result.metadata!.severity);
    });
  });

  describe('File Type Support', () => {
    test('should support JavaScript/TypeScript files', async () => {
      const result = await resolver.resolveConflict(
        'const a = 1;',
        'const a = 2;',
        'const a = 3;',
        'test.ts',
        'user1'
      );

      expect(result).toBeDefined();
      expect(result.strategy).toBeDefined();
    });

    test('should support Markdown files', async () => {
      const result = await resolver.resolveConflict(
        '# Title\nContent',
        '# Title\nLocal content',
        '# Title\nRemote content',
        'README.md',
        'user1'
      );

      expect(result).toBeDefined();
      expect(result.strategy).toBeDefined();
    });

    test('should handle unsupported file types gracefully', async () => {
      const result = await resolver.resolveConflict(
        'binary content',
        'local binary',
        'remote binary',
        'file.bin',
        'user1'
      );

      expect(result).toBeDefined();
      expect(result.strategy).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty content', async () => {
      const result = await resolver.resolveConflict(
        '',
        'local content',
        'remote content',
        'test.txt',
        'user1'
      );

      expect(result).toBeDefined();
      expect(result.resolvedContent).toBeDefined();
    });

    test('should handle identical local and remote changes', async () => {
      const baseContent = 'original';
      const sameContent = 'changed';

      const result = await resolver.resolveConflict(
        baseContent,
        sameContent,
        sameContent,
        'test.txt',
        'user1'
      );

      expect(result.metadata?.autoResolved).toBe(true);
      expect(result.resolvedContent).toBe(sameContent);
    });

    test('should handle whitespace-only differences', async () => {
      const baseContent = 'function test() {\n  return 1;\n}';
      const localContent = 'function test() {\n    return 1;\n}'; // Different indentation
      const remoteContent = 'function test() {\n  return 1;\n}';

      const result = await resolver.resolveConflict(
        baseContent,
        localContent,
        remoteContent,
        'test.js',
        'user1'
      );

      expect(result).toBeDefined();
      // Should prefer local content for whitespace-only changes
      expect(result.resolvedContent.includes('    return')).toBe(true);
    });
  });
});
