// MQTT Broker Details
const MQTT_BROKER = "ws://192.168.74.113:9001"; // WebSocket URL for the broker
const CLIENT_ID = "web_dashboard_" + Math.random().toString(16).substr(2, 8);

// MQTT Topics
const TOPICS = {
    GATE_STATUS: "smart_parking/gate_status",
    PARKING_STATUS: "smart_parking/parking_status",
    DISTANCE: "smart_parking/distance",
    FIRE_STATUS: "smart_parking/fire_status"
};

// MQTT Client Initialization
const client = mqtt.connect(MQTT_BROKER, { clientId: CLIENT_ID });

// DOM Elements
const gateStatusEl = document.getElementById("gate-status");
const parkingStatusEl = document.getElementById("parking-status");
const distanceEl = document.getElementById("distance");
const fireStatusEl = document.getElementById("fire-status");

// MQTT Event Handlers
client.on("connect", () => {
    console.log("Connected to MQTT Broker");
    // Subscribe to relevant topics
    for (let topic in TOPICS) {
        client.subscribe(TOPICS[topic], (err) => {
            if (err) console.error(`Failed to subscribe to ${TOPICS[topic]}`);
        });
    }
});

client.on("message", (topic, message) => {
    const payload = message.toString();
    console.log(`Message received on ${topic}: ${payload}`);

    switch (topic) {
        case TOPICS.GATE_STATUS:
            gateStatusEl.textContent = payload;
            break;

        case TOPICS.PARKING_STATUS:
            const spaces = payload.split(","); // Assuming the payload is "Empty,Occupied,Empty"
            parkingStatusEl.innerHTML = spaces
                .map((status, index) => `<li>Space ${index + 1}: ${status}</li>`)
                .join("");
            break;

        case TOPICS.DISTANCE:
            distanceEl.textContent = `${payload} cm`;
            break;

        case TOPICS.FIRE_STATUS:
            fireStatusEl.textContent = payload;
            fireStatusEl.style.color = payload.includes("Fire") ? "red" : "green";
            break;

        default:
            console.warn(`Unhandled topic: ${topic}`);
    }
});

client.on("error", (err) => {
    console.error("Connection error:", err);
});

client.on("reconnect", () => {
    console.log("Reconnecting...");
});
