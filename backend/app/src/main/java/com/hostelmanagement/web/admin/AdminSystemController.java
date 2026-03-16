package com.hostelmanagement.web.admin;

import java.time.Instant;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/system")
@PreAuthorize("hasRole('ADMIN')")
@Profile("dev")
public class AdminSystemController {

  private static final String HOST_KEY = "host";
  private static final String PORT_KEY = "port";
  private static final String DATABASE_KEY = "database";
  private static final Pattern MYSQL_JDBC_PATTERN =
      Pattern.compile("^jdbc:mysql://([^:/?]+)(?::(\\d+))?/([^?;]+).*$");

  private final Environment environment;

  public AdminSystemController(Environment environment) {
    this.environment = environment;
  }

  @GetMapping("/db-info")
  public ResponseEntity<Map<String, Object>> dbInfo() {
    String datasourceUrl = environment.getProperty("spring.datasource.url", "");
    Map<String, String> parsed = parseMysqlJdbcUrl(datasourceUrl);

    Map<String, Object> response = new LinkedHashMap<>();
    response.put(HOST_KEY, parsed.get(HOST_KEY));
    response.put(PORT_KEY, parsed.get(PORT_KEY));
    response.put(DATABASE_KEY, parsed.get(DATABASE_KEY));
    response.put("activeProfiles", Arrays.asList(environment.getActiveProfiles()));
    response.put("cacheType", environment.getProperty("spring.cache.type", ""));
    response.put("timestamp", Instant.now().toString());

    return ResponseEntity.ok(response);
  }

  private static Map<String, String> parseMysqlJdbcUrl(String jdbcUrl) {
    Map<String, String> result = new LinkedHashMap<>();
    result.put(HOST_KEY, "");
    result.put(PORT_KEY, "");
    result.put(DATABASE_KEY, "");

    if (jdbcUrl == null || jdbcUrl.isBlank()) {
      return result;
    }

    Matcher matcher = MYSQL_JDBC_PATTERN.matcher(jdbcUrl);
    if (!matcher.matches()) {
      return result;
    }

    result.put(HOST_KEY, matcher.group(1));
    result.put(PORT_KEY, matcher.group(2) == null ? "3306" : matcher.group(2));
    result.put(DATABASE_KEY, matcher.group(3));
    return result;
  }
}
