const raw = require("raw-socket");

const DESTINATION_IP = process.argv[2];
const HEADER_LENGTH = 12;
let found = false

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
  if(source === DESTINATION_IP){
    found = true
    const id = buffer.readUInt16BE(24)
    console.log(`${id}\t${source}`)
    console.log("destination reached at hop", id);
    return
  }
  // console.log("received " + buffer.toString('hex'));
  // const sourceIp = buffer.readUInt32BE(12)
  const id = buffer.readUInt16BE(52)
  console.log(`${id}\t${source}`)
  // sourceIp = buffer.slice(12,16)
  // console.log('sourceip', intToIpv4(sourceIp))
  // console.timeEnd('hop:'+i)
});
var socketLevel = raw.SocketLevel.IPPROTO_IP;
var socketOption = raw.SocketOption.IP_TTL;

const sendICMP = (ttl) => {
  let header = Buffer.alloc(HEADER_LENGTH);
  header.writeUInt8(0x8, 0); //type
  header.writeUInt16BE(ttl, 4); //id
  raw.writeChecksum(header, 2, raw.createChecksum(header));

  socket.send(header, 0, HEADER_LENGTH, DESTINATION_IP, function beforeSend() {
    socket.setOption(socketLevel, socketOption, ttl);
  }, function afterSend( error, bytes) {
    if (error) console.log(error.toString());
  });
}


const hops = 64

for(let i = 1; i < hops; i++){
  console.time('hop:'+i)
  setTimeout(() => {
    if(!found){
      sendICMP(i)
    }
  }, i*100)
}

