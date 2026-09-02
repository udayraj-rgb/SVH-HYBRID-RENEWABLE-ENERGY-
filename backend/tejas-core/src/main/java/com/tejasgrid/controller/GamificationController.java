package com.tejasgrid.controller;

import com.tejasgrid.entity.*;
import com.tejasgrid.repository.StudentProfileRepository;
import com.tejasgrid.service.GamificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;
    private final StudentProfileRepository studentProfileRepository;

    // --- LEADERBOARD ---

    @GetMapping("/leaderboard")
    public ResponseEntity<List<HostelBlock>> getLeaderboard() {
        return ResponseEntity.ok(gamificationService.getLeaderboard());
    }

    // --- REWARDS ---

    @GetMapping("/rewards")
    public ResponseEntity<List<Reward>> getAvailableRewards() {
        return ResponseEntity.ok(gamificationService.getAvailableRewards());
    }

    @PostMapping("/rewards/redeem")
    public ResponseEntity<?> redeemReward(@RequestBody Map<String, String> body) {
        try {
            UUID studentId = UUID.fromString(body.get("studentId"));
            UUID rewardId = UUID.fromString(body.get("rewardId"));
            RedemptionLog redemptionLog = gamificationService.redeemReward(studentId, rewardId);
            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "redemptionId", redemptionLog.getId().toString(),
                "pointsSpent", redemptionLog.getPointsSpent()
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- STUDENT PROFILES ---

    @GetMapping("/students/{id}")
    public ResponseEntity<StudentProfile> getStudent(@PathVariable UUID id) {
        return studentProfileRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/students/{id}/award-points")
    public ResponseEntity<StudentProfile> awardPoints(
            @PathVariable UUID id,
            @RequestBody Map<String, Long> body) {
        long points = body.getOrDefault("points", 0L);
        StudentProfile updated = gamificationService.awardPointsToStudent(id, points);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/students")
    public ResponseEntity<StudentProfile> registerStudent(@RequestBody StudentProfile student) {
        // For demo: quick registration endpoint
        return ResponseEntity.ok(studentProfileRepository.save(student));
    }

    // --- GREEN HOUR AWARD ---

    @PostMapping("/hostels/{hostelId}/award-green-hour")
    public ResponseEntity<Map<String, Object>> awardGreenHour(
            @PathVariable UUID hostelId,
            @RequestBody Map<String, Object> body) {
        double energySavedKwh = Double.parseDouble(body.getOrDefault("energySavedKwh", 5.0).toString());
        boolean emergency = Boolean.parseBoolean(body.getOrDefault("emergency", false).toString());
        gamificationService.awardGreenHourPoints(hostelId, energySavedKwh, emergency);
        return ResponseEntity.ok(Map.of(
            "status", "AWARDED",
            "hostelId", hostelId.toString(),
            "energySavedKwh", energySavedKwh
        ));
    }

    // --- EXECUTIVE METRICS ---

    @GetMapping("/metrics/executive")
    public ResponseEntity<Map<String, Object>> getExecutiveMetrics() {
        List<HostelBlock> hostels = gamificationService.getLeaderboard();
        double totalEnergySaved = hostels.stream()
                .mapToDouble(h -> h.getTotalEnergySavedKwh().doubleValue())
                .sum();
        long totalPoints = hostels.stream().mapToLong(HostelBlock::getCurrentPoints).sum();
        double costSavedInr = totalEnergySaved * 7.50;
        double carbonAvoidedKg = totalEnergySaved * 0.82;

        return ResponseEntity.ok(Map.of(
            "total_energy_saved_kwh", Math.round(totalEnergySaved * 100.0) / 100.0,
            "total_cost_saved_inr", Math.round(costSavedInr * 100.0) / 100.0,
            "total_carbon_avoided_kg", Math.round(carbonAvoidedKg * 100.0) / 100.0,
            "total_karma_points_awarded", totalPoints,
            "participating_hostels", hostels.size()
        ));
    }
}
