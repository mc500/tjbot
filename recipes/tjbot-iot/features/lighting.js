var ws281x = require('rpi-ws281x-native');
var NUM_LEDS = 1;        // Number of LEDs
ws281x.init(NUM_LEDS);   // initialize LEDs 

// ----  reset LED before exit
process.on('SIGINT', function () {
    ws281x.reset();    
    process.nextTick(function () { process.exit(0); });
});

// note that colors are specified as Green-Red-Blue, not Red-Green-Blue
// e.g. 0xGGRRBB instead of 0xRRGGBB
var colorPalette = {
    "red": 0x00ff00,
    "green": 0xff0000,
    "blue": 0x0000ff,
    "purple": 0x008080,
    "yellow": 0xc1ff35,
    "magenta": 0x00ffff,
    "orange": 0xa5ff00,
    "aqua": 0xff00ff,
    "white": 0xffffff,
    "off": 0x000000,
    "on": 0xffffff
};

var color = new Uint32Array(NUM_LEDS); 
ws281x.render(color);

console.log("turning off the light");
setLED(colorPalette['off']);

function setLED(grb) { // green-red-blue
	color[0] = grb ;
	ws281x.render(color);    
}

module.exports = {
	'setLED': setLED
};