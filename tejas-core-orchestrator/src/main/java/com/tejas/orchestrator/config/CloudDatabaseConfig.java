package com.tejas.orchestrator.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class CloudDatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(CloudDatabaseConfig.class);

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String envDbUrl = System.getenv("DATABASE_URL");
        if (envDbUrl == null || envDbUrl.isBlank()) {
            envDbUrl = System.getenv("SPRING_DATASOURCE_URL");
        }

        if (envDbUrl != null && !envDbUrl.isBlank()) {
            if (envDbUrl.startsWith("postgres://") || envDbUrl.startsWith("postgresql://")) {
                try {
                    URI uri = new URI(envDbUrl.replace("postgres://", "http://").replace("postgresql://", "http://"));
                    String userInfo = uri.getUserInfo();
                    String username = properties.getUsername();
                    String password = properties.getPassword();

                    if (userInfo != null && userInfo.contains(":")) {
                        String[] parts = userInfo.split(":", 2);
                        username = parts[0];
                        password = parts[1];
                    }

                    int port = (uri.getPort() != -1) ? uri.getPort() : 5432;
                    String dbPath = uri.getPath();
                    if (dbPath != null && dbPath.startsWith("/")) {
                        dbPath = dbPath.substring(1);
                    }

                    String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + "/" + dbPath;
                    if (uri.getQuery() != null && !uri.getQuery().isBlank()) {
                        jdbcUrl += "?" + uri.getQuery();
                    }

                    log.info("Configured Cloud JDBC Datasource -> jdbc:postgresql://{}:{}/{}", uri.getHost(), port, dbPath);
                    properties.setUrl(jdbcUrl);
                    properties.setUsername(username);
                    properties.setPassword(password);
                } catch (Exception e) {
                    log.warn("Failed parsing cloud database URL ({}), falling back to default: {}", envDbUrl, e.getMessage());
                }
            } else if (!envDbUrl.startsWith("jdbc:")) {
                properties.setUrl("jdbc:" + envDbUrl);
            } else {
                properties.setUrl(envDbUrl);
            }
        }

        return properties.initializeDataSourceBuilder().build();
    }
}
