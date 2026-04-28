package com.hostelmanagement.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Sort;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hostelmanagement.domain.Announcement;
import com.hostelmanagement.repository.AnnouncementRepository;
import com.hostelmanagement.web.admin.dto.UpsertAnnouncementRequest;
import com.hostelmanagement.web.dto.AnnouncementResponse;

@Service
@Transactional
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public AnnouncementService(AnnouncementRepository announcementRepository, 
                               SimpMessagingTemplate messagingTemplate) {
        this.announcementRepository = announcementRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public AnnouncementResponse create(UpsertAnnouncementRequest request) {
        Instant expiresAt = parseDate(request.expiresAt());
        
        // If no expiration date provided, set default to 90 days from now
        if (expiresAt == null) {
            expiresAt = Instant.now().plus(java.time.Duration.ofDays(90));
        }

        Announcement announcement = new Announcement(request.title(), request.body(), expiresAt);
        Announcement saved = announcementRepository.save(announcement);
        
        // Use your static factory method
        AnnouncementResponse response = AnnouncementResponse.from(saved);

        // Broadcast a structured payload so student dashboard can render immediately.
        Map<String, Object> broadcast = new LinkedHashMap<>();
        broadcast.put("type", "ANNOUNCEMENT");
        broadcast.put("severity", "info");
        broadcast.put("id", response.id());
        broadcast.put("title", response.title());
        broadcast.put("body", response.body());
        broadcast.put("preview", response.preview());
        broadcast.put("publishedAt", response.publishedAt());
        broadcast.put("expiresAt", response.expiresAt());
        broadcast.put("message", "Important: " + response.preview());

        messagingTemplate.convertAndSend("/topic/announcements", broadcast);

        return response;
    }

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> listActive() {
        return announcementRepository.findAllActive().stream()
                .map(AnnouncementResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> listAll() {
        return announcementRepository.findAll(Sort.by(Sort.Direction.DESC, "publishedAt")).stream()
                .map(AnnouncementResponse::from)
                .toList();
    }

    public void delete(@NonNull Long id) {
        announcementRepository.deleteById(id);
    }

    // Helper to keep the create method clean
    private Instant parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return LocalDate.parse(dateStr)
                    .atStartOfDay(ZoneId.systemDefault())
                    .toInstant();
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}