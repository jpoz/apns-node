var cert_path = './apns-dev-cert.pem';
var keys_path = './apns-dev-keys.pem';
var device_id = require('fs').readFileSync('./device_id.txt', 'utf-8');
// remember to remove "<", ">" and " "'s

var APNS = require('../apns').createServer(cert_path, keys_path);
APNS.notify(device_id, { alert:"Hello", sound: "default", badge:7 });
//APNS.end();