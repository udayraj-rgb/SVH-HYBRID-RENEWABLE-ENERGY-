package com.tejas.orchestrator.repository;

import com.tejas.orchestrator.entity.OperationalAdvisory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OperationalAdvisoryRepository extends JpaRepository<OperationalAdvisory, Long> {

    List<OperationalAdvisory> findByCampusIdOrderByTimestampDesc(Long campusId);

    List<OperationalAdvisory> findByCampusIdAndAcknowledgedFalseOrderByTimestampDesc(Long campusId);

    List<OperationalAdvisory> findByAcknowledgedFalseOrderByTimestampDesc();
}
