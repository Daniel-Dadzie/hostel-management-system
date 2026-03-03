package com.hostelmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync   // powers @Async on NotificationService
@EnableCaching // powers @Cacheable / @CacheEvict on service methods
public class HostelManagementSystemApplication {
  public static void main(String[] args) {
    SpringApplication.run(HostelManagementSystemApplication.class, args);
  }
}
