package com.hostelmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HostelManagementSystemApplication {
  public static void main(String[] args) {
    SpringApplication.run(HostelManagementSystemApplication.class, args);
  }
}
