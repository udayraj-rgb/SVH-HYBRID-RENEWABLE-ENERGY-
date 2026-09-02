package com.tejasgrid.repository;

import com.tejasgrid.entity.HostelBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface HostelBlockRepository extends JpaRepository<HostelBlock, UUID> {

    @Query("SELECT h FROM HostelBlock h ORDER BY h.currentPoints DESC")
    List<HostelBlock> findAllOrderByPointsDesc();
}
