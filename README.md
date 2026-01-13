# Tracer

> See how any website is built — colors, typography, and tech stack for design engineers

Tracer is a browser extension that analyzes websites in real-time, extracting visual design elements and technology stack information. Perfect for design engineers, developers, and curious minds who want to understand how websites are constructed.

![Tracer Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=google-chrome&logoColor=white)
![Version](https://img.shields.io/badge/version-2.2.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎨 **Color Analysis**
- Extract color palettes from any website
- Identify primary, secondary, and accent colors
- View color usage frequency and distribution
- Copy color values with one click

### 🔤 **Typography Detection**
- Discover fonts used across the site
- Preview font samples with actual text rendering
- Identify icon fonts and custom typefaces
- See font weights, sizes, and families

### 🛠️ **Tech Stack Detection**
- Detect JavaScript frameworks (React, Vue, Svelte, etc.)
- Identify UI libraries and design systems
- Discover build tools, CMS platforms, and services
- Powered by Wappalyzer technology patterns
- 3000+ technology icons

### 🔍 **Element Inspector**
- Click-to-inspect page elements
- Analyze individual components
- View computed styles and properties
- Capture element screenshots

### 🔒 **Privacy First**
- **100% local processing** — all analysis happens in your browser
- No data transmission to external servers
- No tracking or analytics
- Temporary session storage only

## 🚀 Installation

### Chrome Web Store
*Coming soon — currently in development*

### Manual Installation (Development)

1. Clone this repository:
```bash
git clone https://github.com/yourusername/tracer-v2.git
cd tracer-v2
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

5. For development with hot reload:
```bash
npm run dev
```

## 🛠️ Development

### Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animation**: Motion (Framer Motion)
- **Extension**: Chrome Extension Manifest V3
- **Icons**: 3000+ tech icons from Wappalyzer

### Project Structure

```
tracer-v2/
├── src/
│   ├── background/          # Service worker
│   ├── content/             # Content scripts
│   │   ├── extractors/      # Color, font, tech extraction
│   │   └── inspect/         # Element inspection
│   ├── sidepanel/           # React UI
│   │   └── components/      # UI components
│   └── shared/              # Shared utilities & types
├── scripts/                 # Build scripts
└── manifest.json           # Extension manifest
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Key Technologies Detected

**Frontend Frameworks**
- React, Vue, Svelte, Angular, Solid, Preact
- Next.js, Nuxt, Remix, Astro, SvelteKit

**UI Libraries**
- Material UI, Chakra UI, Ant Design, Radix UI
- Tailwind CSS, Bootstrap, styled-components

**Animation**
- Framer Motion, GSAP, Lottie, Three.js

**CMS & Site Builders**
- WordPress, Contentful, Sanity, Webflow, Framer

**And 3000+ more technologies...**

## 📖 Usage

1. **Open Tracer**: Click the Tracer icon in your Chrome toolbar
2. **Navigate**: Visit any website you want to analyze
3. **Analyze**: Click the scan button or wait for automatic analysis
4. **Explore**: Browse colors, fonts, and tech stack in the side panel
5. **Inspect**: Use the inspect tool to analyze specific elements

## 🎯 Use Cases

- **Design Engineers**: Understand design systems and color palettes
- **Developers**: Discover tech stacks and frameworks
- **Designers**: Extract typography and color inspiration
- **Product Managers**: Research competitor technologies
- **Students**: Learn how modern websites are built

## 🔧 Configuration

Tracer includes settings to customize your experience:

- **Theme**: Light or dark mode
- **Auto-scan**: Automatically scan pages on navigation
- **Deep scan**: More thorough tech detection (slower)
- **Show signals**: Highlight high-confidence detections

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Wappalyzer](https://www.wappalyzer.com/) for technology detection patterns
- [Webappanalyzer](https://github.com/enthec/webappanalyzer) for icon mappings
- All the open-source projects that make this possible

## 📧 Contact

For questions, issues, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for design engineers and curious developers**
