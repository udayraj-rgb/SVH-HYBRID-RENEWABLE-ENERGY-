package com.tejas.orchestrator.repository;

import com.tejas.orchestrator.entity.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DistrictRepository extends JpaRepository<District, Long> {

    Optional<District> findByCode(String code);

    Optional<District> findByName(String name);

    boolean existsByCode(String code);
}
