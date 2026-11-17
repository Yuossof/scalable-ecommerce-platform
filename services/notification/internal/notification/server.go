package notification

import (
	"context"
	"fmt"
	"log"

	pb "github.com/Yuossof/notification-service/gen/notification"
	"github.com/resend/resend-go/v4"
)

type Server struct {
	pb.UnimplementedNotificationServiceServer
	client *resend.Client
	ch     chan string
}

func NewServer(client *resend.Client) *Server {
	ch := make(chan string, 100)

	return &Server{
		client: client,
		ch:     ch,
	}
}

func (s *Server) Loop() {
	for job := range s.ch {
		go s.SendMail(job)
	}
}

func (s *Server) SendNotification(
	ctx context.Context,
	req *pb.SendNotificationRequest,
) (*pb.SendNotificationResponse, error) {

	log.Printf(
		"Sending notification to user %s",
		req.GetUserId(),
	)

	email := "youssofwr@gmail.com"

	log.Printf("Title: %s", req.GetTitle())
	log.Printf("Body: %s", req.GetBody())

	s.ch <- email

	return &pb.SendNotificationResponse{
		Success: true,
		Message: "Notification sent successfully",
	}, nil

}

func (s *Server) SendMail(email string) {
	params := &resend.SendEmailRequest{
		From:    "Acme <onboarding@resend.dev>",
		To:      []string{email},
		Html:    "<strong>hello world</strong>",
		Subject: "Hello from Golang",
	}

	sent, err := s.client.Emails.Send(params)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	fmt.Println(sent.Id)
}
