import sharp from 'sharp';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const iconDir = join(__dirname, '../src/assets/icons');
const sizes = [16, 32, 48, 128];

async function invertIcon(inputPath: string, outputPath: string, size: number) {
    try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();
        
        // Invert the colors (255 - pixel value for each channel)
        const { data, info } = await image
            .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .raw()
            .toBuffer({ resolveWithObject: true });
        
        // Invert RGB channels (but preserve alpha)
        const inverted = Buffer.from(data);
        for (let i = 0; i < inverted.length; i += info.channels) {
            if (info.channels === 4) {
                // RGBA: invert RGB, keep alpha
                inverted[i] = 255 - inverted[i];     // R
                inverted[i + 1] = 255 - inverted[i + 1]; // G
                inverted[i + 2] = 255 - inverted[i + 2]; // B
                // Alpha stays the same (inverted[i + 3])
            } else if (info.channels === 3) {
                // RGB: invert all
                inverted[i] = 255 - inverted[i];
                inverted[i + 1] = 255 - inverted[i + 1];
                inverted[i + 2] = 255 - inverted[i + 2];
            }
        }
        
        await sharp(inverted, {
            raw: {
                width: info.width,
                height: info.height,
                channels: info.channels
            }
        })
        .png()
        .toFile(outputPath);
        
        console.log(`✓ Created ${outputPath} (${size}x${size})`);
    } catch (error) {
        console.error(`✗ Failed to create ${outputPath}:`, error);
        throw error;
    }
}

async function main() {
    console.log('Inverting icons for light mode...\n');
    
    // Use favicon.png as the source (256x256)
    const sourcePath = join(iconDir, 'favicon.png');
    
    try {
        // Check if source exists
        await readFile(sourcePath);
        
        // Create inverted versions at different sizes
        for (const size of sizes) {
            const outputPath = join(iconDir, `icon-light-${size}.png`);
            await invertIcon(sourcePath, outputPath, size);
        }
        
        console.log('\n✓ All light mode icons created successfully!');
    } catch (error) {
        console.error('\n✗ Error:', error);
        process.exit(1);
    }
}

main();
