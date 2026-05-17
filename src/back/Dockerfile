# syntax=docker/dockerfile:1
FROM eclipse-temurin:25-jdk-jammy AS build

WORKDIR /workspace

COPY .mvn .mvn
COPY mvnw mvnw
COPY mvnw.cmd mvnw.cmd
COPY pom.xml pom.xml

RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -q -DskipTests dependency:go-offline

COPY src src

RUN find src -name "*.java" -exec sed -i '1s/^\xef\xbb\xbf//' {} +

RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -q -DskipTests package

FROM eclipse-temurin:25-jre-jammy

WORKDIR /app

ENV SERVER_PORT=8080

COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
