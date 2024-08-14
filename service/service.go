package service

import (
	"fmt"
	"math"
	"io"
	"sync"
	"encoding/json"
	"log"
	"time"
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

func GetRequest(headers map[string]string, url string) ([]byte, error) {
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

func TransformTime(data map[string]interface{}) {
	now := time.Now().Unix() 

	var transform func(interface{}) interface{}
	transform = func(v interface{}) interface{} {
		switch v := v.(type) {
		case map[string]interface{}:
			result := make(map[string]interface{})
			for k, value := range v {
				if k == "time" {
					if str, ok := value.(string); ok {
						var timeVal int64
						fmt.Sscanf(str, "%d", &timeVal)
						result[k] = math.Floor(float64(timeVal - now) / 60)
					}
				} else {
					result[k] = transform(value)
				}
			}
			return result
		case []interface{}:
			result := make([]interface{}, len(v))
			for i, value := range v {
				result[i] = transform(value)
			}
			return result
		default:
			return v
		}
	}

	for k, value := range data {
		data[k] = transform(value)
	}
}

func GetTripUpdates() ([]byte, error) {
	var endpoint string = "/tripUpdates"
	headers := map[string]string{
		"accept" : "application/x-protobuf",
		"apiKey" : apiKey,
	}

	var url string = defaultUrl + endpoint

	data, err := GetRequest(headers, url)
	if err != nil {
		return nil, fmt.Errorf("error modifying data: %v", err)
	}

	return data, nil
}

func ModifyDataGetTripUpdates(data []byte) (string, error)  {
	message, err := TransformProtoToJSON(data)
	if err != nil {
		return "", fmt.Errorf("error modifying data: %v", err)
	}

	var jsonData map[string]interface{}
	if err := json.Unmarshal([]byte(message), &jsonData); err != nil {
		return "", fmt.Errorf("error unmarshalling JSON: %v", err)
	}

	TransformTime(jsonData)

	modifiedMessage, err := json.Marshal(jsonData)
	if err != nil {
		return "", fmt.Errorf("error marshalling modified JSON: %v", err)
	}

	return string(modifiedMessage), nil
}

func GetVehiclePositions() ([]byte, error) {
	var endpoint string = "/vehiclePositions"
	headers := map[string]string{
		"accept" : "application/x-protobuf",
		"apiKey" : apiKey,
	}

	var url string = defaultUrl + endpoint

	data, err := GetRequest(headers, url)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %v", err)
		}

	return data, nil
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

	data, err := GetRequest(headers, url)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %v", err)
		}

	return data, nil
}

func ModifyDataEtatService(data []byte) (string, error) {
	return string(data), nil
}
