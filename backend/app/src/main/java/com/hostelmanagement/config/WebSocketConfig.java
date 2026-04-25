package com.hostelmanagement.config;

import com.hostelmanagement.security.JwtService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket Configuration for real-time notifications.
 *
 * <p>This class configures STOMP (Simple Text Oriented Messaging Protocol) for WebSocket
 * communication, enabling real-time notifications when admins approve payments.
 *
 * <p>The configuration:
 * - Enables WebSocket message broker with STOMP protocol
 * - Registers the WebSocket endpoint at /ws-notifications
 * - Configures in-memory message broker for routing messages
 * - Sets application destination prefixes for controller mappings
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  private final JwtService jwtService;

  public WebSocketConfig(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  /**
   * Configures the message broker for routing STOMP messages.
   *
   * @param config the message broker registry
   */
 @Override
public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
    // Set up the broker
    config.enableSimpleBroker("/topic", "/queue");
    
    // Set the prefixes on the config object itself!
    config.setApplicationDestinationPrefixes("/app");
    config.setUserDestinationPrefix("/user");
}

  @Override
  public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
    registration.interceptors(stompAuthChannelInterceptor());
  }

  @Bean
  public ChannelInterceptor stompAuthChannelInterceptor() {
    return new ChannelInterceptor() {
      @Override
      @SuppressWarnings({"null", "nullness"})
      @Nullable
      public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
          var header = accessor.getFirstNativeHeader("Authorization");
          if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring("Bearer ".length()).trim();
            try {
              var jwtUser = jwtService.parse(token);
              if (jwtUser.userId() != null) {
                String principalName = String.valueOf(jwtUser.userId());
                accessor.setUser(
                    UsernamePasswordAuthenticationToken.authenticated(
                        principalName, null, java.util.List.of()));
              }
            } catch (Exception ignored) {
              // Leave user unset when token is invalid; connection can still proceed.
            }
          }
        }
        return message;
      }
    };
  }

  /**
   * Registers WebSocket endpoints and configures CORS.
   *
   * @param registry the STOMP endpoint registry
   */
  @Override
  public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
    // Register SockJS/STOMP endpoint used by the frontend notification client.
    registry
        .addEndpoint("/ws-notifications")
        // Allow CORS from configured origins/patterns.
        .setAllowedOriginPatterns("*")
        .withSockJS();
  }
}
