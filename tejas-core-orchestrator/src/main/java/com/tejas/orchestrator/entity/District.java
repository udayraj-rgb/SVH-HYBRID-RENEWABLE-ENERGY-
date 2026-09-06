package com.tejas.orchestrator.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "districts")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class District {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g. Jaipur, Bikaner

    @Column(nullable = false, unique = true, length = 10)
    private String code; // e.g. JPR, BKN

    @OneToMany(mappedBy = "district", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Campus> campuses = new ArrayList<>();

    public District() {
    }

    public District(Long id, String name, String code, List<Campus> campuses) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.campuses = campuses != null ? campuses : new ArrayList<>();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String name;
        private String code;
        private List<Campus> campuses = new ArrayList<>();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder code(String code) { this.code = code; return this; }
        public Builder campuses(List<Campus> campuses) { this.campuses = campuses; return this; }

        public District build() {
            return new District(id, name, code, campuses);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public List<Campus> getCampuses() { return campuses; }
    public void setCampuses(List<Campus> campuses) { this.campuses = campuses; }
}
