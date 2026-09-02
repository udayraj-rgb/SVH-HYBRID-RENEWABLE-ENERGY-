package com.tejasgrid.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "student_profile")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "phone_number", nullable = false, unique = true, length = 20)
    private String phoneNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hostel_id", nullable = false)
    private HostelBlock hostel;

    @Column(name = "karma_points")
    private long karmaPoints;

    @Column(name = "whatsapp_opt_in")
    private boolean whatsappOptIn;

    @Enumerated(EnumType.STRING)
    @Column(name = "badge_level", length = 30)
    private BadgeLevel badgeLevel = BadgeLevel.NEWCOMER;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    public enum BadgeLevel {
        NEWCOMER(0),
        ECO_STARTER(100),
        GREEN_GUARDIAN(300),
        SILVER_SAVIOR(750),
        ECO_CHAMPION(1500),
        GRID_HERO(3000);

        public final int threshold;

        BadgeLevel(int threshold) {
            this.threshold = threshold;
        }
    }

    /**
     * Recalculates the badge level based on current karma points.
     * Iterates through all levels and assigns the highest one the student qualifies for.
     */
    public void recalculateBadge() {
        for (BadgeLevel b : BadgeLevel.values()) {
            if (this.karmaPoints >= b.threshold) {
                this.badgeLevel = b;
            }
        }
    }
}
