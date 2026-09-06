package com.tejas.orchestrator.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "operational_advisories")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class OperationalAdvisory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "campus_id", nullable = false)
    @JsonIgnoreProperties({"users", "telemetryReadings", "hostelBlocks", "hibernateLazyInitializer", "handler"})
    private Campus campus;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false, length = 30)
    private String level; // INFO, RECOMMENDED_ACTION, CRITICAL_WARNING

    @Column(name = "title_en", nullable = false)
    private String titleEn;

    @Column(name = "title_hi", nullable = false)
    private String titleHi;

    @Column(name = "message_en", columnDefinition = "TEXT", nullable = false)
    private String messageEn;

    @Column(name = "message_hi", columnDefinition = "TEXT", nullable = false)
    private String messageHi;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false, length = 50)
    private DispatchAction actionType;

    @Column(nullable = false)
    private Boolean acknowledged = false;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "acknowledged_by")
    private String acknowledgedBy;

    public OperationalAdvisory() {
    }

    public OperationalAdvisory(Long id, Campus campus, LocalDateTime timestamp, String level,
                               String titleEn, String titleHi, String messageEn, String messageHi,
                               DispatchAction actionType, Boolean acknowledged,
                               LocalDateTime acknowledgedAt, String acknowledgedBy) {
        this.id = id;
        this.campus = campus;
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();
        this.level = level;
        this.titleEn = titleEn;
        this.titleHi = titleHi;
        this.messageEn = messageEn;
        this.messageHi = messageHi;
        this.actionType = actionType;
        this.acknowledged = acknowledged != null ? acknowledged : false;
        this.acknowledgedAt = acknowledgedAt;
        this.acknowledgedBy = acknowledgedBy;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Campus campus;
        private LocalDateTime timestamp = LocalDateTime.now();
        private String level = "INFO";
        private String titleEn;
        private String titleHi;
        private String messageEn;
        private String messageHi;
        private DispatchAction actionType = DispatchAction.GRID_SUPPORT_IDLE;
        private Boolean acknowledged = false;
        private LocalDateTime acknowledgedAt;
        private String acknowledgedBy;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder campus(Campus campus) { this.campus = campus; return this; }
        public Builder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }
        public Builder level(String level) { this.level = level; return this; }
        public Builder titleEn(String titleEn) { this.titleEn = titleEn; return this; }
        public Builder titleHi(String titleHi) { this.titleHi = titleHi; return this; }
        public Builder messageEn(String messageEn) { this.messageEn = messageEn; return this; }
        public Builder messageHi(String messageHi) { this.messageHi = messageHi; return this; }
        public Builder actionType(DispatchAction actionType) { this.actionType = actionType; return this; }
        public Builder acknowledged(Boolean acknowledged) { this.acknowledged = acknowledged; return this; }
        public Builder acknowledgedAt(LocalDateTime acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; return this; }
        public Builder acknowledgedBy(String acknowledgedBy) { this.acknowledgedBy = acknowledgedBy; return this; }

        public OperationalAdvisory build() {
            return new OperationalAdvisory(id, campus, timestamp, level, titleEn, titleHi,
                    messageEn, messageHi, actionType, acknowledged, acknowledgedAt, acknowledgedBy);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Campus getCampus() { return campus; }
    public void setCampus(Campus campus) { this.campus = campus; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getTitleEn() { return titleEn; }
    public void setTitleEn(String titleEn) { this.titleEn = titleEn; }

    public String getTitleHi() { return titleHi; }
    public void setTitleHi(String titleHi) { this.titleHi = titleHi; }

    public String getMessageEn() { return messageEn; }
    public void setMessageEn(String messageEn) { this.messageEn = messageEn; }

    public String getMessageHi() { return messageHi; }
    public void setMessageHi(String messageHi) { this.messageHi = messageHi; }

    public DispatchAction getActionType() { return actionType; }
    public void setActionType(DispatchAction actionType) { this.actionType = actionType; }

    public Boolean getAcknowledged() { return acknowledged; }
    public void setAcknowledged(Boolean acknowledged) { this.acknowledged = acknowledged; }

    public LocalDateTime getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }

    public String getAcknowledgedBy() { return acknowledgedBy; }
    public void setAcknowledgedBy(String acknowledgedBy) { this.acknowledgedBy = acknowledgedBy; }
}
