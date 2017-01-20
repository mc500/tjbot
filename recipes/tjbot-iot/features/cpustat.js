var fs = require('fs'),
	cputemploc = '/sys/class/thermal/thermal_zone0/temp',
	cpuloadloc = '/proc/loadavg';

function getCPUTemp() {
	var cputemp;
	try {
		var stats = fs.statSync(cputemploc),
			data = fs.readFileSync(cputemploc, 'utf8');

		cputemp = data/1000;
	} catch(e) {
		cputemp = (Math.random()*100).toFixed(0);
		console.error('cputemploc file does not exist. but returns ' + cputemp);
	}

	return cputemp;
}

function getCPULoad() {

	var load = {};
	
	try {
		var stats = fs.statSync(cpuloadloc),
			data = fs.readFileSync(cpuloadloc, 'utf8').split(' ');

		load = {
			load1: data[0],
			load5: data[1],
			load15: data[2]
		};
	} catch(e) {
		load.load1 = (Math.random()*100).toFixed(0);
		console.error('cpuloadloc file does not exist. but returns ' + load.load1);
	}

	return load.load1;
}

module.exports = {
	getCPUTemp: getCPUTemp,
	getCPULoad: getCPULoad
};