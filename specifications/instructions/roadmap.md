# Roadmap Development Instructions for AI Agent

## Overview
This document provides instructions for AI agents on how to create, maintain, and update project roadmaps effectively. Use these guidelines when managing project progress tracking and future planning.

## Roadmap Framework

### 1. Project Status Classification

**Status Indicators**
- ✅ **Complete**: Fully implemented, tested, and deployed
- 🚧 **In Progress**: Active development or partially complete
- ⚠️ **Issues**: Implementation exists but has known problems
- ❌ **Not Started**: No implementation or planning begun
- 📅 **Planned**: Scheduled for future development

### 2. Progress Tracking Structure

**High-Level Organization**
```markdown
## Current Status: [Status Icon] [Phase Name]

### ✅ Completed [Category]
- [x] Specific deliverable with status
- [x] Another deliverable with detailed status

### 🚧 In Progress [Category]  
- [x] Completed parts
- [ ] Active work items
- [ ] Remaining work

### 📅 Planned [Category]
- [ ] Future deliverable 1
- [ ] Future deliverable 2
```

**Detailed Implementation Tracking**
```markdown
### Feature Completion Status
| Feature Category | Planned | Structured | Implemented | Tested | Production Ready |
|------------------|---------|------------|-------------|---------|------------------|
| Authentication | 5 endpoints | ✅ 5 | ✅ 5 | ⚠️ 2 | ✅ 5 |
| API Operations | 6 endpoints | ✅ 6 | ❌ 0 | ❌ 0 | ❌ 0 |
```

### 3. Risk Assessment Framework

**Risk Categories**
- **High Priority**: Core functionality blockers
- **Medium Priority**: Performance or usability issues  
- **Low Priority**: Nice-to-have improvements

**Risk Documentation Template**
```markdown
**[Risk Name]**
- **Risk**: [Description of the risk]
- **Impact**: [What happens if risk materializes]
- **Mitigation**: [Steps to prevent or minimize risk]
- **Status**: [Current risk status]
```

## Roadmap Maintenance Process

### 1. Regular Updates

**Weekly Review Process**
1. **Status Assessment**: Review all items for status changes
2. **Progress Measurement**: Update completion percentages
3. **Risk Evaluation**: Assess new risks and mitigation progress
4. **Timeline Adjustment**: Update dates based on actual progress
5. **Next Actions**: Define specific next steps for upcoming week

**Monthly Strategic Review**
1. **Phase Evaluation**: Assess overall phase completion
2. **Scope Adjustment**: Add/remove features based on learnings
3. **Resource Reallocation**: Adjust team focus areas
4. **Stakeholder Communication**: Update external stakeholders

### 2. Implementation Gap Analysis

**Current vs. Planned Analysis**
```markdown
### 🚧 Critical Implementation Gaps Identified

**High Priority - [Category] Missing**
- [ ] **[Specific Gap]**
  - Current: [What exists now]
  - Required: [What's actually needed]
  - Impact: [Effect on project]
  - Effort: [Time estimate]
```

**Technical Debt Documentation**
- Document when shortcuts were taken
- Estimate effort required to address properly
- Prioritize debt based on impact and risk
- Create specific action items for resolution

### 3. Success Metrics Integration

**Performance Metrics Tracking**
```markdown
### Current Performance Status
| Metric | Target | Current Status | Notes |
|--------|---------|----------------|--------|
| Response Time | < 500ms | ~50ms (stubbed) | Real implementation needed |
| Uptime | > 99.5% | ~99% | Good baseline |
```

**Feature Completion Metrics**
- Track percentage completion by category
- Monitor testing coverage by feature
- Measure deployment readiness by component

## Roadmap Communication

### 1. Audience-Specific Views

**Executive Summary** (for stakeholders)
- High-level progress and major milestones
- Key risks and mitigation strategies
- Timeline and resource requirements
- Success metrics and business impact

**Technical Detail** (for development team)
- Specific implementation requirements
- Technical debt and architecture decisions
- Testing and deployment procedures
- Performance and security considerations

### 2. Progress Reporting

**Status Updates Format**
```markdown
**Last Updated**: [Date]
**Version**: [Version number]
**Status**: [Current phase and progress]
**Next Milestone**: [Next major deliverable and target date]
```

**Change Documentation**
- Document all significant changes to scope or timeline
- Explain rationale for changes
- Update affected stakeholders
- Maintain historical record of decisions

## Best Practices

### 1. Accuracy and Honesty

**Realistic Assessment**
- Don't mark items complete unless fully functional
- Distinguish between "structured" (endpoints exist) and "implemented" (working)
- Include technical debt and known issues
- Be honest about implementation gaps

**Evidence-Based Status**
- Test implementations before marking complete
- Verify functionality under realistic conditions
- Document known limitations and workarounds
- Include performance metrics where available

### 2. Actionable Next Steps

**Specific Action Items**
```markdown
### Next Steps for Completion

### Week 1-2: [Phase Name]
1. **Day 1-2**: [Specific deliverable]
2. **Day 3-4**: [Another specific deliverable]
3. **Day 5-7**: [Final deliverable with details]
```

**Clear Ownership and Timeline**
- Assign specific ownership for each action item
- Provide realistic time estimates
- Include dependencies and prerequisites
- Define success criteria for each item

### 3. Continuous Improvement

**Roadmap Evolution**
- Regular retrospectives on roadmap accuracy
- Process improvements based on lessons learned
- Template updates to better serve project needs
- Integration with project management tools

**Stakeholder Feedback**
- Regular review sessions with stakeholders
- Feedback incorporation process
- Communication effectiveness assessment
- Roadmap utility evaluation

## Integration with Development Process

### 1. Sprint Planning Integration

**Sprint Goal Alignment**
- Link sprint goals to roadmap phases
- Ensure sprint deliverables update roadmap status
- Use roadmap to prioritize sprint backlog
- Track sprint progress against roadmap timeline

### 2. Technical Documentation Links

**Architecture Decision Records**
- Link roadmap items to detailed technical specifications
- Reference implementation guides and tutorials
- Connect to code repositories and deployment procedures
- Maintain traceability from roadmap to code

### 3. Quality Assurance Integration

**Testing Strategy Alignment**
- Link testing requirements to roadmap features
- Track test coverage by roadmap component
- Include quality gates in roadmap milestones
- Monitor production metrics against roadmap targets

This framework ensures roadmaps remain accurate, actionable, and valuable for project management while providing clear guidance for development teams and stakeholders.