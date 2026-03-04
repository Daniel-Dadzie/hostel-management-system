# ─── Stage 1: Build ────────────────────────────────────────────────────────
FROM maven:3.9.11-eclipse-temurin-21 AS builder
WORKDIR /app

# Resolve Maven dependencies before copying source code.
# Because pom.xml changes far less often than source files this layer is
# cached until the dependency manifest changes – drastically speeding up
# successive builds.
COPY pom.xml ./
RUN mvn dependency:go-offline -q

# Compile & package (tests run in CI; skip here for fast image builds)
COPY src src
RUN mvn package -DskipTests -q

# ─── Stage 2: Minimal runtime image ─────────────────────────────────────────
FROM eclipse-temurin:21-jre-noble
WORKDIR /app

# Principle of least privilege – never run as root inside the container
RUN apt-get update \
    && apt-get dist-upgrade -y \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system spring \
    && useradd --system --gid spring --create-home spring
USER spring:spring

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

# Spring Boot Actuator health endpoint used by Docker / K8s liveness probes
HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=5 \
    CMD wget -qO- http://localhost:8080/actuator/health 2>/dev/null \
        | grep -c '"status":"UP"' || exit 1

# /dev/./urandom avoids JVM blocking on /dev/random entropy during startup
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
