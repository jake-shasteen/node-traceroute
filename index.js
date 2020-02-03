const raw = require("raw-socket");

const HEADER_LENGTH = 12;
const DESTINATION_IP = "8.8.8.8";

let header = Buffer.alloc(HEADER_LENGTH);
header.writeUInt8(0x8, 0); //type
header.writeUInt16LE(process.pid, 4); //id
raw.writeChecksum(header, 2, raw.createChecksum(header));

let socket = raw.createSocket({
  protocol: raw.Protocol.ICMP
});

socket.on("close", function() {
  console.log("socket closed");
  process.exit(-1);
});

socket.on("error", function(error) {
  console.log("error: " + error.toString());
  process.exit(-1);
});

socket.on("message", function(buffer, source) {
  console.log("received " + buffer.length + " bytes from " + source);
  console.log("data: " + buffer.toString("hex"));
});

var socketLevel = raw.SocketLevel.IPPROTO_IP;
var socketOption = raw.SocketOption.IP_TTL;

function beforeSend() {
  socket.setOption(socketLevel, socketOption, 1);
}

socket.send(header, 0, HEADER_LENGTH, DESTINATION_IP, beforeSend, function(
  error,
  bytes
) {
  if (error) console.log(error.toString());
});
