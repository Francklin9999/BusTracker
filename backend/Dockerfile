FROM golang:1.23 AS builder

WORKDIR /app

COPY . .

RUN go build -o server ./cmd/server/main.go

FROM ubuntu:22.04

WORKDIR /app

COPY --from=builder /app/server .

COPY .env .

EXPOSE 8080

CMD ["./server"]
