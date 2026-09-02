package com.tejasgrid.repository;

import com.tejasgrid.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, UUID> {

    List<StudentProfile> findByWhatsappOptInTrue();

    List<StudentProfile> findByHostelId(UUID hostelId);
}
