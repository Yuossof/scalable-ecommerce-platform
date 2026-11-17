package main

import (
	"log"
	"net"
	"os"

	pb "github.com/Yuossof/notification-service/gen/notification"
	notification "github.com/Yuossof/notification-service/internal/notification"
	"github.com/joho/godotenv"
	"github.com/resend/resend-go/v4"

	"google.golang.org/grpc"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal(err)
	}

	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatal(err)
	}

	client := resend.NewClient(os.Getenv("RESEND_API_KEY"))

	grpcServer := grpc.NewServer()

	notificationServer := notification.NewServer(client)
	go notificationServer.Loop()
	pb.RegisterNotificationServiceServer(
		grpcServer,
		notificationServer,
	)

	log.Println("gRPC server listening on :50051")

	if err := grpcServer.Serve(lis); err != nil {
		log.Fatal(err)
	}
}
