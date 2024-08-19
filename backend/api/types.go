package api

type Arrival struct {
	Time int `json:"time"`
}

type StopData struct {
	Id                   string  `json:"id"`
	Arrival              Arrival `json:"arrival"`
	ScheduleRelationship string  `json:"scheduleRelationship"`
	RouteId              string  `json:"routeId"`
	Direction            string  `json:"direction"`
}

type StopTimeUpdate struct {
	Arrival              Arrival `json:"arrival"`
	ScheduleRelationship string  `json:"scheduleRelationship"`
	StopId               string  `json:"stopId"`
	StopSequence         int     `json:"stopSequence"`
}

type TripUpdate struct {
	StopTimeUpdate []StopTimeUpdate `json:"stopTimeUpdate"`
	Timestamp      string           `json:"timestamp"`
	Trip           struct {
		RouteId              string `json:"routeId"`
		ScheduleRelationship string `json:"scheduleRelationship"`
		StartDate            string `json:"startDate"`
		TripId               string `json:"tripId"`
	} `json:"trip"`
}

type Entity struct {
	Id         string     `json:"id"`
	TripUpdate TripUpdate `json:"tripUpdate"`
}

type Root struct {
	Entity []Entity `json:"entity"`
}
