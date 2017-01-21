var watson = require('watson-developer-cloud');
var config = require("../config") // to get our credentials and the attention word from the config.js 
var dfd = require('q').defer();
var attentionWord = config.attentionWord; //you can change the attention word in the config file

/************************************************************************
* Step #1: Configuring your Bluemix Credentials
************************************************************************
In this step we will be configuring the Bluemix Credentials for Speech to Text, Watson Conversation
and Text to Speech services.
*/

var speech_to_text = watson.speech_to_text({
  username: config.STTUsername,
  password: config.STTPassword,
  version: 'v1'
});

/************************************************************************
* Step #2: Configuring the Microphone
************************************************************************
In this step, we configure your microphone to collect the audio samples as you talk.
See https://www.npmjs.com/package/mic for more information on
microphone input events e.g on error, startcomplete, pause, stopcomplete etc.
*/

// Initiate Microphone Instance to Get audio samples
var mic = require('mic');
var micInstance = mic({ 'rate': '44100', 'channels': '2', 'debug': false, 'exitOnSilence': 6 });
var micInputStream = micInstance.getAudioStream();

micInputStream.on('data', function(data) {
  //console.log("Recieved Input Stream: " + data.length);
});

micInputStream.on('error', function(err) {
  console.log("Error in Input Stream: " + err);
});

micInputStream.on('silence', function() {
  // detect silence.
});
micInstance.start();
console.log("TJBot is listening, you may speak now.");


/************************************************************************
* Step #3: Converting your Speech Commands to Text
*************************************************************************/

var textStream = micInputStream.pipe(speech_to_text.createRecognizeStream({
  content_type: 'audio/l16; rate=44100; channels=2',
  interim_results: true,
  keywords: [attentionWord],
  smart_formatting: true,
  keywords_threshold: 0.5
}));

/*********************************************************************
* Step #4: Parsing the Text and create a response
**********************************************************************/
textStream.setEncoding('utf8');
textStream.on('data', function (str) {
	str = str.trim(); // remove last space and new line character
  	console.log(' ===== Speak to text ===== : ' + str); // print the text once received

  	if (str.toLowerCase().indexOf(attentionWord.toLowerCase()) == 0) {
  		// send it as progress
  		dfd.notify(str.substr(attentionWord.length));
  	} else {
  		console.log("Waiting to hear", attentionWord);
    }	
});

textStream.on('error', function (err) {
  console.log(' === Watson Speech to Text : An Error has occurred =====') ; // handle errors
  console.log(err) ;
  console.log("Press <ctrl>+C to exit.") ;
  dfd.reject(err);
});

module.exports = {
	promise: dfd.promise
};