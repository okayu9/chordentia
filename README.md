# Chordentia

Interactive chord analysis tool built with TypeScript and Web Audio API.

## Features

- **Chord to Notes**: Input a chord name to see its component notes
- **Notes to Chord**: Select individual notes to identify possible chords
- **Audio Playback**: Play chord sounds using Web Audio API
- **Slash Chords**: Support for slash chords (e.g., C/G)
- **Sharp/Flat Notation**: Toggle between sharp and flat notation
- **Multiple Timbres**: Choose from sine, triangle, sawtooth, and square waves
- **Modern UI**: Responsive design with glassmorphism effects

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
npm install
```

### Build Commands

#### Development Build
```bash
npm run build:dev  # TypeScript compilation only
npm run dev        # Watch mode for development
```

#### Production Build (with automatic minification)
```bash
npm run build      # TypeScript + automatic minification
```

This automatically:
- Compiles TypeScript to ES2020 modules
- Minifies JavaScript and CSS
- Inlines all assets into a single HTML file
- Creates a standalone `index.html` with everything embedded

### Single-File Output

The build process creates a single, optimized HTML file (`dist/index.html`) containing all CSS and JavaScript inlined. This standalone file can be deployed anywhere or opened directly in a browser.

### File Compression Results

Final output: **Single 14KB HTML file** containing:
- Minified and inlined CSS (~6.4KB)
- Minified and inlined JavaScript (~4.8KB)  
- Optimized HTML structure
- All fonts and external resources linked via CDN

## Project Structure

```
chordentia/
├── .github/workflows/     # CI/CD configuration
│   └── ci.yml            # GitHub Actions workflow
├── src/                  # TypeScript source files
│   ├── types.ts         # Type definitions
│   ├── music-theory.ts  # Music theory logic
│   ├── audio-player.ts  # Web Audio API implementation
│   └── app.ts           # Main application logic
├── tests/               # Test files
│   ├── setup.ts        # Test setup and mocks
│   └── music-theory.test.ts # Unit tests
├── scripts/             # Build scripts
│   ├── create-prod-html.cjs  # HTML generation
│   ├── cleanup-dist.cjs     # Build cleanup
│   └── validate-build.cjs   # Build validation
├── dist/                # Build output
│   └── index.html       # Single standalone HTML file (all assets inlined)
├── index.html           # Development HTML
├── styles.css           # Source CSS
├── tsconfig.json        # TypeScript configuration
├── jest.config.js       # Jest test configuration
├── .eslintrc.json       # ESLint configuration
├── .prettierrc          # Prettier configuration
├── .gitignore           # Git ignore rules
├── DEVELOPMENT.md       # Development guide
├── CONTRIBUTING.md      # Contributing guidelines
└── package.json         # Project configuration
```

## Technology Stack

- **TypeScript**: Strict type safety and modern JavaScript features
- **Web Audio API**: Real-time audio synthesis
- **ES Modules**: Modern module system
- **Terser**: JavaScript minification
- **CleanCSS**: CSS minification
- **HTML Minifier**: HTML optimization

## Deployment

After running `npm run build`, deploy the single `dist/index.html` file:

- **GitHub Pages**: Upload `index.html` to gh-pages branch
- **Netlify**: Drag and drop the `index.html` file
- **Vercel**: Deploy the single file
- **Any web server**: Copy `index.html` to web root
- **Local use**: Open `index.html` directly in any modern browser

## Browser Compatibility

- Modern browsers with ES2020 support
- Web Audio API support required for audio features
- Responsive design works on desktop and mobile
