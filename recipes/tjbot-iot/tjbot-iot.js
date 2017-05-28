/************************************************************************
* Copyright 2016 IBM Corp. All Rights Reserved.
*
* Watson Maker Kits
*
* This project is licensed under the Apache License 2.0, see LICENSE.*
*
************************************************************************
*
* Build a talking robot with Watson.
* This module uses Watson Speech to Text, Watson Conversation, and Watson Text to Speech.
* To run: node conversation.js

* Follow the instructions in http://www.instructables.com/id/Build-a-Talking-Robot-With-Watson-and-Raspberry-Pi/ to
* get the system ready to run this code.
*/

var fs = require('fs');
var mqtt = require('mqtt');
var watson = require('watson-developer-cloud'); //to connect to Watson developer cloud
var config = require("./config"); // to get our credentials and the attention word from the config.js files

var listen = require('./features/listen'),
    lighting = require('./features/lighting'),
    speak = require('./features/speak'),
    servo = require('./features/servo');

/*********************************************************************
* Step #1: Connect to IoT Foundation
**********************************************************************/

function getCA() {
  // Split certificates so that IoTFoundation.pem has multiple certificates
  var certs = fs.readFileSync('IoTFoundation.pem');
  var caCerts = [];
  var chains = certs.toString().split('-----END CERTIFICATE-----');

  for (var idx in chains) {
    var chain = chains[idx].trim();

    if (chain !== '') {
      caCerts.push(chain + '\n-----END CERTIFICATE-----');          
    }
  }

  return caCerts;
}

// Client ID
var clientId = 'd:' + config.org + ':' + config.deviceType + ':' + config.deviceId

// initialize the MQTT connection
var options = {
  'clientId': clientId,
  'username': 'use-token-auth',
  'password': config.authToken,
  'ca': getCA()
};


function publishListenEvent(client, text) {
  var topic = 'iot-2/evt/listen/fmt/json';

  client.publish(topic, JSON.stringify({
    'd': { 
      'text': text
    }
  }));
}

var isConnected = false;

// Connect to server
var msproxyUrl = 'ssl://' + config.org + '.messaging.internetofthings.ibmcloud.com:8883';
var client = mqtt.connect(msproxyUrl, options);

client.on('connect', function() {
  isConnected = true;

  // subscribe command topics
  client.subscribe('iot-2/cmd/lighting/fmt/json');
  client.subscribe('iot-2/cmd/speak/fmt/json');
  client.subscribe('iot-2/cmd/servo/fmt/json');

  console.log('CONNECT');

  // 

  // 
});

client.on('reconnect', function() {
  isConnected = true;

  console.log('RECONNECT');
});

client.on('close', function() {
  isConnected = false;

  console.log('CLOSE');
  // 
  // 
});

client.on('offline', function() {
  isConnected = false;

  console.log('OFFLINE');
  // 
  // 
});

client.on('error', function(error) {
  isConnected = false;
  console.error(error);
  process.exit(1);
}); 

client.on('message', function(topic, message) {

  console.log('MESSAGE');
  console.log('topic: ' + topic);
  console.log('message: ' + message );

  var cmd = JSON.parse(message);

  // lighting
  if (topic == 'iot-2/cmd/lighting/fmt/json') {
      console.log('lighting:'+cmd.code);
      lighting.setLED(cmd.code);
  }
  // speak
  if (topic == 'iot-2/cmd/speak/fmt/json') {
      console.log('speak:'+cmd.text);
      speak.speak(cmd.text);
  }
  // servo
  if (topic == 'iot-2/cmd/servo/fmt/json') {
      console.log('servo:'+cmd.duty);
      servo.poseArm(cmd.duty); // percent
  }

});

/*********************************************************************
* Step #2: Listen user's voice
**********************************************************************/

listen.promise.progress(function(res){
  console.log("msg from speech to text :", res);

  if (isConnected) {
    publishListenEvent(client, res);
  } else {
    // not available
    console.log('not connected to IoTF yet');
  }

}).fail(function(err) {
  console.log('error:', JSON.stringify(err));
});
