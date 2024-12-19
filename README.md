# Camera and Microphone Test
A sleek one-page application for testing your media devices, including your cameras and microphones


This project is a **Media Device Test Application** designed to check the compatibility and functionality of your device's camera and microphone. It allows users to select specific devices and resolutions, ensuring compatibility with media-intensive applications.

## Features

- **Camera and Microphone Access**: Test camera and microphone functionality.
- **Device Selection**: Choose specific cameras and microphones if multiple devices are connected.
- **Resolution Options**: Select from various resolutions (e.g., 320x180, 640x480, 1280x720, and 1920x1080).
- **Audio Volume Meter**: Visualize the audio input from the microphone.
- **Success Indicator**: Clear feedback when media devices are working as expected.
- **Responsive Design**: Optimized for desktop and mobile viewing.

## Technology Stack

- **HTML5**: Provides the structure for the application interface.
- **CSS3**: Ensures a responsive and visually appealing design.
- **JavaScript (ES6+)**: Handles media device interactions using the `MediaDevices` API.
- **Gulp**: Inlines CSS and JavaScript into the `index.html` file and minifies the resulting HTML for better performance; Best for use in applications that require embedding a single .html file (e.g., Squarespace).
- **Google Fonts**: Incorporates the `Rubik` font family for modern and clean typography.

## Getting Started

### Prerequisites

- A modern web browser (e.g., Chrome, Edge, Firefox) with support for `MediaDevices.getUserMedia`.

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/Izzy-Cohn/Camera_and_Microphone_Test.git
    ```

2. Navigate to the project directory:
    ```bash
    cd camera-and-microphone-test
    ```

3. Open index.html in your preferred web browser.

### Usage

1. Grant permission for the application to access your camera and microphone.

2. Select your desired camera, microphone, and resolution using the dropdown menus.

3. Click the Start button to begin testing.

4. View the video feed and audio volume meter to confirm device functionality.

### File Structure

- index.html: Main HTML structure of the application.

- styles.css: Contains all styling for the application, including responsive adjustments.

- app.js: Core JavaScript logic for handling media devices, error handling, and UI updates.
