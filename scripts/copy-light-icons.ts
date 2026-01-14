import { copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src/assets/icons');
const distDir = join(rootDir, 'dist/src/assets/icons');
const sizes = [16, 32, 48, 128];

async function copyIcons() {
    console.log('Copying light mode icons to dist...\n');
    
    // Ensure dist directory exists
    await mkdir(distDir, { recursive: true });
    
    let copied = 0;
    for (const size of sizes) {
        const srcFile = join(srcDir, `icon-light-${size}.png`);
        const dstFile = join(distDir, `icon-light-${size}.png`);
        
        if (existsSync(srcFile)) {
            await copyFile(srcFile, dstFile);
            console.log(`✓ Copied icon-light-${size}.png`);
            copied++;
        } else {
            console.warn(`⚠ icon-light-${size}.png not found in src`);
        }
    }
    
    console.log(`\n✓ Copied ${copied}/${sizes.length} icons`);
}

copyIcons().catch(console.error);
