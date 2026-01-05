import type { TechInfo } from '../../shared/types';
import { TECH_PATTERNS, type TechPattern } from '../../shared/techPatterns';

export async function extractTech(options: {
    headers?: Record<string, string>,
    mainWorldGlobals?: string[],
    mainWorldVersions?: Record<string, string>,
    cookies?: string
} = {}): Promise<TechInfo[]> {
    // 1. Perform detection using passed main world results and headers
    const detected = performDetection(
        options.mainWorldGlobals || [],
        options.mainWorldVersions || {},
        options.headers || {},
        options.cookies || ''
    );

    return detected;
}

function performDetection(
    foundGlobals: string[],
    versions: Record<string, string>,
    responseHeaders: Record<string, string>,
    cookieString: string
): TechInfo[] {
    const findings = new Map<string, { confidence: number, version?: string, matchedPatterns: number }>();

    const update = (name: string, confidence: number, version?: string) => {
        const current = findings.get(name);
        if (!current) {
            findings.set(name, { confidence, version, matchedPatterns: 1 });
        } else {
            // Accumulate confidence from multiple pattern matches (max 100)
            const newConfidence = Math.min(100, Math.max(current.confidence, confidence));
            findings.set(name, {
                confidence: newConfidence,
                version: version || current.version,
                matchedPatterns: current.matchedPatterns + 1
            });
        }
    };

    // Helper to get base confidence for a pattern
    const getBaseConfidence = (tool: TechPattern): number => tool.confidence ?? 100;

    // Cache frequently used DOM data
    const html = document.documentElement.outerHTML;
    const currentUrl = window.location.href;
    const scripts = Array.from(document.querySelectorAll('script'));
    const scriptSrcs = scripts.map(s => s.src).filter(Boolean);

    // Parse cookies once
    const parsedCookies = new Map<string, string>();
    if (cookieString) {
        cookieString.split(';').forEach(c => {
            const [name, ...valueParts] = c.trim().split('=');
            if (name) parsedCookies.set(name, valueParts.join('='));
        });
    }

    // Also try document.cookie as fallback
    try {
        document.cookie.split(';').forEach(c => {
            const [name, ...valueParts] = c.trim().split('=');
            if (name && !parsedCookies.has(name)) {
                parsedCookies.set(name, valueParts.join('='));
            }
        });
    } catch { /* ignore */ }

    // ========== PATTERN DETECTION ==========

    TECH_PATTERNS.forEach(tool => {
        const baseConfidence = getBaseConfidence(tool);

        // 1. URL Pattern Detection (Highest confidence - definitive)
        if (tool.patterns.url) {
            if (tool.patterns.url.some(regex => regex.test(currentUrl))) {
                update(tool.name, baseConfidence);
            }
        }

        // 2. Headers Detection (High Confidence)
        if (tool.patterns.headers) {
            tool.patterns.headers.forEach(h => {
                const value = responseHeaders[h.name.toLowerCase()];
                if (value !== undefined) {
                    if (h.value) {
                        if (h.value.test(value)) update(tool.name, baseConfidence);
                    } else {
                        update(tool.name, baseConfidence);
                    }
                }
            });
        }

        // 3. Cookies Detection (High Confidence)
        if (tool.patterns.cookies) {
            tool.patterns.cookies.forEach(cookie => {
                let matched = false;
                if (typeof cookie.name === 'string') {
                    const value = parsedCookies.get(cookie.name);
                    if (value !== undefined) {
                        matched = cookie.value ? cookie.value.test(value) : true;
                    }
                } else {
                    // Regex name matching
                    for (const [name, value] of parsedCookies) {
                        if (cookie.name.test(name)) {
                            matched = cookie.value ? cookie.value.test(value) : true;
                            if (matched) break;
                        }
                    }
                }
                if (matched) update(tool.name, baseConfidence);
            });
        }

        // 4. Globals Check (High Confidence)
        if (tool.patterns.globals) {
            if (tool.patterns.globals.some(g => foundGlobals.includes(g))) {
                update(tool.name, baseConfidence, versions[tool.name]);
            }
        }

        // 5. Meta Tags (High Confidence)
        if (tool.patterns.meta) {
            tool.patterns.meta.forEach(meta => {
                const el = document.querySelector(`meta[name="${meta.name}"], meta[property="${meta.name}"]`) as HTMLMetaElement;
                if (el) {
                    if (meta.content) {
                        try {
                            if (new RegExp(meta.content).test(el.content)) update(tool.name, baseConfidence);
                        } catch { /* ignore */ }
                    } else {
                        update(tool.name, baseConfidence);
                    }
                }
            });
        }

        // 6. Scripts Analysis (High Confidence)
        if (tool.patterns.scripts) {
            tool.patterns.scripts.forEach(regex => {
                const matchedSrc = scriptSrcs.find(src => regex.test(src));
                if (matchedSrc) {
                    let version: string | undefined;
                    // Try to extract version from script src if versionScript is defined
                    if (tool.versionScript) {
                        const match = matchedSrc.match(tool.versionScript);
                        if (match?.[1]) version = match[1];
                    }
                    update(tool.name, baseConfidence, version);
                }
            });
        }

        // 7. DOM Patterns (Variable Confidence)
        if (tool.patterns.dom) {
            tool.patterns.dom.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        // Use pattern-defined confidence or apply heuristic reduction for common patterns
                        let confidence = baseConfidence;
                        if (baseConfidence === 100 && ['Bootstrap', 'Vuetify', 'DaisyUI'].includes(tool.name)) {
                            confidence = 70;
                        }

                        let version: string | undefined;
                        if (tool.versionDom) {
                            const versionEl = document.querySelector(tool.versionDom.selector);
                            if (versionEl) {
                                version = tool.versionDom.attribute
                                    ? versionEl.getAttribute(tool.versionDom.attribute) || undefined
                                    : versionEl.textContent || undefined;
                                if (version && tool.versionDom.regex) {
                                    const match = version.match(tool.versionDom.regex);
                                    version = match ? match[1] || match[0] : version;
                                }
                            }
                        }
                        update(tool.name, confidence, version);
                    }
                } catch { /* ignore invalid selectors */ }
            });
        }

        // 8. HTML Pattern Detection (Medium-High Confidence)
        if (tool.patterns.html) {
            tool.patterns.html.forEach(regex => {
                if (regex.test(html)) {
                    // HTML patterns are slightly less confident than direct detection
                    update(tool.name, Math.min(baseConfidence, 90));
                }
            });
        }

        // 9. CSS Pattern Detection (Medium Confidence)
        if (tool.patterns.css) {
            try {
                const styleSheets = Array.from(document.styleSheets);
                for (const sheet of styleSheets) {
                    try {
                        // Only check inline styles (CORS prevents reading external)
                        if (sheet.ownerNode && (sheet.ownerNode as HTMLStyleElement).textContent) {
                            const cssText = (sheet.ownerNode as HTMLStyleElement).textContent || '';
                            if (tool.patterns.css.some(regex => regex.test(cssText))) {
                                update(tool.name, Math.min(baseConfidence, 85));
                                break;
                            }
                        }
                    } catch { /* CORS */ }
                }
            } catch { /* ignore */ }
        }
    });

    // ========== HEURISTICS ==========

    // 10. Resources & Timing (WebSocket detection)
    try {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        if (resources.some(r => r.name.startsWith('ws://') || r.name.startsWith('wss://'))) {
            update('WebSocket', 100);
        }
    } catch { /* ignore */ }

    // 11. Advanced Heuristics
    // Tailwind CSS detection via class patterns
    if (html.match(/class="[^"]*\b(text|bg|border|flex|grid|p|m|w|h)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}\b/)) {
        update('Tailwind CSS', 90);
    }

    // Shadcn UI detection (Radix + specific Tailwind patterns)
    if (document.querySelector('[data-radix-collection-item]') && html.includes('ring-offset-background')) {
        update('Shadcn UI', 90);
    }

    // ========== REQUIREMENTS CHECK ==========
    // Remove findings that don't meet their requirements
    TECH_PATTERNS.forEach(tool => {
        if (tool.requires && findings.has(tool.name)) {
            const allRequirementsMet = tool.requires.every(req => findings.has(req));
            if (!allRequirementsMet) {
                findings.delete(tool.name);
            }
        }
    });

    // ========== IMPLICATIONS (Recursive) ==========
    let added = true;
    while (added) {
        added = false;
        TECH_PATTERNS.forEach(tool => {
            if (findings.has(tool.name) && tool.implies) {
                tool.implies.forEach(impliedName => {
                    if (!findings.has(impliedName)) {
                        const impliedTool = TECH_PATTERNS.find(p => p.name === impliedName);
                        if (impliedTool) {
                            // Implied tech gets slightly lower confidence
                            const parentConfidence = findings.get(tool.name)!.confidence;
                            update(impliedName, Math.min(parentConfidence, 80));
                            added = true;
                        }
                    }
                });
            }
        });
    }

    // ========== EXCLUSIONS ==========
    // Remove excluded technologies
    TECH_PATTERNS.forEach(tool => {
        if (tool.excludes && findings.has(tool.name)) {
            tool.excludes.forEach(excluded => {
                findings.delete(excluded);
            });
        }
    });

    // ========== FALSE POSITIVE MITIGATION ==========
    if (window.location.hostname.includes('github.com')) {
        findings.delete('Bootstrap');
        findings.delete('Vuetify');
        findings.delete('DaisyUI');
    }

    // Prevent duplicate v0 entries
    if (findings.has('v0')) {
        findings.delete('Vercel v0');
    }

    // ========== CONVERT TO TechInfo ==========
    return Array.from(findings.entries()).map(([name, data]) => {
        const pattern = TECH_PATTERNS.find(p => p.name === name)!;
        return {
            name,
            confidence: data.confidence,
            version: data.version,
            category: pattern.category,
            isSignal: pattern.isSignal,
            url: pattern.url
        };
    });
}
