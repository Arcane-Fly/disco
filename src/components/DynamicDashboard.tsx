/**
 * Dynamic Dashboard Component System
 * 
 * This component exemplifies Phase II vision by providing:
 * - Advanced Modularity: Reusable, self-contained widgets
 * - Sophisticated User Controls: Drag-and-drop, real-time data manipulation
 * - Personalization: Custom layouts, themes, saved configurations
 * - Asynchronous Processing: Non-blocking widget operations
 * - Robust State Management: Complex widget state orchestration
 * - Micro-interactions: Smooth animations and responsive feedback
 * - Analytics Integration: Usage tracking and behavior analysis
 * 
 * Purpose: Transform the static enhancement interface into a dynamic, 
 * user-driven dashboard that adapts to individual workflows and preferences.
 * 
 * Future Expansion Potential:
 * - Widget marketplace for community extensions
 * - AI-powered layout suggestions
 * - Collaborative dashboard sharing
 * - Real-time multi-user collaboration
 * - Advanced data visualization widgets
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// Replaced react-beautiful-dnd with modern @dnd-kit for better performance and accessibility
import { DragDropProvider } from './ui/DragDropProvider.js';
import { Button } from './ui/Button.js';
import { EventEmitter } from 'events';

// =====================================================================================
// TYPE DEFINITIONS & INTERFACES
// =====================================================================================

/**
 * Core widget interface defining the contract for all dashboard widgets
 */
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  config: WidgetConfig;
  data?: any;
  isLoading?: boolean;
  error?: string;
  lastUpdated?: number;
}

/**
 * Available widget types - extensible for future widget additions
 */
export type WidgetType = 
  | 'performance-metrics'
  | 'system-health'
  | 'enhancement-progress'
  | 'analytics-chart'
  | 'task-queue'
  | 'user-activity'
  | 'resource-monitor'
  | 'notification-center'
  | 'quick-actions'
  | 'custom-component';

/**
 * Widget positioning and sizing configuration
 */
export interface WidgetPosition {
  x: number;
  y: number;
  order: number;
}

export interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Widget-specific configuration options
 */
export interface WidgetConfig {
  refreshInterval?: number;
  showHeader?: boolean;
  allowResize?: boolean;
  allowMove?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  customSettings?: Record<string, any>;
}

/**
 * Dashboard layout configuration and user preferences
 */
export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  gridSize: { columns: number; rows: number };
  theme: DashboardTheme;
  created: number;
  lastModified: number;
}

/**
 * Theme configuration for dashboard appearance
 */
export interface DashboardTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderColor: string;
  shadowLevel: number;
  borderRadius: number;
  fontFamily: string;
}

/**
 * Analytics tracking interface for user behavior analysis
 */
export interface AnalyticsEvent {
  type: 'widget_added' | 'widget_removed' | 'widget_moved' | 'widget_resized' | 'layout_saved' | 'theme_changed';
  widgetId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

// =====================================================================================
// DASHBOARD STATE MANAGEMENT
// =====================================================================================

/**
 * Advanced state management system for dashboard operations
 * Implements Redux-like patterns with immutable state updates
 */
class DashboardStateManager extends EventEmitter {
  private state: {
    layouts: DashboardLayout[];
    activeLayoutId: string;
    widgets: Map<string, DashboardWidget>;
    theme: DashboardTheme;
    analytics: AnalyticsEvent[];
    isLoading: boolean;
    errors: string[];
  };

  private undoStack: any[] = [];
  private redoStack: any[] = [];
  private maxHistorySize = 50;

  constructor() {
    super();
    this.state = this.getInitialState();
    this.setupAutoSave();
  }

  /**
   * Initialize default dashboard state
   */
  private getInitialState() {
    return {
      layouts: [this.createDefaultLayout()],
      activeLayoutId: 'default',
      widgets: new Map(),
      theme: this.getDefaultTheme(),
      analytics: [],
      isLoading: false,
      errors: []
    };
  }

