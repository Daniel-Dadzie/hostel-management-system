package com.hostelmanagement.web.admin;

import com.hostelmanagement.service.AdminHostelService;
import com.hostelmanagement.web.admin.dto.UpsertHostelRequest;
import com.hostelmanagement.web.dto.HostelResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/hostels")
@PreAuthorize("hasRole('ADMIN')")
public class AdminHostelController {

  private final AdminHostelService hostelService;

  public AdminHostelController(AdminHostelService hostelService) {
    this.hostelService = hostelService;
  }

  @GetMapping
  public ResponseEntity<List<HostelResponse>> list(@RequestParam(required = false) Boolean active) {
    return ResponseEntity.ok(hostelService.list(active));
  }

  @PostMapping
  public ResponseEntity<HostelResponse> create(@Valid @RequestBody UpsertHostelRequest request) {
    return ResponseEntity.ok(hostelService.create(request));
  }

  @PutMapping("/{id}")
  public ResponseEntity<HostelResponse> update(
      @PathVariable Long id, @Valid @RequestBody UpsertHostelRequest request) {
    return ResponseEntity.ok(hostelService.update(id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deactivate(@PathVariable Long id) {
    hostelService.deactivate(id);
    return ResponseEntity.noContent().build();
  }
}
