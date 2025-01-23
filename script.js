// MQTT Broker Details
const MQTT_BROKER = "ws://192.168.139.202:9001";
const CLIENT_ID = "web_dashboard_" + Math.random().toString(16).substr(2, 8);

// MQTT Topics
const TOPICS = {
    GATE_STATUS: "smart_parking/gate_status",
    PARKING_STATUS: "smart_parking/parking_status",
    DISTANCE: "smart_parking/distance",
    FIRE_STATUS: "smart_parking/fire_status",
    OPEN_GATE: "smart_parking/open_gate",
    CLOSE_GATE: "smart_parking/close_gate"
};

// MQTT Client Initialization
const client = mqtt.connect(MQTT_BROKER, { clientId: CLIENT_ID });

// DOM Elements
const gateStatusEl = document.getElementById("gate-status");
const parkingStatusEl = document.getElementById("parking-status");
const distanceEl = document.getElementById("distance");
const fireStatusEl = document.getElementById("fire-status");
const gateToggleBtn = document.getElementById("gate-toggle-btn");

// State Variables
let isGateOpen = false;

// MQTT Event Handlers
client.on("connect", () => {
    console.log("Connected to MQTT Broker");
    Object.values(TOPICS).forEach((topic) => {
        client.subscribe(topic, (err) => {
            if (err) console.error(`Failed to subscribe to ${topic}`);
        });
    });
});

client.on("message", (topic, message) => {
    const payload = message.toString();
    console.log(`Message received on ${topic}: ${payload}`);

    switch (topic) {
        case TOPICS.GATE_STATUS:
            gateStatusEl.textContent = payload;
            isGateOpen = payload.toLowerCase().includes("open");
            gateToggleBtn.textContent = isGateOpen ? "Close Gate" : "Open Gate";
            break;

        case TOPICS.PARKING_STATUS:
            const spaces = payload.split(",");
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

client.on("error", (err) => console.error("Connection error:", err));

// Button Event Listener
gateToggleBtn.addEventListener("click", () => {
    const action = isGateOpen ? "close" : "open";
    const topic = isGateOpen ? TOPICS.CLOSE_GATE : TOPICS.OPEN_GATE;

    client.publish(topic, action);
    console.log(`${action} gate command sent.`);
});
