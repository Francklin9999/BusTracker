package service

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"sync"
	"time"

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

func ModifyDataEtatService(data1 []byte) (string, error) {
	var data map[string]interface{}
	if err := json.Unmarshal(data1, &data); err != nil {
		return "", fmt.Errorf("error parsing JSON: %v", err)
	}

	result := make(map[string]interface{})

	alerts, ok := data["alerts"].([]interface{})

	if !ok {
	return "", fmt.Errorf("error: 'alerts' is not an array")
	}

	for _, alert := range alerts {
		alertMap, ok := alert.(map[string]interface{})
		if !ok {
			continue
		}

		activePeriods := []map[string]interface{}{}
		if periods, ok := alertMap["active_periods"].([]interface{}); ok {
			for _, period := range periods {
				periodMap, ok := period.(map[string]interface{})
				if !ok {
					continue
				}

				start, _ := periodMap["start"].(float64)
				end, endOk := periodMap["end"]

				startDate := unixToDateString(start)
				var endDate *string
				if endOk && end != nil {
					endValue := end.(float64)
					endDateStr := unixToDateString(endValue)
					endDate = &endDateStr
				}

				activePeriod := map[string]interface{}{
					"start": startDate,
					"end":   endDate,
				}
				activePeriods = append(activePeriods, activePeriod)
			}
		} else if periodMap, ok := alertMap["active_periods"].(map[string]interface{}); ok {
			start, _ := periodMap["start"].(float64)
			end, endOk := periodMap["end"]

			startDate := unixToDateString(start)
			var endDate *string
			if endOk && end != nil {
				endValue := end.(float64)
				endDateStr := unixToDateString(endValue)
				endDate = &endDateStr
			}

			activePeriod := map[string]interface{}{
				"start": startDate,
				"end":   endDate,
			}
			activePeriods = append(activePeriods, activePeriod)
		}
	
			if entities, ok := alertMap["informed_entities"].([]interface{}); ok {
				for _, entity := range entities {
					entityMap, ok := entity.(map[string]interface{})
					if !ok {
						continue
					}
	
					routeShortName, ok := entityMap["route_short_name"].(string)
					if !ok {
						continue
					}

					description := ""
					if descriptions, ok := alertMap["description_texts"].([]interface{}); ok {
						for _, desc := range descriptions {
							descMap, ok := desc.(map[string]interface{})
							if !ok {
								continue
							}
	
							if descMap["language"] == "en" {
								description = descMap["text"].(string)
								break
							}
						}
					}
	
					result[routeShortName] = map[string]interface{}{
						"active_periods": activePeriods,
						"description":    description,
					}
				}
			}
		}
	
		output, err := json.MarshalIndent(result, "", "  ")
		if err != nil {
			return "", err
		}
		return string(output), nil
}

func unixToDateString(unixTime float64) string {
	t := time.Unix(int64(unixTime), 0).UTC()
	return t.Format(time.RFC3339) 
}

// func MixTripUpdatesAndVehiclePositions(data1 string, data2 string) (string, err) {
	
// }
