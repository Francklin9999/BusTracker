package api

import (
	"encoding/csv"
	"os"
)

var tripDirectionMap = make(map[string]string)

var filePath = "./stmBusHeadSign.csv"

func loadTripDirection() error {
	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	reader := csv.NewReader(file)

	records, err := reader.ReadAll()
	if err != nil {
		return err
	}

	for _, record := range records[1:] {
		tripID := record[0]
		tripHeadsign := record[1]
		tripDirectionMap[tripID] = tripHeadsign
	}

	return nil
}
