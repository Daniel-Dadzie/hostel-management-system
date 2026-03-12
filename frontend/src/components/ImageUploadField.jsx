
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

export default function ImageUploadField({
  id,
  label,
  value = '',
  onChange,
  onError = undefined,
  onClear = undefined,
  helperText = '',
  maxBytes = DEFAULT_MAX_BYTES
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

    if (file.size > maxBytes) {
      onError?.('Selected image is too large.');
      return;
    }

    setBusy(true);
    onError?.('');

    try {
      const previewUrl = URL.createObjectURL(file);
      onChange(file, previewUrl);
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
  maxBytes: PropTypes.number
};
