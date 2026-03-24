package com.hostelmanagement.security;

import com.hostelmanagement.domain.Role;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private static final String TOKEN_TYPE_ACCESS = "access";
  private static final String TOKEN_TYPE_REFRESH = "refresh";

  private final SecretKey key;
  private final long accessTokenExpirationSeconds;
  private final long refreshTokenExpirationSeconds;

  public JwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.access-token-expiration-seconds:3600}") long accessTokenExpirationSeconds,
      @Value("${app.jwt.refresh-token-expiration-seconds:604800}") long refreshTokenExpirationSeconds) {
    if (secret == null || secret.length() < 32) {
      throw new IllegalArgumentException("JWT secret must be at least 32 characters");
    }
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.accessTokenExpirationSeconds = accessTokenExpirationSeconds;
    this.refreshTokenExpirationSeconds = refreshTokenExpirationSeconds;
  }

  /**
   * Generate an access token (short-lived, typically 1 hour).
   */
  public String generateAccessToken(Long userId, String email, Role role) {
    Instant now = Instant.now();
    Instant exp = now.plusSeconds(accessTokenExpirationSeconds);
    return Jwts.builder()
        .subject(String.valueOf(userId))
        .claim("email", email)
        .claim("role", role.name())
      .claim("type", TOKEN_TYPE_ACCESS)
        .issuedAt(Date.from(now))
        .expiration(Date.from(exp))
        .signWith(key)
        .compact();
  }

  /**
   * Generate a refresh token (long-lived, typically 7 days).
   * Includes a unique token ID for rotation tracking.
   */
  public String generateRefreshToken(Long userId) {
    Instant now = Instant.now();
    Instant exp = now.plusSeconds(refreshTokenExpirationSeconds);
    String tokenId = UUID.randomUUID().toString();
    
    return Jwts.builder()
        .subject(String.valueOf(userId))
        .claim("tokenId", tokenId)
      .claim("type", TOKEN_TYPE_REFRESH)
        .issuedAt(Date.from(now))
        .expiration(Date.from(exp))
        .signWith(key)
        .compact();
  }

  public JwtUser parse(String token) {
    var claims =
        Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();

    String tokenType = (String) claims.get("type");
    if (TOKEN_TYPE_REFRESH.equals(tokenType)) {
      // For refresh tokens, only return userId
      long userId = Long.parseLong(claims.getSubject());
      return new JwtUser(userId, null, null);
    }

    long userId = Long.parseLong(claims.getSubject());
    String email = (String) claims.get("email");
    String role = (String) claims.get("role");

    return new JwtUser(userId, email, Role.valueOf(role));
  }

  /**
   * Parse refresh token and extract token ID for rotation tracking.
   */
  public RefreshTokenData parseRefreshToken(String token) {
    var claims =
        Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();

    String tokenType = (String) claims.get("type");
    if (!TOKEN_TYPE_REFRESH.equals(tokenType)) {
      throw new IllegalArgumentException("Invalid refresh token type");
    }

    long userId = Long.parseLong(claims.getSubject());
    String tokenId = (String) claims.get("tokenId");
    if (tokenId == null || tokenId.isBlank()) {
      throw new IllegalArgumentException("Invalid refresh token");
    }

    return new RefreshTokenData(userId, tokenId);
  }
  
  /**
   * Data class for refresh token parsing results.
   */
  public record RefreshTokenData(long userId, String tokenId) {}
}
