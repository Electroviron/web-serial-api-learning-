# Web Serial API Learning

A hands-on learning journey exploring browser-to-hardware communication using the **Web Serial API**, JavaScript, and the Arduino Uno.

This project explores how web technologies can communicate with physical devices, receive serial data, transmit commands, and control hardware directly from a browser.

The goal is to build a strong understanding of the Web Serial API through practical experiments, progressive projects, and clear technical documentation.

## Table of Contents

- [Project Overview](#project-overview)
- [Learning Objectives](#learning-objectives)
- [Requirements](#requirements)
- [Project Structure](#project-structure)
- [Phase 1 — Understanding Web Serial](#phase-1--understanding-web-serial)
  - [1. What Is the Web Serial API?](#1-what-is-the-web-serial-api)
  - [2. Understanding Serial Communication](#2-understanding-serial-communication)
  - [3. Browser Permissions and Security](#3-browser-permissions-and-security)
  - [4. Web Serial API Objects](#4-web-serial-api-objects)
  - [5. Experiment 1 — Connecting to Arduino](#5-experiment-1--connecting-to-arduino)
  - [6. Experiment 2 — Receiving Arduino Data](#6-experiment-2--receiving-arduino-data)
- [Phase 2 — Sending Commands and Controlling Hardware](#phase-2--sending-commands-and-controlling-hardware)
  - [1. Sending Data to Arduino](#1-sending-data-to-arduino)
  - [2. Experiment 1 — PING Command](#2-experiment-1--ping-command)
  - [3. Designing a Command Protocol](#3-designing-a-command-protocol)
  - [4. Experiment 2 — Browser-Based LED Control](#4-experiment-2--browser-based-led-control)
  - [5. Communication Flow](#5-communication-flow)
- [Troubleshooting](#troubleshooting)
- [Lessons Learned](#lessons-learned)
- [Future Roadmap](#future-roadmap)
- [Resources](#resources)

---

## Project Overview

The Web Serial API allows supported web applications to communicate with serial devices connected to a computer.

In this project, an Arduino Uno acts as the hardware endpoint, while a webpage running in Microsoft Edge provides the interface for communication and control.

The project began with establishing a serial connection and receiving messages from the Arduino. It then progressed to transmitting commands from JavaScript and using those commands to control a physical LED.

### Current Capabilities

- Connect a webpage to an Arduino Uno through a serial port.
- Receive serial messages from the Arduino in the browser.
- Transmit text-based commands from JavaScript to the Arduino.
- Interpret incoming commands using Arduino C++.
- Control an LED through webpage buttons.
- Receive acknowledgements and error messages from the Arduino.

## Learning Objectives

The project aims to develop practical knowledge of:

- Serial communication and baud rates.
- Browser permissions and secure contexts.
- The Web Serial API and its streams.
- JavaScript asynchronous programming.
- Text encoding and byte transmission.
- Serial command parsing in embedded firmware.
- Hardware control through a browser interface.
- Error handling and communication reliability.

## Requirements

### Hardware

- Arduino Uno
- USB data cable
- Computer
- LED
- 220 Ω resistor or another suitable current-limiting resistor
- Breadboard and jumper wires

### Software

- Microsoft Edge or another compatible desktop browser.
- Arduino IDE.
- Visual Studio Code or another code editor.
- A local HTTP server, such as Python's built-in HTTP server.

### Tested Configuration

| Component | Configuration |
|---|---|
| Microcontroller board | Arduino Uno |
| Browser | Microsoft Edge |
| Firmware language | Arduino C++ |
| Frontend | HTML and JavaScript |
| Communication interface | USB serial |
| Serial baud rate | 9600 |
| Development environment | VS Code and Arduino IDE |

---

## Project Structure

The repository is organized around progressive learning phases.

```text
web-serial-api-learning/
├── README.md
├── Phase 1/
│   ├── index.html
│   └── main.js
├── Phase 2/
│   └── ...
└── Phase 3/
    └── ...
```

**Note:** During the initial experiments, the Phase 2 functionality was added to the existing Phase 1 webpage and JavaScript files. The folders above illustrate the intended organization; the actual directory structure may differ.

---

# Phase 1 — Understanding Web Serial

## 1. What Is the Web Serial API?

The Web Serial API is a browser API that allows supported web applications to communicate with serial devices.

Examples of devices that may expose a serial interface include:

- Arduino boards.
- Microcontrollers and development boards.
- USB-to-serial adapters.
- Certain laboratory instruments and embedded devices.

Traditionally, communicating with serial hardware often required a desktop application written in languages such as C++, Python, or C#.

The Web Serial API makes it possible to build browser-based interfaces using HTML, CSS, and JavaScript.

However, the API provides the communication mechanism, not automatic understanding of the connected device. The webpage and firmware must still agree on the format and meaning of the transmitted data.

## 2. Understanding Serial Communication

Serial communication transmits data sequentially over a communication channel.

In our project, the Arduino communicates with the computer through USB. The Uno's USB-to-serial interface bridges the computer's USB connection and the ATmega328P's UART interface.

### Important Concepts

**Baud rate**

The baud rate specifies the signaling rate of the serial connection. In our experiments, the browser opens the port at 9600 baud, matching the Arduino firmware.

```cpp
Serial.begin(9600);
```

Both sides must use compatible serial settings.

**Transmit and receive**

- TX means transmit.
- RX means receive.

The direction depends on which device is being considered. The Arduino's transmitted data becomes incoming data for the browser, and commands transmitted by the browser become incoming data for the Arduino.

**Bytes versus text**

Serial communication transports bytes. When we transmit a string such as `Hello`, the text must be represented as bytes before it travels across the connection.

The receiving side must interpret those bytes according to an agreed encoding and message format.

**Serial framing**

A typical UART configuration is 8-N-1:

- 8 data bits.
- No parity bit.
- 1 stop bit.

The baud rate and other serial parameters must be compatible between the communicating endpoints.

## 3. Browser Permissions and Security

The Web Serial API is a browser capability with security restrictions.

A webpage cannot silently access arbitrary serial devices. The user generally needs to select the device through a browser-provided permission prompt.

### Important Requirements

- Use a supported browser and operating system.
- Run the page in a secure context, such as `localhost` or an appropriate HTTPS origin.
- Call `navigator.serial.requestPort()` in response to a user action, such as clicking a Connect button.
- Select the intended serial device in the browser's device chooser.
- Ensure another application, such as Arduino Serial Monitor, is not occupying the serial port.

### Checking Browser Support

```javascript
if ("serial" in navigator) {
  console.log("Web Serial API is supported.");
} else {
  console.log("Web Serial API is not supported.");
}
```

This checks whether the API is available. It does not establish a connection.

### Requesting a Serial Port

```javascript
const port = await navigator.serial.requestPort();
```

The browser prompts the user to select an available serial device. This call must occur within an appropriate user-initiated interaction.

### Opening the Port

```javascript
await port.open({
  baudRate: 9600
});
```

The port is now configured for communication at the specified baud rate, assuming the operation succeeds.

## 4. Web Serial API Objects

| Object or method | Purpose |
|---|---|
| `navigator.serial` | Provides access to the Web Serial API. |
| `requestPort()` | Prompts the user to select a serial port. |
| `getPorts()` | Returns ports for which the origin has permission. |
| `SerialPort` | Represents the selected serial connection. |
| `port.open()` | Opens the selected port with the chosen settings. |
| `port.readable` | Provides a stream for incoming data. |
| `port.writable` | Provides a stream for outgoing data. |
| `port.close()` | Closes the connection when stream locks have been released. |

The readable and writable streams form the basis of our two-way communication system.

---

## 5. Experiment 1 — Connecting to Arduino

### Objective

Establish a serial connection between a webpage and an Arduino Uno.

### Arduino Code

```cpp
void setup() {
  Serial.begin(9600);
  Serial.println("Arduino is ready!");
}

void loop() {
}
```

The Arduino initializes serial communication and transmits a startup message.

A startup message may be sent before the browser connects, so it is not guaranteed to appear in the webpage. This experiment primarily verifies the connection.

### Browser Connection

The webpage uses a Connect button to request and open the port.

```javascript
let port = null;

async function connectToArduino() {
  try {
    port = await navigator.serial.requestPort();

    await port.open({
      baudRate: 9600
    });

    console.log("Connected to Arduino Uno!");
  } catch (error) {
    console.error("Connection error:", error);
  }
}
```

The connection function is a simplified example. In the project, it is called through a user-initiated button click.

### Results

**Successful.** The webpage connected to the Arduino Uno through the browser's serial-port chooser.

This established the foundation for receiving and transmitting serial data.

---

## 6. Experiment 2 — Receiving Arduino Data

### Objective

Continuously transmit messages from the Arduino and display the incoming data in the browser.

### Arduino Code

```cpp
void setup() {
  Serial.begin(9600);
}

void loop() {
  Serial.println("Hello from Arduino!");
  delay(1000);
}
```

The Arduino sends a message once per second.

### JavaScript Reading Function

```javascript
async function readFromArduino() {
  const decoder = new TextDecoder();
  const reader = port.readable.getReader();

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      output.textContent += decoder.decode(value);
    }
  } catch (error) {
    console.error("Reading error:", error);
  } finally {
    reader.releaseLock();
  }
}
```

### How It Works

**`TextDecoder()`**

Converts received bytes into JavaScript text.

**`port.readable.getReader()`**

Acquires a reader for the serial input stream.

**`reader.read()`**

Waits asynchronously for incoming data. It returns a result containing a `value` and a `done` property.

**`decoder.decode(value)`**

Decodes the received byte chunk into text.

**`reader.releaseLock()`**

Releases the reader lock when the reading loop finishes or encounters an error.

### Results

**Successful.** The browser displayed the messages transmitted by the Arduino.

This experiment demonstrated the Arduino-to-browser data path and introduced asynchronous stream reading.

### Important Detail

Serial data arrives in chunks. A single `reader.read()` call does not necessarily correspond to one complete message. More advanced projects must handle message boundaries explicitly.

---

# Phase 2 — Sending Commands and Controlling Hardware

## 1. Sending Data to Arduino

In Phase 1, we learned to receive data from the Arduino. Phase 2 introduced the reverse direction: transmitting commands from JavaScript to the microcontroller.

The Web Serial API exposes the writable stream through:

```javascript
port.writable
```

To write data, we acquire a writer and encode our command into bytes.

### Using TextEncoder

```javascript
const encoder = new TextEncoder();

const data = encoder.encode("PING\n");
```

`TextEncoder` converts the JavaScript string into UTF-8 bytes.

The newline character, `\n`, marks the end of the command in our custom protocol. It is an application-level choice rather than a requirement of the Web Serial API.

### Reusable Command Function

```javascript
async function sendCommand(command) {
  const encoder = new TextEncoder();
  const writer = port.writable.getWriter();

  try {
    await writer.write(
      encoder.encode(command + "\n")
    );

    console.log("Sent:", command);
  } finally {
    writer.releaseLock();
  }
}
```

### How It Works

1. Create a text encoder.
2. Acquire a writer from the writable stream.
3. Encode the command and append a newline.
4. Write the resulting bytes to the serial connection.
5. Release the writer lock.

The serial port must already be open, and its writable stream must be available.

The `finally` block ensures that the writer lock is released even if writing fails.

## 2. Experiment 1 — PING Command

### Objective

Send a command from the browser and verify that the Arduino receives it and transmits a response.

### Arduino Code

```cpp
void setup() {
  Serial.begin(9600);
}

void loop() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');

    command.trim();

    Serial.print("Received: ");
    Serial.println(command);
  }
}
```

### Important Functions

| Function | Purpose |
|---|---|
| `Serial.available()` | Reports how many received bytes are waiting. |
| `Serial.readStringUntil('\n')` | Reads characters until a newline or timeout. |
| `command.trim()` | Removes leading and trailing whitespace. |
| `Serial.println()` | Sends text followed by a newline. |

### Browser Command

```javascript
await sendCommand("PING");
```

### Expected Response

```text
Received: PING
```

The existing browser reading loop displays the response.

### Results

**Successful.** The browser transmitted `PING`, the Arduino processed it, and the Arduino sent the response back to the webpage.

This experiment verified two-way serial communication.

### Firmware Consideration

`readStringUntil()` is useful for a beginner experiment, but it can block while waiting for the terminating newline or until its timeout expires. In later embedded projects, a non-blocking character-buffer parser can provide more predictable responsiveness.

## 3. Designing a Command Protocol

A communication protocol defines how devices format, interpret, and respond to messages.

For our project, we introduced a simple newline-delimited text protocol.

| Command | Meaning |
|---|---|
| `PING` | Test communication. |
| `LED_ON` | Turn the LED on. |
| `LED_OFF` | Turn the LED off. |

The browser sends the command followed by a newline.

For example:

```text
LED_ON\n
```

The Arduino reads the incoming bytes, reconstructs the command, and compares it with the commands supported by the firmware.

Both sides must agree on command spelling and message termination. Otherwise, the receiver may fail to recognize a valid command.

## 4. Experiment 2 — Browser-Based LED Control

### Objective

Control a physical LED through webpage buttons.

### Hardware Components

- Arduino Uno.
- LED.
- 220 Ω resistor or another suitable current-limiting resistor.
- Breadboard and jumper wires.

### Circuit Connections

| Component | Connection |
|---|---|
| Arduino digital pin 8 | Resistor in series with the LED. |
| LED anode | Toward the resistor and pin 8. |
| LED cathode | Arduino GND. |

The resistor limits the current flowing through the LED.

### Arduino Firmware

```cpp
const byte LED_PIN = 8;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  Serial.begin(9600);
}

void loop() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command == "LED_ON") {
      digitalWrite(LED_PIN, HIGH);
      Serial.println("ACK:LED_ON");
    }
    else if (command == "LED_OFF") {
      digitalWrite(LED_PIN, LOW);
      Serial.println("ACK:LED_OFF");
    }
    else {
      Serial.print("ERROR:UNKNOWN_COMMAND:");
      Serial.println(command);
    }
  }
}
```

### Firmware Explanation

**`const byte LED_PIN = 8;`**

Defines the pin connected to the LED. The `const` keyword prevents reassignment of this variable.

**`pinMode(LED_PIN, OUTPUT);`**

Configures pin 8 as an output.

**`digitalWrite(LED_PIN, HIGH);`**

Sets the digital output HIGH, turning on the LED in this circuit.

**`digitalWrite(LED_PIN, LOW);`**

Sets the output LOW, turning the LED off.

**Command comparison**

The `if` and `else if` statements compare the received command against the supported command names.

**Acknowledgements**

The firmware sends `ACK:LED_ON` or `ACK:LED_OFF` after executing the corresponding output instruction. `ACK` means acknowledgement.

These responses confirm that the firmware recognized and processed the command. They do not independently measure whether the physical LED is actually illuminated.

Unknown commands produce an error response, helping with debugging.

### HTML Interface

The webpage provides buttons for testing communication and controlling the LED.

```html
<button id="pingButton" disabled>Send PING</button>

<button id="ledOnButton" disabled>LED ON</button>

<button id="ledOffButton" disabled>LED OFF</button>
```

The buttons are initially disabled until the serial connection has been established.

### JavaScript Button References

```javascript
const pingButton = document.getElementById("pingButton");

const ledOnButton = document.getElementById("ledOnButton");

const ledOffButton = document.getElementById("ledOffButton");
```

### Button Event Listeners

```javascript
pingButton.addEventListener("click", async () => {
  await sendCommand("PING");
});

ledOnButton.addEventListener("click", async () => {
  await sendCommand("LED_ON");
});

ledOffButton.addEventListener("click", async () => {
  await sendCommand("LED_OFF");
});
```

Each button calls `sendCommand()` with its corresponding command.

After the serial port opens successfully, the buttons are enabled:

```javascript
pingButton.disabled = false;
ledOnButton.disabled = false;
ledOffButton.disabled = false;
```

These statements belong inside the successful connection handler, after the port has opened.

### Results

**Successful.** The webpage buttons controlled the physical LED connected to Arduino digital pin 8.

The browser could transmit commands, the Arduino could interpret them, and the firmware returned acknowledgements to the browser.

## 5. Communication Flow

The completed project follows this sequence:

1. The user clicks a button on the webpage.
2. JavaScript selects a command.
3. `TextEncoder` converts the command into bytes.
4. `port.writable` transmits the bytes to the Arduino.
5. The Arduino receives the bytes through its serial interface.
6. The firmware reconstructs and interprets the command.
7. The Arduino changes its digital output.
8. The firmware transmits an acknowledgement.
9. The browser receives the response through `port.readable`.
10. The existing JavaScript reader decodes the bytes into text for display.

This is the foundation of a browser-based hardware-control interface.

---

# Troubleshooting

## The Webpage Cannot Connect

- Confirm that the Arduino is connected using a USB data cable.
- Confirm that the browser supports the Web Serial API.
- Run the webpage from `localhost` or another secure context.
- Check that the correct serial port is selected.
- Close Arduino Serial Monitor or other software that may be using the port.

## The Arduino Receives No Commands

- Confirm that the serial port is open.
- Check that the baud rate matches on both sides.
- Verify that the JavaScript command function is called.
- Confirm that the command includes the expected newline.
- Check for JavaScript errors in the browser console.

## The LED Does Not Turn On

- Verify the LED polarity.
- Check the resistor and breadboard connections.
- Confirm that the LED is connected to digital pin 8 and GND as specified.
- Ensure the LED-control sketch was uploaded successfully.
- Verify that the browser is sending `LED_ON` exactly.

## The Arduino Receives Commands but Does Not Recognize Them

- Check command spelling and capitalization.
- Confirm that the firmware removes unwanted whitespace.
- Ensure that the newline delimiter is handled correctly.
- Inspect the browser console and serial output for errors.

## The Arduino Responds, but the Webpage Does Not Display the Response

- Confirm that the reading loop starts after the serial connection opens.
- Verify that `port.readable` is available.
- Check for reader errors in the browser console.
- Ensure another reader has not locked the readable stream.
- Remember that serial data can arrive in chunks rather than as complete messages.

## JavaScript: Assignment to Constant Variable

This error occurs when a variable declared with `const` is reassigned.

Incorrect:

```javascript
const command = "LED_ON";

command = "LED_OFF";
```

Correct when reassignment is needed:

```javascript
let command = "LED_ON";

command = "LED_OFF";
```

Use `const` when the variable binding should not be reassigned, and `let` when reassignment is required.

---

# Lessons Learned

## Phase 1

- What the Web Serial API does.
- How serial communication works.
- Why baud rates must match.
- How browser permissions and secure contexts affect device access.
- How to request and open a serial port.
- How to read and decode data from the Arduino.

## Phase 2

- How to transmit data through `port.writable`.
- How to use `TextEncoder` to convert text into bytes.
- How to acquire and release a writable stream lock.
- How the Arduino receives data using its serial interface.
- How to design a simple text-based command protocol.
- How to control a physical LED through webpage buttons.
- How to send acknowledgements and error messages.
- How reading and writing can operate independently on the same serial connection.

---

# Future Roadmap

## Phase 3 — Improving the Browser Interface

Planned topics:

- Displaying Arduino acknowledgements in a structured interface.
- Improving status messages and connection feedback.
- Showing the current LED state in the webpage.
- Handling errors and serial disconnections.
- Making the interface easier to extend with more controls.

## Future Phases

Possible extensions include:

- Non-blocking serial command parsing.
- Controlling multiple outputs.
- Reading sensors and displaying live measurements.
- Sending structured data between the browser and firmware.
- Improving reconnection and stream-lock management.
- Building a more complete browser-based hardware dashboard.

These are planned extensions rather than completed features.

---

# Resources

- [MDN — Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
- [MDN — TextEncoder](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder)
- [MDN — Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [Arduino Documentation](https://docs.arduino.cc/)
- [Google Chrome — Serial API Explainer](https://developer.chrome.com/docs/capabilities/serial)

---

## Project Status

- [x] Phase 1 — Establishing a browser-to-Arduino connection.
- [x] Phase 1 — Receiving serial messages in the browser.
- [x] Phase 2 — Sending commands from the browser.
- [x] Phase 2 — Interpreting commands in Arduino firmware.
- [x] Phase 2 — Controlling a physical LED through webpage buttons.
- [ ] Phase 3 — Improving the interface and communication feedback.

**Learning by building, testing, documenting, and improving.**
