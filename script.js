// DOM elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const gestureResult = document.getElementById('gesture-result');
const itemPrompt = document.getElementById('item-prompt');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('start-game');
const resetButton = document.getElementById('reset-game');

// Game variables
let gameActive = false;
let score = 0;
let currentTimer = 1;
let timerInterval;
let currentRound = 0;
let model;
let handDetected = false;

// Lists of items
const flyingItems = [
    // Birds
    "Sparrow", "Eagle", "Hawk", "Pigeon", "Dove", "Parrot", "Crow", "Raven", "Owl", "Vulture",
    "Falcon", "Seagull", "Robin", "Woodpecker", "Peacock", "Ostrich", "Penguin", "Hummingbird", "Flamingo", "Stork",
    "Pelican", "Duck", "Swan", "Goose", "Crane", "Albatross", "Macaw", "Cockatoo", "Canary", "Finch",
    "Kiwi", "Kingfisher", "Toucan", "Parakeet", "Lovebird",
    
    // Insects
    "Butterfly", "Dragonfly", "Bee", "Wasp", "Mosquito", "Fly", "Moth", "Hornet", "Ladybug", "Grasshopper",
    
    // Things
    "Airplane", "Helicopter", "Drone", "Rocket", "Jet", "Balloon", "Hot air balloon", "Kite", "Frisbee", "Boomerang",
    "Paper airplane", "Hang glider", "Paraglider", "Glider", "Blimp", "Zeppelin", "Space shuttle", "UFO", "Satellite",
];

const nonFlyingItems = [
    // Land animals
    "Dog", "Cat", "Lion", "Tiger", "Elephant", "Giraffe", "Zebra", "Horse", "Cow", "Goat",
    "Sheep", "Pig", "Bear", "Wolf", "Fox", "Deer", "Moose", "Rabbit", "Squirrel", "Hedgehog",
    "Badger", "Raccoon", "Skunk", "Porcupine", "Armadillo", "Rhinoceros", "Hippopotamus", "Cheetah", "Leopard", "Jaguar",
    "Panther", "Lynx", "Bobcat", "Hyena", "Coyote", "Kangaroo", "Koala", "Wombat", "Tasmanian devil", "Platypus",
    
    // Sea creatures
    "Fish", "Shark", "Whale", "Dolphin", "Octopus", "Squid", "Crab", "Lobster", "Clam", "Oyster",
    "Shrimp", "Jellyfish", "Starfish", "Sea urchin", "Coral", "Sea cucumber", "Seahorse", "Seal", "Sea lion", "Walrus",
    "Otter", "Beaver", "Manatee", "Narwhal", "Manta ray", "Stingray", "Eel", "Tuna", "Salmon", "Trout",
    
    // Insects/bugs (non-flying)
    "Ant", "Spider", "Scorpion", "Centipede", "Millipede", "Worm", "Caterpillar", "Snail", "Slug", "Tick",
    "Flea", "Louse", "Mite", "Bedbug",
    
    // Reptiles/Amphibians
    "Snake", "Lizard", "Turtle", "Tortoise", "Crocodile", "Alligator", "Frog", "Toad", "Salamander", "Newt",
    "Chameleon", "Gecko", "Iguana", "Komodo dragon",
    
    // Objects
    "Chair", "Table", "Bed", "Sofa", "Desk", "Lamp", "Book", "Pen", "Pencil", "Phone",
    "Computer", "Keyboard", "Mouse", "Monitor", "Printer", "Camera", "Watch", "Clock", "Cup", "Mug",
    "Plate", "Bowl", "Fork", "Knife", "Spoon", "Bottle", "Glass", "Window", "Door", "Wall",
    "Floor", "Ceiling", "Roof", "Car", "Bus", "Truck", "Train", "Boat", "Ship", "Bicycle",
    "Motorcycle", "Skateboard", "Scooter", "Hammer", "Nail", "Screw", "Screwdriver", "Wrench"
];

// Setup canvas size to match video
function setupCanvas() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
}

// Start the video stream
async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: {
            width: 640,
            height: 480,
            facingMode: 'user'
        },
        audio: false
    });
    
    video.srcObject = stream;
    
    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            setupCanvas();
            resolve(video);
        };
    });
}

