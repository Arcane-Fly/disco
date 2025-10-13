/**
 * TemplateRepository - Manages workflow template storage and retrieval
 * 
 * Provides marketplace functionality including search, filtering,
 * ratings, and template management.
 */

import type {
  WorkflowTemplate,
  TemplateFilter,
  TemplateMarketplaceListing,
  TemplateCategory,
} from '../../../types/templates.js';

export class TemplateRepository {
  private templates = new Map<string, WorkflowTemplate>();
  private featured = new Set<string>();
  private verified = new Set<string>();
  
  /**
   * Add a template to the repository
   * 
   * @param template - Template to add
   */
  add(template: WorkflowTemplate): void {
    this.templates.set(template.metadata.id, template);
  }
  
  /**
   * Get a template by ID
   * 
   * @param id - Template ID
   * @returns Template or undefined
   */
  get(id: string): WorkflowTemplate | undefined {
    return this.templates.get(id);
  }
  
  /**
   * Remove a template from the repository
   * 
   * @param id - Template ID
   * @returns Whether template was removed
   */
  remove(id: string): boolean {
    return this.templates.delete(id);
  }
  
  /**
   * List all templates
   * 
   * @returns Array of all templates
   */
  list(): WorkflowTemplate[] {
    return Array.from(this.templates.values());
  }
  
  /**
   * Search and filter templates
   * 
   * @param filter - Filter options
   * @returns Filtered templates
   */
  search(filter: TemplateFilter): WorkflowTemplate[] {
    let results = this.list();
    
    // Filter by category
    if (filter.category) {
      results = results.filter(t => t.metadata.category === filter.category);
    }
    
    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      results = results.filter(t => 
        filter.tags!.some(tag => t.metadata.tags.includes(tag))
      );
    }
    
    // Filter by difficulty
    if (filter.difficulty) {
      results = results.filter(t => t.metadata.difficulty === filter.difficulty);
    }
    
    // Filter by minimum rating
    if (filter.minRating !== undefined && filter.minRating > 0) {
      results = results.filter(t => 
        t.stats && t.stats.rating >= filter.minRating!
      );
    }
    
    // Filter by search query
    if (filter.query) {
      const query = filter.query.toLowerCase();
      results = results.filter(t => 
        t.metadata.name.toLowerCase().includes(query) ||
        t.metadata.description.toLowerCase().includes(query) ||
        t.metadata.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Sort results
    results = this.sortTemplates(results, filter.sortBy || 'popular', filter.sortDirection || 'desc');
    
    return results;
  }
  
  /**
   * Get marketplace listings
   * 
   * @param filter - Filter options
   * @returns Array of marketplace listings
   */
  getMarketplaceListings(filter: TemplateFilter): TemplateMarketplaceListing[] {
    const templates = this.search(filter);
    
    return templates.map(template => ({
      template,
      featured: this.featured.has(template.metadata.id),
      verified: this.verified.has(template.metadata.id),
    }));
  }
  
  /**
   * Mark a template as featured
   * 
   * @param id - Template ID
   */
  markFeatured(id: string): void {
    if (this.templates.has(id)) {
      this.featured.add(id);
    }
  }
  
  /**
   * Mark a template as verified
   * 
   * @param id - Template ID
   */
  markVerified(id: string): void {
    if (this.templates.has(id)) {
      this.verified.add(id);
    }
  }
  
  /**
   * Get templates by category
   * 
   * @param category - Category to filter by
   * @returns Templates in category
   */
  getByCategory(category: TemplateCategory): WorkflowTemplate[] {
    return this.list().filter(t => t.metadata.category === category);
  }
  
  /**
   * Get featured templates
   * 
   * @returns Featured templates
   */
  getFeatured(): WorkflowTemplate[] {
    return this.list().filter(t => this.featured.has(t.metadata.id));
  }
  
  /**
   * Get verified templates
   * 
   * @returns Verified templates
   */
  getVerified(): WorkflowTemplate[] {
    return this.list().filter(t => this.verified.has(t.metadata.id));
  }
  
  /**
   * Get popular templates
   * 
   * @param limit - Maximum number of templates to return
   * @returns Popular templates
   */
  getPopular(limit: number = 10): WorkflowTemplate[] {
    return this.sortTemplates(this.list(), 'popular', 'desc').slice(0, limit);
  }
  
  /**
   * Get recent templates
   * 
   * @param limit - Maximum number of templates to return
   * @returns Recent templates
   */
  getRecent(limit: number = 10): WorkflowTemplate[] {
    return this.sortTemplates(this.list(), 'recent', 'desc').slice(0, limit);
  }
  
  /**
   * Update template statistics
   * 
   * @param id - Template ID
   * @param stats - Updated stats
   */
  updateStats(id: string, stats: Partial<WorkflowTemplate['stats']>): void {
    const template = this.templates.get(id);
    if (template) {
      template.stats = {
        ...template.stats,
        ...stats,
      } as any;
    }
  }
  
  /**
   * Increment download count
   * 
   * @param id - Template ID
   */
  incrementDownloads(id: string): void {
    const template = this.templates.get(id);
    if (template && template.stats) {
      template.stats.downloads++;
    }
  }
  
  /**
   * Add rating to template
   * 
   * @param id - Template ID
   * @param rating - Rating (0-5)
   */
  addRating(id: string, rating: number): void {
    const template = this.templates.get(id);
    if (template && template.stats) {
      const currentTotal = template.stats.rating * template.stats.ratingCount;
      template.stats.ratingCount++;
      template.stats.rating = (currentTotal + rating) / template.stats.ratingCount;
    }
  }
  
  /**
   * Clear all templates
   */
  clear(): void {
    this.templates.clear();
    this.featured.clear();
    this.verified.clear();
  }
  
  /**
   * Get template count
   * 
   * @returns Number of templates
   */
  count(): number {
    return this.templates.size;
  }
  
  /**
   * Sort templates
   */
  private sortTemplates(
    templates: WorkflowTemplate[],
    sortBy: string,
    direction: 'asc' | 'desc'
  ): WorkflowTemplate[] {
    const sorted = [...templates];
    const multiplier = direction === 'asc' ? 1 : -1;
    
    sorted.sort((a, b) => {
      let aValue: number;
      let bValue: number;
      
      switch (sortBy) {
        case 'downloads':
          aValue = a.stats?.downloads || 0;
          bValue = b.stats?.downloads || 0;
          break;
        case 'rating':
          aValue = a.stats?.rating || 0;
          bValue = b.stats?.rating || 0;
          break;
        case 'recent':
          aValue = new Date(a.metadata.updatedAt).getTime();
          bValue = new Date(b.metadata.updatedAt).getTime();
          break;
        case 'popular':
          // Popularity score: combination of downloads, rating, and stars
          aValue = (a.stats?.downloads || 0) * 0.4 + 
                   (a.stats?.rating || 0) * 200 * 0.3 +
                   (a.stats?.stars || 0) * 0.3;
          bValue = (b.stats?.downloads || 0) * 0.4 + 
                   (b.stats?.rating || 0) * 200 * 0.3 +
                   (b.stats?.stars || 0) * 0.3;
          break;
        default:
          return 0;
      }
      
      return (aValue - bValue) * multiplier;
    });
    
    return sorted;
  }
}

/**
 * Global template repository instance
 */
export const templateRepository = new TemplateRepository();
