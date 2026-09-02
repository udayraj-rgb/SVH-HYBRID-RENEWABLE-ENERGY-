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
        if (hostelBlockRepository.count() == 0) {
            log.info("Seeding initial TEJAS GRID hostel blocks and students...");

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

            List<HostelBlock> savedHostels = hostelBlockRepository.saveAll(List.of(blockA, blockB, blockC));

            HostelBlock hA = savedHostels.get(0);
            HostelBlock hB = savedHostels.get(1);
            HostelBlock hC = savedHostels.get(2);

            List<Student> students = List.of(
                    Student.builder()
                            .name("Aarav Sharma")
                            .phoneNumber("+919876543210")
                            .email("aarav.s@campus.tejas.edu")
                            .karmaPoints(420)
                            .whatsappOptIn(true)
                            .hostel(hA)
                            .build(),
                    Student.builder()
                            .name("Priya Patel")
                            .phoneNumber("+919876543211")
                            .email("priya.p@campus.tejas.edu")
                            .karmaPoints(380)
                            .whatsappOptIn(true)
                            .hostel(hB)
                            .build(),
                    Student.builder()
                            .name("Rohan Verma")
                            .phoneNumber("+919876543212")
                            .email("rohan.v@campus.tejas.edu")
                            .karmaPoints(310)
                            .whatsappOptIn(false)
                            .hostel(hA)
                            .build(),
                    Student.builder()
                            .name("Ananya Iyer")
                            .phoneNumber("+919876543213")
                            .email("ananya.i@campus.tejas.edu")
                            .karmaPoints(290)
                            .whatsappOptIn(true)
                            .hostel(hC)
                            .build(),
                    Student.builder()
                            .name("Vikram Singh")
                            .phoneNumber("+919876543214")
                            .email("vikram.s@campus.tejas.edu")
                            .karmaPoints(260)
                            .whatsappOptIn(true)
                            .hostel(hB)
                            .build()
            );

            studentRepository.saveAll(students);
            log.info("Successfully seeded 3 hostels and 5 students into PostgreSQL.");
        } else {
            log.info("PostgreSQL database already contains hostel and student records. Skipping seed.");
        }
    }
}
