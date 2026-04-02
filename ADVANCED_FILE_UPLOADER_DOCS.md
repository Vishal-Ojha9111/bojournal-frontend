# AdvancedFileUploader Component

## Overview
The `AdvancedFileUploader` is a feature-rich file upload component with camera capture, drag-and-drop, and image preview capabilities. It's designed for modern web applications that need flexible image upload options.

## Features

### ✨ Core Functionality
- **📷 Camera Capture**: Take photos directly using device camera
- **📁 File Gallery**: Choose images from device storage
- **🎯 Drag & Drop**: Intuitive drag-and-drop interface
- **🖼️ Image Previews**: Grid layout with hover effects
- **🗑️ Easy Deletion**: Remove images with one click
- **✅ Validation**: File type and size validation
- **📱 Responsive**: Works on mobile, tablet, and desktop

### 🎨 UI/UX Features
- Hover effects on preview images
- Loading states for uploads
- Visual feedback for drag operations
- Camera modal with live preview
- Image counter display
- Empty state messaging
- Error handling with toast notifications

## Props

```typescript
interface AdvancedFileUploaderProps {
  /** Callback when images change - receives array of File objects */
  onImagesChange: (images: File[]) => void;
  
  /** Maximum number of images allowed (default: 5) */
  maxFiles?: number;
  
  /** Maximum file size in MB (default: 5) */
  maxSizeMB?: number;
  
  /** Accepted file types (default: 'image/*') */
  accept?: string;
  
  /** URLs of existing images to display */
  existingImages?: string[];
  
  /** Callback when existing image is removed */
  onExistingImageRemove?: (url: string) => void;
}
```

## Usage Examples

### Basic Usage
```tsx
import { AdvancedFileUploader } from '@/components/ui';

function MyForm() {
  const [images, setImages] = useState<File[]>([]);

  return (
    <AdvancedFileUploader
      onImagesChange={setImages}
    />
  );
}
```

### With Existing Images
```tsx
function EditForm({ transaction }) {
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState(
    transaction.images || []
  );

  const handleRemoveExisting = (url: string) => {
    setExistingImages(prev => prev.filter(img => img !== url));
  };

  return (
    <AdvancedFileUploader
      onImagesChange={setNewImages}
      existingImages={existingImages}
      onExistingImageRemove={handleRemoveExisting}
      maxFiles={10}
      maxSizeMB={10}
    />
  );
}
```

### Custom Validation
```tsx
function StrictUploader() {
  return (
    <AdvancedFileUploader
      onImagesChange={(files) => {
        console.log(`Received ${files.length} files`);
      }}
      maxFiles={3}
      maxSizeMB={2}
      accept="image/jpeg,image/png"
    />
  );
}
```

## Camera Support

### Browser Compatibility
- ✅ Chrome/Edge (desktop & mobile)
- ✅ Firefox (desktop & mobile)
- ✅ Safari (iOS 11+)
- ⚠️ Requires HTTPS in production
- ⚠️ User must grant camera permissions

### Camera Features
- Live video preview
- Capture button with instant feedback
- Auto-stop stream on cancel
- Fallback to file picker if camera unavailable
- Error handling for permission denied

## Drag & Drop

### Supported Operations
- Drag files from desktop
- Drag from file explorer
- Visual feedback during drag
- Multiple files at once
- Validation on drop

### Visual States
- **Normal**: Gray dashed border
- **Hover**: Highlighted border
- **Dragging**: Blue background, blue border
- **Disabled**: Opacity reduced, cursor not-allowed

## Image Preview Grid

### Layout
- Responsive grid: 2 cols (mobile), 3 cols (tablet), 4 cols (desktop)
- Aspect ratio maintained (square)
- Hover effects on each image
- Delete button appears on hover
- Loading spinner during upload

### Actions
- **Click Delete**: Remove image instantly
- **Hover**: Show delete button
- **Upload Progress**: Spinning loader overlay

## Integration with Forms

### React Hook Form Example
```tsx
import { useForm } from 'react-hook-form';
import { AdvancedFileUploader } from '@/components/ui';

function TransactionForm() {
  const { setValue, watch } = useForm();
  const images = watch('images') || [];

  return (
    <form>
      <AdvancedFileUploader
        onImagesChange={(files) => setValue('images', files)}
        maxFiles={5}
      />
      
      {/* Other form fields */}
    </form>
  );
}
```

