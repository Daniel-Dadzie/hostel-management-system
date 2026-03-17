package com.hostelmanagement.web;

import com.hostelmanagement.security.JwtUser;
import com.hostelmanagement.service.UserProfileService;
import com.hostelmanagement.web.dto.UpdateUserProfileRequest;
import com.hostelmanagement.web.dto.UserProfileResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

  private final UserProfileService userProfileService;

  public ProfileController(UserProfileService userProfileService) {
    this.userProfileService = userProfileService;
  }

  @GetMapping
  public ResponseEntity<UserProfileResponse> me(@AuthenticationPrincipal JwtUser user) {
    return ResponseEntity.ok(userProfileService.get(user.userId()));
  }

  @PutMapping
  public ResponseEntity<UserProfileResponse> update(
      @AuthenticationPrincipal JwtUser user, @Valid @RequestBody UpdateUserProfileRequest request) {
    return ResponseEntity.ok(userProfileService.update(user.userId(), request));
  }
}
