package com.tejas.orchestrator.repository;

import com.tejas.orchestrator.entity.Campus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampusRepository extends JpaRepository<Campus, Long> {

    List<Campus> findByDistrictId(Long districtId);

    Optional<Campus> findByName(String name);

    boolean existsByName(String name);
}
