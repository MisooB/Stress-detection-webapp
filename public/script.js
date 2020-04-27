const startButton = document.getElementById("start_process_id");

let gumStream; 						//stream from getUserMedia()
let recorder; 						//WebAudioRecorder object
let input; 							//MediaStreamAudioSourceNode  we'll be recording
let encodingType; 					//holds selected encoding for resulting audio (file)
let encodeAfterRecord = true;       // when to encode

// shim for AudioContext when it's not avb.
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext; //new audio context to help us record

const recordButton = document.getElementById("recordButton");
const stopButton = document.getElementById("stopButton");

const processSoundRequest = () => {
  const httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = () => {
    if (httpRequest.status === 200) {
      const data = httpRequest.responseText;
      console.log(`Successful, data: ${data}`);
    } else {
      console.log(`somethings wrong, data: ${data}`);
    }
  };
  httpRequest.open('GET', '/process_sound/test.wav');
  httpRequest.send();
};

const saveSoundFile = (soundFile) => {
  const formData = new FormData();

  formData.append('name', name);
  formData.append('temp-sound', soundFile);
  axios.post('/process_sound', formData, {
    headers: {
      'content-type': 'multipart/form-data'
    }
  }).then(() => {
    // Handle data
  }, (error) => {
    // Handle error
    console.log(error);
  });
};

const startRecording = () => {

  // Simple constraints object, for more advanced features see https://addpipe.com/blog/audio-constraints-getusermedia/
  const constraints = {audio: true, video: false}

  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    // console.log("getUserMedia() success, stream created, initializing WebAudioRecorder...");

    /*
      create an audio context after getUserMedia is called
      sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
      the sampleRate defaults to the one set in your OS for your playback device
    */
    audioContext = new AudioContext();

    //assign to gumStream for later use
    gumStream = stream;

    // use the stream
    input = audioContext.createMediaStreamSource(stream);

    //stop the input from playing back through the speakers
    //input.connect(audioContext.destination)

    //get the encoding
    encodingType = "wav";

    recorder = new WebAudioRecorder(input, {
      encoding: encodingType,
      numChannels: 2, //2 is the default, mp3 encoding supports only 2
      onEncoderLoading: function (recorder, encoding) {
        // show "loading encoder..." display
        // console.log("Loading " + encoding + " encoder...");
      },
      onEncoderLoaded: function (recorder, encoding) {
        // hide "loading encoder..." display
        // console.log(encoding + " encoder loaded");
      }
    });

    recorder.onComplete = function (recorder, blob) {
      // console.log("Encoding complete");
      createDownloadLink(blob, recorder.encoding);
      const wavSound = new Blob([blob], {'type': 'audio/wav; codecs=0'});
      saveSoundFile(wavSound);
    }

    recorder.setOptions({
      timeLimit: 120,
      encodeAfterRecord: encodeAfterRecord,
      ogg: {quality: 0.5},
      mp3: {bitRate: 160}
    });

    //start the recording process
    recorder.startRecording();

    // console.log("Recording started");

  }).catch(function (err) {
    //enable the record button if getUSerMedia() fails
    recordButton.disabled = false;
    stopButton.disabled = true;
  });

  //disable the record button
  recordButton.disabled = true;
  stopButton.disabled = false;
};

const stopRecording = () => {
  // console.log("stopRecording() called");

  //stop microphone access
  gumStream.getAudioTracks()[0].stop();

  //disable the stop button
  stopButton.disabled = true;
  recordButton.disabled = false;

  //tell the recorder to finish the recording (stop recording + encode the recorded audio)
  recorder.finishRecording();

};

function createDownloadLink(blob, encoding) {
  const url = URL.createObjectURL(blob);
  const au = document.createElement('audio');
  const li = document.createElement('li');

  au.controls = true;
  au.src = url;

  //add the new audio and a elements to the li element
  li.appendChild(au);

  //add the li element to the ordered list
  recordingsList.appendChild(li);
}

recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);