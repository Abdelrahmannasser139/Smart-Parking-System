document.addEventListener("DOMContentLoaded", () => {
    const parkingSpots = {
        spot1: { status: "Empty" },
        spot2: { status: "Empty" },
    };

    const fireStatus = document.getElementById("fire-status");
    const carsEntered = document.getElementById("cars-entered");
    const carsExited = document.getElementById("cars-exited");
    const modeToggle = document.getElementById("mode-toggle");

    let enteredCount = 0;
    let exitedCount = 0;

    // Update parking spot status
    function updateParkingSpot(spotId, status) {
        const spotElement = document.getElementById(spotId);
        parkingSpots[spotId].status = status;

        if (status === "Occupied") {
            spotElement.textContent = `${spotId.replace("spot", "Spot ")}: Occupied`;
            spotElement.classList.add("occupied");
        } else {
            spotElement.textContent = `${spotId.replace("spot", "Spot ")}: Empty`;
            spotElement.classList.remove("occupied");
        }
    }

    // Fetch data from Raspberry Pi sensors
    async function fetchSensorData() {
        try {
            const response = await fetch('http://192.168.241.244:5000/sensors');
            const data = await response.json();

            // Update parking spots
            updateParkingSpot("spot1", data.parking_1 === "Empty" ? "Empty" : "Occupied");
            updateParkingSpot("spot2", data.parking_2 === "Empty" ? "Empty" : "Occupied");

            // Update fire status
            if (data.fire_alert) {
                fireStatus.textContent = "🔥 Fire Detected!";
                fireStatus.classList.add("danger");
                fireStatus.classList.remove("safe");
                alert("⚠ FIRE ALERT: Evacuate the Garage!");
            } else {
                fireStatus.textContent = "No Fire Detected";
                fireStatus.classList.add("safe");
                fireStatus.classList.remove("danger");
            }

            // Update car entry/exit counts
            enteredCount = data.cars_entered;
            exitedCount = data.cars_exited;

            carsEntered.textContent = enteredCount;
            carsExited.textContent = exitedCount;

        } catch (error) {
            console.error("Error fetching sensor data:", error);
        }
    }

    // Toggle dark and light modes
    modeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        document.querySelector("header").classList.toggle("dark-mode");
        document.querySelectorAll(".card").forEach(card => card.classList.toggle("dark-mode"));
        document.querySelectorAll(".parking-spot").forEach(spot => spot.classList.toggle("dark-mode"));
        document.querySelector("footer").classList.toggle("dark-mode");

        // Update button text
        if (document.body.classList.contains("dark-mode")) {
            modeToggle.textContent = "☀ Light Mode";
        } else {
            modeToggle.textContent = "🌙 Dark Mode";
        }
    });

    // Call fetchSensorData every 3 seconds
    setInterval(fetchSensorData, 3000);
});
