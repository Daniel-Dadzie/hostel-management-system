package com.hostelmanagement.web.exception;

import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final String ERROR_KEY = "error";

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(Map.of(ERROR_KEY, ex.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
    var first = ex.getBindingResult().getFieldErrors().stream().findFirst().orElse(null);
    String msg = first == null ? "Validation error" : first.getField() + ": " + first.getDefaultMessage();
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(ERROR_KEY, msg));
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<Map<String, Object>> handleIntegrity(DataIntegrityViolationException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
      .body(Map.of(ERROR_KEY, "Request violates a database constraint"));
  }

  @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
  public ResponseEntity<Map<String, Object>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
    String method = ex.getMethod();
    var supportedHttpMethods = ex.getSupportedHttpMethods();
    String supported = supportedHttpMethods == null
        ? ""
      : supportedHttpMethods.stream().map(HttpMethod::name).reduce((a, b) -> a + ", " + b).orElse("");
    String message = supported.isBlank()
        ? "Method " + method + " is not supported for this endpoint"
        : "Method " + method + " is not supported for this endpoint. Supported methods: " + supported;
    return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(Map.of(ERROR_KEY, message));
  }

  @ExceptionHandler({NoHandlerFoundException.class, NoResourceFoundException.class})
  public ResponseEntity<Map<String, Object>> handleNotFound(Exception ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(ERROR_KEY, "Resource not found"));
  }

  @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
  public ResponseEntity<Map<String, Object>> handleBadRequest(Exception ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(ERROR_KEY, "Malformed request"));
  }

  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<Map<String, Object>> handleAuthentication(AuthenticationException ex) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(ERROR_KEY, "Unauthorized"));
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(ERROR_KEY, "Forbidden"));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of(ERROR_KEY, "Internal server error"));
  }
}
