package com.hostelmanagement.web.admin;

import com.hostelmanagement.service.AdminRoomService;
import com.hostelmanagement.web.admin.dto.UpsertRoomRequest;
import com.hostelmanagement.web.dto.RoomResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/rooms")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRoomController {

  private final AdminRoomService roomService;

  public AdminRoomController(AdminRoomService roomService) {
    this.roomService = roomService;
  }

  @GetMapping
  public ResponseEntity<List<RoomResponse>> list(@RequestParam(required = false) Long hostelId) {
    return ResponseEntity.ok(roomService.list(hostelId));
  }

  @PostMapping
  public ResponseEntity<RoomResponse> create(@Valid @RequestBody UpsertRoomRequest request) {
    return ResponseEntity.ok(roomService.create(request));
  }

  @PutMapping("/{id}")
  public ResponseEntity<RoomResponse> update(
      @PathVariable Long id, @Valid @RequestBody UpsertRoomRequest request) {
    return ResponseEntity.ok(roomService.update(id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    roomService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
