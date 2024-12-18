// This script creates a MediaDeviceManager class, which is responsible for managing the media devices (camera and microphone) and the media stream. It provides methods for checking if media devices are supported, handling media access errors, updating the device list, and adding event listeners for device changes. It also provides a method for getting the media stream with the selected devices and resolution, and a method for handling the media stream.

class MediaDeviceManager {
    // Creates an instance of MediaDeviceManager
    constructor() {
        // The following properties represent various HTML elements and objects that will be used to interact with the media devices and display information to the user. They are initialized in the constructor.
        this.videoOutput = document.getElementById('videoElement');
        this.infoText = document.getElementById('infoText');
        this.videoInputSelect = document.getElementById('videoInputSelect');
        this.audioInputSelect = document.getElementById('audioInputSelect');
        this.resolutionSelect = document.getElementById('resolutionSelect');

        // The devices property is used to store the navigator.mediaDevices object, which provides access to the media devices (camera and microphone) on the user's device. It is initialized in the constructor.
        this.devices = navigator.mediaDevices;

        // The javascriptNode property is used to store the JavaScriptNode object, which is used for audio processing and volume meter visualization. It is initialized to null in the constructor.
        this.javascriptNode = null;

        // The updateDeviceList() and addEventListeners() methods are called in the constructor. This ensures that  the device list is populated and the event listeners are set up immediately when a MediaDeviceManager object is instantiated, initializing the state of the object and making sure it's ready for use immediately after creation.
        this.updateDeviceList();
        this.addEventListeners();
    }

    // Checks if media devices are supported by the browser
    checkMediaDevices() {
        if (!this.devices || !this.devices.getUserMedia) {
            this.infoText.textContent = 'Media devices are not supported by your browser.';
            alert('Media devices are not supported by your browser.');
            console.log('Media devices are not supported by the browser.');
            return false;
        }
        return true;
    }

    // Handles errors that occur during media access
    handleMediaAccessError(err) {
        if (err.name === 'NotAllowedError') {
            alert('Access to camera and microphone was denied.');
        } else if (err.name === 'NotFoundError') {
            alert('No camera or microphone found.');
        } else if (err.name === 'OverconstrainedError') {
            alert('The resolution requested is not supported by your camera.');               
        } else {
            console.error("Error accessing media devices:", err);
            alert('An error occurred while accessing media devices.');
        }
    }

    // Updates the list of available media devices. This method is called in the constructor to populate the select elements with the available options when a MediaDeviceManager object is instantiated, and it can also be called manually to refresh the list of available devices.
    updateDeviceList() {
        return new Promise((resolve, reject) => {
            this.devices.enumerateDevices()
                .then(devices => {
                    this.videoInputSelect.innerHTML = '';
                    this.audioInputSelect.innerHTML = '';

                    devices.forEach(device => {
                        let option = document.createElement('option');
                        option.value = device.deviceId;

                        if (device.kind === 'videoinput') {
                            option.text = device.label || `Camera ${this.videoInputSelect.length + 1}`;
                            this.videoInputSelect.appendChild(option);
                        } else if (device.kind === 'audioinput') {
                            option.text = device.label || `Microphone ${this.audioInputSelect.length + 1}`;
                            this.audioInputSelect.appendChild(option);
                        }
                    });

                    resolve(); // Resolve the promise after updating the device list
                })
                .catch(err => {
                    console.log(err.name + ": " + err.message);
                    reject(err); // Reject the promise if there's an error
                });
        });
    }

    // Adds event listeners for device changes and user selections. This method will be used by the constructor to set up the event listeners when a MediaDeviceManager object is instantiated.
    addEventListeners() {
        
        // Add an event listener for changes in the list of available media devices
        this.devices.ondevicechange = () => this.updateDeviceList();

        // Add event listeners for changes in the selected video and audio devices, as well as the selected camera resolution
        this.videoInputSelect.addEventListener('change', () => {
            this.getDeviceMedia();
            console.log('>>> video device change detected');
        });
        this.audioInputSelect.addEventListener('change', () => {
            this.getDeviceMedia();
            console.log('>>> audio device change detected');
        });
        this.resolutionSelect.addEventListener('change', () => {
            this.getDeviceMedia();
            console.log('>>> camera resolution change detected');
        });
    }

    // Gets the user media with the selected devices and resolution
    getDeviceMedia() {
        const videoSource = this.videoInputSelect.value;
        const audioSource = this.audioInputSelect.value;

        // Get the selected resolution from the resolution select element and parse it into width and height values
        const selectedResolution = this.resolutionSelect.value.split('x');
        const width = parseInt(selectedResolution[0], 10);
        const height = parseInt(selectedResolution[1], 10);

        // Create the media constraints object based on the selected devices and resolution
        const constraints = {
            video: {
                deviceId: videoSource ? { exact: videoSource } : undefined,
                width: { exact: width },
                height: { exact: height }
            },
            audio: { deviceId: audioSource ? { exact: audioSource } : undefined }
        };

        // Stop the current video stream and audio processing node if they exist
        if (this.videoOutput.srcObject) {
            this.videoOutput.srcObject.getTracks().forEach(track => track.stop());
        }
        if (this.javascriptNode) {
            this.javascriptNode.disconnect();
            this.javascriptNode = null;
        }

        // Get the media stream with the selected devices and resolution
        this.devices.getUserMedia(constraints)
            .then((stream) => {
                this.handleMediaStream(stream);
                // this.successMessage();
            })
            .catch((err) => {
                this.handleMediaAccessError(err);
                //<<<< add method that displays error message;
            })   
    }

