// get DOM elements...
let status = document.getElementById("status");

let connectBtn = document.getElementById("connectBtn");
let ledOnBtn = document.getElementById("ledOnBtn");
let ledOffBtn = document.getElementById("ledOffBtn");


// check if browser supports serial
if("serial" in navigator){
    status.textContent = "Web Serial API supported !";
}
else{
    status.textContent = "Web Serial API not supported !";
    connectBtn.disabled = true;
}

// function to send arduino commands
async function sendCommand(command) {
    
    const encoder = new TextEncoder;
    const writer = port.writable.getWriter();

    try{
        await writer.write(encoder.encode(command+"\n"));
        console.log("sent: ", command);
    }
    finally{
        writer.releaseLock();
    }
}

// custom function to  receive command acknowlegdement from the arduino...
let ack = "";

async function readData() {
    const decoder = new TextDecoder;
    const reader = port.readable.getReader();

    try{
        while(true){
            const {value, done} = await reader.read();

            if(done){
                break;
            }

            if(decoder.decode(value) != '\n'){
                ack += decoder.decode(value);
            }
            else{
                console.log(ack);
            }
        }
    }
    catch(error){
        console.log("Reading error: ", error);
    }
    finally{
        reader.releaseLock();
    }
}


// connect to serial device COM channel
let port = null;

connectBtn.addEventListener("click", async () => {
    try{
        status.textContent = "waiting for port selection";
        port = await navigator.serial.requestPort();

        status.textContent = "openning COM session";
        await port.open({baudRate: 9600});

        // ...
        readData();

        connectBtn.disabled = true;
        ledOffBtn.disabled = false;
        ledOnBtn.disabled = false;
    }
    catch(error){
        if(error.name === "NotFoundError"){
            status.textContent = "No device selected !";
        }
        else{
            status.textContent = "Connection failed: "+ error.message;
            console.log(error);
        }
    }
    
})

ledOnBtn.addEventListener("click", async () => {

    sendCommand("LED_ON");
    
})

ledOffBtn.addEventListener("click", async () => {
    
    sendCommand("LED_OFF");
})