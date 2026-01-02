import type { TechInfo } from '../../shared/types';
import { TECH_PATTERNS } from '../../shared/techPatterns';

export async function extractTech(options: {
    headers?: Record<string, string>,
    mainWorldGlobals?: string[],
    mainWorldVersions?: Record<string, string>
} = {}): Promise<TechInfo[]> {
    // 1. Perform detection using passed main world results and headers
    const detected = performDetection(
        options.mainWorldGlobals || [],
        options.mainWorldVersions || {},
        options.headers || {}
    );

    return detected;
}

function performDetection(foundGlobals: string[], versions: Record<string, string>, responseHeaders: Record<string, string>): TechInfo[] {
    const findings = new Map<string, { confidence: number, version?: string }>();

    const update = (name: string, confidence: number, version?: string) => {
        const current = findings.get(name);
        if (!current || current.confidence < confidence) {
            findings.set(name, { confidence, version: version || current?.version });
        }
    };

    // 1. Headers Detection (High Confidence)
    TECH_PATTERNS.forEach(tool => {
        if (tool.patterns.headers) {
            tool.patterns.headers.forEach(h => {
                const value = responseHeaders[h.name.toLowerCase()];
                if (value !== undefined) {
                    if (h.value) {
                        if (h.value.test(value)) update(tool.name, 100);
                    } else {
                        update(tool.name, 100);
                    }
                }
            });
        }
    });

    // 2. Globals Check (High Confidence)
    TECH_PATTERNS.forEach(tool => {
        if (tool.patterns.globals) {
            if (tool.patterns.globals.some(g => foundGlobals.includes(g))) {
                update(tool.name, 100, versions[tool.name]);
            }
        }
    });

    // 3. Meta Tags (High Confidence)
    TECH_PATTERNS.forEach(tool => {
        if (tool.patterns.meta) {
            tool.patterns.meta.forEach(meta => {
                const el = document.querySelector(`meta[name="${meta.name}"], meta[property="${meta.name}"]`) as HTMLMetaElement;
                if (el) {
                    if (meta.content) {
                        try {
                            if (new RegExp(meta.content).test(el.content)) update(tool.name, 100);
                        } catch (e) { }
                    } else {
                        update(tool.name, 100);
                    }
                }
            });
        }
    });

    // 4. Scripts Analysis (High Confidence)
    const scripts = Array.from(document.querySelectorAll('script'));
    const scriptSrcs = scripts.map(s => s.src).filter(Boolean);
    TECH_PATTERNS.forEach(tool => {
        if (tool.patterns.scripts) {
            tool.patterns.scripts.forEach(regex => {
                if (scriptSrcs.some(src => regex.test(src))) update(tool.name, 100);
            });
        }
    });

    // 5. DOM Patterns (Variable Confidence)
    TECH_PATTERNS.forEach(tool => {
        if (tool.patterns.dom) {
            tool.patterns.dom.forEach(selector => {
                try {
                    // Use querySelectorAll to check all elements, not just first match
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        let confidence = 100;
                        if (['Bootstrap', 'Vuetify', 'DaisyUI'].includes(tool.name)) {
                            confidence = 70;
                        }

                        let version: string | undefined;
                        if (tool.versionDom) {
                            const versionEl = document.querySelector(tool.versionDom.selector);
                            if (versionEl) {
                                version = tool.versionDom.attribute ? versionEl.getAttribute(tool.versionDom.attribute) || undefined : versionEl.textContent || undefined;
                                if (version && tool.versionDom.regex) {
                                    const match = version.match(tool.versionDom.regex);
                                    version = match ? match[1] || match[0] : version;
                                }
                            }
                        }
                        update(tool.name, confidence, version);
                    }
                } catch (e) { }
            });
        }
    });

    // 6. Resources & Timing
    try {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        if (resources.some(r => r.name.startsWith('ws://') || r.name.startsWith('wss://'))) {
            update('WebSocket', 100);
        }
    } catch (e) { }

    // 7. Heuristics
    const html = document.documentElement.outerHTML;
    if (html.match(/class="[^"]*(\b(text|bg|border)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3})/)) {
        update('Tailwind CSS', 90);
    }
    if (document.querySelector('[data-radix-collection-item]') && html.includes('ring-offset-background')) {
        update('Shadcn UI', 90);
    }

    // 8. Implications (Recursive)
    let added = true;
    while (added) {
        added = false;
        TECH_PATTERNS.forEach(tool => {
            if (findings.has(tool.name) && tool.implies) {
                tool.implies.forEach(impliedName => {
                    if (!findings.has(impliedName)) {
                        const impliedTool = TECH_PATTERNS.find(p => p.name === impliedName);
                        if (impliedTool) {
                            update(impliedName, findings.get(tool.name)!.confidence);
                            added = true;
                        }
                    }
                });
            }
        });
    }

    // False Positive Mitigation
    if (window.location.hostname.includes('github.com')) {
        findings.delete('Bootstrap');
        findings.delete('Vuetify');
        findings.delete('DaisyUI');
    }

    // Convert to TechInfo
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
