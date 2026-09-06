package com.tejas.orchestrator.dto;

import java.util.List;

public class StudentKioskDTO {

    private Long campusId;
    private String campusName;
    private String districtName;
    private Double currentRenewablePercentage;
    private String statusBadge; // CLEAN_POWERED (>60%), HYBRID_BALANCED (30-60%), GRID_RELIANT (<30%)
    private Double todayAvoidedCarbonKg;
    private Double equivalentTreesPlanted;
    private Double liveSolarKw;
    private Double liveWindKw;
    private Double cleanGenerationKw;
    private Double campusLoadKw;
    private List<HostelLeaderboardEntryDTO> hostelLeaderboard;
    private EcoTipDTO ecoTipOfTheDay;
    private String safetyAudit;

    public StudentKioskDTO() {
    }

    public StudentKioskDTO(Long campusId, String campusName, String districtName,
                           Double currentRenewablePercentage, String statusBadge,
                           Double todayAvoidedCarbonKg, Double equivalentTreesPlanted,
                           Double liveSolarKw, Double liveWindKw, Double cleanGenerationKw,
                           Double campusLoadKw, List<HostelLeaderboardEntryDTO> hostelLeaderboard,
                           EcoTipDTO ecoTipOfTheDay, String safetyAudit) {
        this.campusId = campusId;
        this.campusName = campusName;
        this.districtName = districtName;
        this.currentRenewablePercentage = currentRenewablePercentage;
        this.statusBadge = statusBadge;
        this.todayAvoidedCarbonKg = todayAvoidedCarbonKg;
        this.equivalentTreesPlanted = equivalentTreesPlanted;
        this.liveSolarKw = liveSolarKw;
        this.liveWindKw = liveWindKw;
        this.cleanGenerationKw = cleanGenerationKw;
        this.campusLoadKw = campusLoadKw;
        this.hostelLeaderboard = hostelLeaderboard;
        this.ecoTipOfTheDay = ecoTipOfTheDay;
        this.safetyAudit = safetyAudit;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long campusId;
        private String campusName;
        private String districtName;
        private Double currentRenewablePercentage;
        private String statusBadge;
        private Double todayAvoidedCarbonKg;
        private Double equivalentTreesPlanted;
        private Double liveSolarKw;
        private Double liveWindKw;
        private Double cleanGenerationKw;
        private Double campusLoadKw;
        private List<HostelLeaderboardEntryDTO> hostelLeaderboard;
        private EcoTipDTO ecoTipOfTheDay;
        private String safetyAudit;

        public Builder campusId(Long campusId) { this.campusId = campusId; return this; }
        public Builder campusName(String campusName) { this.campusName = campusName; return this; }
        public Builder districtName(String districtName) { this.districtName = districtName; return this; }
        public Builder currentRenewablePercentage(Double currentRenewablePercentage) { this.currentRenewablePercentage = currentRenewablePercentage; return this; }
        public Builder statusBadge(String statusBadge) { this.statusBadge = statusBadge; return this; }
        public Builder todayAvoidedCarbonKg(Double todayAvoidedCarbonKg) { this.todayAvoidedCarbonKg = todayAvoidedCarbonKg; return this; }
        public Builder equivalentTreesPlanted(Double equivalentTreesPlanted) { this.equivalentTreesPlanted = equivalentTreesPlanted; return this; }
        public Builder liveSolarKw(Double liveSolarKw) { this.liveSolarKw = liveSolarKw; return this; }
        public Builder liveWindKw(Double liveWindKw) { this.liveWindKw = liveWindKw; return this; }
        public Builder cleanGenerationKw(Double cleanGenerationKw) { this.cleanGenerationKw = cleanGenerationKw; return this; }
        public Builder campusLoadKw(Double campusLoadKw) { this.campusLoadKw = campusLoadKw; return this; }
        public Builder hostelLeaderboard(List<HostelLeaderboardEntryDTO> hostelLeaderboard) { this.hostelLeaderboard = hostelLeaderboard; return this; }
        public Builder ecoTipOfTheDay(EcoTipDTO ecoTipOfTheDay) { this.ecoTipOfTheDay = ecoTipOfTheDay; return this; }
        public Builder safetyAudit(String safetyAudit) { this.safetyAudit = safetyAudit; return this; }

        public StudentKioskDTO build() {
            return new StudentKioskDTO(campusId, campusName, districtName, currentRenewablePercentage,
                    statusBadge, todayAvoidedCarbonKg, equivalentTreesPlanted, liveSolarKw, liveWindKw,
                    cleanGenerationKw, campusLoadKw, hostelLeaderboard, ecoTipOfTheDay, safetyAudit);
        }
    }

