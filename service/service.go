package service

import (
	"fmt"
	"io"
	"sync"
	"log"
	"net/http"
	"github.com/Francklin9999/BusTracker/protos"
	"github.com/golang/protobuf/proto"
	"google.golang.org/protobuf/encoding/protojson"
)

var (
	apiKey string
	apiKeyMutex sync.Mutex
	defaultUrl string = "https://api.stm.info/pub/od/gtfs-rt/ic/v2"
	recentUrl string = "https://api.stm.info/pub/od/i3/v2/messages"
)

	func SetApiKey(key string) {
	if key == "" {
		log.Fatal("API key is required")
	}
	apiKeyMutex.Lock()
	apiKey = key
	apiKeyMutex.Unlock()
}

func TransformProtoToJSON(data []byte) ([]byte, error) {
	var message protos.FeedMessage

	err := proto.Unmarshal(data, &message)
	if err != nil {
		return nil, fmt.Errorf("error unmarshalling protobuf data: %w", err)
	}

	jsonMessage, err := protojson.Marshal(&message)
	if err != nil {
		return nil, fmt.Errorf("error marshalling to JSON: %w", err)
	}

	return jsonMessage, nil
}

func GetTripUpdates() ([]byte, error) {
	var endpoint string = "/tripUpdates"
	headers := map[string]string{
		"accept" : "application/x-protobuf",
		"apiKey" : apiKey,
	}

	var url string = defaultUrl + endpoint

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %v", err)
	}

	for key, value := range headers {
		req.Header.Set(key, value)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error sending request: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %v", err)
	}

	return body, nil
}

func ModifyDataGetTripUpdates(data []byte) (string, error)  {
	message, err := TransformProtoToJSON(data)
	if err != nil {
		return "", fmt.Errorf("error modifying data: %v", err)
	}

	return string(message), nil
}

func GetVehiclePositions() ([]byte, error) {
	var endpoint string = "/vehiclePostions"
	headers := map[string]string{
		"accept" : "application/x-protobuf",
		"apiKey" : apiKey,
	}

	var url string = defaultUrl + endpoint

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %v", err)
	}

	for key, value := range headers {
		req.Header.Add(key, value)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error sending request: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %v", err)
	}

	return body, nil
}

func ModifyDataGetVehiclePositions(data []byte) (string, error) {
	message, err := TransformProtoToJSON(data)
	if err != nil {
		return "", fmt.Errorf("error modifying data: %v", err)
	}

	return string(message), nil
}

func GetEtatService() ([]byte, error) {
	var endpoint string = "/etatservice"
	headers := map[string]string{
		"accept" : "application/json",
		"apiKey" : apiKey,
	}

	var url string = recentUrl + endpoint

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %v", err)
	}

	for key, value := range headers {
		req.Header.Add(key, value)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error sending request: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %v", err)
	}

	return body, nil
}

func ModifyDataEtatService(data []byte) (string, error) {

	return string(data), nil
}