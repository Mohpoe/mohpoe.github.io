// DOM Elements
const questionDisplay = document.getElementById('questionDisplay');
const optionsContainer = document.getElementById('optionsContainer');
const timerBar = document.getElementById('timerBar');
const scoreValue = document.getElementById('scoreValue');
const correctValue = document.getElementById('correctValue');
const wrongValue = document.getElementById('wrongValue');
const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
const menuToggle = document.getElementById('menuToggle');
const themeToggle = document.getElementById('themeToggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const mainContent = document.getElementById('mainContent');

// Game Variables
let currentProblem = { a: 0, b: 0, answer: 0 };
let options = [0, 0, 0, 0];
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let timer;
let timeLeft;
let difficulty = 'satuan';
const TIME_LIMIT = 4; // 4 seconds

// Initialize game
function initGame() {
    updateStats();
    generateProblem();
}

// Generate new problem
function generateProblem() {
    // Clear previous timer
    clearInterval(timer);
    
    // Set difficulty ranges
    let min, max;
    switch(difficulty) {
        case 'puluhan':
            min = 10;
            max = 99;
            break;
        case 'ratusan':
            min = 100;
            max = 999;
            break;
        case 'satuan':
        default:
            min = 1;
            max = 9;
    }
    
    // Generate problem
    currentProblem.a = getRandomInt(min, max);
    currentProblem.b = getRandomInt(min, max);
    currentProblem.answer = currentProblem.a * currentProblem.b;
    
    // Generate options
    generateOptions();
    
    // Display problem
    questionDisplay.textContent = `${currentProblem.a} × ${currentProblem.b} = ?`;
    
    // Start timer
    startTimer();
}

// Generate answer options
function generateOptions() {
    // Reset options
    options = [];
    
    // Add correct answer
    options.push(currentProblem.answer);
    
    // Generate 3 wrong answers
    while(options.length < 4) {
        let wrongAnswer;
        const variance = Math.floor(currentProblem.answer * 0.3); // 30% variance
        
        do {
            // Generate wrong answer with some logic
            if(Math.random() > 0.5) {
                wrongAnswer = currentProblem.answer + getRandomInt(1, variance);
            } else {
                wrongAnswer = Math.max(1, currentProblem.answer - getRandomInt(1, variance));
            }
            
            // For small numbers, just add/subtract 1-3
            if(currentProblem.answer < 10) {
                wrongAnswer = currentProblem.answer + (Math.random() > 0.5 ? 1 : -1) * getRandomInt(1, 3);
                wrongAnswer = Math.max(1, wrongAnswer);
            }
        } while(options.includes(wrongAnswer) || wrongAnswer === currentProblem.answer);
        
        options.push(wrongAnswer);
    }
    
    // Shuffle options
    options = shuffleArray(options);
    
    // Update buttons
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach((btn, index) => {
        btn.textContent = options[index];
        btn.className = 'option-btn'; // Reset classes
        btn.disabled = false;
    });
}

// Start timer
function startTimer() {
    timeLeft = TIME_LIMIT;
    updateTimerDisplay();
    
    timer = setInterval(() => {
        timeLeft -= 0.1;
        updateTimerDisplay();
        
        if(timeLeft <= 0) {
            clearInterval(timer);
            timeOut();
        }
    }, 100);
}

// Update timer display
function updateTimerDisplay() {
    const percentage = (timeLeft / TIME_LIMIT) * 100;
    timerBar.style.width = `${percentage}%`;
    
    // Change color based on time left
    if(percentage < 30) {
        timerBar.style.backgroundColor = 'var(--wrong-color)';
    } else if(percentage < 60) {
        timerBar.style.backgroundColor = 'var(--neutral-color)';
    } else {
        timerBar.style.backgroundColor = 'var(--primary-color)';
    }
}

// Time out handler
function timeOut() {
    // Mark as unanswered
    score -= 1;
    updateStats();
    
    // Visual feedback
    questionDisplay.textContent = `${currentProblem.a} × ${currentProblem.b} = ${currentProblem.answer}`;
    
    // Disable buttons
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
        btn.disabled = true;
    });
    
    // Next question after delay
    setTimeout(generateProblem, 1500);
}

// Check answer
function checkAnswer(selectedOption, selectedIndex) {
    // Clear timer
    clearInterval(timer);
    
    // Get clicked button
    const optionButtons = document.querySelectorAll('.option-btn');
    const clickedButton = optionButtons[selectedIndex];
    
    // Check if correct
    if(selectedOption === currentProblem.answer) {
        // Correct answer
        score += 1;
        correctCount += 1;
        clickedButton.classList.add('correct');
    } else {
        // Wrong answer
        score -= 2;
        wrongCount += 1;
        clickedButton.classList.add('wrong');
        
        // Highlight correct answer
        optionButtons.forEach(btn => {
            if(parseInt(btn.textContent) === currentProblem.answer) {
                btn.classList.add('correct');
            }
        });
    }
    
    updateStats();
    
    // Disable all buttons
    optionButtons.forEach(btn => {
        btn.disabled = true;
    });
    
    // Show correct answer
    questionDisplay.textContent = `${currentProblem.a} × ${currentProblem.b} = ${currentProblem.answer}`;
    
    // Next question after delay
    setTimeout(generateProblem, 1500);
}

// Update statistics display
function updateStats() {
    scoreValue.textContent = score;
    correctValue.textContent = correctCount;
    wrongValue.textContent = wrongCount;
}

// Helper functions
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
    const newArray = [...array];
    for(let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Event listeners
optionsContainer.addEventListener('click', (e) => {
    if(e.target.classList.contains('option-btn') && !e.target.disabled) {
        const selectedIndex = parseInt(e.target.dataset.option) - 1;
        const selectedOption = parseInt(e.target.textContent);
        checkAnswer(selectedOption, selectedIndex);
    }
});

difficultyRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        difficulty = e.target.value;
        generateProblem();
    });
});

// Theme toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
});

// Menu toggle
menuToggle.addEventListener('click', toggleSidebar);
overlay.addEventListener('click', toggleSidebar);

function toggleSidebar() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    mainContent.classList.toggle('sidebar-open');
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Number keys 1-4 for options
    if(e.key >= '1' && e.key <= '4') {
        const index = parseInt(e.key) - 1;
        const optionButtons = document.querySelectorAll('.option-btn');
        if(index < optionButtons.length && !optionButtons[index].disabled) {
            const selectedOption = parseInt(optionButtons[index].textContent);
            checkAnswer(selectedOption, index);
        }
    }
    // M for menu toggle
    else if(e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleSidebar();
    }
    // D for dark mode toggle
    else if(e.key.toLowerCase() === 'd') {
        e.preventDefault();
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
    }
});

// Check for saved theme preference
if(localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Start the game
initGame();