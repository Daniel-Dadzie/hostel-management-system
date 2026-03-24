package com.hostelmanagement.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImageUploadService {

  private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");
  private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp"
  );
  // Magic bytes for image validation
  private static final Map<String, byte[]> MAGIC_BYTES = Map.of(
      "jpg", new byte[] { (byte) 0xFF, (byte) 0xD8, (byte) 0xFF },
      "jpeg", new byte[] { (byte) 0xFF, (byte) 0xD8, (byte) 0xFF },
      "png", new byte[] { (byte) 0x89, 'P', 'N', 'G' },
      "gif", new byte[] { 'G', 'I', 'F', '8' },
      "webp", new byte[] { 'R', 'I', 'F', 'F' }
  );

  private final Path uploadRoot;
  private final long maxBytes;

  public ImageUploadService(
      @Value("${app.upload.root-dir:uploads}") String uploadRootDir,
      @Value("${app.upload.max-image-bytes:5242880}") long maxBytes) {
    this.uploadRoot = Path.of(uploadRootDir).toAbsolutePath().normalize();
    this.maxBytes = maxBytes;
  }

  public String storeImage(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("Image file is required");
    }

    if (file.getSize() > maxBytes) {
      throw new IllegalArgumentException("Image is too large");
    }

    String contentType = file.getContentType();
    if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
      throw new IllegalArgumentException("Only image uploads are allowed");
    }

    // Validate using magic bytes (file signature)
    validateMagicBytes(file, detectExtension(file.getOriginalFilename()));

    String extension = detectExtension(file.getOriginalFilename());
    String safeFileName = UUID.randomUUID() + "." + extension;

    Path imagesDir = uploadRoot.resolve("images").normalize();
    Path target = imagesDir.resolve(safeFileName).normalize();

    if (!target.startsWith(imagesDir)) {
      throw new IllegalArgumentException("Invalid upload path");
    }

    try {
      Files.createDirectories(imagesDir);
      Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
      return "/uploads/images/" + safeFileName;
    } catch (IOException ex) {
      throw new IllegalStateException("Failed to store uploaded image", ex);
    }
  }

  private void validateMagicBytes(MultipartFile file, String extension) {
    try {
      byte[] header = new byte[4];
      java.io.InputStream is = file.getInputStream();
      int bytesRead = is.read(header);
      is.close();

      if (bytesRead < 4) {
        throw new IllegalArgumentException("Invalid image file");
      }

      byte[] expected = MAGIC_BYTES.get(extension.toLowerCase(Locale.ROOT));
      if (expected == null) {
        return; // Skip validation for unknown extensions
      }

      boolean matches = true;
      for (int i = 0; i < expected.length && i < header.length; i++) {
        if (expected[i] != header[i]) {
          matches = false;
          break;
        }
      }

      // Special handling for JPEG (can have different signatures)
      if (extension.equalsIgnoreCase("jpg") || extension.equalsIgnoreCase("jpeg")) {
        matches = (header[0] == (byte) 0xFF && header[1] == (byte) 0xD8);
      }

      // Special handling for WebP (RIFF....WEBP)
      if (extension.equalsIgnoreCase("webp")) {
        matches = (header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F');
        if (matches && bytesRead >= 12) {
          // Check for WEBP in bytes 8-11
          matches = (header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P');
        }
      }

      if (!matches) {
        throw new IllegalArgumentException("Invalid image file format");
      }
    } catch (IOException ex) {
      throw new IllegalArgumentException("Failed to validate image file");
    }
  }

  private static String detectExtension(String originalFilename) {
    if (originalFilename == null || originalFilename.isBlank()) {
      return "jpg";
    }

    int idx = originalFilename.lastIndexOf('.');
    if (idx < 0 || idx == originalFilename.length() - 1) {
      return "jpg";
    }

    String ext = originalFilename.substring(idx + 1).toLowerCase(Locale.ROOT);
    if (!ALLOWED_EXTENSIONS.contains(ext)) {
      throw new IllegalArgumentException("Unsupported image format");
    }

    return ext;
  }
}
