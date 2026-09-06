package com.tejas.orchestrator.repository;

import com.tejas.orchestrator.entity.TelemetryReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TelemetryReadingRepository extends JpaRepository<TelemetryReading, Long> {

    List<TelemetryReading> findByCampusIdOrderByTimestampDesc(Long campusId);

    Optional<TelemetryReading> findTopByCampusIdOrderByTimestampDesc(Long campusId);

    List<TelemetryReading> findByCampusIdAndTimestampBetweenOrderByTimestampAsc(Long campusId, LocalDateTime start, LocalDateTime end);
}
