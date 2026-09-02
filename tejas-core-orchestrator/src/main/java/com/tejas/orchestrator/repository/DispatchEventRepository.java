package com.tejas.orchestrator.repository;

import com.tejas.orchestrator.entity.DispatchEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DispatchEventRepository extends JpaRepository<DispatchEvent, Long> {

    Optional<DispatchEvent> findTopByOrderByTimestampDesc();

    List<DispatchEvent> findAllByOrderByTimestampDesc();
}