// Draw hand landmarks on canvas
function drawHand(predictions) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update hand detection status
    handDetected = predictions.length > 0;
    
    // Draw all keypoints and connections if a hand is detected
    if (handDetected) {
        const keypoints = predictions[0].landmarks;
        
        // Draw dots at each keypoint
        for (let i = 0; i < keypoints.length; i++) {
            const [x, y, z] = keypoints[i];
            
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#00FF00';
            ctx.fill();
        }
        
        // Draw hand skeleton (simplified)
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        
        // Connect fingers
        const fingerIndices = [
            [0, 1, 2, 3, 4], // thumb
            [0, 5, 6, 7, 8], // index finger
            [0, 9, 10, 11, 12], // middle finger
            [0, 13, 14, 15, 16], // ring finger
            [0, 17, 18, 19, 20]  // pinky
        ];
        
        fingerIndices.forEach(finger => {
            for (let i = 0; i < finger.length - 1; i++) {
                const start = keypoints[finger[i]];
                const end = keypoints[finger[i + 1]];
                
                ctx.beginPath();
                ctx.moveTo(start[0], start[1]);
                ctx.lineTo(end[0], end[1]);
                ctx.stroke();
            }
        });
    }
    
    // Update hand detection indicator
    if (handDetected) {
        gestureResult.textContent = "Hand Detected";
        gestureResult.style.color = "#00FF00";
    } else {
        gestureResult.textContent = "No Hand";
        gestureResult.style.color = "#FF0000";
    }
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Create a pattern with flying and non-flying items to make it tricky
function createGameSequence(rounds) {
    const sequence = [];
    const flyingCopy = [...flyingItems];
    const nonFlyingCopy = [...nonFlyingItems];
    
    // Shuffle both arrays
    shuffleArray(flyingCopy);
    shuffleArray(nonFlyingCopy);
    
    let consecutiveFlying = 0;
    let consecutiveNonFlying = 0;
    
    for (let i = 0; i < rounds; i++) {
        // Create patterns to trick the player
        // After 2-4 consecutive flying items, throw in 1-2 non-flying items
        // After 2-3 consecutive non-flying items, throw in 1-3 flying items
        
        let useFlying;
        
        if (consecutiveFlying >= 2 + Math.floor(Math.random() * 3)) {
            useFlying = false;
            consecutiveFlying = 0;
            consecutiveNonFlying++;
        } else if (consecutiveNonFlying >= 2 + Math.floor(Math.random() * 2)) {
            useFlying = true;
            consecutiveNonFlying = 0;
            consecutiveFlying++;
        } else {
            // Random choice with slightly higher probability for flying items
            useFlying = Math.random() < 0.55;
            if (useFlying) {
                consecutiveFlying++;
                consecutiveNonFlying = 0;
            } else {
                consecutiveNonFlying++;
                consecutiveFlying = 0;
            }
        }
        
        // Get an item from the appropriate array
        if (useFlying) {
            const item = flyingCopy.pop();
            if (!item) {
                // If we run out of flying items, reshuffle and start over
                shuffleArray(flyingItems);
                sequence.push({ 
                    name: flyingItems[0], 
                    canFly: true 
                });
            } else {
                sequence.push({ 
                    name: item, 
                    canFly: true 
                });
            }
        } else {
            const item = nonFlyingCopy.pop();
            if (!item) {
                // If we run out of non-flying items, reshuffle and start over
                shuffleArray(nonFlyingItems);
                sequence.push({ 
                    name: nonFlyingItems[0], 
                    canFly: false 
                });
            } else {
                sequence.push({ 
                    name: item, 
                    canFly: false 
                });
            }
        }
    }
    
    return sequence;
}

// Generate a sequence of 100 items for the game
let gameSequence = createGameSequence(100);

// Start countdown timer
function startTimer() {
    // Reset timer display
    currentTimer = 1.5;
    timerDisplay.textContent = currentTimer.toFixed(1) + 's';
    
    clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        currentTimer -= 0.1;
        timerDisplay.textContent = currentTimer.toFixed(1) + 's';
        
        if (currentTimer <= 0) {
            clearInterval(timerInterval);
            checkResult();
        }
    }, 100);
}

// Check if player's response is correct
function checkResult() {
    clearInterval(timerInterval);
    
    const currentItem = gameSequence[currentRound];
    
    // If the current item can fly, player should raise their hand
    // If the current item cannot fly, player should not raise their hand
    let correct = (currentItem.canFly && handDetected) || (!currentItem.canFly && !handDetected);
    
    if (correct) {
        // Player responded correctly
        score++;
        scoreDisplay.textContent = score;
        currentRound++;
        
        // Continue with next round
        if (currentRound < gameSequence.length) {
            setTimeout(showNextItem, 1000);
        }
    } else {
        // Game over
        endGame();
    }
}

// Show the next item in the sequence
function showNextItem() {
    if (!gameActive) return;
    
    const currentItem = gameSequence[currentRound];
    itemPrompt.textContent = currentItem.name;
    itemPrompt.style.color = "#FFFFFF";
    
    // Start timer for response
    startTimer();
}

// End the game
function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    
    itemPrompt.textContent = "Game Over! Score: " + score;
    itemPrompt.style.color = "#FF0000";
    
    startButton.disabled = false;
}

// Reset the game
function resetGame() {
    score = 0;
    currentRound = 0;
    gameActive = false;
    clearInterval(timerInterval);
    
    // Generate new sequence
    gameSequence = createGameSequence(100);
    
    // Reset displays
    scoreDisplay.textContent = "0";
    timerDisplay.textContent = "1.5s";
    itemPrompt.textContent = "Get Ready...";
    itemPrompt.style.color = "#FFFFFF";
    
    startButton.disabled = false;
}

// Start the game
function startGame() {
    if (gameActive) return;
    
    gameActive = true;
    score = 0;
    currentRound = 0;
    scoreDisplay.textContent = "0";
    
    // Generate new sequence
    gameSequence = createGameSequence(100);
    
    // Start with a countdown
    itemPrompt.textContent = "Starting in 3...";
    setTimeout(() => {
        itemPrompt.textContent = "2...";
        setTimeout(() => {
            itemPrompt.textContent = "1...";
            setTimeout(() => {
                showNextItem();
            }, 1000);
        }, 1000);
    }, 1000);
    
    startButton.disabled = true;
}

// Main function
async function main() {
    try {
        // Load the HandPose model
        model = await handpose.load();
        console.log("HandPose model loaded");
        
        // Setup camera
        await setupCamera();
        console.log("Camera setup complete");
        
        // Set initial prompt
        itemPrompt.textContent = "Get Ready...";
        
        // Add event listeners for buttons
        startButton.addEventListener('click', startGame);
        resetButton.addEventListener('click', resetGame);
        
        // Main detection loop
        async function detectHands() {
            // Get hand predictions
            const predictions = await model.estimateHands(video);
            
            // Draw hands
            drawHand(predictions);
            
            // Call next frame
            requestAnimationFrame(detectHands);
        }
        
        // Start detection loop
        detectHands();
        
    } catch (error) {
        console.error("Error in hand tracking:", error);
        gestureResult.textContent = "Error: " + error.message;
        gestureResult.style.color = "red";
    }
}

// Start the application
main(); 