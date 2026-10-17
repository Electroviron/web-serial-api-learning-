// get elements from DOM
const status = document.getElementById("status");
const connectButton = document.getElementById("connectButton");
const output = document.getElementById("output");  // to display serial data from arduino

// check if browser supports serial
if("serial" in navigator){
    status.textContent = "web serial API is supported!";
}
else{
    status.textContent = "Web serial API is not supported!";
    connectButton.disabled = true;
}

// reading from aruino function
async function readFromArduino() {
  const decoder = new TextDecoder();
  const reader = port.readable.getReader();

  try {
    while (true) {
      const { value, done } = await reader.read();  //This waits asynchronously for the next available chunk of data.

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


let port  = null;

// if support, add event listener for button click
connectButton.addEventListener("click", async () => {
    
    try {
        status.textContent = "waiting for device connection";

        port = await navigator.serial.requestPort();

        status.textContent = "opening serial port";

        await port.open({baudRate: 9600})

        status.textContent = "connected to arduino uno";
        readFromArduino();
        connectButton.disabled = true;

    } catch (error) {
        if(error.name === "NotFoundError"){
            status.textContent = "No device selected";
        }
        else{
            status.textContent = "Connection failed: " + error.message;
            console.log(error);
        }
    }
});



//=================================
// NOTE
//=================================
//
/*A Promise in JavaScript is an object that represents the eventual result (success or failure)
of an asynchronous operation, and it can be in one of three states: pending, fulfilled, or 
rejected.*/
//
/*
An asynchronous function in JavaScript is a function declared with the async keyword that always 
returns a Promise and allows the use of await inside it to pause execution until a Promise 
resolves, enabling cleaner, non‑blocking asynchronous code. */