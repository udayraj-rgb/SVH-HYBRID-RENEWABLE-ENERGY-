package com.tejas.orchestrator.repository;

import com.tejas.orchestrator.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    List<Student> findByWhatsappOptInTrue();

    List<Student> findTop10ByOrderByKarmaPointsDesc();
}
