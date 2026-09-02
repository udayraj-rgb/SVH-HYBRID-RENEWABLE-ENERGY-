package com.tejas.orchestrator.repository;

import com.tejas.orchestrator.entity.HostelBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HostelBlockRepository extends JpaRepository<HostelBlock, Long> {

    List<HostelBlock> findAllByOrderByCumulativeSavedKwhDesc();

    @Query("SELECT h FROM HostelBlock h ORDER BY h.cumulativeSavedKwh DESC")
    List<HostelBlock> findTopHostelsByOrderByCumulativeSavedKwhDesc();
}
