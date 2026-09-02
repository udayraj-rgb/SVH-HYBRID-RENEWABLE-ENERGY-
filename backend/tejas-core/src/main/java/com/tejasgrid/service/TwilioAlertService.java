package com.tejasgrid.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Stub implementation — full implementation in Phase 3.
 */
@Service
@Slf4j
public class TwilioAlertService {
    public void broadcastGreenHourAlert(String message) {
        log.info("[STUB] WhatsApp broadcast: {}", message);
    }
    public void sendDirectMessage(String phoneNumber, String message) {
        log.info("[STUB] WhatsApp DM to {}: {}", phoneNumber, message);
    }
    
    public void sendRewardNotification(com.tejasgrid.entity.StudentProfile student, long pointsEarned, long totalPoints) {
        log.info("[STUB] WhatsApp to {}: You earned {} Karma Points! Total: {}. Current Badge: {}",
                 student.getPhoneNumber(), pointsEarned, totalPoints, student.getBadgeLevel());
    }
}
