package com.tejasgrid.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "dispatch_event")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DispatchEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "event_timestamp", nullable = false)
    private Instant eventTimestamp;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(name = "trigger_condition", length = 200)
    private String triggerCondition;

    @Column(name = "peak_reduction_kw", precision = 10, scale = 2)
    private BigDecimal peakReductionKw;

    @Column(name = "cost_saved_inr", precision = 12, scale = 2)
    private BigDecimal costSavedInr;

    @Column(name = "carbon_avoided_kg", precision = 10, scale = 4)
    private BigDecimal carbonAvoidedKg;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EventStatus status = EventStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    public enum EventStatus {
        PENDING, ACKNOWLEDGED, EXECUTED, EXPIRED
    }
}
