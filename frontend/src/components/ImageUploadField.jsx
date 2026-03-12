
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';

const DEFAULT_MAX_DATA_URL_LENGTH = 50000;

export default function ImageUploadField({
  id,
  label,
  value = '',
  onChange,
  onError = undefined,
  onClear = undefined,
  helperText = '',
  maxDataUrlLength = DEFAULT_MAX_DATA_URL_LENGTH
}) {
  const uploadInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function handleFileSelect(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError?.('Please select an image file.');
      return;
    }

    setBusy(true);
    onError?.('');

    try {
      const dataUrl = await optimizeImageToDataUrl(file, maxDataUrlLength);
      onChange(dataUrl);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to process selected image.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>

      <input
        ref={uploadInputRef}
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          onClick={() => uploadInputRef.current?.click()}
          disabled={busy}
        >
          {busy ? 'Processing...' : 'Upload Image'}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => cameraInputRef.current?.click()}
          disabled={busy}
        >
          Take Picture
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={onClear}
          disabled={busy || !value}
        >
          Remove
        </button>
      </div>

      {helperText && <p className="section-subtitle text-neutral-500 dark:text-neutral-400">{helperText}</p>}

      {value && (
        <div className="mt-2 flex items-center gap-3">
          <img
            src={value}
            alt="Selected"
            className="h-16 w-24 rounded-lg object-cover"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
          <p className="body-text text-neutral-500 dark:text-neutral-400">Preview</p>
        </div>
      )}
    </div>
  );
}

ImageUploadField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onError: PropTypes.func,
  onClear: PropTypes.func,
  helperText: PropTypes.string,
  maxDataUrlLength: PropTypes.number
};

async function optimizeImageToDataUrl(file, maxDataUrlLength) {
  const originalDataUrl = await fileToDataUrl(file);
  if (originalDataUrl.length <= maxDataUrlLength) {
    return originalDataUrl;
  }

  const image = await loadImage(originalDataUrl);
  let targetWidth = image.width;
  let targetHeight = image.height;
  let quality = 0.85;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const compressed = renderCanvasDataUrl(image, targetWidth, targetHeight, quality);
    if (compressed.length <= maxDataUrlLength) {
      return compressed;
    }

    if (quality > 0.5) {
      quality -= 0.12;
    } else {
      targetWidth = Math.max(320, Math.floor(targetWidth * 0.8));
      targetHeight = Math.max(240, Math.floor(targetHeight * 0.8));
    }
  }

  throw new Error('Selected image is too large. Please choose a smaller image.');
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
        return;
      }
      reject(new Error('Could not read selected file.'));
    };
    reader.onerror = () => reject(new Error('Could not read selected file.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not process selected image.'));
    image.src = dataUrl;
  });
}

function renderCanvasDataUrl(image, width, height, quality) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to process image in this browser.');
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}
