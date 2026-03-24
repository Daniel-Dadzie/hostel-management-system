package com.hostelmanagement.web.admin;

import com.hostelmanagement.domain.AcademicTerm;
import com.hostelmanagement.service.AcademicRolloverService;
import com.hostelmanagement.service.AcademicRolloverService.AcademicTermInput;
import com.hostelmanagement.service.AcademicRolloverService.RolloverRunSummary;
import com.hostelmanagement.service.AcademicRolloverService.StudentActionResult;
import com.hostelmanagement.service.AcademicRolloverService.StudentRolloverRow;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/rollover")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRolloverController {

  private final AcademicRolloverService academicRolloverService;

  public AdminRolloverController(AcademicRolloverService academicRolloverService) {
    this.academicRolloverService = academicRolloverService;
  }

  @GetMapping("/context")
  public ResponseEntity<RolloverContextResponse> context() {
    AcademicTerm activeTerm = academicRolloverService.getRequiredActiveTerm();
    return ResponseEntity.ok(
        new RolloverContextResponse(
        activeTerm.getId(),
        activeTerm.getAcademicYear(),
        activeTerm.getSemester(),
        activeTerm.getStartDate(),
        activeTerm.getEndDate(),
        activeTerm.getReapplicationOpenDate(),
            academicRolloverService.isReapplicationWindowOpen()));
  }

    @GetMapping("/terms")
    public ResponseEntity<List<AcademicTermSummaryResponse>> terms() {
    return ResponseEntity.ok(
      academicRolloverService.listAcademicTerms().stream()
        .map(
          term ->
            new AcademicTermSummaryResponse(
              term.getId(),
              term.getAcademicYear(),
              term.getSemester(),
              term.getStartDate(),
              term.getEndDate(),
              term.getReapplicationOpenDate(),
              term.isActive()))
        .toList());
  }

  @PostMapping("/terms")
  public ResponseEntity<AcademicTermSummaryResponse> createTerm(
      @Valid @RequestBody UpsertAcademicTermRequest request) {
    AcademicTerm created = academicRolloverService.createAcademicTerm(request.toInput());
    return ResponseEntity.ok(toSummary(created));
  }

  @PutMapping("/terms/{termId}")
  public ResponseEntity<AcademicTermSummaryResponse> updateTerm(
      @PathVariable Long termId, @Valid @RequestBody UpsertAcademicTermRequest request) {
    AcademicTerm updated = academicRolloverService.updateAcademicTerm(termId, request.toInput());
    return ResponseEntity.ok(toSummary(updated));
  }

  @PostMapping("/terms/{termId}/activate")
  public ResponseEntity<AcademicTermSummaryResponse> activateTerm(@PathVariable Long termId) {
    AcademicTerm activated = academicRolloverService.activateAcademicTerm(termId);
    return ResponseEntity.ok(toSummary(activated));
  }

  @DeleteMapping("/terms/{termId}")
  public ResponseEntity<Void> deleteTerm(@PathVariable Long termId) {
    academicRolloverService.deleteAcademicTerm(termId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/students")
  public ResponseEntity<List<StudentRolloverRow>> students() {
    return ResponseEntity.ok(academicRolloverService.listStudentRolloverContext());
  }

  @PostMapping("/run")
  public ResponseEntity<RolloverRunSummary> runRollover() {
    return ResponseEntity.ok(academicRolloverService.runAnnualRollover());
  }

  @PostMapping("/students/{studentId}/promote")
  public ResponseEntity<StudentActionResult> promoteStudent(@PathVariable Long studentId) {
    return ResponseEntity.ok(academicRolloverService.promoteStudent(studentId));
  }

  @PostMapping("/students/{studentId}/retain")
  public ResponseEntity<StudentActionResult> retainStudent(@PathVariable Long studentId) {
    return ResponseEntity.ok(academicRolloverService.retainStudent(studentId));
  }

  @PostMapping("/students/{studentId}/clear-retain")
  public ResponseEntity<StudentActionResult> clearRetainStudent(@PathVariable Long studentId) {
    return ResponseEntity.ok(academicRolloverService.clearRetainStudent(studentId));
  }

  @PostMapping("/students/{studentId}/checkout")
  public ResponseEntity<StudentActionResult> checkoutStudent(@PathVariable Long studentId) {
    return ResponseEntity.ok(academicRolloverService.checkoutStudent(studentId));
  }

  @PostMapping("/students/actions/promote")
  public ResponseEntity<List<StudentActionResult>> promoteStudents(
      @Valid @RequestBody BulkStudentActionRequest request) {
    return ResponseEntity.ok(academicRolloverService.bulkPromoteStudents(request.studentIds()));
  }

  @PostMapping("/students/actions/retain")
  public ResponseEntity<List<StudentActionResult>> retainStudents(
      @Valid @RequestBody BulkStudentActionRequest request) {
    return ResponseEntity.ok(academicRolloverService.bulkRetainStudents(request.studentIds()));
  }

  @PostMapping("/students/actions/clear-retain")
  public ResponseEntity<List<StudentActionResult>> clearRetainStudents(
      @Valid @RequestBody BulkStudentActionRequest request) {
    return ResponseEntity.ok(academicRolloverService.bulkClearRetainStudents(request.studentIds()));
  }

  @PostMapping("/students/actions/checkout")
  public ResponseEntity<List<StudentActionResult>> checkoutStudents(
      @Valid @RequestBody BulkStudentActionRequest request) {
    return ResponseEntity.ok(academicRolloverService.bulkCheckoutStudents(request.studentIds()));
  }

  public record RolloverContextResponse(
      Long activeTermId,
      String academicYear,
      String semester,
      LocalDate startDate,
      LocalDate endDate,
      LocalDate reapplicationOpenDate,
      boolean reapplicationWindowOpen) {}

  public record AcademicTermSummaryResponse(
      Long id,
      String academicYear,
      String semester,
      LocalDate startDate,
      LocalDate endDate,
      LocalDate reapplicationOpenDate,
      boolean active) {}

  public record UpsertAcademicTermRequest(
      @NotBlank String academicYear,
      @NotBlank @Pattern(regexp = "^(1|2|REGULAR)$", message = "Semester must be 1, 2, or REGULAR") String semester,
      @NotNull LocalDate startDate,
      @NotNull LocalDate endDate,
      @NotNull LocalDate reapplicationOpenDate,
      boolean active) {

    public AcademicTermInput toInput() {
      return new AcademicTermInput(
          academicYear, semester, startDate, endDate, reapplicationOpenDate, active);
    }
  }

  public record BulkStudentActionRequest(@NotEmpty List<Long> studentIds) {}

  private static AcademicTermSummaryResponse toSummary(AcademicTerm term) {
    return new AcademicTermSummaryResponse(
        term.getId(),
        term.getAcademicYear(),
        term.getSemester(),
        term.getStartDate(),
        term.getEndDate(),
        term.getReapplicationOpenDate(),
        term.isActive());
  }
}
