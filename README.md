# Smart-Parking-System

## Overview

The Smart Parking System is an IoT-based project designed to automate parking management. It utilizes sensors, a servo motor, and a Raspberry Pi to monitor and control parking space availability, gate operations, and fire detection. The system communicates real-time data via MQTT and features a web dashboard for visualization.

## Features

Parking Space Monitoring:

Infrared (IR) sensors detect the occupancy of parking spaces.

Automatic Gate Control:

Ultrasonic sensors detect vehicles at the entry and exit points.

A servo motor opens and closes the gate accordingly.

Fire Detection:

A flame sensor detects fire and triggers an alarm through a buzzer.

Real-Time Data Communication:

MQTT protocol transmits data on parking space status, gate operations, vehicle distances, and fire alerts.

Web Dashboard:

Displays live data, including parking statuses, gate operations, and fire alerts.

Components

## Hardware:

Raspberry Pi 4

IR Sensors (3 units)

Ultrasonic Sensors (2 units)

Flame Sensor

Buzzer

Servo Motor

## Software:

Python (for system logic and sensor integration)

MQTT (Paho MQTT Client for data communication)

HTML/CSS/JavaScript (for the web dashboard)

## System Setup

### Hardware Setup

IR Sensors:

Connect to GPIO pins 17, 27, and 22.

Ultrasonic Sensors:

Entry: Trigger - GPIO 20, Echo - GPIO 21.

Exit: Trigger - GPIO 18, Echo - GPIO 12.

Flame Sensor:

Connect to GPIO pin 26.

Buzzer:

Connect to GPIO pin 19.

Servo Motor:

Connect to GPIO pin 25.

### Software Setup

Install Dependencies:

sudo apt update
sudo apt install python3-pip
pip3 install paho-mqtt RPi.GPIO

Run the Python Script:

python3 Smart_parking_system.py

Configure MQTT Broker:

Use the Raspberry Pi's IP address as the broker address.

### Web Dashboard

Host the Dashboard:

Use a lightweight web server to host the HTML/CSS/JavaScript files.

Update the dashboard to subscribe to MQTT topics for real-time updates.

MQTT Topics

Topic                              Description

smart_parking/gate_status          Gate operation status (open/closed).

smart_parking/parking_status       Status of parking spaces (occupied/empty).

smart_parking/distance             Distance readings from ultrasonic sensors.

smart_parking/fire_status          Fire detection alerts.

## Code Explanation

### Python Script Highlights

Ultrasonic Distance Measurement:

def measure_distance(trigger_pin, echo_pin):
    GPIO.output(trigger_pin, GPIO.HIGH)
    time.sleep(0.00001)
    GPIO.output(trigger_pin, GPIO.LOW)
    ...
    distance = (elapsed_time * 34300) / 2
    return distance


Gate Control:

def open_gate():
    servo.ChangeDutyCycle(7.5)  # Open gate to 90 degrees
def close_gate():
    servo.ChangeDutyCycle(2.5)  # Close gate to 0 degrees


Fire Detection:

def check_fire():
    if GPIO.input(FLAME_SENSOR_PIN) == GPIO.LOW:
        GPIO.output(BUZZER_PIN, GPIO.HIGH)
        return "Fire detected!"
    else:
        GPIO.output(BUZZER_PIN, GPIO.LOW)
        return "No fire detected."


Multithreading:

Handles gate operations, parking status monitoring, and fire detection concurrently.

## Demo

Parking Space Status:

Visualize on the dashboard if spaces are empty or occupied.

Gate Operations:

Watch the gate open/close automatically based on vehicle detection.

Fire Alerts:

Receive immediate fire detection alerts on the dashboard.
