# Chidiya Udd Game

A fun browser-based game inspired by the traditional "Chidiya Udd" (Bird Fly) game, using hand detection technology!

## Game Concept

"Chidiya Udd" is a traditional Indian game where a leader calls out different objects, animals, and birds. Players must raise their hand only when the leader names something that can fly.

This digital version uses your webcam and hand tracking technology to automatically detect if you've raised your hand in response to the prompt.

## How to Play

1. Click "Start Game" to begin
2. The game will display various items one at a time (animals, birds, objects, etc.)
3. You have 1.5 seconds to respond:
   - If the item can fly (birds, insects, airplanes, etc.), raise your hand in front of the camera
   - If the item cannot fly (dog, car, table, etc.), keep your hands out of view
4. Score a point for each correct response
5. The game ends when you make a mistake (raising your hand for non-flying items or not raising it for flying items)
6. Try to achieve the highest score!

## Features

- Real-time hand tracking using TensorFlow.js and MediaPipe Handpose
- Over 200 different items (100+ flying and 100+ non-flying)
- Tricky sequence generation that tries to confuse players
- 1.5 second time limit for responses
- Visual hand landmark tracking
- Running score counter

## Technical Requirements

- A modern web browser (Chrome, Firefox, Edge, Safari)
- A webcam
- Internet connection (to load TensorFlow.js and Handpose model)

## Running the Game

1. Clone or download this repository
2. You need to serve these files from a web server due to security restrictions on accessing the camera
   - For quick testing, you can use Python's built-in HTTP server:
     ```
     # Python 3
     python -m http.server
     
     # Python 2
     python -m SimpleHTTPServer
     ```
   - Or use an extension like "Live Server" if you're using Visual Studio Code
   
3. Open your browser and navigate to:
   - `http://localhost:8000` (if using Python's server)
   - Or the URL provided by your web server

4. Allow camera access when prompted by your browser
5. Click "Start Game" and have fun!

## How It Works

This application uses:

- TensorFlow.js for the machine learning framework
- MediaPipe Handpose model for hand tracking
- Canvas API for drawing hand landmarks
- A custom algorithm to generate engaging sequences of flying and non-flying items

## Privacy Note

This application processes all video data locally in your browser. No video or image data is sent to any server. 