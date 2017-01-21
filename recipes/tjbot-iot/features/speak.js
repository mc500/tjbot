var watson = require('watson-developer-cloud');
var fs = require('fs');
var config = require("../config") // to get our credentials and the attention word from the config.js 
var exec = require('child_process').exec;

var text_to_speech = watson.text_to_speech({
  username: config.TTSUsername,
  password: config.TTSPassword,
  version: 'v1'
});

module.exports = {
	speak: function(text) {
		var params = {
			text: text,
			voice: config.voice,
			accept: 'audio/wav'
		};
		tempStream = text_to_speech.synthesize(params)
			.pipe(fs.createWriteStream('output.wav'))
			.on('close', function() {
				var create_audio = exec('aplay output.wav', function (error, stdout, stderr) {
					if (error !== null) {
						console.log('exec error: ' + error);
					}
				});
			});
        return tempStream;
	}
};