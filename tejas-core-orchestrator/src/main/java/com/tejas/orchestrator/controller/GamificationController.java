package com.tejas.orchestrator.controller;

import com.tejas.orchestrator.dto.LeaderboardResponse;
import com.tejas.orchestrator.entity.HostelBlock;
import com.tejas.orchestrator.entity.Student;
import com.tejas.orchestrator.repository.HostelBlockRepository;
import com.tejas.orchestrator.repository.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/gamification")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000", "http://127.0.0.1:8000"})
public class GamificationController {

    private final HostelBlockRepository hostelBlockRepository;
    private final StudentRepository studentRepository;

    public GamificationController(HostelBlockRepository hostelBlockRepository, StudentRepository studentRepository) {
        this.hostelBlockRepository = hostelBlockRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * GET /api/v1/gamification/leaderboard
     * Returns ranked hostels and student top contributors.
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<LeaderboardResponse> getLeaderboard() {
        List<HostelBlock> rankedHostels = hostelBlockRepository.findAllByOrderByCumulativeSavedKwhDesc();
        // Update rank numbers dynamically
        for (int i = 0; i < rankedHostels.size(); i++) {
            rankedHostels.get(i).setRank(i + 1);
        }

        List<Student> topStudents = studentRepository.findTop10ByOrderByKarmaPointsDesc();

        LeaderboardResponse response = LeaderboardResponse.builder()
                .hostelLeaderboard(rankedHostels)
                .topStudents(topStudents)
                .build();

        return ResponseEntity.ok(response);
    }
}