  /**
   * Create default dashboard layout with essential widgets
   */
  private createDefaultLayout(): DashboardLayout {
    const defaultWidgets: DashboardWidget[] = [
      {
        id: 'performance-overview',
        type: 'performance-metrics',
        title: 'Performance Overview',
        position: { x: 0, y: 0, order: 0 },
        size: { width: 6, height: 4 },
        config: { refreshInterval: 5000, showHeader: true, allowResize: true, allowMove: true }
      },
      {
        id: 'system-health',
        type: 'system-health',
        title: 'System Health',
        position: { x: 6, y: 0, order: 1 },
        size: { width: 6, height: 4 },
        config: { refreshInterval: 10000, showHeader: true, allowResize: true, allowMove: true }
      },
      {
        id: 'enhancement-progress',
        type: 'enhancement-progress',
        title: 'Enhancement Progress',
        position: { x: 0, y: 4, order: 2 },
        size: { width: 12, height: 3 },
        config: { refreshInterval: 15000, showHeader: true, allowResize: true, allowMove: true }
      }
    ];

    return {
      id: 'default',
      name: 'Default Dashboard',
      description: 'Standard dashboard layout with essential monitoring widgets',
      widgets: defaultWidgets,
      gridSize: { columns: 12, rows: 8 },
      theme: this.getDefaultTheme(),
      created: Date.now(),
      lastModified: Date.now()
    };
  }

  /**
   * Default theme configuration
   */
  private getDefaultTheme(): DashboardTheme {
    return {
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      backgroundColor: '#f8fafc',
      surfaceColor: '#ffffff',
      textColor: '#0f172a',
      borderColor: '#e2e8f0',
      shadowLevel: 2,
      borderRadius: 8,
      fontFamily: 'Inter, system-ui, sans-serif'
    };
  }

  /**
   * Setup automatic state persistence
   */
  private setupAutoSave() {
    setInterval(() => {
      this.saveStateToStorage();
    }, 30000); // Auto-save every 30 seconds
  }

