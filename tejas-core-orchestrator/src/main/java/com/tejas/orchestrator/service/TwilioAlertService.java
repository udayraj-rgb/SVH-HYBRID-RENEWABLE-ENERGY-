package com.tejas.orchestrator.service;

import com.tejas.orchestrator.entity.Student;
import com.tejas.orchestrator.repository.StudentRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TwilioAlertService {

    private static final Logger log = LoggerFactory.getLogger(TwilioAlertService.class);

    private final StudentRepository studentRepository;

    @Value("${twilio.account.sid:AC_MOCK_SID}")
    private String accountSid;

    @Value("${twilio.auth.token:mock_token}")
    private String authToken;

    @Value("${twilio.whatsapp.from:whatsapp:+14155238886}")
    private String fromWhatsapp;

    private boolean isTwilioConfigured = false;

    public TwilioAlertService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.contains("MOCK") && !accountSid.startsWith("AC_") &&
                authToken != null && !authToken.contains("mock") && !authToken.equals("your_twilio_auth_token_here")) {
            try {
                Twilio.init(accountSid, authToken);
                isTwilioConfigured = true;
                log.info("Twilio SDK initialized successfully with SID: {}", accountSid);
            } catch (Exception exc) {
                log.warn("Twilio initialization failed: {}. Running in Mock WhatsApp Mode.", exc.getMessage());
                isTwilioConfigured = false;
            }
        } else {
            log.info("Twilio placeholder credentials detected. Running in Mock WhatsApp Mode.");
            isTwilioConfigured = false;
        }
    }

    /**
     * Dispatch single Green Hour WhatsApp alert to a student.
     * Guaranteed safe execution: logs mock message if credentials are not configured or request fails.
     */
    public void sendGreenHourAlert(String recipientPhone, String hostelName, double deficitKw) {
        String messageBody = "⚡ TEJAS GRID ALERT: Solar deficit of " + deficitKw + " kW detected on campus! Green Hour is now active. Reduce non-essential appliances in " + hostelName + " for 45 mins to earn 50 Karma points for your hostel leaderboard!";

        // Ensure proper WhatsApp formatting
        String formattedRecipient = recipientPhone.startsWith("whatsapp:") ? recipientPhone : "whatsapp:" + recipientPhone;
        String formattedSender = fromWhatsapp.startsWith("whatsapp:") ? fromWhatsapp : "whatsapp:" + fromWhatsapp;

        if (isTwilioConfigured) {
            try {
                Message message = Message.creator(
                        new PhoneNumber(formattedRecipient),
                        new PhoneNumber(formattedSender),
                        messageBody
                ).create();
                log.info("[TWILIO WHATSAPP SENT] SID: {} | To: {}", message.getSid(), formattedRecipient);
                return;
            } catch (Exception exc) {
                log.warn("Failed delivering live Twilio WhatsApp message to {}: {}. Falling back to mock dispatch.", recipientPhone, exc.getMessage());
            }
        }

        // Safe mock log
        log.info("[MOCK WHATSAPP DISPATCHED] To: {} | Message: {}", recipientPhone, messageBody);
    }

    /**
     * Broadcast alert to all student residents who opted into WhatsApp notifications.
     */
    public int broadcastToOptedInStudents(double deficitKw) {
        List<Student> optedInStudents = studentRepository.findByWhatsappOptInTrue();
        log.info("Initiating Green Hour broadcast for deficit {} kW to {} opted-in students...", deficitKw, optedInStudents.size());

        for (Student student : optedInStudents) {
            String hostelName = (student.getHostel() != null) ? student.getHostel().getName() : "Campus Hostel";
            sendGreenHourAlert(student.getPhoneNumber(), hostelName, deficitKw);
        }

        return optedInStudents.size();
    }
}
