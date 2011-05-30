var sys = require("sys"),
    tls = require("tls"),
    fs  = require("fs"),
    url = require("url"),
 Buffer = require('buffer').Buffer;

exports.createServer = function(cert_path, keys_path, host, port) {
	var options = {};
	options.cert_path = cert_path;
	options.keys_path = keys_path;
	options.host = host || 'gateway.sandbox.push.apple.com';
	options.port = port || 2195;
	
	var server = new APNS(options);
	
	return server;
};

APNS = function(options) {
	var self = this;
	var keyPem 	= fs.readFileSync(url.resolve(__dirname,options.keys_path));
	var certPem = fs.readFileSync(url.resolve(__dirname,options.cert_path));
	var cred = { key:keyPem, cert:certPem };
	
	var client = this.client = tls.connect(options.port, options.host, cred, function() {
		this.connected = true;
		if (client.authorized) {
			client.setEncoding('utf-8');
			connected(self);
		} else {
			console.log(client.authorizationError);
			connected(null);
		}
	});
	self.waiting_buffers = [];
	
	client.addListener('data', function(data) { console.log(data); });
	client.addListener('error', function(error) {
		if (!this.connected) { connected(null); }
		console.log("FAIL: "+error);
	});
	client.addListener('close', function() {});
};

function connected(server) {
    if (server.client) {
    	server.waiting_buffers.forEach(function(b){
    		server.client.write(b);
    	});
    } else {
		console.log("Connection failed");
		server.end();
    }
};

APNS.prototype.notify = function(device_id, obj) {
	var json = JSON.stringify({'aps':obj});
  
	var buffer = this.notification_buffer(device_id, json);
	if (this.client.readyState == 'open') {
		this.client.write(buffer);
	} else {
		this.waiting_buffers.push(buffer);
	}
	return this;
};

APNS.prototype.HEXpack = function(str){
	var p=[];
	for (var i=0;i<str.length;i=i+2) { p.push(parseInt(str[i]+str[i+1], 16)); }
	return p
};

APNS.prototype.ASCIIpack = function(str){
	var p=[];
	for (var i=0;i<str.length;i++) { p.push(str.charCodeAt(i)); }
	return p;
};

APNS.prototype.notification_buffer = function(device_id, json) {
	var a = [0,0,32].concat( this.HEXpack(device_id), [0,json.length], this.ASCIIpack(json) );
	
	var buffer = new Buffer(a.length);
	var count = 0;
	a.forEach(function(e) {
		buffer[count] = e;
		count++;
	});
	
	return buffer;
};

APNS.prototype.end = function() {
 	this.client.end();
};