### With S3 Upload
```tsx
function UploadToS3() {
  const [files, setFiles] = useState<File[]>([]);

  const handleUpload = async () => {
    for (const file of files) {
      // Get presigned URL
      const { url, key } = await getPresignedUrl();
      
      // Upload to S3
      await fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });
      
      // Save key to database
      await saveToDatabase({ s3Key: key });
    }
  };

  return (
    <>
      <AdvancedFileUploader onImagesChange={setFiles} />
      <Button onClick={handleUpload}>Upload</Button>
    </>
  );
}
```

## Styling

### CSS Variables Used
```css
--border: Border color
--surface: Background color
--surface-hover: Hover background
--text: Text color
--muted: Muted text color
```

### Customization
The component uses Tailwind CSS classes and can be customized via:
- Tailwind config
- CSS variables for dark mode
- Wrapper className props (if added)

## Performance Considerations

### Optimization
- ✅ Object URLs cleaned up on unmount
- ✅ Camera stream stopped when modal closes
- ✅ Memoized callbacks with useCallback
- ✅ Efficient re-renders with proper dependencies

### Best Practices
- Limit `maxFiles` to reasonable number (5-10)
- Set appropriate `maxSizeMB` for your use case
- Clean up uploaded files if form submission fails
- Use loading states during actual S3 uploads

## Accessibility

### Keyboard Support
- Tab to navigate buttons
- Enter/Space to activate buttons
- Escape to close camera modal

### Screen Readers
- Proper ARIA labels on buttons
- Alt text on images
- Role attributes where needed

### Focus Management
- Visible focus indicators
- Logical tab order
- Focus trap in camera modal

## Error Handling

### Validation Errors
- File type mismatch → Toast error
- File size exceeded → Toast error
- Max files exceeded → Toast error

### Camera Errors
- Permission denied → Toast error + fallback to gallery
- Camera not available → Toast error
- General error → Console log + user-friendly message

### Network Errors
- Upload failure handling (handled by parent component)
- Retry mechanisms (implemented by parent)

## Testing

### Unit Tests
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AdvancedFileUploader } from './AdvancedFileUploader';

test('allows file selection', () => {
  const handleChange = jest.fn();
  render(<AdvancedFileUploader onImagesChange={handleChange} />);
  
  const input = screen.getByLabelText('Choose from Gallery');
  const file = new File(['image'], 'test.png', { type: 'image/png' });
  
  fireEvent.change(input, { target: { files: [file] } });
  
  expect(handleChange).toHaveBeenCalledWith([file]);
});
```

## Browser Requirements

### Minimum Versions
- Chrome/Edge: 53+
- Firefox: 36+
- Safari: 11+
- iOS Safari: 11+
- Android Chrome: 53+

### Required APIs
- File API
- Drag and Drop API
- MediaDevices API (for camera)
- Canvas API (for photo capture)
- Blob API

## Migration from Old FileUploader

### Before (Old FileUploader)
```tsx
<FileUploader
  allowedPrefixes={['transactions/']}
  onUploadComplete={handleSuccess}
  onError={handleError}
  maxFiles={1}
/>
```

### After (AdvancedFileUploader)
```tsx
<AdvancedFileUploader
  onImagesChange={(files) => {
    // Handle S3 upload in parent component
    uploadToS3(files).then(handleSuccess);
  }}
  maxFiles={5}
/>
```

### Key Differences
- **Old**: Handles S3 upload internally
- **New**: Returns File objects, parent handles upload
- **Old**: Single file only
- **New**: Multiple files supported
- **Old**: No camera support
- **New**: Built-in camera capture

## Future Enhancements

### Planned Features
- [ ] Image cropping before upload
- [ ] Image compression
- [ ] Progress bar for uploads
- [ ] Undo/redo functionality
- [ ] Bulk actions (delete all, download all)
- [ ] Image rotation
- [ ] Filters and effects

### Community Contributions
Feel free to contribute! See CONTRIBUTING.md for guidelines.

## License
MIT License - see LICENSE file for details.

## Support
For issues, questions, or feature requests, please open an issue on GitHub.