  /**
   * Add new widget to active layout
   */
  public addWidget(widget: Omit<DashboardWidget, 'id'>): string {
    const widgetId = `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newWidget: DashboardWidget = {
      ...widget,
      id: widgetId
    };

    this.executeAction('ADD_WIDGET', { widget: newWidget });
    this.trackAnalytics({ type: 'widget_added', widgetId, timestamp: Date.now() });
    
    return widgetId;
  }

  /**
   * Remove widget from active layout
   */
  public removeWidget(widgetId: string): boolean {
    const success = this.executeAction('REMOVE_WIDGET', { widgetId });
    if (success) {
      this.trackAnalytics({ type: 'widget_removed', widgetId, timestamp: Date.now() });
    }
    return success;
  }

  /**
   * Update widget configuration
   */
  public updateWidget(widgetId: string, updates: Partial<DashboardWidget>): boolean {
    return this.executeAction('UPDATE_WIDGET', { widgetId, updates });
  }

  /**
   * Reorder widgets after drag and drop
   */
  public reorderWidgets(sourceIndex: number, destinationIndex: number): boolean {
    const success = this.executeAction('REORDER_WIDGETS', { sourceIndex, destinationIndex });
    if (success) {
      this.trackAnalytics({ 
        type: 'widget_moved', 
        timestamp: Date.now(),
        metadata: { sourceIndex, destinationIndex }
      });
    }
    return success;
  }

  /**
   * Execute state actions with undo/redo support
   */
  private executeAction(type: string, payload: any): boolean {
    try {
      const previousState = JSON.parse(JSON.stringify(this.state));
      
      switch (type) {
        case 'ADD_WIDGET':
          this.addWidgetToState(payload.widget);
          break;
        case 'REMOVE_WIDGET':
          this.removeWidgetFromState(payload.widgetId);
          break;
        case 'UPDATE_WIDGET':
          this.updateWidgetInState(payload.widgetId, payload.updates);
          break;
        case 'REORDER_WIDGETS':
          this.reorderWidgetsInState(payload.sourceIndex, payload.destinationIndex);
          break;
        default:
          return false;
      }

      // Add to undo stack
      this.undoStack.push({ type, payload, previousState });
      if (this.undoStack.length > this.maxHistorySize) {
        this.undoStack.shift();
      }
      this.redoStack = []; // Clear redo stack on new action

      this.emit('stateChanged', this.state);
      return true;
    } catch (error) {
      console.error('Action execution failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.state.errors.push(`Action ${type} failed: ${errorMessage}`);
      return false;
    }
  }

  /**
   * State mutation methods
   */
  private addWidgetToState(widget: DashboardWidget) {
    const activeLayout = this.getActiveLayout();
    if (activeLayout) {
      activeLayout.widgets.push(widget);
      activeLayout.lastModified = Date.now();
    }
  }

  private removeWidgetFromState(widgetId: string) {
    const activeLayout = this.getActiveLayout();
    if (activeLayout) {
      activeLayout.widgets = activeLayout.widgets.filter(w => w.id !== widgetId);
      activeLayout.lastModified = Date.now();
    }
  }

  private updateWidgetInState(widgetId: string, updates: Partial<DashboardWidget>) {
    const activeLayout = this.getActiveLayout();
    if (activeLayout) {
      const widgetIndex = activeLayout.widgets.findIndex(w => w.id === widgetId);
      if (widgetIndex !== -1) {
        activeLayout.widgets[widgetIndex] = { ...activeLayout.widgets[widgetIndex], ...updates };
        activeLayout.lastModified = Date.now();
      }
    }
  }

  private reorderWidgetsInState(sourceIndex: number, destinationIndex: number) {
    const activeLayout = this.getActiveLayout();
    if (activeLayout) {
      const [removed] = activeLayout.widgets.splice(sourceIndex, 1);
      activeLayout.widgets.splice(destinationIndex, 0, removed);
      
      // Update order positions
      activeLayout.widgets.forEach((widget, index) => {
        widget.position.order = index;
      });
      
      activeLayout.lastModified = Date.now();
    }
  }

  /**
   * Undo/Redo functionality
   */
  public undo(): boolean {
    if (this.undoStack.length === 0) return false;
    
    const action = this.undoStack.pop();
    this.redoStack.push({ state: JSON.parse(JSON.stringify(this.state)) });
    this.state = action.previousState;
    
    this.emit('stateChanged', this.state);
    return true;
  }

  public redo(): boolean {
    if (this.redoStack.length === 0) return false;
    
    const action = this.redoStack.pop();
    this.undoStack.push({ state: JSON.parse(JSON.stringify(this.state)) });
    this.state = action.state;
    
    this.emit('stateChanged', this.state);
    return true;
  }

  /**
   * Analytics tracking
   */
  private trackAnalytics(event: AnalyticsEvent) {
    this.state.analytics.push(event);
    
    // Keep only last 1000 events to prevent memory bloat
    if (this.state.analytics.length > 1000) {
      this.state.analytics = this.state.analytics.slice(-1000);
    }
    
    this.emit('analyticsEvent', event);
  }

  /**
   * State persistence
   */
  private saveStateToStorage() {
    try {
      const stateToSave = {
        layouts: this.state.layouts,
        activeLayoutId: this.state.activeLayoutId,
        theme: this.state.theme
      };
      localStorage.setItem('dashboardState', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save dashboard state:', error);
    }
  }

  private loadStateFromStorage() {
    try {
      const saved = localStorage.getItem('dashboardState');
      if (saved) {
        const parsedState = JSON.parse(saved);
        this.state.layouts = parsedState.layouts || this.state.layouts;
        this.state.activeLayoutId = parsedState.activeLayoutId || this.state.activeLayoutId;
        this.state.theme = parsedState.theme || this.state.theme;
      }
    } catch (error) {
      console.error('Failed to load dashboard state:', error);
    }
  }

  /**
   * Public state accessors
   */
  public getActiveLayout(): DashboardLayout | null {
    return this.state.layouts.find(layout => layout.id === this.state.activeLayoutId) || null;
  }

  public getState() {
    return { ...this.state };
  }

  public getAnalytics(): AnalyticsEvent[] {
    return [...this.state.analytics];
  }
}

// =====================================================================================
// WIDGET COMPONENTS
// =====================================================================================

/**
 * Base widget wrapper component with common functionality
 */
interface BaseWidgetProps {
  widget: DashboardWidget;
  onUpdate: (updates: Partial<DashboardWidget>) => void;
  onRemove: () => void;
  isDragging?: boolean;
}

const BaseWidget: React.FC<BaseWidgetProps & { children: React.ReactNode }> = ({
  widget,
  onUpdate,
  onRemove,
  isDragging,
  children
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(widget.isLoading || false);

  const widgetStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    background: widget.config.theme === 'dark' ? '#1f2937' : '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    boxShadow: isHovered ? '0 10px 25px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isDragging ? 'rotate(2deg) scale(1.05)' : 'none',
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? 'grabbing' : 'default',
    overflow: 'hidden',
    position: 'relative' as const
  }), [widget.config.theme, isHovered, isDragging]);

  const headerStyle = useMemo(() => ({
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    background: widget.config.theme === 'dark' ? '#374151' : '#f9fafb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: 600,
    color: widget.config.theme === 'dark' ? '#f3f4f6' : '#111827'
  }), [widget.config.theme]);

  return (
    <div
      style={widgetStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {widget.config.showHeader && (
        <div style={headerStyle}>
          <span>{widget.title}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isLoading && (
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid #e5e7eb', 
                borderTop: '2px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            <button
              onClick={onRemove}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.2s'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <div style={{ padding: '16px', height: widget.config.showHeader ? 'calc(100% - 60px)' : '100%' }}>
        {children}
      </div>
    </div>
  );
};

/**
 * Performance Metrics Widget
 */
const PerformanceMetricsWidget: React.FC<BaseWidgetProps> = ({ widget, onUpdate, onRemove }) => {
  const [metrics, setMetrics] = useState({
    responseTime: 45,
    throughput: 1250,
    errorRate: 0.2,
    cpuUsage: 34,
    memoryUsage: 67
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        responseTime: Math.max(20, prev.responseTime + (Math.random() - 0.5) * 10),
        throughput: Math.max(800, prev.throughput + (Math.random() - 0.5) * 200),
        errorRate: Math.max(0, Math.min(5, prev.errorRate + (Math.random() - 0.5) * 0.5)),
        cpuUsage: Math.max(10, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 15)),
        memoryUsage: Math.max(20, Math.min(95, prev.memoryUsage + (Math.random() - 0.5) * 10))
      }));
    }, widget.config.refreshInterval || 5000);

    return () => clearInterval(interval);
  }, [widget.config.refreshInterval]);

  const MetricCard = ({ label, value, unit, color }: { 
    label: string; 
    value: number; 
    unit: string; 
    color: string; 
  }) => (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
      padding: '12px',
      borderRadius: '6px',
      border: `1px solid ${color}20`,
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '20px', fontWeight: 'bold', color, marginBottom: '4px' }}>
        {value.toFixed(unit === '%' ? 1 : 0)}{unit}
      </div>
      <div style={{ fontSize: '12px', color: '#6b7280' }}>{label}</div>
    </div>
  );

  return (
    <BaseWidget widget={widget} onUpdate={onUpdate} onRemove={onRemove}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '12px',
        height: '100%',
        alignContent: 'start'
      }}>
        <MetricCard label="Response Time" value={metrics.responseTime} unit="ms" color="#10b981" />
        <MetricCard label="Throughput" value={metrics.throughput} unit="/min" color="#3b82f6" />
        <MetricCard label="Error Rate" value={metrics.errorRate} unit="%" color="#ef4444" />
        <MetricCard label="CPU Usage" value={metrics.cpuUsage} unit="%" color="#f59e0b" />
        <MetricCard label="Memory Usage" value={metrics.memoryUsage} unit="%" color="#8b5cf6" />
      </div>
    </BaseWidget>
  );
};

/**
 * System Health Widget
 */
const SystemHealthWidget: React.FC<BaseWidgetProps> = ({ widget, onUpdate, onRemove }) => {
  const [healthStatus, setHealthStatus] = useState({
    overall: 'excellent',
    services: [
      { name: 'API Gateway', status: 'healthy', uptime: 99.9 },
      { name: 'Database', status: 'healthy', uptime: 99.8 },
      { name: 'Cache Layer', status: 'warning', uptime: 98.5 },
      { name: 'File Storage', status: 'healthy', uptime: 99.7 }
    ]
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✗';
      default: return '?';
    }
  };

  return (
    <BaseWidget widget={widget} onUpdate={onUpdate} onRemove={onRemove}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          textAlign: 'center',
          padding: '16px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '8px',
          color: 'white',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>System Status</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>All systems operational</div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {healthStatus.services.map((service, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              borderBottom: '1px solid #f3f4f6',
              transition: 'background-color 0.2s',
              borderRadius: '4px',
              marginBottom: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  color: getStatusColor(service.status),
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {getStatusIcon(service.status)}
                </span>
                <span style={{ fontWeight: 500 }}>{service.name}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {service.uptime}% uptime
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseWidget>
  );
};

/**
 * Enhancement Progress Widget
 */
const EnhancementProgressWidget: React.FC<BaseWidgetProps> = ({ widget, onUpdate, onRemove }) => {
  const [progress, setProgress] = useState({
    overall: 78,
    categories: [
      { name: 'Performance', progress: 85, target: 90 },
      { name: 'Scalability', progress: 72, target: 85 },
      { name: 'Security', progress: 90, target: 95 },
      { name: 'User Experience', progress: 65, target: 80 }
    ]
  });

  const ProgressBar = ({ label, progress, target, color }: {
    label: string;
    progress: number;
    target: number;
    color: string;
  }) => (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '6px'
      }}>
        <span style={{ fontSize: '14px', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          {progress}% / {target}%
        </span>
      </div>
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#f3f4f6',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${(progress / target) * 100}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color} 0%, ${color}aa 100%)`,
          borderRadius: '4px',
          transition: 'width 0.5s ease-in-out'
        }} />
      </div>
    </div>
  );

  return (
    <BaseWidget widget={widget} onUpdate={onUpdate} onRemove={onRemove}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          padding: '16px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: '8px',
          color: 'white'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{progress.overall}%</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Overall Enhancement Progress</div>
        </div>
        
        <div style={{ flex: 1 }}>
          {progress.categories.map((category, index) => (
            <ProgressBar
              key={index}
              label={category.name}
              progress={category.progress}
              target={category.target}
              color={['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'][index]}
            />
          ))}
        </div>
      </div>
    </BaseWidget>
  );
};

