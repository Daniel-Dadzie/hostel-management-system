package com.hostelmanagement.config;

import java.util.concurrent.Executor;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * Configures the thread pool used for all {@code @Async} tasks.
 *
 * <p>Sizing rationale:
 * <ul>
 *   <li>corePoolSize=4  — always-alive threads for hot-path notifications</li>
 *   <li>maxPoolSize=20  — burst capacity during the semester "booking rush"</li>
 *   <li>queueCapacity=100 — backlog buffer before tasks are rejected</li>
 * </ul>
 * Tasks that exceed the queue trigger RejectedExecutionException; callers
 * (e.g. {@link com.hostelmanagement.service.NotificationService}) catch and log.
 */
@Configuration
public class AsyncConfig implements AsyncConfigurer {

  @Bean(name = "taskExecutor")
  @Override
  public Executor getAsyncExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(4);
    executor.setMaxPoolSize(20);
    executor.setQueueCapacity(100);
    executor.setThreadNamePrefix("hostel-async-");
    executor.setWaitForTasksToCompleteOnShutdown(true);
    executor.setAwaitTerminationSeconds(30);
    executor.initialize();
    return executor;
  }

  /** Prevent uncaught async exceptions from being silently swallowed. */
  @Override
  public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
    return (ex, method, params) ->
        System.err.printf("[ASYNC ERROR] %s threw: %s%n", method.getName(), ex.getMessage());
  }
}
