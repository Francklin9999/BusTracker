import json

with open('modified_trip_updates.json', 'r') as file:
    data = json.load(file)

with open('formated_positions.json', 'w') as file:
    json.dump(data, file, indent=4)
