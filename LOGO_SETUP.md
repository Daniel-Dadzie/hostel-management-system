# Logo Setup Instructions

## Quick Setup for University Logo

### Step 1: Prepare Your Logo File
- Format: PNG (recommended) or JPG
- Recommended size: 200x200px
- File size: Keep under 500KB (ideally < 200KB)
- Transparency: PNG with transparency works well

### Step 2: Place Logo in Resources
Copy your logo file to:
```
backend/app/src/main/resources/logo.png
```

### Step 3: Verify File Placement
The file structure should look like:
```
backend/app/src/main/resources/
├── application.yml
├── db/
├── META-INF/
└── logo.png          ← Add your logo here
```

### Step 4: Restart Backend
The logo will be automatically loaded when the application starts.

## How It Works

The `PdfAllocationLetterService` automatically:
1. ✅ Looks for `logo.png` in resources at startup
2. ✅ Loads the image if found
3. ✅ Inserts it into the PDF header (60x60px display size)
4. ✅ Continues gracefully if logo is missing

## Troubleshooting Logo Issues

### Logo Not Showing in PDF
1. Verify file name is exactly `logo.png` (case-sensitive on Linux)
2. Ensure file is in correct directory: `src/main/resources/`
3. Check file format is PNG or JPG (not TIFF, GIF, etc.)
4. Restart backend application after adding logo
5. Clear browser cache and regenerate PDF

### Logo Looks Distorted
- Check original image quality
- Verify image dimensions are square (200x200px is ideal)
- Ensure image is not corrupted
- Try a different compression level in PNG

### Large PDF File Size
- Compress logo image using online tools
- Ensure logo is < 200KB
- Consider using SVG format (if supported)

## Logo Examples

### Minimal Logo (Recommended)
- 200x200px PNG
- White background
- University name and emblem
- File size: 50-100KB

### Transparent Logo
- PNG with transparent background
- Works great on white PDF
- 200x200px
- File size: 30-80KB

## Without Logo

If you don't add a logo:
- PDFs will still generate perfectly
- All other formatting is preserved
- No error messages
- Header space will be used for university name only

## Updating Logo

To update the logo:
1. Replace the file at `src/main/resources/logo.png`
2. Restart the backend application
3. New PDFs will use the updated logo
4. Old PDFs remain unchanged (already generated)

## Multi-Hostel Logos (Future Enhancement)

Currently, one logo per installation. Future versions could support:
- Different logo per hostel
- Logo stored in database
- Dynamic logo upload in admin panel

## Quality Tips for Logo Design

### Best Practices
✅ Use PNG format with transparency  
✅ Keep aspect ratio 1:1 (square)  
✅ Use minimum 200x200px resolution  
✅ Ensure logo scales well at 60x60px (print size)  
✅ Include university name and seal  
✅ Use dark colors for good contrast  

### Avoid
❌ Very thin lines (may disappear at small sizes)  
❌ Small text (unreadable when scaled down)  
❌ Too many colors (may not print well)  
❌ Photo-based images (use vector/graphics)  

## Example Logo Use Case

### Before Adding Logo
```
┌─────────────────────────────────┐
│ University of Ghana             │
│ Admissions & Student Affairs    │
├─────────────────────────────────┤
│                                 │
│ HOSTEL ALLOCATION LETTER        │
```

### After Adding Logo
```
┌─────────────────────────────────┐
│      [LOGO]                     │
│ University of Ghana             │
│ Admissions & Student Affairs    │
├─────────────────────────────────┤
│                                 │
│ HOSTEL ALLOCATION LETTER        │
```

## Testing Logo Display

### Test Procedure
1. Add logo file to `src/main/resources/logo.png`
2. Rebuild: `mvnw clean package`
3. Start application
4. Complete a booking and payment
5. Download allocation letter PDF
6. Open PDF and verify logo appears in header
7. Print PDF to verify logo quality at actual size

## Support

If logo doesn't appear:
1. Check file exists: `backend/app/src/main/resources/logo.png`
2. Verify file format using: `file logo.png` (on Unix systems)
3. Check backend logs for any image loading errors
4. Try a different image file to isolate the issue
5. Ensure ImageDataFactory can read the file

## Technical Details

### Image Loading
- Uses iText ImageDataFactory
- Automatically detects format (PNG/JPG)
- Handles both RGB and RGBA formats
- Scales to 60x60px for display

### Fallback Behavior
If logo fails to load:
- No error is thrown
- PDF generation continues
- PDF is still valid and complete
- Only header layout adjusts slightly

### PDF Compliance
- Logo is embedded directly in PDF
- No external references
- PDF is self-contained (can be shared/printed anywhere)
- Compatible with all PDF readers
