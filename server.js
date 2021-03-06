const http = require('http');
const WebSocket = require('ws');
const robot = require("robotjs");
const fs = require('fs');

let moving = false;
let moveTime = null;
let moveForceX = null;
let moveForceY = null;
const forceMultiplier = 0.1;

const websocketsServer = http.createServer();

const wss = new WebSocket.Server({ port: 8080, maxPayload: 1000 });


wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      console.log('received: %s', message);
      let splitMessage = message.split(' ');
      switch(splitMessage[0]) {
        case 'move':
          moveMouse(...splitMessage.slice(1));
          break;
        case 'key':
          typeKey(...splitMessage.slice(1));
          break;
        case 'stopMove':
          moving = false;
          moveTime = 0;
          break;
        case 'click':
          click(...splitMessage.slice(1))
          break;
        default:
          console.log('Unimplemented method', splitMessage[0]);
      }
    });
    ws.send('Opened Connection');
});

function typeKey(key) {
    robot.keyTap(key)
}
function moveMouse(x, y, length) {
  console.log('Moving', x, y);
  moveForceX = x;
  moveForceY = y;
  console.log(length)
  if (length > 250) {
    length = 250;
  }
  if (!moveTime) {
    moveTime = parseInt(length, 10);
  } else {
    moveTime += parseInt(length, 10);
  }
  if (!moving) {
    moving = true;
    startSmoothMove()
  }
}
function startSmoothMove() {
  let start = new Date().getTime();
  console.log((new Date().getTime() - start), moveTime);
  while((new Date().getTime() - start) < moveTime) {
    console.log((new Date().getTime() - start), moveTime);
    let mouse = robot.getMousePos();
    console.log("Mouse is at x:" + mouse.x + " y:" + mouse.y);
    robot.moveMouse(mouse.x - (moveForceX * forceMultiplier), mouse.y - (moveForceY * forceMultiplier));
  }
  moveTime = 0;
  moving = false;
}
function click(button, direction=false) {
  if (direction) {
    robot.mouseToggle(direction, button)
  } else {
    robot.mouseClick(button)
  }
}
//create a server object:


http.createServer(function (req, res) {
  res.write(fs.readFileSync('./client.html')); //write a response to the client
  res.end(); //end the response
}).listen(8081, "0.0.0.0"); //the server object listens on port 8080
