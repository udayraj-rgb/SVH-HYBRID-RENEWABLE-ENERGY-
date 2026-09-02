package com.tejasgrid.repository;

import com.tejasgrid.entity.DispatchEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface DispatchEventRepository extends JpaRepository<DispatchEvent, UUID> {

    List<DispatchEvent> findTop10ByOrderByEventTimestampDesc();

    @Query("SELECT d FROM DispatchEvent d WHERE d.eventTimestamp >= :from ORDER BY d.eventTimestamp DESC")
    List<DispatchEvent> findEventsSince(@Param("from") Instant from);

    List<DispatchEvent> findByStatus(DispatchEvent.EventStatus status);
}
