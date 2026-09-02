# Multi-stage Docker build for Spring Boot on Render
# Stage 1: Build with official Maven 3.9 + Java 17 image
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Cache dependencies
COPY pom.xml ./
RUN mvn dependency:go-offline -B || true

# Copy source code and build production JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal runtime image (JRE 17 Alpine)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=builder /app/target/tejas-core-orchestrator-1.0.0.jar app.jar

EXPOSE 8080

# Keep JVM heap within Render free tier limit (512MB RAM)
ENV JAVA_OPTS="-Xmx350m -Xms128m -XX:+UseG1GC"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar"]
