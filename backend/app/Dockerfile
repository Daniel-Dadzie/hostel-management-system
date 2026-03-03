# ─── Stage 1: Build ────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Resolve Maven dependencies before copying source code.
# Because pom.xml changes far less often than source files this layer is
# cached until the dependency manifest changes – drastically speeding up
# successive builds.
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline -q

# Compile & package (tests run in CI; skip here for fast image builds)
COPY src src
RUN ./mvnw package -DskipTests -q

# ─── Stage 2: Minimal runtime image ─────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Principle of least privilege – never run as root inside the container
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

# Spring Boot Actuator health endpoint used by Docker / K8s liveness probes
HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=5 \
    CMD wget -qO- http://localhost:8080/actuator/health 2>/dev/null \
        | grep -c '"status":"UP"' || exit 1

# /dev/./urandom avoids JVM blocking on /dev/random entropy during startup
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
