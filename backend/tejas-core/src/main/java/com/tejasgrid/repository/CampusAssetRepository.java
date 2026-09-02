package com.tejasgrid.repository;

import com.tejasgrid.entity.CampusAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CampusAssetRepository extends JpaRepository<CampusAsset, UUID> {

    List<CampusAsset> findByIsActiveTrue();

    List<CampusAsset> findByAssetTypeAndIsActiveTrue(CampusAsset.AssetType assetType);
}