    public Long getCampusId() { return campusId; }
    public void setCampusId(Long campusId) { this.campusId = campusId; }

    public String getCampusName() { return campusName; }
    public void setCampusName(String campusName) { this.campusName = campusName; }

    public String getDistrictName() { return districtName; }
    public void setDistrictName(String districtName) { this.districtName = districtName; }

    public Double getCurrentRenewablePercentage() { return currentRenewablePercentage; }
    public void setCurrentRenewablePercentage(Double currentRenewablePercentage) { this.currentRenewablePercentage = currentRenewablePercentage; }

    public String getStatusBadge() { return statusBadge; }
    public void setStatusBadge(String statusBadge) { this.statusBadge = statusBadge; }

    public Double getTodayAvoidedCarbonKg() { return todayAvoidedCarbonKg; }
    public void setTodayAvoidedCarbonKg(Double todayAvoidedCarbonKg) { this.todayAvoidedCarbonKg = todayAvoidedCarbonKg; }

    public Double getEquivalentTreesPlanted() { return equivalentTreesPlanted; }
    public void setEquivalentTreesPlanted(Double equivalentTreesPlanted) { this.equivalentTreesPlanted = equivalentTreesPlanted; }

    public Double getLiveSolarKw() { return liveSolarKw; }
    public void setLiveSolarKw(Double liveSolarKw) { this.liveSolarKw = liveSolarKw; }

    public Double getLiveWindKw() { return liveWindKw; }
    public void setLiveWindKw(Double liveWindKw) { this.liveWindKw = liveWindKw; }

    public Double getCleanGenerationKw() { return cleanGenerationKw; }
    public void setCleanGenerationKw(Double cleanGenerationKw) { this.cleanGenerationKw = cleanGenerationKw; }

    public Double getCampusLoadKw() { return campusLoadKw; }
    public void setCampusLoadKw(Double campusLoadKw) { this.campusLoadKw = campusLoadKw; }

    public List<HostelLeaderboardEntryDTO> getHostelLeaderboard() { return hostelLeaderboard; }
    public void setHostelLeaderboard(List<HostelLeaderboardEntryDTO> hostelLeaderboard) { this.hostelLeaderboard = hostelLeaderboard; }

    public EcoTipDTO getEcoTipOfTheDay() { return ecoTipOfTheDay; }
    public void setEcoTipOfTheDay(EcoTipDTO ecoTipOfTheDay) { this.ecoTipOfTheDay = ecoTipOfTheDay; }

    public String getSafetyAudit() { return safetyAudit; }
    public void setSafetyAudit(String safetyAudit) { this.safetyAudit = safetyAudit; }

    public static class HostelLeaderboardEntryDTO {
        private Integer rank;
        private String hostelName;
        private Double savedKwh;
        private Integer karmaPoints;
        private Integer totalResidents;

        public HostelLeaderboardEntryDTO() {}

        public HostelLeaderboardEntryDTO(Integer rank, String hostelName, Double savedKwh, Integer karmaPoints, Integer totalResidents) {
            this.rank = rank;
            this.hostelName = hostelName;
            this.savedKwh = savedKwh;
            this.karmaPoints = karmaPoints;
            this.totalResidents = totalResidents;
        }

        public Integer getRank() { return rank; }
        public void setRank(Integer rank) { this.rank = rank; }

        public String getHostelName() { return hostelName; }
        public void setHostelName(String hostelName) { this.hostelName = hostelName; }

        public Double getSavedKwh() { return savedKwh; }
        public void setSavedKwh(Double savedKwh) { this.savedKwh = savedKwh; }

        public Integer getKarmaPoints() { return karmaPoints; }
        public void setKarmaPoints(Integer karmaPoints) { this.karmaPoints = karmaPoints; }

        public Integer getTotalResidents() { return totalResidents; }
        public void setTotalResidents(Integer totalResidents) { this.totalResidents = totalResidents; }
    }

    public static class EcoTipDTO {
        private String tipEn;
        private String tipHi;
        private String category;

        public EcoTipDTO() {}

        public EcoTipDTO(String tipEn, String tipHi, String category) {
            this.tipEn = tipEn;
            this.tipHi = tipHi;
            this.category = category;
        }

        public String getTipEn() { return tipEn; }
        public void setTipEn(String tipEn) { this.tipEn = tipEn; }

        public String getTipHi() { return tipHi; }
        public void setTipHi(String tipHi) { this.tipHi = tipHi; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }
}
