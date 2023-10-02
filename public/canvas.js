let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let pencilColor = document.querySelectorAll(".pencil-color"); 
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWidthElem = document.querySelector(".eraser-width");
let download = document.querySelector(".download")
let undo = document.querySelector(".undo")
let redo = document.querySelector(".redo")

let penColor = "red";
let eraserColor = "white";
let penWidth = pencilWidthElem.value;
let eraserWidth = eraserWidthElem.value;

let undoRedoTracker = [] // Data
let track = 0; // Represnt which action from tracker array

let mouseDown = false;



//API
let tool = canvas.getContext("2d")

tool.strokeStyle = penColor;
tool.lineWidth = penWidth;

// mousedown -> start new path, mousemove -> path fill (graphics)
canvas.addEventListener("mousedown", (e) => {
    mouseDown = true;

    let data = {
        x: e.clientX,
        y: e.clientY
    }
    socket.emit("beginPath", data)
})

canvas.addEventListener("mousemove", (e) => {
    if (mouseDown) {
        let data = {
            x: e.clientX,
            y: e.clientY,
            color: eraserFlag ? eraserColor : penColor,
            width: eraserFlag ? eraserWidth : penWidth
        }

        socket.emit("drawStroke", data)
    }
})

canvas.addEventListener("mouseup", (e) => {
    mouseDown = false;

    let url = canvas.toDataURL()
    undoRedoTracker.push(url)
    track = undoRedoTracker.length - 1;
})

undo.addEventListener("click", (e) => {
    if (track > 0) track--;
    
    // track action
    let data = {
        trackValue: track,
        undoRedoTracker
    }

    socket.emit("undoRedoCanvas", data)
})

redo.addEventListener("click", (e) => {
    if (track < undoRedoTracker.length - 1) track++;

    // track action
    let data = {
        trackValue: track,
        undoRedoTracker
    }

    socket.emit("undoRedoCanvas", data)
})

function undoRedoCanvas(trackObj) {
    track = trackObj.trackValue
    undoRedoTracker = trackObj.undoRedoTracker

    let url = undoRedoTracker[track];
    let img = new Image(); //new image reference element
    img.src = url;

    img.onload = (e) => {
        tool.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
}

function beginPath(strokeObj) {
    tool.beginPath()
    tool.moveTo(strokeObj.x, strokeObj.y)
}

function drawStroke(strokeObj) {
    console.log("strokeObj", strokeObj)
    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;
    tool.lineTo(strokeObj.x, strokeObj.y)
    tool.stroke()
}

pencilColor.forEach((colorElem) => {
    colorElem.addEventListener("click", (e) => {
        let color = colorElem.classList[0];
        penColor = color;
        tool.strokeStyle = penColor;
    })
})

pencilWidthElem.addEventListener("change", (e) => {
    penWidth = pencilWidthElem.value;
    tool.lineWidth = penWidth
})

eraserWidthElem.addEventListener("change", (e) => {
    eraserWidth = eraserWidthElem.value;
    tool.lineWidth = eraserWidth
})

eraser.addEventListener("click", (e) => {
    if (eraserFlag) {
        tool.strokeStyle = eraserColor;
        tool.lineWidth = eraserWidth;
    } else {
        tool.strokeStyle = penColor;
        tool.lineWidth = penWidth;
    }
})

download.addEventListener("click", (e) => {

    let url = canvas.toDataURL();
    let a = document.createElement("a");
    a.href = url;
    a.download = "board.jpg";
    a.click();
})

socket.on("beginPath", (data) => {
    // data -> data from server
    //Now transfer data to all connected computers
    beginPath(data);
})

socket.on("drawStroke", (data) => {
    // data -> data from server
    //Now transfer data to all connected computers
    drawStroke(data);
})

socket.on("undoRedoCanvas", (data) => {
    // data -> data from server
    //Now transfer data to all connected computers
    undoRedoCanvas(data);
})