package com.tejas.orchestrator.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hostel_blocks")
public class HostelBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private Integer totalResidents;

    @Column(nullable = false)
    private Double cumulativeSavedKwh;

    @Column(nullable = false)
    private Integer currentKarmaPoints;

    @Column(name = "leaderboard_rank")
    private Integer rank;

    @OneToMany(mappedBy = "hostel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Student> students = new ArrayList<>();

    public HostelBlock() {
    }

    public HostelBlock(Long id, String name, Integer totalResidents, Double cumulativeSavedKwh, Integer currentKarmaPoints, Integer rank, List<Student> students) {
        this.id = id;
        this.name = name;
        this.totalResidents = totalResidents;
        this.cumulativeSavedKwh = cumulativeSavedKwh;
        this.currentKarmaPoints = currentKarmaPoints;
        this.rank = rank;
        this.students = students != null ? students : new ArrayList<>();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String name;
        private Integer totalResidents;
        private Double cumulativeSavedKwh;
        private Integer currentKarmaPoints;
        private Integer rank;
        private List<Student> students = new ArrayList<>();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder totalResidents(Integer totalResidents) { this.totalResidents = totalResidents; return this; }
        public Builder cumulativeSavedKwh(Double cumulativeSavedKwh) { this.cumulativeSavedKwh = cumulativeSavedKwh; return this; }
        public Builder currentKarmaPoints(Integer currentKarmaPoints) { this.currentKarmaPoints = currentKarmaPoints; return this; }
        public Builder rank(Integer rank) { this.rank = rank; return this; }
        public Builder students(List<Student> students) { this.students = students; return this; }

        public HostelBlock build() {
            return new HostelBlock(id, name, totalResidents, cumulativeSavedKwh, currentKarmaPoints, rank, students);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getTotalResidents() { return totalResidents; }
    public void setTotalResidents(Integer totalResidents) { this.totalResidents = totalResidents; }

    public Double getCumulativeSavedKwh() { return cumulativeSavedKwh; }
    public void setCumulativeSavedKwh(Double cumulativeSavedKwh) { this.cumulativeSavedKwh = cumulativeSavedKwh; }

    public Integer getCurrentKarmaPoints() { return currentKarmaPoints; }
    public void setCurrentKarmaPoints(Integer currentKarmaPoints) { this.currentKarmaPoints = currentKarmaPoints; }

    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }

    public List<Student> getStudents() { return students; }
    public void setStudents(List<Student> students) { this.students = students; }
}
