# Favicon Generation Guide

## Current Favicon Files

- `assets/favicon.svg` - Vector SVG favicon (primary)
- `assets/favicon.png` - PNG placeholder (needs conversion)
- `assets/favicon.ico` - ICO placeholder (needs conversion)
- `assets/apple-touch-icon.png` - Apple touch icon placeholder (needs conversion)

## How to Generate Favicon Files

### Option 1: Online Tools (Recommended)

1. **favicon.io** (https://favicon.io/)
   - Upload the `favicon.svg` file
   - Download all generated formats
   - Replace placeholder files with generated ones

2. **Convertio.co** (https://convertio.co/svg-png/)
   - Convert SVG to PNG in multiple sizes
   - Generate ICO files

### Option 2: Command Line Tools

```bash
# Using ImageMagick (if installed)
convert favicon.svg -resize 16x16 favicon-16x16.png
convert favicon.svg -resize 32x32 favicon-32x32.png
convert favicon.svg -resize 48x48 favicon-48x48.png
convert favicon.svg -resize 180x180 apple-touch-icon.png

# Using Inkscape (if installed)
inkscape favicon.svg --export-png=favicon.png --export-width=32 --export-height=32
```

### Option 3: Browser Developer Tools

1. Open `favicon.svg` in a browser
2. Right-click and "Save as" PNG
3. Use online tools to resize to required dimensions

## Required Sizes

- **16x16** - Standard favicon
- **32x32** - High-DPI favicon
- **48x48** - Windows taskbar
- **180x180** - Apple touch icon
- **192x192** - Android home screen
- **512x512** - PWA icon

## File Structure After Generation

```
assets/
├── favicon.svg          # Vector version (already created)
├── favicon.png          # 32x32 PNG version
├── favicon.ico          # Multi-size ICO file
├── apple-touch-icon.png # 180x180 PNG for iOS
└── favicon-16x16.png    # 16x16 PNG version
```

## Testing

After generating the favicon files:

1. Open `index.html` in different browsers
2. Check browser tab icon appears
3. Test on mobile devices
4. Verify PWA installation works (if implemented)

## Notes

- The SVG favicon is already working and will display in modern browsers
- PNG and ICO files are needed for older browser compatibility
- Apple touch icon is required for iOS home screen installation
- The web manifest file is already configured for PWA support 