package com.tejas.orchestrator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TejasOrchestratorApplication {

    public static void main(String[] args) {
        SpringApplication.run(TejasOrchestratorApplication.class, args);
    }
}
