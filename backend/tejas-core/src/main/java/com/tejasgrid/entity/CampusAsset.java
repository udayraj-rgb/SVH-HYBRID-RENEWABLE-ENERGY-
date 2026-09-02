package com.tejasgrid.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "campus_asset")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampusAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_type", nullable = false, length = 20)
    private AssetType assetType;

    @Column(name = "capacity_kw", nullable = false, precision = 10, scale = 2)
    private BigDecimal capacityKw;

    @Column(length = 200)
    private String location;

    @Column(name = "is_active")
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    public enum AssetType {
        SOLAR, WIND, BESS
    }
}