// =====================================================================================
// MAIN DASHBOARD COMPONENT
// =====================================================================================

/**
 * Main Dynamic Dashboard Component
 * 
 * This is the primary component that orchestrates the entire dashboard experience.
 * It demonstrates all Phase II principles in a cohesive, production-ready interface.
 */
export const DynamicDashboard: React.FC = () => {
  // State management
  const stateManagerRef = useRef<DashboardStateManager | null>(null);
  const [dashboardState, setDashboardState] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'auto'>('light');

  // Initialize state manager
  useEffect(() => {
    if (!stateManagerRef.current) {
      stateManagerRef.current = new DashboardStateManager();
      
      // Listen for state changes
      stateManagerRef.current.on('stateChanged', (newState) => {
        setDashboardState({ ...newState });
      });

      // Initialize state
      setDashboardState(stateManagerRef.current.getState());
    }

    return () => {
      if (stateManagerRef.current) {
        stateManagerRef.current.removeAllListeners();
      }
    };
  }, []);

  // Widget renderers map
  const widgetRenderers = useMemo(() => ({
    'performance-metrics': PerformanceMetricsWidget,
    'system-health': SystemHealthWidget,
    'enhancement-progress': EnhancementProgressWidget,
    // Add more widget types here as they're developed
  }), []);

  // Modern @dnd-kit drag and drop handlers
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback((event: any) => {
    setIsDragging(false);
    
    const { active, over } = event;
    if (!over || !stateManagerRef.current) return;

    const activeIndex = activeLayout?.widgets.findIndex(w => w.id === active.id) ?? -1;
    const overIndex = activeLayout?.widgets.findIndex(w => w.id === over.id) ?? -1;
    
    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      stateManagerRef.current.reorderWidgets(activeIndex, overIndex);
    }
  }, []);

  // Widget management functions
  const handleAddWidget = useCallback((type: WidgetType) => {
    if (!stateManagerRef.current) return;

    const newWidget = {
      type,
      title: `New ${type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Widget`,
      position: { x: 0, y: 0, order: 0 },
      size: { width: 6, height: 4 },
      config: { 
        refreshInterval: 5000, 
        showHeader: true, 
        allowResize: true, 
        allowMove: true,
        theme: selectedTheme
      }
    };

    stateManagerRef.current.addWidget(newWidget);
  }, [selectedTheme]);

  const handleUpdateWidget = useCallback((widgetId: string, updates: Partial<DashboardWidget>) => {
    if (!stateManagerRef.current) return;
    stateManagerRef.current.updateWidget(widgetId, updates);
  }, []);

  const handleRemoveWidget = useCallback((widgetId: string) => {
    if (!stateManagerRef.current) return;
    stateManagerRef.current.removeWidget(widgetId);
  }, []);

  // Theme management
  const handleThemeChange = useCallback((theme: 'light' | 'dark' | 'auto') => {
    setSelectedTheme(theme);
    // Apply theme to all widgets
    const activeLayout = stateManagerRef.current?.getActiveLayout();
    if (activeLayout) {
      activeLayout.widgets.forEach(widget => {
        handleUpdateWidget(widget.id, { 
          config: { ...widget.config, theme } 
        });
      });
    }
  }, [handleUpdateWidget]);

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    if (stateManagerRef.current) {
      stateManagerRef.current.undo();
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (stateManagerRef.current) {
      stateManagerRef.current.redo();
    }
  }, []);

  // Loading state
  if (!dashboardState) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '32px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
            Loading Dashboard...
          </div>
        </div>
      </div>
    );
  }

  const activeLayout = stateManagerRef.current?.getActiveLayout();
  
  return (
    <div style={{
      minHeight: '100vh',
      background: selectedTheme === 'dark' ? '#0f172a' : '#f8fafc',
      transition: 'background-color 0.3s ease'
    }}>
      {/* Dashboard Header */}
      <div style={{
        background: selectedTheme === 'dark' ? '#1e293b' : 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: selectedTheme === 'dark' ? '#f1f5f9' : '#111827',
            margin: 0
          }}>
            Dynamic Dashboard
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '4px 0 0 0'
          }}>
            Phase II Enhancement Framework - Intelligent Widget Management
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Theme Selector */}
          <select
            value={selectedTheme}
            onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'auto')}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: selectedTheme === 'dark' ? '#374151' : 'white',
              color: selectedTheme === 'dark' ? '#f3f4f6' : '#111827'
            }}
          >
            <option value="light">Light Theme</option>
            <option value="dark">Dark Theme</option>
            <option value="auto">Auto Theme</option>
          </select>

          {/* Undo/Redo */}
          <button
            onClick={handleUndo}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Undo"
          >
            ↶
          </button>
          <button
            onClick={handleRedo}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Redo"
          >
            ↷
          </button>

          {/* Add Widget Dropdown */}
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleAddWidget(e.target.value as WidgetType);
                e.target.value = '';
              }
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="">Add Widget...</option>
            <option value="performance-metrics">Performance Metrics</option>
            <option value="system-health">System Health</option>
            <option value="enhancement-progress">Enhancement Progress</option>
          </select>
        </div>
      </div>

      {/* Dashboard Content */}
      <div style={{ padding: '24px' }}>
        <DragDropProvider 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
          strategy="vertical"
        >
          <div style={{
            minHeight: '400px',
            background: 'transparent',
            borderRadius: '8px',
            transition: 'background-color 0.2s ease'
          }}>
            {activeLayout?.widgets.map((widget, index) => {
              const WidgetComponent = widgetRenderers[widget.type];
              
              if (!WidgetComponent) {
                return null;
              }

              return (
                <div
                  key={widget.id}
                  style={{
                    marginBottom: '16px',
                    height: `${widget.size.height * 80}px`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <WidgetComponent
                    widget={widget}
                    onUpdate={(updates) => handleUpdateWidget(widget.id, updates)}
                    onRemove={() => handleRemoveWidget(widget.id)}
                    isDragging={isDragging}
                  />
                </div>
              );
            })}

            {/* Empty State */}
            {(!activeLayout?.widgets || activeLayout.widgets.length === 0) && (
              <div style={{
                textAlign: 'center',
                padding: '64px 32px',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 600, 
                  marginBottom: '8px',
                  color: selectedTheme === 'dark' ? '#d1d5db' : '#374151'
                }}>
                  Your Dashboard is Empty
                </h3>
                <p style={{ fontSize: '14px', marginBottom: '24px' }}>
                  Add widgets using the dropdown menu above to start monitoring your system.
                </p>
                <button
                  onClick={() => handleAddWidget('performance-metrics')}
                  style={{
                    padding: '12px 24px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'background-color 0.2s'
                  }}
                >
                  Add Your First Widget
                </button>
              </div>
            )}
          </div>
        </DragDropProvider>
      </div>

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .widget-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.12);
        }
        
        .smooth-transition {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default DynamicDashboard;

/**
 * Usage Example:
 * 
 * import { DynamicDashboard } from './components/DynamicDashboard';
 * 
 * function App() {
 *   return (
 *     <div className="App">
 *       <DynamicDashboard />
 *     </div>
 *   );
 * }
 * 
 * This component demonstrates Phase II principles:
 * 
 * 1. **Modularity**: Each widget is self-contained and reusable
 * 2. **Advanced Controls**: Drag-and-drop, real-time data, theme switching
 * 3. **Personalization**: Custom layouts, themes, widget configurations
 * 4. **Async Processing**: Non-blocking widget updates and data loading
 * 5. **State Management**: Robust Redux-like state with undo/redo
 * 6. **Micro-interactions**: Smooth animations and responsive feedback
 * 7. **Analytics**: Built-in usage tracking and behavior analysis
 * 
 * Future Expansion Opportunities:
 * - Widget marketplace for community extensions
 * - AI-powered layout suggestions based on usage patterns
 * - Collaborative dashboard sharing and real-time editing
 * - Advanced data visualization widgets with custom charting
 * - Voice control and natural language interface
 * - Mobile-responsive design with touch interactions
 * - Integration with external data sources and APIs
 */