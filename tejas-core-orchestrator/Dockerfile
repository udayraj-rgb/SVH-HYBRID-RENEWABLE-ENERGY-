# Multi-stage Docker build for Spring Boot on Render (Java 17 Alpine)
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Compile and package application JAR
COPY src src
RUN ./mvnw package -DskipTests

# Minimal runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=builder /app/target/tejas-core-orchestrator-1.0.0.jar app.jar

EXPOSE 8080

# Keep JVM heap within Render free tier limit (512MB)
ENV JAVA_OPTS="-Xmx384m -Xms128m -XX:+UseG1GC"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar"]
