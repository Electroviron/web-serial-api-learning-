// get DOM elements
let status = document.getElementById("status");
let connectBtn = document.getElementById("connectButton");
let pingBtn = document.getElementById("pingButton");
const output = document.getElementById("output");


// check if browser supports serial
if("serial" in navigator){
    status.textContent = "Web Serial API supported";
}
else{
    status.textContent = "Web Serial API not supported";
    connectBtn.disabled = true;
}

// communcation functions go under here ...
async function readFromArduino() {
    const decoder = new TextDecoder();
    const reader = port.readable.getReader();

    try{
        while(true){
            const {value, done} = await reader.read();

        if (done){
            break;
        }

        //
        output.textContent += decoder.decode(value);
        }
    }
    catch(error){
        console.log("Reading error: ", error);
    }
    finally{
        reader.releaseLock();
    }
}


async function sendCommand(command) {
    const encoder = new TextEncoder();
    const writer = port.writable.getWriter();

    try{
        await writer.write(encoder.encode(command + "\n"));

        console.log("Sent: ",command);
    }
    finally{
        writer.releaseLock();
    }
}


let port = null;
// connect to serial device
connectBtn.addEventListener("click", async ()=>{
    try{
        status.textContent = "waiting for device connection";
        port = await navigator.serial.requestPort();   // return serial object representing device COM

        status.textContent = "opening serial port";
        // start a communication session
        await port.open({baudRate: 9600})

        status.textContent = "connected to arduino uno";
        // call function to read from data stream
        readFromArduino();

        connectBtn.disabled = true;
        pingBtn.disabled = false;
    }
    catch(error){
        if(error.name === "NotFoundError"){
            status.textContent = "No device connected";
        }
        else{
            status.textContent = "connection failed: "+ error.message;
            console.log(error);
        }
    }
});

pingBtn.addEventListener("click", async () => {
    await sendCommand("PING");
});