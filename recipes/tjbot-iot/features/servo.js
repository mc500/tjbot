var config = require("../config") // to get our credentials and the attention word from the config.js 
var exec = require('child_process').exec;

var mincycle = 500; var maxcycle = 2300 ;

// Setup software PWM on pin 26, GPIO7.
var Gpio = require('pigpio').Gpio;
var motor = new Gpio(7, {mode: Gpio.OUTPUT});

module.exports = {
	waveArm: function() {
		motor.servoWrite(maxcycle);
		setTimeout(function(){
			motor.servoWrite(mincycle);
		}, 400);
	},
	poseArm: function(percent) {
		var dutycycle = Math.floor(mincycle + (maxcycle - mincycle)/100*percent);

		motor.servoWrite(dutycycle < mincycle ? mincycle : (dutycycle > maxcycle ? maxcycle : dutycycle));
	}
};