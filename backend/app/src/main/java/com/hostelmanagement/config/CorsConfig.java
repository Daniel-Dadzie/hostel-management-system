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

  @Value("${app.frontend-url}")
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
    
    cfg.setAllowedOrigins(allowedOrigins);
    cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    cfg.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    cfg.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", cfg);
    return source;
  }
}
