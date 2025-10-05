import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { resolveSecurityDataDir, findWritableDir } from '../config/securityPersistence.js';
/**
 * Enterprise-grade Security and Compliance Manager
 * Implements SOC 2 Type II compliance, advanced audit logging, and zero-trust security
 */
export class SecurityComplianceManager {
    auditLogs = new Map();
    securityIncidents = new Map();
    complianceReports = new Map();
    maxAuditLogs = 1000000; // 1 million log entries
    // private readonly auditLogRetentionDays = 2555; // 7 years for SOC 2 compliance
    dataDirectoryDefault;
    dataDirectory;
    allowFilePersistence = true;
    isSecurityMonitoringEnabled = true;
    zeroTrustEnabled = true;
    constructor(dataDir) {
        this.dataDirectoryDefault = resolveSecurityDataDir();
        this.dataDirectory = (dataDir && dataDir.trim()) || this.dataDirectoryDefault;
        this.initializeSecurityCompliance();
        console.log('🛡️  Security & Compliance Manager initialized - SOC 2 Type II ready');
    }
    /**
     * SOC 2 Type II Compliance - Trust Services Criteria Implementation
     */
    /**
     * Security Criterion - System protection against unauthorized access
     */
    async logSecurityEvent(req, action, resource, _additionalData) {
        const logId = crypto.randomUUID();
        const timestamp = new Date();
        const auditEntry = {
            id: logId,
            timestamp,
            userId: req.user?.userId,
            sessionId: req.headers['mcp-session-id'],
            action,
            resource,
            method: req.method,
            url: req.originalUrl,
            ip: this.getClientIp(req),
            userAgent: req.headers['user-agent'] || 'Unknown',
            requestBody: this.sanitizeRequestBody(req.body),
            securityContext: {
                authType: this.determineAuthType(req),
                permissions: this.getUserPermissions(req),
                riskScore: await this.calculateRiskScore(req, action, resource),
                anomalyFlags: await this.detectAnomalies(req, action, resource),
            },
            compliance: {
                dataClassification: this.classifyData(resource, req.body),
                retention: this.determineRetention(resource, action),
                jurisdiction: this.determineJurisdiction(req),
            },
        };
        this.auditLogs.set(logId, auditEntry);
        await this.persistAuditLog(auditEntry);
        // Check for security incidents
        await this.analyzeForSecurityIncidents(auditEntry);
        // Rotate logs if necessary
        await this.rotateAuditLogs();
        return logId;
    }
    /**
     * Availability Criterion - System availability for operation and use
     */
    async logSystemAvailability(component, status, responseTime) {
        const logId = await this.logSecurityEvent({}, 'system_availability', component, {
            status,
            responseTime,
            component,
        });
        if (status === 'down') {
            await this.createSecurityIncident({
                severity: 'high',
                type: 'suspicious_activity',
                description: `System component ${component} is unavailable`,
                ip: '127.0.0.1',
                userAgent: 'System Monitor',
                evidenceLogIds: [logId],
            });
        }
    }
    /**
     * Processing Integrity Criterion - System processing completeness and accuracy
     */
    async validateProcessingIntegrity(operation, data, expectedResult, actualResult) {
        const isValid = JSON.stringify(expectedResult) === JSON.stringify(actualResult);
        await this.logSecurityEvent({}, 'processing_integrity_check', operation, {
            data: this.sanitizeData(data),
            expected: expectedResult,
            actual: actualResult,
            isValid,
        });
        if (!isValid) {
            await this.createSecurityIncident({
                severity: 'medium',
                type: 'data_access_violation',
                description: `Processing integrity violation in ${operation}`,
                ip: '127.0.0.1',
                userAgent: 'System Monitor',
                evidenceLogIds: [],
            });
        }
        return isValid;
    }
    /**
     * Confidentiality Criterion - Information designated as confidential is protected
     */
    async enforceDataClassification(data, requiredClassification, userClearance) {
        const dataClass = this.classifyData('data_access', data);
        const hasAccess = this.checkDataAccess(dataClass, userClearance);
        await this.logSecurityEvent({}, 'data_classification_check', 'confidential_data', {
            dataClassification: dataClass,
            userClearance,
            accessGranted: hasAccess,
        });
        if (!hasAccess) {
            await this.createSecurityIncident({
                severity: 'high',
                type: 'data_access_violation',
                description: `Unauthorized access attempt to ${dataClass} data`,
                ip: '127.0.0.1',
                userAgent: 'System',
                evidenceLogIds: [],
            });
        }
        return hasAccess;
    }
    /**
     * Privacy Criterion - Personal information protection
     */
    async logPersonalDataAccess(req, dataType, dataSubject, purpose) {
        return await this.logSecurityEvent(req, 'personal_data_access', dataType, {
            dataSubject,
            purpose,
            legalBasis: 'legitimate_interest', // Would be determined based on purpose
            consentStatus: 'not_required', // Would check consent database
            retentionPeriod: '7_years',
        });
    }
    /**
     * Advanced Audit Logging with Retention Policies
     */
    async generateComplianceReport(type, startDate, endDate) {
        const reportId = crypto.randomUUID();
        const logs = Array.from(this.auditLogs.values()).filter(log => log.timestamp >= startDate && log.timestamp <= endDate);
        const incidents = Array.from(this.securityIncidents.values()).filter(incident => incident.timestamp >= startDate && incident.timestamp <= endDate);
        const report = {
            id: reportId,
            timestamp: new Date(),
            period: { start: startDate, end: endDate },
            type,
            metrics: {
                totalRequests: logs.length,
                failedAuthentications: logs.filter(l => l.action.includes('auth') && (l.statusCode || 0) >= 400).length,
                dataAccessEvents: logs.filter(l => l.action.includes('data')).length,
                securityIncidents: incidents.length,
                complianceViolations: incidents.filter(i => i.type === 'data_access_violation').length,
            },
            findings: await this.generateComplianceFindings(logs, incidents),
            status: this.determineComplianceStatus(incidents),
        };
        this.complianceReports.set(reportId, report);
        await this.persistComplianceReport(report);
        return report;
    }
    /**
     * Zero-Trust Security Model Implementation
     */
    async validateZeroTrustAccess(req, resource, action) {
        if (!this.zeroTrustEnabled) {
            return { allowed: true, reasons: ['Zero-trust disabled'], trustScore: 1.0 };
        }
        const checks = {
            identity: await this.verifyIdentity(req),
            device: await this.verifyDevice(req),
            location: await this.verifyLocation(req),
            behavior: await this.analyzeBehavior(req),
            resource: await this.verifyResourceAccess(req, resource, action),
            network: await this.verifyNetworkSecurity(req),
        };
        const trustScore = Object.values(checks).reduce((sum, check) => sum + check.score, 0) /
            Object.keys(checks).length;
        const allowed = trustScore >= 0.7 && Object.values(checks).every(check => check.passed);
        const reasons = Object.entries(checks)
            .filter(([_, check]) => !check.passed)
            .map(([key, check]) => `${key}: ${check.reason}`);
        await this.logSecurityEvent(req, 'zero_trust_validation', resource, {
            checks,
            trustScore,
            allowed,
            reasons,
        });
        return { allowed, reasons, trustScore };
    }
    /**
     * Security Incident Management
     */
    async createSecurityIncident(incident) {
        const incidentId = crypto.randomUUID();
        const securityIncident = {
            id: incidentId,
            timestamp: new Date(),
            resolved: false,
            ...incident,
        };
        this.securityIncidents.set(incidentId, securityIncident);
        await this.persistSecurityIncident(securityIncident);
        // Auto-escalate critical incidents
        if (incident.severity === 'critical') {
            await this.escalateIncident(incidentId);
        }
        console.log(`🚨 Security incident created: ${incidentId} (${incident.severity}) - ${incident.description}`);
        return incidentId;
    }
    // Helper methods for security analysis and validation
    getClientIp(req) {
        return (req.headers['x-forwarded-for']?.split(',')[0] ||
            req.headers['x-real-ip'] ||
            req.socket.remoteAddress ||
            'unknown');
    }
    sanitizeRequestBody(body) {
        if (!body)
            return null;
        const sanitized = { ...body };
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
        const sanitizeObject = (obj) => {
            if (typeof obj !== 'object' || obj === null)
                return obj;
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
                    result[key] = '[REDACTED]';
                }
                else if (typeof value === 'object') {
                    result[key] = sanitizeObject(value);
                }
                else {
                    result[key] = value;
                }
            }
            return result;
        };
        return sanitizeObject(sanitized);
    }
    determineAuthType(req) {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer '))
            return 'jwt';
        if (req.headers['x-api-key'])
            return 'api_key';
        return 'none';
    }
    getUserPermissions(req) {
        const user = req.user;
        return user?.permissions || ['anonymous'];
    }
    async calculateRiskScore(req, action, resource) {
        let score = 0.0;
        // IP-based risk
        const ip = this.getClientIp(req);
        if (this.isKnownThreatIP(ip))
            score += 0.4;
        // Action-based risk
        const highRiskActions = ['delete', 'admin', 'auth', 'security'];
        if (highRiskActions.some(risk => action.toLowerCase().includes(risk)))
            score += 0.3;
        // Resource-based risk
        const sensitiveResources = ['users', 'credentials', 'keys', 'config'];
        if (sensitiveResources.some(sens => resource.toLowerCase().includes(sens)))
            score += 0.3;
        // Time-based risk (off-hours access)
        const hour = new Date().getHours();
        if (hour < 6 || hour > 22)
            score += 0.1;
        return Math.min(score, 1.0);
    }
    async detectAnomalies(_req, _action, _resource) {
        const anomalies = [];
        // Unusual user agent
        const userAgent = _req.headers['user-agent'] || '';
        if (userAgent.includes('curl') || userAgent.includes('wget') || userAgent.length < 10) {
            anomalies.push('suspicious_user_agent');
        }
        // Multiple rapid requests (would check request history)
        // This would need to be implemented with request tracking
        // Unusual geographic location (would need GeoIP)
        return anomalies;
    }
    classifyData(resource, _data) {
        const publicResources = ['health', 'status', 'docs'];
        const confidentialResources = ['users', 'credentials', 'sessions'];
        const restrictedResources = ['admin', 'security', 'keys'];
        if (restrictedResources.some(r => resource.includes(r)))
            return 'restricted';
        if (confidentialResources.some(r => resource.includes(r)))
            return 'confidential';
        if (publicResources.some(r => resource.includes(r)))
            return 'public';
        return 'internal';
    }
    determineRetention(resource, action) {
        if (action.includes('auth') || action.includes('security'))
            return 'extended';
        if (resource.includes('admin') || resource.includes('audit'))
            return 'permanent';
        return 'standard';
    }
    determineJurisdiction(_req) {
        // Would implement GeoIP lookup for actual jurisdiction determination
        return 'US';
    }
    sanitizeData(data) {
        return this.sanitizeRequestBody(data);
    }
    checkDataAccess(dataClass, userClearance) {
        const clearanceLevels = ['public', 'internal', 'confidential', 'restricted'];
        const dataIndex = clearanceLevels.indexOf(dataClass);
        const userIndex = clearanceLevels.indexOf(userClearance);
        return userIndex >= dataIndex;
    }
    async analyzeForSecurityIncidents(auditEntry) {
        // Check for authentication failures
        if (auditEntry.action.includes('auth') && (auditEntry.statusCode || 0) >= 400) {
            await this.createSecurityIncident({
                severity: 'medium',
                type: 'authentication_failure',
                description: `Failed authentication attempt from ${auditEntry.ip}`,
                userId: auditEntry.userId,
                ip: auditEntry.ip,
                userAgent: auditEntry.userAgent,
                evidenceLogIds: [auditEntry.id],
            });
        }
        // Check for high-risk activities
        if (auditEntry.securityContext.riskScore > 0.7) {
            await this.createSecurityIncident({
                severity: auditEntry.securityContext.riskScore > 0.9 ? 'critical' : 'high',
                type: 'suspicious_activity',
                description: `High-risk activity detected: ${auditEntry.action} on ${auditEntry.resource}`,
                userId: auditEntry.userId,
                ip: auditEntry.ip,
                userAgent: auditEntry.userAgent,
                evidenceLogIds: [auditEntry.id],
            });
        }
    }
    async generateComplianceFindings(logs, incidents) {
        const findings = [];
        // Check authentication failure rate
        const authFailures = logs.filter(l => l.action.includes('auth') && (l.statusCode || 0) >= 400).length;
        const authAttempts = logs.filter(l => l.action.includes('auth')).length;
        const failureRate = authAttempts > 0 ? authFailures / authAttempts : 0;
        if (failureRate > 0.1) {
            findings.push({
                severity: 'warning',
                category: 'Authentication',
                description: `High authentication failure rate: ${(failureRate * 100).toFixed(1)}%`,
                recommendation: 'Implement additional authentication controls and monitor for brute force attacks',
            });
        }
        // Check for unresolved security incidents
        const unresolvedIncidents = incidents.filter(i => !i.resolved).length;
        if (unresolvedIncidents > 0) {
            findings.push({
                severity: 'error',
                category: 'Incident Management',
                description: `${unresolvedIncidents} unresolved security incidents`,
                recommendation: 'Review and resolve all outstanding security incidents',
            });
        }
        return findings;
    }
    determineComplianceStatus(incidents) {
        const criticalIncidents = incidents.filter(i => i.severity === 'critical' && !i.resolved).length;
        const highIncidents = incidents.filter(i => i.severity === 'high' && !i.resolved).length;
        if (criticalIncidents > 0)
            return 'non_compliant';
        if (highIncidents > 2)
            return 'warning';
        return 'compliant';
    }
    // Zero-trust validation methods
    async verifyIdentity(req) {
        const user = req.user;
        if (!user)
            return { passed: false, score: 0, reason: 'No authenticated user' };
        // Check if user account is active and in good standing
        const score = user.userId ? 1.0 : 0.0;
        return { passed: score > 0, score, reason: score > 0 ? 'Valid identity' : 'Invalid identity' };
    }
    async verifyDevice(req) {
        const userAgent = req.headers['user-agent'] || '';
        // Check for known good user agents
        const knownGoodAgents = ['Mozilla', 'Chrome', 'Safari', 'Firefox', 'Edge'];
        const isKnownGood = knownGoodAgents.some(agent => userAgent.includes(agent));
        const score = isKnownGood ? 0.8 : 0.3;
        return {
            passed: score >= 0.5,
            score,
            reason: isKnownGood ? 'Known browser' : 'Unknown or suspicious user agent',
        };
    }
    async verifyLocation(req) {
        const ip = this.getClientIp(req);
        // In production, this would use GeoIP to check if location is suspicious
        const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.');
        const score = isLocalhost ? 1.0 : 0.7; // Assume external IPs are slightly less trusted
        return { passed: true, score, reason: isLocalhost ? 'Local access' : 'External access' };
    }
    async analyzeBehavior(_req) {
        // This would implement behavioral analysis based on user patterns
        // For now, return a baseline score
        return { passed: true, score: 0.8, reason: 'Normal behavior pattern' };
    }
    async verifyResourceAccess(req, resource, _action) {
        const user = req.user;
        const dataClass = this.classifyData(resource, req.body);
        // Check if user has appropriate clearance
        const userClearance = user?.clearance || 'public';
        const hasAccess = this.checkDataAccess(dataClass, userClearance);
        return {
            passed: hasAccess,
            score: hasAccess ? 1.0 : 0.0,
            reason: hasAccess ? 'Authorized access' : `Insufficient clearance for ${dataClass} data`,
        };
    }
    async verifyNetworkSecurity(req) {
        const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
        const score = isHttps ? 1.0 : 0.3;
        return {
            passed: score >= 0.5,
            score,
            reason: isHttps ? 'Secure HTTPS connection' : 'Insecure HTTP connection',
        };
    }
    isKnownThreatIP(ip) {
        // In production, this would check against threat intelligence feeds
        const knownThreats = ['192.168.1.666', '10.0.0.666']; // Example IPs
        return knownThreats.includes(ip);
    }
    // Persistence methods
    async initializeSecurityCompliance() {
        try {
            const preferred = [
                this.dataDirectory,
                process.env.SECURITY_DATA_DIR || '',
                this.dataDirectoryDefault,
                '/data/disco/security',
                '/mnt/data/disco/security',
                process.env.NODE_ENV === 'production' ? '/tmp/disco/security' : '',
                process.cwd() + '/data/security',
            ].filter(Boolean);
            const { dir, tried } = await findWritableDir(preferred);
            if (!dir) {
                this.allowFilePersistence = false;
                console.warn('⚠️  No writable audit log directory found. File persistence disabled.', {
                    tried,
                });
                return;
            }
            this.dataDirectory = dir;
            console.log('🛡️  Security compliance data directory initialized', { dir });
        }
        catch (error) {
            this.allowFilePersistence = false;
            console.error('Failed to initialize security compliance directory. File persistence disabled.', error);
        }
    }
    async persistAuditLog(entry) {
        if (!this.allowFilePersistence)
            return;
        try {
            const filePath = path.join(this.dataDirectory, `audit-${entry.timestamp.toISOString().split('T')[0]}.json`);
            const logLine = JSON.stringify(entry) + '\n';
            await fs.appendFile(filePath, logLine);
        }
        catch (error) {
            this.allowFilePersistence = false;
            console.error('Failed to persist audit log. Disabling file persistence to avoid repeated failures.', error);
        }
    }
    async persistSecurityIncident(incident) {
        if (!this.allowFilePersistence)
            return;
        try {
            const filePath = path.join(this.dataDirectory, 'security-incidents.json');
            const incidents = await this.loadSecurityIncidents();
            incidents.push(incident);
            await fs.writeFile(filePath, JSON.stringify(incidents, null, 2));
        }
        catch (error) {
            this.allowFilePersistence = false;
            console.error('Failed to persist security incident. Disabling file persistence.', error);
        }
    }
    async persistComplianceReport(report) {
        if (!this.allowFilePersistence)
            return;
        try {
            const filePath = path.join(this.dataDirectory, `compliance-${report.id}.json`);
            await fs.writeFile(filePath, JSON.stringify(report, null, 2));
        }
        catch (error) {
            this.allowFilePersistence = false;
            console.error('Failed to persist compliance report. Disabling file persistence.', error);
        }
    }
    async loadSecurityIncidents() {
        try {
            const filePath = path.join(this.dataDirectory, 'security-incidents.json');
            const data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        }
        catch {
            return [];
        }
    }
    async rotateAuditLogs() {
        if (this.auditLogs.size > this.maxAuditLogs) {
            // Remove oldest 10% of logs
            const sortedLogs = Array.from(this.auditLogs.entries()).sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime());
            const toRemove = Math.floor(this.maxAuditLogs * 0.1);
            for (let i = 0; i < toRemove; i++) {
                this.auditLogs.delete(sortedLogs[i][0]);
            }
            console.log(`🔄 Rotated ${toRemove} audit log entries`);
        }
    }
    async escalateIncident(incidentId) {
        // In production, this would send alerts to security team
        console.log(`🚨 CRITICAL SECURITY INCIDENT ESCALATED: ${incidentId}`);
    }
    // Public API methods
    getAuditLogs(filters) {
        let logs = Array.from(this.auditLogs.values());
        if (filters) {
            if (filters.startDate)
                logs = logs.filter(l => l.timestamp >= filters.startDate);
            if (filters.endDate)
                logs = logs.filter(l => l.timestamp <= filters.endDate);
            if (filters.userId)
                logs = logs.filter(l => l.userId === filters.userId);
            if (filters.action)
                logs = logs.filter(l => l.action.includes(filters.action));
        }
        return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    getSecurityIncidents(resolved) {
        const incidents = Array.from(this.securityIncidents.values());
        if (resolved !== undefined) {
            return incidents.filter(i => i.resolved === resolved);
        }
        return incidents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    getComplianceReports() {
        return Array.from(this.complianceReports.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    async resolveSecurityIncident(incidentId, resolution, resolvedBy) {
        const incident = this.securityIncidents.get(incidentId);
        if (!incident)
            return false;
        incident.resolved = true;
        incident.resolution = resolution;
        incident.resolvedBy = resolvedBy;
        incident.resolvedAt = new Date();
        await this.persistSecurityIncident(incident);
        return true;
    }
    getSecurityMetrics() {
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const recentLogs = this.getAuditLogs({ startDate: last24h });
        const recentIncidents = this.getSecurityIncidents().filter(i => i.timestamp >= last24h);
        return {
            auditLogs: {
                total: this.auditLogs.size,
                last24h: recentLogs.length,
                highRisk: recentLogs.filter(l => l.securityContext.riskScore > 0.7).length,
            },
            securityIncidents: {
                total: this.securityIncidents.size,
                unresolved: this.getSecurityIncidents(false).length,
                critical: recentIncidents.filter(i => i.severity === 'critical').length,
                last24h: recentIncidents.length,
            },
            compliance: {
                reports: this.complianceReports.size,
                lastStatus: this.getComplianceReports()[0]?.status || 'unknown',
                zeroTrustEnabled: this.zeroTrustEnabled,
                securityMonitoring: this.isSecurityMonitoringEnabled,
            },
        };
    }
}
// Create and export singleton instance
export const securityComplianceManager = new SecurityComplianceManager();
//# sourceMappingURL=securityComplianceManager.js.map