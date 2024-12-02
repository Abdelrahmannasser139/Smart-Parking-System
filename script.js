document.addEventListener("DOMContentLoaded", () => {
    const parkingSpots = {
        spot1: { status: "Empty" },
        spot2: { status: "Empty" },
        spot3: { status: "Empty" },
    };

    const fireStatus = document.getElementById("fire-status");
    const carsEntered = document.getElementById("cars-entered");
    const carsExited = document.getElementById("cars-exited");
    const modeToggle = document.getElementById("mode-toggle");

    let enteredCount = 0;
    let exitedCount = 0;

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

    function simulateGarage() {
        const spotKeys = Object.keys(parkingSpots);
        const randomSpot = spotKeys[Math.floor(Math.random() * spotKeys.length)];
        const newStatus = parkingSpots[randomSpot].status === "Empty" ? "Occupied" : "Empty";
        updateParkingSpot(randomSpot, newStatus);

        enteredCount += Math.floor(Math.random() * 2);
        exitedCount += Math.floor(Math.random() * 2);

        carsEntered.textContent = enteredCount;
        carsExited.textContent = exitedCount;

        if (Math.random() < 0.1) {
            fireStatus.textContent = "🔥 Fire Detected!";
            fireStatus.classList.remove("safe");
            fireStatus.classList.add("danger");
            alert("⚠️ FIRE ALERT: Evacuate the Garage!");
        } else {
            fireStatus.textContent = "No Fire Detected";
            fireStatus.classList.remove("danger");
            fireStatus.classList.add("safe");
        }
    }

    // Toggle Dark and Light Mode
    modeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        document.querySelector("header").classList.toggle("dark-mode");
        document.querySelectorAll(".card").forEach(card => card.classList.toggle("dark-mode"));
        document.querySelectorAll(".parking-spot").forEach(spot => spot.classList.toggle("dark-mode"));
        document.querySelector("footer").classList.toggle("dark-mode");

        // Update button text
        if (document.body.classList.contains("dark-mode")) {
            modeToggle.textContent = "☀️ Light Mode";
        } else {
            modeToggle.textContent = "🌙 Dark Mode";
        }
    });

    setInterval(simulateGarage, 3000);
});
