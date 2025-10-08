import fs from 'node:fs/promises';
import path from 'node:path';
const trimSlash = (s) => s.replace(/\/+$/, '');
export function resolveSecurityDataDir() {
    const envDir = process.env.SECURITY_DATA_DIR?.trim();
    if (envDir)
        return envDir;
    const railwayMount = process.env.RAILWAY_VOLUME_MOUNT_PATH?.trim();
    if (railwayMount)
        return path.join(trimSlash(railwayMount), 'disco', 'security');
    // Prefer common mount points
    // Note: actual writability is checked later
    const common = '/data/disco/security';
    if (process.env.NODE_ENV === 'production') {
        // Production fallback to /tmp (ephemeral)
        return '/tmp/disco/security';
    }
    // Dev fallback
    return common; // will ultimately fall back to project ./data/security if needed
}
export async function findWritableDir(candidates) {
    const tried = [];
    for (const c of candidates) {
        if (!c)
            continue;
        const dir = path.resolve(c);
        tried.push(dir);
        try {
            await fs.mkdir(dir, { recursive: true });
            const test = path.join(dir, '.write-test');
            await fs.writeFile(test, 'ok');
            await fs.unlink(test);
            return { dir, tried };
        }
        catch {
            // try next
        }
    }
    return { dir: null, tried };
}
//# sourceMappingURL=securityPersistence.js.map