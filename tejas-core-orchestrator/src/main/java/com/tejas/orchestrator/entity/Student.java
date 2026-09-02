package com.tejas.orchestrator.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private Integer karmaPoints;

    @Column(nullable = false)
    private Boolean whatsappOptIn;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hostel_id", nullable = false)
    @JsonIgnoreProperties("students")
    private HostelBlock hostel;

    public Student() {
    }

    public Student(Long id, String name, String phoneNumber, String email, Integer karmaPoints, Boolean whatsappOptIn, HostelBlock hostel) {
        this.id = id;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.karmaPoints = karmaPoints;
        this.whatsappOptIn = whatsappOptIn;
        this.hostel = hostel;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String name;
        private String phoneNumber;
        private String email;
        private Integer karmaPoints;
        private Boolean whatsappOptIn;
        private HostelBlock hostel;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder karmaPoints(Integer karmaPoints) { this.karmaPoints = karmaPoints; return this; }
        public Builder whatsappOptIn(Boolean whatsappOptIn) { this.whatsappOptIn = whatsappOptIn; return this; }
        public Builder hostel(HostelBlock hostel) { this.hostel = hostel; return this; }

        public Student build() {
            return new Student(id, name, phoneNumber, email, karmaPoints, whatsappOptIn, hostel);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Integer getKarmaPoints() { return karmaPoints; }
    public void setKarmaPoints(Integer karmaPoints) { this.karmaPoints = karmaPoints; }

    public Boolean getWhatsappOptIn() { return whatsappOptIn; }
    public void setWhatsappOptIn(Boolean whatsappOptIn) { this.whatsappOptIn = whatsappOptIn; }

    public HostelBlock getHostel() { return hostel; }
    public void setHostel(HostelBlock hostel) { this.hostel = hostel; }
}
