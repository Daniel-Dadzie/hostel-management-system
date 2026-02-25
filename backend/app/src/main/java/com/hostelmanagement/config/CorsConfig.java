package com.hostelmanagement.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

  @Value("${app.frontend-url:http://localhost:5173}")
  private String frontendUrl;

  @Value("${app.cors.allowed-origins:}")
  private String additionalOrigins;

  @Bean
  CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration cfg = new CorsConfiguration();
    
    // Parse additional origins from comma-separated config
    List<String> allowedOrigins = new java.util.ArrayList<>();
    allowedOrigins.add(frontendUrl);
    
    if (additionalOrigins != null && !additionalOrigins.isBlank()) {
      Arrays.stream(additionalOrigins.split(","))
          .map(String::trim)
          .filter(s -> !s.isEmpty())
          .forEach(allowedOrigins::add);
    }
    
    // In development, allow common localhost ports
    if (isDevelopmentEnvironment()) {
      allowedOrigins.addAll(List.of(
          "http://localhost:5173",
          "http://localhost:3000",
          "http://localhost:3001",
          "http://127.0.0.1:5173",
          "http://127.0.0.1:3000",
          "http://127.0.0.1:3001"
      ));
    }
    
    cfg.setAllowedOrigins(allowedOrigins);
    cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    cfg.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    cfg.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", cfg);
    return source;
  }
  
  private boolean isDevelopmentEnvironment() {
    String env = System.getProperty("spring.profiles.active", "");
    // Only allow development CORS origins when explicitly in dev/local mode
    // Empty profile defaults to production for security
    if (env.isEmpty()) {
      return false;
    }
    // Split by comma for multiple profiles and check each one
    // Use contains check to catch variations like "development", "dev-local", etc.
    return Arrays.stream(env.split(","))
        .map(String::trim)
        .map(String::toLowerCase)
        .anyMatch(profile -> profile.contains("dev") || profile.contains("local"));
  }
}
