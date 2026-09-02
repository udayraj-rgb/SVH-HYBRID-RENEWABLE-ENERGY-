package com.tejasgrid.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "hostel_block")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HostelBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "total_students")
    private int totalStudents;

    @Column(name = "current_points")
    private long currentPoints;

    @Column(name = "total_energy_saved_kwh", precision = 12, scale = 4)
    private BigDecimal totalEnergySavedKwh = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
