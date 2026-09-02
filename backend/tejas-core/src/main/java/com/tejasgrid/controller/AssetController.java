package com.tejasgrid.controller;

import com.tejasgrid.entity.CampusAsset;
import com.tejasgrid.repository.CampusAssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {
    private final CampusAssetRepository campusAssetRepository;

    @GetMapping
    public List<CampusAsset> getAllAssets() {
        return campusAssetRepository.findByIsActiveTrue();
    }

    @GetMapping("/type/{type}")
    public List<CampusAsset> getByType(@PathVariable CampusAsset.AssetType type) {
        return campusAssetRepository.findByAssetTypeAndIsActiveTrue(type);
    }
}
