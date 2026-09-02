package com.tejas.orchestrator.config;

import com.tejas.orchestrator.entity.HostelBlock;
import com.tejas.orchestrator.entity.Student;
import com.tejas.orchestrator.repository.HostelBlockRepository;
import com.tejas.orchestrator.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final HostelBlockRepository hostelBlockRepository;
    private final StudentRepository studentRepository;

    public DataInitializer(HostelBlockRepository hostelBlockRepository, StudentRepository studentRepository) {
        this.hostelBlockRepository = hostelBlockRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public void run(String... args) {
        // Ensure hostels exist
        if (hostelBlockRepository.count() == 0) {
            log.info("Seeding initial TEJAS GRID hostel blocks...");

            HostelBlock blockA = HostelBlock.builder()
                    .name("Block A (Aryabhata)")
                    .totalResidents(450)
                    .cumulativeSavedKwh(1420.5)
                    .currentKarmaPoints(3450)
                    .rank(1)
                    .build();

            HostelBlock blockB = HostelBlock.builder()
                    .name("Block B (Bhaskara)")
                    .totalResidents(380)
                    .cumulativeSavedKwh(1180.0)
                    .currentKarmaPoints(2890)
                    .rank(2)
                    .build();

            HostelBlock blockC = HostelBlock.builder()
                    .name("Block C (Charaka)")
                    .totalResidents(420)
                    .cumulativeSavedKwh(940.2)
                    .currentKarmaPoints(2340)
                    .rank(3)
                    .build();

            hostelBlockRepository.saveAll(List.of(blockA, blockB, blockC));
        }

        List<HostelBlock> hostels = hostelBlockRepository.findAll();
        HostelBlock hA = hostels.get(0);
        HostelBlock hB = hostels.size() > 1 ? hostels.get(1) : hA;
        HostelBlock hC = hostels.size() > 2 ? hostels.get(2) : hA;

        // Ensure real testing number and student records with registration numbers are present
        boolean testUserExists = studentRepository.findAll().stream()
                .anyMatch(s -> "+918238893551".equals(s.getPhoneNumber()) || "8238893551".equals(s.getPhoneNumber()));

        if (!testUserExists) {
            log.info("Registering real test student (+918238893551) with hostel registration...");

            Student udayraj = Student.builder()
                    .name("Udayraj")
                    .registrationNumber("24BCE1082")
                    .phoneNumber("+918238893551")
                    .email("udayraj@campus.tejas.edu")
                    .karmaPoints(550)
                    .whatsappOptIn(true)
                    .hostel(hA)
                    .build();

            studentRepository.save(udayraj);
        }

        // Backfill registration numbers for any existing legacy student rows
        List<Student> allStudents = studentRepository.findAll();
        boolean updated = false;
        String[] sampleRegs = {"24BCE1001", "24BEE1045", "24BME1078", "24BIT1012", "24BCE1090", "24BCE1082"};
        for (int i = 0; i < allStudents.size(); i++) {
            Student s = allStudents.get(i);
            if (s.getRegistrationNumber() == null || s.getRegistrationNumber().isBlank()) {
                s.setRegistrationNumber(sampleRegs[i % sampleRegs.length]);
                updated = true;
            }
        }
        if (updated) {
            studentRepository.saveAll(allStudents);
        }

        log.info("Student directory initialized: {} active students in PostgreSQL.", studentRepository.count());
    }
}
