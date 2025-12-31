import type { TechInfo } from '../../shared/types';
import { TECH_PATTERNS } from '../../shared/techPatterns';

export async function extractTech(): Promise<TechInfo[]> {
    // Poll for a short period to allow frameworks (React/Ember) to initialize on heavy SPAs like LinkedIn
    const MAX_RETRIES = 10;
    const INTERVAL = 200;

    for (let i = 0; i < MAX_RETRIES; i++) {
        const detected = performDetection();
        // If we found a framework or signal, we can probably return, but let's wait a bit to collect everything
        // Or if it's the last try, return what we have.
        if (i === MAX_RETRIES - 1 || detected.some(t => t.category === 'js-framework' || t.category === 'web-framework')) {
            // We found a major framework, wait one more tick to be safe then return
            if (detected.length > 0) return detected;
        }
        await new Promise(r => setTimeout(r, INTERVAL));
    }

    return performDetection();
}

function performDetection(): TechInfo[] {
    const detected: TechInfo[] = [];

    // Helper to add detection
    const add = (name: string, confidence: number) => {
        const pattern = TECH_PATTERNS.find(p => p.name === name);
        if (pattern) {
            detected.push({
                name: pattern.name,
                confidence,
                category: pattern.category,
                isSignal: pattern.isSignal,
                url: pattern.url
            });
        }
    };

    // 1. Globals Check
    const w = window as any;
    TECH_PATTERNS.forEach(tool => {
        if (tool.patterns.globals) {
            tool.patterns.globals.forEach(global => {
                const parts = global.split('.');
                let current = w;
                let found = true;
                for (const part of parts) {
                    if (current && current[part]) {
                        current = current[part];
                    } else {
                        found = false;
                        break;
                    }
                }
                if (found) add(tool.name, 100);
            });
        }
    });

    // 2. DOM Selectors
    TECH_PATTERNS.forEach(tool => {
        if (tool.patterns.dom) {
            tool.patterns.dom.forEach(selector => {
                if (document.querySelector(selector)) {
                    add(tool.name, 100, `dom:${selector}`);
                }
            });
        }
    });

    // 3. Scripts Analysis
    const scripts = Array.from(document.querySelectorAll('script'));
    scripts.forEach(script => {
        const src = script.src;
        if (!src) return;

        TECH_PATTERNS.forEach(tool => {
            if (tool.patterns.scripts) {
                tool.patterns.scripts.forEach(regex => {
                    if (regex.test(src)) {
                        add(tool.name, 100, `script-src`);
                    }
                });
            }
        });
    });

    // 4. Meta Tags
    TECH_PATTERNS.forEach(tool => {
        if (tool.patterns.meta) {
            tool.patterns.meta.forEach(meta => {
                const el = document.querySelector(`meta[name="${meta.name}"]`) as HTMLMetaElement;
                if (el) {
                    if (meta.content) {
                        if (meta.content.test(el.content)) {
                            add(tool.name, 100, `meta:${meta.name}`);
                        }
                    } else {
                        add(tool.name, 100, `meta:${meta.name}`);
                    }
                }
            });
        }
    });

    // 5. Special Heuristics (Tailwind, Bootstrap, etc.)
    const html = document.documentElement.outerHTML;

    // Tailwind: Look for specific class patterns
    // flex, grid, p-4, m-1 etc are too generic.
    // Look for more specific utility combinations or specific classes
    if (html.match(/class="[^"]*(\b(text|bg|border)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3})/)) {
        add('Tailwind CSS', 90, 'heuristic:classes');
    }

    // Bootstrap
    if (html.match(/class="[^"]*\b(container-fluid|row|col-[a-z]{2}-\d+|btn-primary|navbar-expand)/)) {
        add('Bootstrap', 90, 'heuristic:classes');
    }

    // Deduplicate
    const unique = new Map<string, TechInfo>();
    detected.forEach(t => {
        const existing = unique.get(t.name);
        if (!existing || t.confidence > existing.confidence) {
            unique.set(t.name, t);
        }
    });

    return Array.from(unique.values());
}
