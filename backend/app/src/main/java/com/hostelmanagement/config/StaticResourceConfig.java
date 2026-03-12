package com.hostelmanagement.config;

import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

  private final Path uploadRoot;

  public StaticResourceConfig(@Value("${app.upload.root-dir:uploads}") String uploadRootDir) {
    this.uploadRoot = Path.of(uploadRootDir).toAbsolutePath().normalize();
  }

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    String location = uploadRoot.toUri().toString();
    registry.addResourceHandler("/uploads/**").addResourceLocations(location);
  }
}
