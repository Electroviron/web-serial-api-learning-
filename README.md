## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Learning Objectives](#2-learning-objectives)
- [3. Repository Structure](#3-repository-structure)
- [4. Phase 1 — Foundations](#4-phase-1--foundations)
  - [4.1 What Is the Web Serial API?](#41-what-is-the-web-serial-api)
  - [4.2 Understanding Serial Communication](#42-understanding-serial-communication)
  - [4.3 Baud Rate](#43-baud-rate)
  - [4.4 TX and RX](#44-tx-and-rx)
  - [4.5 Bytes, Text, and Messages](#45-bytes-text-and-messages)
  - [4.6 Browser Permissions and Security](#46-browser-permissions-and-security)
  - [4.7 Understanding the Main API Objects](#47-understanding-the-main-api-objects)
  - [4.8 Browser and Hardware Requirements](#48-browser-and-hardware-requirements)
- [5. Phase 1 — Practical Experiments](#5-phase-1--practical-experiments)
  - [5.1 Experiment 1: Establishing a Connection](#51-experiment-1-establishing-a-connection)
  - [5.2 Experiment 2: Receiving Serial Data](#52-experiment-2-receiving-serial-data)
- [6. Troubleshooting and Debugging](#6-troubleshooting-and-debugging)
- [7. Current Progress](#7-current-progress)
- [8. Phase 2 — Two-Way Communication](#8-phase-2--two-way-communication)
- [9. References and Further Reading](#9-references-and-further-reading)

---

## 1. Project Overview

The Web Serial API provides a browser interface for communicating with serial devices. It allows supported web applications to request permission to access a serial port, open a connection, and exchange data with compatible hardware.

This makes it possible to build browser-based interfaces for embedded systems without relying exclusively on a desktop serial terminal.

Potential applications include:

- Live sensor monitoring dashboards.
- Browser-based LED and actuator controls.
- Embedded-system debugging interfaces.
- Interactive electronics demonstrations.
- Serial data visualization and logging.
- Custom control panels for Arduino and ESP32 projects.

The project follows a progressive learning approach: understand the underlying concepts, implement small experiments, investigate failures, and then build more capable applications.

**Current hardware:** Arduino Uno  
**Development environment:** Visual Studio Code  
**Browser:** Microsoft Edge  
**Languages:** HTML, CSS, JavaScript, and Arduino C/C++

## 2. Learning Objectives

By progressing through this repository, the aim is to understand:

1. How serial communication connects browser applications to embedded hardware.
2. How the Web Serial API exposes serial ports to JavaScript.
3. How browser permissions and secure contexts protect access to hardware.
4. How serial data is transmitted, received, decoded, and interpreted.
5. How asynchronous JavaScript and streams handle continuous data.
6. How to build reliable two-way communication between a webpage and a microcontroller.
7. How to develop browser-based interfaces for practical electronics projects.

## 3. Repository Structure

The repository is organized into progressive learning phases.

```text
web-serial-api-learning/
│
├── README.md
│
├── Phase 1/
│   ├── index.html
│   └── main.js
│
├── Phase 2/
│   └── ...
│
└── ...
```

- `README.md` — Main documentation, research notes, learning objectives, and project progress.
- `Phase 1/index.html` — Webpage structure and interface for the initial experiments.
- `Phase 1/main.js` — JavaScript logic for browser support checks, serial connection, and data reception.
- `Phase 2/` — Reserved for the next stage of learning: browser-to-Arduino communication.

The folder structure may expand as the project introduces styling, reusable functions, and more advanced experiments.

---

## 4. Phase 1 — Foundations

Phase 1 establishes the concepts required to understand how a browser communicates with physical hardware.

### 4.1 What Is the Web Serial API?

The Web Serial API is a browser API that allows JavaScript applications to communicate with serial devices through a permission-controlled interface.

Without this API, a normal webpage cannot directly use the browser's serial-device interface in this manner.

The API provides access to serial ports, allowing applications to open connections and exchange data through readable and writable streams.

A typical communication path is:

```text
Web Application
      |
      v
JavaScript
      |
      v
Web Serial API
      |
      v
Computer Serial Interface
      |
      v
USB Connection
      |
      v
Arduino
```

The API handles access to the serial interface and the transfer of data. It does not automatically understand the meaning of a message or control a particular component. The application and Arduino firmware must agree on how commands and responses are interpreted.

**Separation of responsibilities**

| Component | Responsibility |
|---|---|
| HTML | Defines the webpage structure. |
| CSS | Controls the appearance of the interface. |
| JavaScript | Implements application logic. |
| Web Serial API | Exposes serial communication to supported web applications. |
| Arduino firmware | Processes commands and controls connected hardware. |

### 4.2 Understanding Serial Communication

Serial communication transmits data sequentially, one bit at a time over a communication channel.

In Arduino projects, serial communication is commonly used to print debugging information, transmit sensor readings, and receive commands.

For example:

```cpp
void setup() {
    Serial.begin(9600);
}

void loop() {
    Serial.println("Hello from Arduino!");
    delay(1000);
}
```

This program initializes the Arduino's serial interface and sends a text message approximately once per second.

On a typical Arduino Uno, the ATmega328P communicates through a UART interface connected to a USB-to-serial interface on the board. The computer communicates with the board through USB, while the browser interacts with the serial port exposed by the operating system.

This distinction matters because USB and UART are not the same protocol, even though they are connected in the communication path.

### 4.3 Baud Rate

The baud rate describes the number of signal symbols transmitted per second.

For a conventional UART connection using standard binary signalling, one symbol represents one bit.

Arduino initializes serial communication using:

```cpp
Serial.begin(9600);
```

The browser can open the corresponding port using:

```javascript
await port.open({ baudRate: 9600 });
```

For typical UART communication, the settings must match.

Common baud rates include:

| Baud rate | Example application |
|---|---|
| 9600 | Basic Arduino communication and debugging |
| 19200 | Embedded serial applications |
| 115200 | Faster serial communication and development |

Baud rate is not identical to application-level throughput. UART framing consumes transmission time. For example, a typical 8-N-1 UART frame uses ten transmitted bits for each eight-bit data byte, limiting a 9600-baud connection to approximately 960 data bytes per second before other overhead.

### 4.4 TX and RX

Two common serial signal names are:

- **TX — Transmit:** Sends data.
- **RX — Receive:** Receives data.

In a conventional UART connection between two devices, TX connects to the other device's RX, and vice versa.

In a typical USB-connected Arduino Uno, the board's USB interface handles the connection to the computer, so separate TX/RX wiring is unnecessary for our initial experiments.

Communication can operate in both directions:

```text
Arduino  ────────>  Browser
         Sensor data

Arduino  <────────  Browser
         Commands
```

### 4.5 Bytes, Text, and Messages

Serial communication transfers bytes rather than abstract concepts.

Consider:

```cpp
Serial.println("25");
```

The text `"25"` is transmitted as the character bytes for `2` and `5`, followed by a line ending.

This differs from transmitting the binary representation of the integer 25.

The browser must decode incoming bytes and interpret them according to the application's message format.

For example, a newline-delimited text protocol could send:

```text
25
26
27
```

Each line might represent a sensor reading.

JavaScript can decode the incoming bytes using a `TextDecoder`:

```javascript
const decoder = new TextDecoder();
```

A crucial detail is that serial data arrives in chunks. One chunk is not guaranteed to contain exactly one complete message. More advanced applications must account for partial messages, multiple messages in one chunk, and message boundaries.

### 4.6 Browser Permissions and Security

Web Serial access is permission-controlled because it exposes communication with physical devices.

The usual process is:

1. JavaScript requests a serial port.
2. The browser presents a device chooser.
3. The user selects a device and authorizes access.
4. JavaScript opens the selected port.
5. The application exchanges data through the open connection.

The request is made using:

```javascript
const port = await navigator.serial.requestPort();
```

This operation normally requires a user gesture, such as clicking a Connect button.

The API is also restricted to secure contexts. HTTPS qualifies, and `localhost` is treated as a trustworthy local development context.

A website cannot simply open every serial port without the browser's permission model.

### 4.7 Understanding the Main API Objects

The first experiments use several important API objects and methods.

| API member | Purpose |
|---|---|
| `navigator.serial` | Entry point to the Web Serial API. |
| `requestPort()` | Requests user selection of a serial port. |
| `getPorts()` | Retrieves ports previously authorized for the current site. |
| `SerialPort` | Represents a selected serial port. |
| `port.open()` | Opens the serial connection. |
| `port.readable` | Exposes incoming data as a readable stream. |
| `port.writable` | Exposes outgoing data as a writable stream. |
| `port.close()` | Closes the port when its streams and locks permit it. |

Checking browser support:

```javascript
if ("serial" in navigator) {
    console.log("Web Serial is supported.");
}
```

Opening a port:

```javascript
await port.open({ baudRate: 9600 });
```

Reading incoming data requires a reader:

```javascript
const reader = port.readable.getReader();
```

Writing outgoing data will be explored in Phase 2.

When using stream readers and writers, their locks must be managed correctly. A robust application also needs to handle disconnections, read errors, and cleanup.

### 4.8 Browser and Hardware Requirements

The initial experiments use Microsoft Edge on a desktop computer.

Requirements include:

- A browser that supports the Web Serial API.
- A secure context, such as HTTPS or localhost.
- A USB data cable.
- An Arduino board exposing a compatible serial port.
- Appropriate drivers where required.
- A serial port that is not already occupied by another application.

A local Python server can serve the project during development:

```bash
py -m http.server 8000
```

Then open:

`http://localhost:8000/Phase%201/`

Run the command from the mother folder. The space in `Phase 1` is encoded as `%20` in the URL.

The Arduino IDE Serial Monitor should be closed before opening the same serial port in the browser.

---

## 5. Phase 1 — Practical Experiments

Phase 1 contains two completed experiments that progressively establish browser-to-hardware communication.

### 5.1 Experiment 1: Establishing a Connection

**Objective:** Detect Web Serial support, request access to the Arduino Uno, and open its serial port.

Arduino firmware:

```cpp
void setup() {
    Serial.begin(9600);
    Serial.println("Arduino is ready!");
}

void loop() {
}
```

The browser-side process is:

1. Check whether `navigator.serial` is available.
2. Wait for the user to click Connect.
3. Request a serial port using `requestPort()`.
4. Open the port at 9600 baud.
5. Display the connection status.

Core JavaScript operations:

```javascript
const port = await navigator.serial.requestPort();

await port.open({ baudRate: 9600 });
```

**Result:** Successfully connected the webpage running in Microsoft Edge to the Arduino Uno.

This experiment established that the browser, permissions, USB connection, and serial-port opening process were functioning.

### 5.2 Experiment 2: Receiving Serial Data

**Objective:** Receive continuous messages from the Arduino and display them in the webpage.

Arduino firmware:

```cpp
void setup() {
    Serial.begin(9600);
}

void loop() {
    Serial.println("Hello from Arduino!");
    delay(1000);
}
```

The Arduino transmits a message approximately once per second.

On the browser side, JavaScript obtains a reader from the serial port's readable stream:

```javascript
const decoder = new TextDecoder();
const reader = port.readable.getReader();
```

It then reads incoming chunks:

```javascript
const { value, done } = await reader.read();
```

The `value` contains received bytes, while `done` indicates whether the stream has ended.

Incoming bytes can be decoded into text:

```javascript
output.textContent += decoder.decode(value);
```

The resulting text is displayed in the webpage.

**Result:** Successfully received and displayed continuous serial messages from the Arduino Uno in Microsoft Edge.

This experiment demonstrated:

- Continuous serial reception.
- Asynchronous reading with `await`.
- Stream-based data access.
- Byte-to-text decoding.
- Updating webpage content with incoming data.

**Current limitation:** The initial implementation is a learning example. It does not yet implement a complete connection lifecycle, sophisticated message parsing, or robust reconnect handling.

---

## 6. Troubleshooting and Debugging

Common problems encountered when developing Web Serial applications include:

| Symptom | Possible cause |
|---|---|
| `navigator.serial` is unavailable | Unsupported browser or insecure context. |
| Device chooser does not appear | Missing user gesture, permission restriction, or unsupported environment. |
| Arduino does not appear in the chooser | USB cable, driver, or device connection issue. |
| Port fails to open | Another application is using it, or the device cannot be opened. |
| Connection works but no data appears | Firmware, baud rate, or reading logic issue. |
| Received text is corrupted | Serial configuration or decoding issue. |
| Application cannot close the port | A reader or writer may still hold a stream lock. |

Debugging should proceed layer by layer: browser support, user permission, port selection, connection opening, data reception, and message interpretation.

This prevents unrelated issues from being treated as a single failure.

---

## 7. Current Progress

Phase 1 is complete.

| Experiment | Objective | Status |
|---|---|---|
| 1 | Establish a browser-to-Arduino serial connection | Completed |
| 2 | Receive and display Arduino messages | Completed |

The following concepts have been covered:

- Web Serial API fundamentals.
- Serial communication and baud rate.
- TX/RX and data representation.
- Browser permissions and secure contexts.
- Serial port objects and streams.
- Browser, USB, and development-environment requirements.
- Initial connection and data-reception experiments.

The next step is to extend the application from receiving messages to sending commands.

---

## 8. Phase 2 — Two-Way Communication

Phase 2 will focus on sending commands from the browser to the Arduino and receiving responses.

Planned topics include:

1. Understanding `port.writable` and stream writers.
2. Encoding JavaScript strings into bytes with `TextEncoder`.
3. Sending commands from browser buttons.
4. Receiving Arduino acknowledgements.
5. Designing a simple serial message protocol.
6. Handling line endings and parsing complete messages.
7. Improving error handling and connection cleanup.

The first target will be a browser button that sends an `LED_ON` or `LED_OFF` command to the Arduino, with the Arduino responding to confirm the action.

This will establish the foundation for browser-controlled electronics projects and interactive hardware dashboards.

---

## 9. References and Further Reading

The following official documentation provides a foundation for further research:

- [MDN Web Docs — Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
- [MDN — Serial API specification overview](https://developer.mozilla.org/en-US/docs/Web/API/Serial)
- [WICG — Web Serial API specification and explainer](https://github.com/WICG/serial)
- [Arduino — Serial reference](https://docs.arduino.cc/language-reference/en/functions/communication/serial/)
- [MDN — TextDecoder](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder)
- [MDN — ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)
- [MDN — Secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts)

---

**Project philosophy:** Learn the underlying concepts, test them against real hardware, document the results, and build progressively more capable applications. The goal is not merely to make a connection work, but to understand why it works and how to extend it reliably.
