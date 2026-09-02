package com.tejasgrid.repository;

import com.tejasgrid.entity.RedemptionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RedemptionLogRepository extends JpaRepository<RedemptionLog, UUID> {

    List<RedemptionLog> findByStudentId(UUID studentId);
}
