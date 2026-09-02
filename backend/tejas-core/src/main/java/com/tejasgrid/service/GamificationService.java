package com.tejasgrid.service;

import com.tejasgrid.entity.*;
import com.tejasgrid.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GamificationService {

    private final StudentProfileRepository studentProfileRepository;
    private final HostelBlockRepository hostelBlockRepository;
    private final RewardRepository rewardRepository;
    private final RedemptionLogRepository redemptionLogRepository;
    private final TwilioAlertService twilioAlertService;

    // Points awarded per kWh saved during Green Hour
    private static final long POINTS_PER_KWH_SAVED = 10L;
    private static final long GREEN_HOUR_BASE_POINTS = 50L;
    private static final long EMERGENCY_PARTICIPATION_POINTS = 100L;

    /**
     * Awards points to all students in a hostel after a Green Hour event.
     * Also updates the hostel aggregate score.
     */
    @Transactional
    public void awardGreenHourPoints(UUID hostelId, double energySavedKwh, boolean isEmergency) {
        HostelBlock hostel = hostelBlockRepository.findById(hostelId)
                .orElseThrow(() -> new RuntimeException("Hostel not found: " + hostelId));

        long basePoints = isEmergency ? EMERGENCY_PARTICIPATION_POINTS : GREEN_HOUR_BASE_POINTS;
        long bonusPoints = (long) (energySavedKwh * POINTS_PER_KWH_SAVED);
        long totalStudentPoints = basePoints + bonusPoints;

        // Update hostel aggregate
        hostel.setCurrentPoints(hostel.getCurrentPoints() + (totalStudentPoints * hostel.getTotalStudents()));
        hostel.setTotalEnergySavedKwh(
            hostel.getTotalEnergySavedKwh().add(BigDecimal.valueOf(energySavedKwh))
        );
        hostelBlockRepository.save(hostel);

        // Award individual student points
        List<StudentProfile> students = studentProfileRepository.findByHostelId(hostelId);
        for (StudentProfile student : students) {
            student.setKarmaPoints(student.getKarmaPoints() + totalStudentPoints);
            student.recalculateBadge();
            studentProfileRepository.save(student);

            // Notify opted-in students asynchronously
            if (student.isWhatsappOptIn()) {
                twilioAlertService.sendRewardNotification(student, totalStudentPoints, student.getKarmaPoints());
            }
        }

        log.info("Awarded {} Karma Points to {} students in hostel '{}'. Energy saved: {} kWh",
                totalStudentPoints, students.size(), hostel.getName(), energySavedKwh);
    }

    /**
     * Awards points to a specific student directly.
     */
    @Transactional
    public StudentProfile awardPointsToStudent(UUID studentId, long points) {
        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
        student.setKarmaPoints(student.getKarmaPoints() + points);
        student.recalculateBadge();
        StudentProfile saved = studentProfileRepository.save(student);
        log.info("Awarded {} points to student '{}'. New balance: {}", points, student.getName(), saved.getKarmaPoints());
        return saved;
    }

    /**
     * Redeems a reward for a student if they have sufficient Karma Points.
     */
    @Transactional
    public RedemptionLog redeemReward(UUID studentId, UUID rewardId) {
        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
        Reward reward = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new RuntimeException("Reward not found: " + rewardId));

        if (!reward.isAvailable()) {
            throw new IllegalStateException("Reward is currently unavailable.");
        }
        if (student.getKarmaPoints() < reward.getPointsCost()) {
            throw new IllegalStateException(String.format(
                "Insufficient Karma Points. Required: %d, Balance: %d",
                reward.getPointsCost(), student.getKarmaPoints()
            ));
        }

        student.setKarmaPoints(student.getKarmaPoints() - reward.getPointsCost());
        studentProfileRepository.save(student);

        RedemptionLog redemptionLog = RedemptionLog.builder()
                .student(student)
                .reward(reward)
                .pointsSpent(reward.getPointsCost())
                .build();
        return redemptionLogRepository.save(redemptionLog);
    }

    public List<HostelBlock> getLeaderboard() {
        return hostelBlockRepository.findAllOrderByPointsDesc();
    }

    public List<Reward> getAvailableRewards() {
        return rewardRepository.findByIsAvailableTrue();
    }
}
