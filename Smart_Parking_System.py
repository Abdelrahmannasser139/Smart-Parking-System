import paho.mqtt.client as mqtt
import time
import threading
import RPi.GPIO as GPIO

# GPIO Pins Setup
IR_SENSOR_PINS = [17, 27, 22]  # IR sensors for parking spaces
ENTRY_TRIGGER_PIN = 20  # Ultrasonic trigger for entry
ENTRY_ECHO_PIN = 21  # Ultrasonic echo for entry
EXIT_TRIGGER_PIN = 18  # Ultrasonic trigger for exit
EXIT_ECHO_PIN = 12  # Ultrasonic echo for exit
SERVO_PIN = 25  # Servo motor
FLAME_SENSOR_PIN = 26  # Flame sensor
BUZZER_PIN = 19  # Buzzer

# GPIO Setup
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

# Set up IR sensors
for pin in IR_SENSOR_PINS:
    GPIO.setup(pin, GPIO.IN)

# Set up Entry Ultrasonic sensor
GPIO.setup(ENTRY_TRIGGER_PIN, GPIO.OUT)
GPIO.setup(ENTRY_ECHO_PIN, GPIO.IN)

# Set up Exit Ultrasonic sensor
GPIO.setup(EXIT_TRIGGER_PIN, GPIO.OUT)
GPIO.setup(EXIT_ECHO_PIN, GPIO.IN)

# Set up Servo motor
GPIO.setup(SERVO_PIN, GPIO.OUT)
servo = GPIO.PWM(SERVO_PIN, 50)  # 50 Hz frequency
servo.start(0)

# Set up Flame sensor and Buzzer
GPIO.setup(FLAME_SENSOR_PIN, GPIO.IN)
GPIO.setup(BUZZER_PIN, GPIO.OUT)

# MQTT Configuration
MQTT_BROKER = "192.168.74.113"  # Your Raspberry Pi IP address
MQTT_PORT = 1883
MQTT_TOPIC_GATE_STATUS = "smart_parking/gate_status"
MQTT_TOPIC_PARKING_STATUS = "smart_parking/parking_status"
MQTT_TOPIC_DISTANCE = "smart_parking/distance"
MQTT_TOPIC_FIRE_STATUS = "smart_parking/fire_status"

client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT Broker with result code {rc}")
    client.subscribe(MQTT_TOPIC_GATE_STATUS)
    client.subscribe(MQTT_TOPIC_PARKING_STATUS)
    client.subscribe(MQTT_TOPIC_DISTANCE)
    client.subscribe(MQTT_TOPIC_FIRE_STATUS)

def on_publish(client, userdata, mid):
    print(f"Message {mid} published")

client.on_connect = on_connect
client.on_publish = on_publish

client.connect(MQTT_BROKER, MQTT_PORT, 60)

def measure_distance(trigger_pin, echo_pin):
    """Measures the distance using the ultrasonic sensor."""
    GPIO.output(trigger_pin, GPIO.HIGH)
    time.sleep(0.00001)
    GPIO.output(trigger_pin, GPIO.LOW)

    start_time = time.time()
    stop_time = time.time()

    while GPIO.input(echo_pin) == 0:
        start_time = time.time()
    while GPIO.input(echo_pin) == 1:
        stop_time = time.time()

    elapsed_time = stop_time - start_time
    distance = (elapsed_time * 34300) / 2  # Calculate distance in cm
    return distance

def open_gate():
    """Opens the gate by rotating the servo motor to 90 degrees."""
    print("Opening gate...")
    servo.ChangeDutyCycle(7.5)  # 7.5% duty cycle for 90 degrees

def close_gate():
    """Closes the gate by rotating the servo motor back to 0 degrees."""
    print("Closing gate...")
    servo.ChangeDutyCycle(2.5)  # 2.5% duty cycle for 0 degrees

def check_parking_spaces():
    """Checks the status of parking spaces using IR sensors."""
    statuses = []
    for i, pin in enumerate(IR_SENSOR_PINS):
        status = GPIO.input(pin)
        statuses.append("Empty" if status == GPIO.HIGH else "Occupied")
    return statuses

def check_fire():
    """Checks for fire using the flame sensor and activates the buzzer if fire is detected."""
    if GPIO.input(FLAME_SENSOR_PIN) == GPIO.LOW:  # Fire detected
        GPIO.output(BUZZER_PIN, GPIO.HIGH)  # Turn buzzer on
        return "Fire detected!"
    else:  # No fire detected
        GPIO.output(BUZZER_PIN, GPIO.LOW)  # Turn buzzer off
        return "No fire detected."

def ultrasonic_thread():
    """Thread to handle entry and exit ultrasonic sensors and gate control."""
    entry_gate_open = False
    exit_gate_open = False

    while True:
        # Measure entry distance
        entry_distance = measure_distance(ENTRY_TRIGGER_PIN, ENTRY_ECHO_PIN)
        print(f"Entry Distance: {entry_distance:.2f} cm")

        # Measure exit distance
        exit_distance = measure_distance(EXIT_TRIGGER_PIN, EXIT_ECHO_PIN)
        print(f"Exit Distance: {exit_distance:.2f} cm")

        if entry_distance < 10:  # Car detected at entry
            if not entry_gate_open:
                open_gate()
                entry_gate_open = True
                client.publish(MQTT_TOPIC_GATE_STATUS, "Car detected at entry. Gate open.")
        else:
            if entry_gate_open:
                close_gate()
                entry_gate_open = False
                client.publish(MQTT_TOPIC_GATE_STATUS, "No car at entry. Gate closed.")

        if exit_distance < 10:  # Car detected at exit
            if not exit_gate_open:
                open_gate()
                exit_gate_open = True
                client.publish(MQTT_TOPIC_GATE_STATUS, "Car detected at exit. Gate open.")
        else:
            if exit_gate_open:
                close_gate()
                exit_gate_open = False
                client.publish(MQTT_TOPIC_GATE_STATUS, "No car at exit. Gate closed.")

        # Publish distances
        client.publish(MQTT_TOPIC_DISTANCE, f"Entry: {entry_distance:.2f}, Exit: {exit_distance:.2f}")
        time.sleep(1)

def parking_status_thread():
    """Thread to handle parking space status."""
    while True:
        parking_statuses = check_parking_spaces()
        client.publish(MQTT_TOPIC_PARKING_STATUS, ",".join(parking_statuses))
        time.sleep(2)

def fire_detection_thread():
    """Thread to handle fire detection."""
    while True:
        fire_status = check_fire()
        print(fire_status)
        client.publish(MQTT_TOPIC_FIRE_STATUS, fire_status)
        time.sleep(1)

try:
    print("Smart Parking System Initialized")
    client.loop_start()

    # Start threads
    ultrasonic = threading.Thread(target=ultrasonic_thread, daemon=True)
    parking = threading.Thread(target=parking_status_thread, daemon=True)
    fire = threading.Thread(target=fire_detection_thread, daemon=True)

    ultrasonic.start()
    parking.start()
    fire.start()

    # Keep the main thread alive
    while True:
        time.sleep(0.1)

except KeyboardInterrupt:
    print("Exiting...")
finally:
    GPIO.cleanup()
    client.loop_stop()
    servo.stop()