FROM openjdk:8-jre-slim

WORKDIR /app

COPY . /app

CMD ["echo", "Launching Trident Network node..."]
