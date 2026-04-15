package com.hostelmanagement.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
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

  /**
   * Configures the message broker for routing STOMP messages.
   *
   * @param config the message broker registry
   */
 @Override
public void configureMessageBroker(MessageBrokerRegistry config) {
    // Set up the broker
    config.enableSimpleBroker("/topic", "/queue");
    
    // Set the prefixes on the config object itself!
    config.setApplicationDestinationPrefixes("/app");
    config.setUserDestinationPrefix("/user");
}

  /**
   * Registers WebSocket endpoints and configures CORS.
   *
   * @param registry the STOMP endpoint registry
   */
  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    // Register WebSocket endpoint without SockJS fallback (modern browsers support WebSocket natively)
    // Clients connect to: ws://localhost:8080/ws-notifications
    registry
        .addEndpoint("/ws-notifications")
        // Allow CORS from any origin (configure for production security)
        .setAllowedOrigins("*")
        .setAllowedOriginPatterns("*");
  }
}
