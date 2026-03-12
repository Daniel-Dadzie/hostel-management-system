package com.hostelmanagement.web;

import com.hostelmanagement.service.ImageUploadService;
import com.hostelmanagement.web.dto.ImageUploadResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
public class ImageUploadController {

  private final ImageUploadService imageUploadService;

  public ImageUploadController(ImageUploadService imageUploadService) {
    this.imageUploadService = imageUploadService;
  }

  @PostMapping("/images")
  public ResponseEntity<ImageUploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(new ImageUploadResponse(imageUploadService.storeImage(file)));
  }
}
