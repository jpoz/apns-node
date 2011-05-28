# apns-node

Apple push notification service for Node.js

## Warning-Update

apns-node uses now the new tls-API. It should work with node v0.4.8.

## Usage

    var pem_path = './secure.pem'
    // openssl pkcs12 -in mycert.p12 -out client-cert.pem -nodes -clcerts

    var device_id = require('fs').readFileSync('./device_id.txt');
    // remember to remove "<", ">" and " "'s
    
    var APNS = require('apns').createServer(pem_path);
    APNS.notify(device_id, {alert:"Hello", sound: "default", badge:7});

## Copyright

Copyright (c) 2010 James Pozdena. See LICENSE for details.
