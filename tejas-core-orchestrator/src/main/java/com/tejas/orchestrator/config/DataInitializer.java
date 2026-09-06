package com.tejas.orchestrator.config;

import com.tejas.orchestrator.entity.*;
import com.tejas.orchestrator.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final HostelBlockRepository hostelBlockRepository;
    private final StudentRepository studentRepository;
    private final DistrictRepository districtRepository;
    private final CampusRepository campusRepository;
    private final UserRepository userRepository;
    private final TelemetryReadingRepository telemetryReadingRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(HostelBlockRepository hostelBlockRepository,
                           StudentRepository studentRepository,
                           DistrictRepository districtRepository,
                           CampusRepository campusRepository,
                           UserRepository userRepository,
                           TelemetryReadingRepository telemetryReadingRepository,
                           PasswordEncoder passwordEncoder) {
        this.hostelBlockRepository = hostelBlockRepository;
        this.studentRepository = studentRepository;
        this.districtRepository = districtRepository;
        this.campusRepository = campusRepository;
        this.userRepository = userRepository;
        this.telemetryReadingRepository = telemetryReadingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // =========================================================================
        // 1. SEED 20 RAJASTHAN DISTRICTS & ANCHOR CAMPUSES
        // =========================================================================
        record CampusSeedSpec(String districtName, String districtCode, String campusName,
                              double lat, double lon, double sanctionedKw, double solarKw, double windKw, double batteryKwh) {}

        List<CampusSeedSpec> seedSpecs = List.of(
            new CampusSeedSpec("Jaipur", "JPR", "MNIT / UNIRAJ Campus", 26.9124, 75.7873, 500.0, 350.0, 50.0, 200.0),
            new CampusSeedSpec("Jodhpur", "JDH", "IIT Jodhpur / JNVU Campus", 26.2389, 73.0243, 600.0, 450.0, 100.0, 300.0),
            new CampusSeedSpec("Kota", "KOTA", "RTU / Govt Poly College", 25.2138, 75.8648, 400.0, 250.0, 30.0, 150.0),
            new CampusSeedSpec("Udaipur", "UDZ", "MLSU / CTAE MPUAT Campus", 24.5854, 73.7125, 450.0, 300.0, 40.0, 180.0),
            new CampusSeedSpec("Ajmer", "AJM", "Govt Engineering College Ajmer", 26.4499, 74.6399, 350.0, 220.0, 30.0, 120.0),
            new CampusSeedSpec("Bikaner", "BKN", "BTU / Govt Engg College Bikaner", 28.0229, 73.3119, 400.0, 320.0, 80.0, 200.0),
            new CampusSeedSpec("Alwar", "ALW", "RRBMU / Govt Arts College", 27.5530, 76.6346, 300.0, 180.0, 20.0, 100.0),
            new CampusSeedSpec("Sikar", "SIKR", "Pandit Deendayal Upadhyaya Shekhawati Univ", 27.6094, 75.1398, 280.0, 160.0, 25.0, 90.0),
            new CampusSeedSpec("Bharatpur", "BHR", "Maharaja Surajmal Brij Univ", 27.2152, 77.5030, 250.0, 150.0, 15.0, 80.0),
            new CampusSeedSpec("Banswara", "BWA", "Govind Guru Tribal Univ (GGTU)", 23.5461, 74.4349, 220.0, 140.0, 20.0, 70.0),
            new CampusSeedSpec("Bhilwara", "BHL", "MLV Textile & Engineering College", 25.3407, 74.6313, 380.0, 260.0, 40.0, 150.0),
            new CampusSeedSpec("Churu", "CUR", "Government Lohia College", 28.2900, 74.9600, 260.0, 180.0, 35.0, 100.0),
            new CampusSeedSpec("Jhalawar", "JHW", "Govt PG College / Medical Campus", 24.5973, 76.1610, 240.0, 150.0, 20.0, 80.0),
            new CampusSeedSpec("Sri Ganganagar", "SGNR", "Govt National College", 29.9038, 73.8772, 250.0, 170.0, 30.0, 90.0),
            new CampusSeedSpec("Chittorgarh", "COR", "Govt PG College Chittorgarh", 24.8887, 74.6269, 230.0, 140.0, 20.0, 70.0),
            new CampusSeedSpec("Jhunjhunu", "JJN", "Seth Motilal Govt College", 28.1289, 75.3995, 220.0, 130.0, 25.0, 70.0),
            new CampusSeedSpec("Pali", "PALI", "Bangur Govt College", 25.7711, 73.3234, 240.0, 160.0, 30.0, 80.0),
            new CampusSeedSpec("Nagaur", "NGO", "Govt B.R. Mirdha College", 27.2000, 73.7400, 230.0, 150.0, 30.0, 75.0),
            new CampusSeedSpec("Hanumangarh", "HMH", "Govt Nehru Memorial PG College", 29.5800, 74.3200, 220.0, 140.0, 25.0, 70.0),
            new CampusSeedSpec("Barmer", "BME", "Govt PG College Barmer", 25.7521, 71.3967, 280.0, 220.0, 50.0, 110.0)
        );

        Campus gecBikaner = null;
        Campus gpJaipur = null;

        for (CampusSeedSpec spec : seedSpecs) {
            District district = districtRepository.findByCode(spec.districtCode()).orElseGet(() -> {
                log.info("Seeding District {} ({})", spec.districtName(), spec.districtCode());
                return districtRepository.save(District.builder().name(spec.districtName()).code(spec.districtCode()).build());
            });

            Campus campus = null;
            if ("BKN".equals(spec.districtCode())) {
                campus = campusRepository.findByName("BTU / Govt Engg College Bikaner")
                        .or(() -> campusRepository.findByName("Govt Engineering College Bikaner"))
                        .orElse(null);
            } else if ("JPR".equals(spec.districtCode())) {
                campus = campusRepository.findByName("MNIT / UNIRAJ Campus")
                        .or(() -> campusRepository.findByName("Govt Polytechnic College Jaipur"))
                        .orElse(null);
            } else {
                campus = campusRepository.findByName(spec.campusName()).orElse(null);
            }

            if (campus != null) {
                campus.setName(spec.campusName());
                campus.setDistrict(district);
                campus.setLatitude(spec.lat());
                campus.setLongitude(spec.lon());
                campus.setSanctionedLoadKw(spec.sanctionedKw());
                campus.setSolarCapacityKw(spec.solarKw());
                campus.setWindCapacityKw(spec.windKw());
                campus.setBatteryCapacityKwh(spec.batteryKwh());
                campus = campusRepository.save(campus);
            } else {
                log.info("Seeding Anchor Campus: {}...", spec.campusName());
                campus = campusRepository.save(Campus.builder()
                        .name(spec.campusName())
                        .district(district)
                        .latitude(spec.lat())
                        .longitude(spec.lon())
                        .sanctionedLoadKw(spec.sanctionedKw())
                        .solarCapacityKw(spec.solarKw())
                        .windCapacityKw(spec.windKw())
                        .batteryCapacityKwh(spec.batteryKwh())
                        .build());
            }

            if ("BKN".equals(spec.districtCode())) {
                gecBikaner = campus;
            } else if ("JPR".equals(spec.districtCode())) {
                gpJaipur = campus;
            }
        }

        // =========================================================================
        // 3. SEED TELEMETRY READINGS (Initial data points for each campus)
        // =========================================================================
        if (telemetryReadingRepository.findByCampusIdOrderByTimestampDesc(gecBikaner.getId()).isEmpty()) {
            log.info("Seeding initial telemetry reading for GEC Bikaner...");
            telemetryReadingRepository.save(TelemetryReading.builder()
                    .campus(gecBikaner)
                    .timestamp(LocalDateTime.now().minusMinutes(5))
                    .solarKw(460.5)
                    .windKw(82.0)
                    .campusLoadKw(520.0)
                    .batterySocPct(82.5)
                    .gridImportKw(0.0)
                    .gridExportKw(22.5)
                    .build());
        }

        if (telemetryReadingRepository.findByCampusIdOrderByTimestampDesc(gpJaipur.getId()).isEmpty()) {
            log.info("Seeding initial telemetry reading for GP Jaipur...");
            telemetryReadingRepository.save(TelemetryReading.builder()
                    .campus(gpJaipur)
                    .timestamp(LocalDateTime.now().minusMinutes(5))
                    .solarKw(290.0)
                    .windKw(0.0)
                    .campusLoadKw(340.0)
                    .batterySocPct(68.0)
                    .gridImportKw(50.0)
                    .gridExportKw(0.0)
                    .build());
        }

        // =========================================================================
        // 4. SEED ROLE-BASED TEST USERS (BCrypt Hashed)
        // =========================================================================
        // User 1: State-level DTE Admin (Govt) -> Unrestricted access across all districts and campuses
        if (!userRepository.existsByUsername("govt_admin")) {
            log.info("Seeding user: govt_admin (ROLE_GOVT)...");
            userRepository.save(User.builder()
                    .username("govt_admin")
                    .password(passwordEncoder.encode("Govt@2026"))
                    .fullName("DTE State Director (Rajasthan)")
                    .email("dte.director@rajasthan.gov.in")
                    .role(Role.ROLE_GOVT)
                    .campus(null) // Unrestricted across all districts
                    .enabled(true)
                    .build());
        }

        // User 2: Campus Facility Engineer (Operator) -> Strictly scoped to GEC Bikaner
        if (!userRepository.existsByUsername("operator_bikaner")) {
            log.info("Seeding user: operator_bikaner (ROLE_OPERATOR for GEC Bikaner)...");
            userRepository.save(User.builder()
                    .username("operator_bikaner")
                    .password(passwordEncoder.encode("Operator@2026"))
                    .fullName("Er. Rameshwar Lal (GEC Bikaner)")
                    .email("energy.gecb@rajasthan.gov.in")
                    .role(Role.ROLE_OPERATOR)
                    .campus(gecBikaner)
                    .enabled(true)
                    .build());
        }

        // User 3: Campus Student -> Scoped read-only view for GEC Bikaner
        if (!userRepository.existsByUsername("student_bikaner")) {
            log.info("Seeding user: student_bikaner (ROLE_STUDENT for GEC Bikaner)...");
            userRepository.save(User.builder()
                    .username("student_bikaner")
                    .password(passwordEncoder.encode("Student@2026"))
                    .fullName("Pooja Choudhary (Student GECB)")
                    .email("pooja.24bce@gecb.ac.in")
                    .role(Role.ROLE_STUDENT)
                    .campus(gecBikaner)
                    .enabled(true)
                    .build());
        }

        // User 4: Campus Facility Engineer for Jaipur
        if (!userRepository.existsByUsername("operator_jaipur")) {
            log.info("Seeding user: operator_jaipur (ROLE_OPERATOR for GP Jaipur)...");
            userRepository.save(User.builder()
                    .username("operator_jaipur")
                    .password(passwordEncoder.encode("Operator@2026"))
                    .fullName("Er. Suman Sharma (GP Jaipur)")
                    .email("energy.gpj@rajasthan.gov.in")
                    .role(Role.ROLE_OPERATOR)
                    .campus(gpJaipur)
                    .enabled(true)
                    .build());
        }

        // Seed Remaining 18 Campus Facility Operators across Rajasthan
        List<String[]> operatorAccounts = List.of(
            new String[]{"operator_jodhpur", "IIT Jodhpur / JNVU Campus", "Er. Mahendra Singh (IIT Jodhpur)", "energy.jdh@rajasthan.gov.in"},
            new String[]{"operator_kota", "RTU / Govt Poly College", "Er. Ankit Agrawal (RTU Kota)", "energy.kota@rajasthan.gov.in"},
            new String[]{"operator_udaipur", "MLSU / CTAE MPUAT Campus", "Er. Vikas Meena (CTAE Udaipur)", "energy.udz@rajasthan.gov.in"},
            new String[]{"operator_ajmer", "Govt Engineering College Ajmer", "Er. Sunita Rathore (GEC Ajmer)", "energy.ajm@rajasthan.gov.in"},
            new String[]{"operator_alwar", "RRBMU / Govt Arts College", "Er. Hemant Yadav (RRBMU Alwar)", "energy.alw@rajasthan.gov.in"},
            new String[]{"operator_sikar", "Pandit Deendayal Upadhyaya Shekhawati Univ", "Er. Suresh Kumar (Shekhawati Univ)", "energy.sikr@rajasthan.gov.in"},
            new String[]{"operator_bharatpur", "Maharaja Surajmal Brij Univ", "Er. Neeraj Sharma (MSBU Bharatpur)", "energy.bhr@rajasthan.gov.in"},
            new String[]{"operator_banswara", "Govind Guru Tribal Univ (GGTU)", "Er. Kaluram Damor (GGTU Banswara)", "energy.bwa@rajasthan.gov.in"},
            new String[]{"operator_bhilwara", "MLV Textile & Engineering College", "Er. Deepak Maheshwari (MLVTEC Bhilwara)", "energy.bhl@rajasthan.gov.in"},
            new String[]{"operator_churu", "Government Lohia College", "Er. Vinod Shekhawat (Lohia College Churu)", "energy.cur@rajasthan.gov.in"},
            new String[]{"operator_jhalawar", "Govt PG College / Medical Campus", "Er. Rohit Patidar (Govt College Jhalawar)", "energy.jhw@rajasthan.gov.in"},
            new String[]{"operator_ganganagar", "Govt National College", "Er. Gurpreet Singh (National College SGNR)", "energy.sgnr@rajasthan.gov.in"},
            new String[]{"operator_chittorgarh", "Govt PG College Chittorgarh", "Er. Lokendra Sisodia (Govt College Chittor)", "energy.cor@rajasthan.gov.in"},
            new String[]{"operator_jhunjhunu", "Seth Motilal Govt College", "Er. Naveen Kedia (Motilal College JJN)", "energy.jjn@rajasthan.gov.in"},
            new String[]{"operator_pali", "Bangur Govt College", "Er. Ratan Choudhary (Bangur College Pali)", "energy.pali@rajasthan.gov.in"},
            new String[]{"operator_nagaur", "Govt B.R. Mirdha College", "Er. Manoj Gehlot (Mirdha College Nagaur)", "energy.ngo@rajasthan.gov.in"},
            new String[]{"operator_hanumangarh", "Govt Nehru Memorial PG College", "Er. Balwant Saharan (Nehru College HMH)", "energy.hmh@rajasthan.gov.in"},
            new String[]{"operator_barmer", "Govt PG College Barmer", "Er. Tanwar Singh (Govt College Barmer)", "energy.bme@rajasthan.gov.in"}
        );

        for (String[] op : operatorAccounts) {
            String opUsername = op[0];
            String campusName = op[1];
            String fullName = op[2];
            String email = op[3];
            if (!userRepository.existsByUsername(opUsername)) {
                campusRepository.findByName(campusName).ifPresent(camp -> {
                    log.info("Seeding operator user: {} for {}", opUsername, camp.getName());
                    userRepository.save(User.builder()
                            .username(opUsername)
                            .password(passwordEncoder.encode("Operator@2026"))
                            .fullName(fullName)
                            .email(email)
                            .role(Role.ROLE_OPERATOR)
                            .campus(camp)
                            .enabled(true)
                            .build());
                });
            }
        }

        // =========================================================================
        // 5. EXISTING PRESERVED LOGIC: HOSTEL BLOCKS & STUDENTS
        // =========================================================================
        if (hostelBlockRepository.count() == 0) {
            log.info("Seeding initial TEJAS GRID hostel blocks...");

            HostelBlock blockA = HostelBlock.builder()
                    .name("Block A (Aryabhata)")
                    .totalResidents(450)
                    .cumulativeSavedKwh(1420.5)
                    .currentKarmaPoints(3450)
                    .rank(1)
                    .campus(gecBikaner)
                    .build();

            HostelBlock blockB = HostelBlock.builder()
                    .name("Block B (Bhaskara)")
                    .totalResidents(380)
                    .cumulativeSavedKwh(1180.0)
                    .currentKarmaPoints(2890)
                    .rank(2)
                    .campus(gecBikaner)
                    .build();

            HostelBlock blockC = HostelBlock.builder()
                    .name("Block C (Charaka)")
                    .totalResidents(420)
                    .cumulativeSavedKwh(940.2)
                    .currentKarmaPoints(2340)
                    .rank(3)
                    .campus(gecBikaner)
                    .build();

            hostelBlockRepository.saveAll(List.of(blockA, blockB, blockC));
        }

        List<HostelBlock> hostels = hostelBlockRepository.findAll();
        // Link any hostels missing campus to GEC Bikaner
        for (HostelBlock h : hostels) {
            if (h.getCampus() == null) {
                h.setCampus(gecBikaner);
                hostelBlockRepository.save(h);
            }
        }

        HostelBlock hA = hostels.get(0);

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
                    .campus(gecBikaner)
                    .build();

            studentRepository.save(udayraj);
        }

        // Backfill registration numbers & campus for any existing legacy student rows
        List<Student> allStudents = studentRepository.findAll();
        boolean updated = false;
        String[] sampleRegs = {"24BCE1001", "24BEE1045", "24BME1078", "24BIT1012", "24BCE1090", "24BCE1082"};
        for (int i = 0; i < allStudents.size(); i++) {
            Student s = allStudents.get(i);
            if (s.getRegistrationNumber() == null || s.getRegistrationNumber().isBlank()) {
                s.setRegistrationNumber(sampleRegs[i % sampleRegs.length]);
                updated = true;
            }
            if (s.getCampus() == null) {
                s.setCampus(gecBikaner);
                updated = true;
            }
        }
        if (updated) {
            studentRepository.saveAll(allStudents);
        }

        log.info("TEJAS GRID Initialization Complete:");
        log.info(" -> Districts: {}", districtRepository.count());
        log.info(" -> Campuses: {}", campusRepository.count());
        log.info(" -> RBAC Users: {}", userRepository.count());
        log.info(" -> Students: {}", studentRepository.count());
        log.info(" -> Hostel Blocks: {}", hostelBlockRepository.count());
    }
}
