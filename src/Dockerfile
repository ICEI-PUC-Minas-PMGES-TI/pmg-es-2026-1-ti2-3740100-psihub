# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS frontend-build

WORKDIR /workspace/front

COPY front/package.json front/package-lock.json ./
RUN npm ci

COPY front/ ./
RUN npm run build

FROM eclipse-temurin:25-jdk-jammy AS backend-build

WORKDIR /workspace/back

COPY back/.mvn .mvn
COPY back/mvnw back/mvnw.cmd back/pom.xml ./

RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -q -DskipTests dependency:go-offline

COPY back/src src
COPY --from=frontend-build /workspace/front/dist src/main/resources/static

RUN find src -name "*.java" -exec sed -i '1s/^\xef\xbb\xbf//' {} +

RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -q -DskipTests package

FROM eclipse-temurin:25-jre-jammy

WORKDIR /app

ENV PORT=10000
ENV SERVER_PORT=10000

COPY --from=backend-build /workspace/back/target/*.jar app.jar

EXPOSE 10000

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
