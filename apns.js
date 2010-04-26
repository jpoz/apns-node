var sys = require("sys"),
    net = require("net"),
    fs  = require("fs"),
 crypto = require('crypto'),
 Buffer = require('buffer').Buffer

exports.createServer = function(pem_path, host, port) {
  var options = {};
  options.pem_path = pem_path;
  options.host = host || 'gateway.sandbox.push.apple.com';
  options.port = port || 2195;
  
  var server = new APNS(options);
 
  return server
}

APNS = function(options) {
  var self = this;
  var pem = fs.readFileSync(options.pem_path);
  
  var client = this.client = net.createConnection(options.port, options.host);
  this.waiting_buffers = [];

  var credentials = crypto.createCredentials({ca:pem, key:pem, cert:pem});

  client.setEncoding("UTF8");
  client.setNoDelay(true)
  client.setKeepAlive(true)

  client.addListener("connect", function () {
    sys.puts("APNS connected.");
    client.setSecure(credentials);
  });

  client.addListener("secure", function () {
    self.waiting_buffers.forEach(function(b){
      client.write(b);
    })
  });

  client.addListener("error", function (chunk) {
    sys.puts("APNS ERROR: " + chunk);
  });

  client.addListener("end", function () {
    sys.puts("APNS disconnected.");
  });

  client.addListener("close", function () {
    sys.puts("APNS closes.");
  });
}

// Notify device
// 
// JSON Object keys:
//   alert
//   badge
//   sound
// 
// TODO custom keys
//
// usage: apns_instance.notify('12345abcdefg1235abcdefg', {"alert":"Hello World!"});

APNS.prototype.notify = function(device_id, obj) {
  var json = JSON.stringify({'aps':obj});
  
  var buffer = this.notification_buffer(device_id, json);
  if (this.client.readyState == 'open') {
    this.client.write(buffer);
  } else {
    this.waiting_buffers.push(buffer)
  }
}

APNS.prototype.HEXpack = function(str){
  var p=[];
  for (var i=0;i<str.length;i=i+2) { p.push(parseInt(str[i]+str[i+1], 16)); }
  return p
}

APNS.prototype.ASCIIpack = function(str){
  var p=[];
  for (var i=0;i<str.length;i++) { p.push(str.charCodeAt(i)); }
  return p;
}

APNS.prototype.notification_buffer = function(device_id, json) {
  var a = [0,0,32].concat( this.HEXpack(device_id), [0,json.length], this.ASCIIpack(json) );
    
  var buffer = new Buffer(a.length);
  var count = 0;
  a.forEach(function(e) {
   buffer[count] = e;
   count++;
  });
  
  return buffer;
}






