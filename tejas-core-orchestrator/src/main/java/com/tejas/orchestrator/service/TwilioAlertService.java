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
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class TwilioAlertService {

    private static final Logger log = LoggerFactory.getLogger(TwilioAlertService.class);

    private final StudentRepository studentRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${twilio.account.sid:AC_MOCK_SID}")
    private String accountSid;

    @Value("${twilio.auth.token:mock_token}")
    private String authToken;

    @Value("${twilio.whatsapp.from:whatsapp:+17372212163}")
    private String fromWhatsapp;

    @Value("${whatsapp.gateway.url:http://localhost:5001}")
    private String localGatewayUrl;

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
     * 1. Attempts Local Campus WhatsApp Gateway (port 5001) first (100% free direct delivery).
     * 2. Falls back to Twilio if gateway is not connected.
     * 3. Falls back to safe mock log if neither is available.
     */
    public void sendGreenHourAlert(String recipientPhone, String hostelName, double deficitKw) {
        String messageBody = "⚡ TEJAS GRID ALERT: Solar deficit of " + deficitKw + " kW detected on campus! Green Hour is now active. Reduce non-essential appliances in " + hostelName + " for 45 mins to earn 50 Karma points for your hostel leaderboard!";

        // 1. Try Local WhatsApp Gateway first
        try {
            Map<String, String> payload = new LinkedHashMap<>();
            payload.put("phone", recipientPhone);
            payload.put("message", messageBody);

            restTemplate.postForObject(localGatewayUrl + "/api/send", payload, String.class);
            log.info("[LOCAL WHATSAPP GATEWAY SENT] To: {}", recipientPhone);
            return;
        } catch (Exception gwEx) {
            log.debug("Local WhatsApp Gateway unreachable/not paired: {}", gwEx.getMessage());
        }

        // 2. Try Twilio
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

        // 3. Safe mock log
        log.info("[MOCK WHATSAPP DISPATCHED] To: {} | Message: {}", recipientPhone, messageBody);
    }

    /**
     * Broadcast alert to all student residents who opted into WhatsApp notifications.
     */
    public int broadcastToOptedInStudents(double deficitKw) {
        List<Student> optedInStudents = studentRepository.findByWhatsappOptInTrue();
        log.info("Initiating Green Hour broadcast for deficit {} kW to {} opted-in students...", deficitKw, optedInStudents.size());

        List<String> phones = optedInStudents.stream().map(Student::getPhoneNumber).toList();
        String messageBody = "⚡ TEJAS GRID ALERT: Solar deficit of " + deficitKw + " kW detected on campus! Green Hour is now active. Reduce non-essential appliances for 45 mins to earn 50 Karma points for your hostel leaderboard!";

        // Try batch broadcast via Local Gateway
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("phones", phones);
            payload.put("message", messageBody);

            restTemplate.postForObject(localGatewayUrl + "/api/broadcast", payload, String.class);
            log.info("[LOCAL WHATSAPP GATEWAY BROADCAST COMPLETE] Delivered to {} students.", phones.size());
            return phones.size();
        } catch (Exception gwEx) {
            log.debug("Local Gateway batch broadcast failed, falling back to individual dispatch: {}", gwEx.getMessage());
        }

        for (Student student : optedInStudents) {
            String hostelName = (student.getHostel() != null) ? student.getHostel().getName() : "Campus Hostel";
            sendGreenHourAlert(student.getPhoneNumber(), hostelName, deficitKw);
        }

        return optedInStudents.size();
    }
}
