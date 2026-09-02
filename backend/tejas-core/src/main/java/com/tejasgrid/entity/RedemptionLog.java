package com.tejasgrid.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "redemption_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RedemptionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reward_id", nullable = false)
    private Reward reward;

    @CreationTimestamp
    @Column(name = "redeemed_at")
    private Instant redeemedAt;

    @Column(name = "points_spent", nullable = false)
    private int pointsSpent;
}
