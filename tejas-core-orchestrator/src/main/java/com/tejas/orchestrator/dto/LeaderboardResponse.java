package com.tejas.orchestrator.dto;

import com.tejas.orchestrator.entity.HostelBlock;
import com.tejas.orchestrator.entity.Student;
import java.util.List;

public class LeaderboardResponse {

    private List<HostelBlock> hostelLeaderboard;
    private List<Student> topStudents;

    public LeaderboardResponse() {
    }

    public LeaderboardResponse(List<HostelBlock> hostelLeaderboard, List<Student> topStudents) {
        this.hostelLeaderboard = hostelLeaderboard;
        this.topStudents = topStudents;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private List<HostelBlock> hostelLeaderboard;
        private List<Student> topStudents;

        public Builder hostelLeaderboard(List<HostelBlock> hostelLeaderboard) {
            this.hostelLeaderboard = hostelLeaderboard;
            return this;
        }

        public Builder topStudents(List<Student> topStudents) {
            this.topStudents = topStudents;
            return this;
        }

        public LeaderboardResponse build() {
            return new LeaderboardResponse(hostelLeaderboard, topStudents);
        }
    }

    public List<HostelBlock> getHostelLeaderboard() { return hostelLeaderboard; }
    public void setHostelLeaderboard(List<HostelBlock> hostelLeaderboard) { this.hostelLeaderboard = hostelLeaderboard; }

    public List<Student> getTopStudents() { return topStudents; }
    public void setTopStudents(List<Student> topStudents) { this.topStudents = topStudents; }
}
