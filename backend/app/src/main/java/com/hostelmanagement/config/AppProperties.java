package com.hostelmanagement.config;

import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app")
public class AppProperties {

  private String frontendUrl;
  private final Upload upload = new Upload();
  private final Auth auth = new Auth();
  private final Jwt jwt = new Jwt();
  private final Booking booking = new Booking();
  private final Payments payments = new Payments();
  private final Admin admin = new Admin();
  private final PasswordReset passwordReset = new PasswordReset();
  private final Cors cors = new Cors();

  public String getFrontendUrl() {
    return frontendUrl;
  }

  public void setFrontendUrl(String frontendUrl) {
    this.frontendUrl = frontendUrl;
  }

  public Upload getUpload() {
    return upload;
  }

  public Jwt getJwt() {
    return jwt;
  }

  public Auth getAuth() {
    return auth;
  }

  public Booking getBooking() {
    return booking;
  }

  public Payments getPayments() {
    return payments;
  }

  public Admin getAdmin() {
    return admin;
  }

  public PasswordReset getPasswordReset() {
    return passwordReset;
  }

  public Cors getCors() {
    return cors;
  }

  public static class Upload {
    private String rootDir;
    private long maxImageBytes;
    private long maxReceiptSizeBytes;

    public String getRootDir() {
      return rootDir;
    }

    public void setRootDir(String rootDir) {
      this.rootDir = rootDir;
    }

    public long getMaxImageBytes() {
      return maxImageBytes;
    }

    public void setMaxImageBytes(long maxImageBytes) {
      this.maxImageBytes = maxImageBytes;
    }

    public long getMaxReceiptSizeBytes() {
      return maxReceiptSizeBytes;
    }

    public void setMaxReceiptSizeBytes(long maxReceiptSizeBytes) {
      this.maxReceiptSizeBytes = maxReceiptSizeBytes;
    }
  }

  public static class Auth {
    private long resetRateLimitSeconds;
    private long resetTokenCleanupMs;

    public long getResetRateLimitSeconds() {
      return resetRateLimitSeconds;
    }

    public void setResetRateLimitSeconds(long resetRateLimitSeconds) {
      this.resetRateLimitSeconds = resetRateLimitSeconds;
    }

    public long getResetTokenCleanupMs() {
      return resetTokenCleanupMs;
    }

    public void setResetTokenCleanupMs(long resetTokenCleanupMs) {
      this.resetTokenCleanupMs = resetTokenCleanupMs;
    }
  }

  public static class Jwt {
    private String secret;
    private long expirationSeconds;

    public String getSecret() {
      return secret;
    }

    public void setSecret(String secret) {
      this.secret = secret;
    }

    public long getExpirationSeconds() {
      return expirationSeconds;
    }

    public void setExpirationSeconds(long expirationSeconds) {
      this.expirationSeconds = expirationSeconds;
    }
  }

  public static class Payments {
    private long paymentWindowHours;
    private final Paystack paystack = new Paystack();

    public long getPaymentWindowHours() {
      return paymentWindowHours;
    }

    public void setPaymentWindowHours(long paymentWindowHours) {
      this.paymentWindowHours = paymentWindowHours;
    }

    public Paystack getPaystack() {
      return paystack;
    }

    public static class Paystack {
      private String baseUrl;
      private String secretKey;
      private String callbackUrl;
      private String webhookSecret;

      public String getBaseUrl() {
        return baseUrl;
      }

      public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
      }

      public String getSecretKey() {
        return secretKey;
      }

      public void setSecretKey(String secretKey) {
        this.secretKey = secretKey;
      }

      public String getCallbackUrl() {
        return callbackUrl;
      }

      public void setCallbackUrl(String callbackUrl) {
        this.callbackUrl = callbackUrl;
      }

      public String getWebhookSecret() {
        return webhookSecret;
      }

      public void setWebhookSecret(String webhookSecret) {
        this.webhookSecret = webhookSecret;
      }
    }
  }

  public static class Booking {
    private long paymentHoldMinutes;
    private long expirationCronMs;

    public long getPaymentHoldMinutes() {
      return paymentHoldMinutes;
    }

    public void setPaymentHoldMinutes(long paymentHoldMinutes) {
      this.paymentHoldMinutes = paymentHoldMinutes;
    }

    public long getExpirationCronMs() {
      return expirationCronMs;
    }

    public void setExpirationCronMs(long expirationCronMs) {
      this.expirationCronMs = expirationCronMs;
    }
  }

  public static class Admin {
    private String defaultEmail;
    private String passwordHash;

    public String getDefaultEmail() {
      return defaultEmail;
    }

    public void setDefaultEmail(String defaultEmail) {
      this.defaultEmail = defaultEmail;
    }

    public String getPasswordHash() {
      return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
      this.passwordHash = passwordHash;
    }
  }

  public static class PasswordReset {
    private long expiryMinutes;
    private int rateLimitPerEmailPerHour;

    public long getExpiryMinutes() {
      return expiryMinutes;
    }

    public void setExpiryMinutes(long expiryMinutes) {
      this.expiryMinutes = expiryMinutes;
    }

    public int getRateLimitPerEmailPerHour() {
      return rateLimitPerEmailPerHour;
    }

    public void setRateLimitPerEmailPerHour(int rateLimitPerEmailPerHour) {
      this.rateLimitPerEmailPerHour = rateLimitPerEmailPerHour;
    }
  }

  public static class Cors {
    private List<String> allowedOrigins = new ArrayList<>();

    public List<String> getAllowedOrigins() {
      return allowedOrigins;
    }

    public void setAllowedOrigins(List<String> allowedOrigins) {
      this.allowedOrigins = allowedOrigins;
    }
  }
}
