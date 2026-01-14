
# Light Mode Icons

This extension supports different icons for light and dark modes to ensure optimal visibility.

## Required Files

You need to create PNG versions of your icon optimized for light backgrounds:

- `icon-light-16.png` - 16x16 pixels
- `icon-light-32.png` - 32x32 pixels  
- `icon-light-48.png` - 48x48 pixels
- `icon-light-128.png` - 128x128 pixels

## Design Guidelines

For light mode icons, use:
- **Darker colors** (e.g., black, dark gray) for better contrast on light backgrounds
- **Higher contrast** than your dark mode icon
- **Same design** but inverted/adjusted colors

## Converting SVG to PNG

I've created SVG templates (`icon-light-*.svg`) that you can customize and convert to PNG.

### Option 1: Online Tools
- Use [CloudConvert](https://cloudconvert.com/svg-to-png) or similar
- Upload each SVG file and export as PNG at the correct size

### Option 2: Image Editor
- Open the SVG in Figma, Sketch, or Adobe Illustrator
- Export as PNG at the specified sizes
- Ensure you use the exact dimensions (16x16, 32x32, etc.)

### Option 3: Command Line (with ImageMagick)
```bash
# Install ImageMagick first: brew install imagemagick (macOS) or apt-get install imagemagick (Linux)

convert icon-light-16.svg -resize 16x16 icon-light-16.png
convert icon-light-32.svg -resize 32x32 icon-light-32.png
convert icon-light-48.svg -resize 48x48 icon-light-48.png
convert icon-light-128.svg -resize 128x128 icon-light-128.png
```

## Testing

Once you've created the PNG files:
1. Rebuild the extension: `npm run build`
2. Reload the extension in Chrome
3. Switch between light and dark themes in settings
4. The extension icon should update automatically

## Current Implementation

The background script (`src/background/index.ts`) automatically:
- Detects theme changes from settings
- Updates the extension icon when theme changes
- Sets the correct icon on extension startup

No code changes needed - just create the PNG files!
