FROM golang:latest AS builder

WORKDIR /app

COPY . .

RUN go build -o server ./cmd/server/main.go

FROM ubuntu:22.04

RUN apt-get update && apt-get install -y ca-certificates

WORKDIR /app

COPY --from=builder /app/server .

COPY ./cmd/server/.env .

COPY ./cmd/server/stmBusHeadSign.csv .

EXPOSE 8080

CMD ["./server"]
