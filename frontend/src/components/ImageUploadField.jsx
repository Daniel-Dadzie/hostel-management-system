
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

function dataUrlToFile(dataUrl, fileName) {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/data:(.*);base64/)?.[1] || 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.codePointAt(index) || 0;
  }

  return new File([bytes], fileName, { type: mime });
}

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
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  function stopCameraStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  async function openCamera() {
    onError?.('');

    if (!navigator.mediaDevices?.getUserMedia) {
      // Desktop browsers that do not expose camera APIs fall back to file chooser.
      cameraInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });

      streamRef.current = stream;
      setCameraOpen(true);
    } catch (error) {
      onError?.(
        error instanceof Error
          ? `Unable to access camera: ${error.message}`
          : 'Unable to access camera on this device/browser.'
      );
      cameraInputRef.current?.click();
    }
  }

  useEffect(() => {
    if (!cameraOpen || !videoRef.current || !streamRef.current) {
      return;
    }

    videoRef.current.srcObject = streamRef.current;
  }, [cameraOpen]);

  function closeCamera() {
    setCameraOpen(false);
    stopCameraStream();
  }

  function processSelectedFile(file) {
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

  async function handleFileSelect(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    processSelectedFile(file);
  }

  function captureFromVideo() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      onError?.('Camera is not ready yet. Please wait a moment and try again.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      onError?.('Could not capture image from camera.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const imageFile = dataUrlToFile(dataUrl, `camera-${Date.now()}.jpg`);

    closeCamera();
    processSelectedFile(imageFile);
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
          onClick={openCamera}
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

      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-xl dark:bg-neutral-900">
            <p className="mb-3 text-sm font-medium text-neutral-800 dark:text-neutral-100">Camera preview</p>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="aspect-video w-full rounded-lg bg-black object-cover"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn-primary" onClick={captureFromVideo}>
                Capture
              </button>
              <button type="button" className="btn-ghost" onClick={closeCamera}>
                Cancel
              </button>
            </div>
          </div>
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
