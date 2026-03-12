package com.hostelmanagement.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImageUploadService {

  private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");

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
    if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
      throw new IllegalArgumentException("Only image uploads are allowed");
    }

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