    // Handles the media stream by detecting the camera resolution, displaying the video, and setting up audio processing for the volume meter
    handleMediaStream(stream) {

        //-- VIDEO HANDLING --//
        // Set the media stream as the source for the video element. We "write to" the srcObject property of the videOutput element with the stream  object. This will display the video from the camera in the video element.
        this.videoOutput.srcObject = stream;
        
        this.videoOutput.muted = true; // Mute the video to avoid feedback
        this.infoText.textContent = ''; 
        
        // Detect and display camera resolution              
        const videoTrack = stream.getVideoTracks()[0]; // Get the video track from the media stream
        const settings = videoTrack.getSettings(); // Get the settings of the video track
        const resolutionText = `Camera Resolution: ${settings.width} x ${settings.height}`;
        // document.getElementById('cameraResolution').textContent = resolutionText; // Display the camera resolution

        // Hide the start button and start messages
        document.getElementById('buttonContainer').style.display = 'none';
        document.getElementById('startMessageContainer').style.display = 'none';

        // Show the success message
        document.getElementById('successMessage').classList.remove('hidden');

        //-- AUDIO HANDLING --//
        // Audio context setup for volume meter
        let audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
            audioContext.resume(); 
        }
        let analyser = audioContext.createAnalyser();
        let microphone = audioContext.createMediaStreamSource(stream);
        this.javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
        
        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        // Connect the microphone to the analyser and then to the javascriptNode
        microphone.connect(analyser);
        analyser.connect(this.javascriptNode);
        this.javascriptNode.connect(audioContext.destination);

        // Canvas setup for drawing the volume meter
        let canvas = document.getElementById("volumeMeter");
        let canvasContext = canvas.getContext("2d");

        // Define the width of the volume meter
        // let volumeMeterWidth = 30; // Adjust this value to make the volume meter thinner or thicker
        
        // Set up the audio processing and volume meter visualization
        this.javascriptNode.onaudioprocess = function() {
            
            // Get the average volume level from the analyser
            let array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            let values = 0;
            let length = array.length;
            for (let i = 0; i < length; i++) {
                values += (array[i]);
            }
            let average = values / length;

            // Calculate volumeWidth instead of volumeHeight
            let volumeWidth = average * 4;  // Scale the volume level
            let xPosition = 0;              // Start from the left

            // Ensure the rectangle doesn't exceed the canvas boundaries
            volumeWidth = Math.min(volumeWidth, canvas.width);

            // Clear the canvas
            canvasContext.clearRect(0, 0, canvas.width, canvas.height);

            // Set the color
            canvasContext.fillStyle = '#23d3d3';

            // Define the height of the volume meter
            let volumeMeterHeight = 150;     // Match the canvas height

            // Draw the volume meter horizontally
            canvasContext.fillRect(xPosition, (canvas.height - volumeMeterHeight) / 2, volumeWidth, volumeMeterHeight);
        };
    }
}    


// Create an instance of the MediaDeviceManager class
const mediaDeviceManager = new MediaDeviceManager();
const testButton = document.getElementById('runTestButton');
const buttonContainer = document.getElementById('buttonContainer');
const selectElements = document.querySelectorAll('select');

// Store original resolution options
const originalResolutions = Array.from(mediaDeviceManager.resolutionSelect.options).map(option => ({
    value: option.value,
    text: option.textContent,
    disabled: option.disabled,
    color: option.style.color
}));

// Helper functions
const setDisabledState = (isDisabled) => {
    testButton.disabled = isDisabled;
    buttonContainer.classList.toggle('disabled', isDisabled);
    buttonContainer.style.border = isDisabled ? '2px solid #ffffff4f' : '';
    selectElements.forEach(element => {
        element.disabled = isDisabled;
        element.classList.toggle('disabled', isDisabled);

        if (isDisabled) {
            element.options[element.selectedIndex].textContent = 'Permission needed';
        } else if (element.id === 'resolutionSelect') {
            // Reset resolution options and select default value
            element.innerHTML = '';
            originalResolutions.forEach(resolution => {
                const option = document.createElement('option');
                option.value = resolution.value;
                option.textContent = resolution.text;
                option.disabled = resolution.disabled;
                option.style.color = resolution.color;
                element.appendChild(option);
            });
            element.value = '1280x720';
        }
    });
};

// Prompt for permission as soon as the page loads
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        // Stop the initial tracks immediately
        stream.getTracks().forEach(track => track.stop());

        // Permissions granted: Update the device list and enable controls
        mediaDeviceManager.updateDeviceList().then(() => setDisabledState(false));
    })
    .catch(err => {
        // Permissions denied: Handle error
        mediaDeviceManager.handleMediaAccessError(err);
        setDisabledState(true);
    });

// Handle test button click
testButton.addEventListener('click', () => mediaDeviceManager.getDeviceMedia());

// Check current permission state and update UI accordingly
mediaDeviceManager.devices.enumerateDevices()
    .then(devices => {
        // Check for at least one accessible video input and at least one accessible audio input
        const hasVideoInput = devices.some(device => device.kind === 'videoinput' && device.deviceId !== '');
        const hasAudioInput = devices.some(device => device.kind === 'audioinput' && device.deviceId !== '');
        
        // Enable the UI only if both conditions are met
        const hasPermissions = hasVideoInput && hasAudioInput;

        // Update the UI based on permission status
        setDisabledState(!hasPermissions);
    });
