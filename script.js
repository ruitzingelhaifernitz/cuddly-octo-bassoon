document.addEventListener('DOMContentLoaded', () => {
    const pizzaFlavors = [
        'classic margherita',
        'mushroom and spinach',
        'spinach and pesto',
        'five cheese sweet chutney',
        'grilled vegetable and french goat cheese',
        'truffle oil and mushroom',
        'tarte flambée with goat cheese and olives',
        'tarte flambée mushroom and spinach'
    ];
    let correctWord = '';
    let displayedWord = [];
    let incorrectGuesses = 0;
    const maxIncorrectGuesses = 8;
    let guessedLetters = new Set(); // Stores all unique letters guessed (correct or incorrect)

    // Image file names for the pizza indicator
    const pizzaImageStates = [
        'pizza-full.png',        // 0 incorrect guesses
        'pizza_1_slice_gone.png', // 1 incorrect guess
        'pizza_2_slices_gone.png', // 2 incorrect guesses
        'pizza_3_slices_gone.png', // 3 incorrect guesses
        'pizza_4_slices_gone.png', // 4 incorrect guesses
        'pizza_5_slices_gone.png', // 5 incorrect guesses
        'pizza_6_slices_gone.png', // 6 incorrect guesses
        'pizza_7_slices_gone.png', // 7 incorrect guesses
        'pizza_8_slices_gone.png'  // 8 incorrect guesses (empty crust)
    ];


    // DOM Elements
    const attemptsLeftDisplay = document.getElementById('attemptsLeft');
    const wordDisplay = document.getElementById('wordDisplay');
    const messageDisplay = document.getElementById('message');
    const letterInput = document.getElementById('letterInput');
    const guessButton = document.getElementById('guessButton');
    const keyboardContainer = document.getElementById('keyboard');
    const resetGameButton = document.getElementById('resetGame');
    const pizzaIndicatorImg = document.getElementById('pizzaIndicator'); // Get the image element

    function initializeGame() {
        correctWord = pizzaFlavors[Math.floor(Math.random() * pizzaFlavors.length)];
        displayedWord = Array(correctWord.length).fill('_'); // Start with underscores for each char
        incorrectGuesses = 0;
        guessedLetters.clear();
        messageDisplay.textContent = '';
        letterInput.value = '';
        letterInput.disabled = false;
        guessButton.disabled = false;
        resetGameButton.style.display = 'none';
        
        // Set the pizza image back to full
        pizzaIndicatorImg.src = pizzaImageStates[0];

        // Reveal spaces, hyphens, and ampersands from the start
        for (let i = 0; i < correctWord.length; i++) {
            if (correctWord[i] === ' ' || correctWord[i] === '-' || correctWord[i] === '&') {
                displayedWord[i] = correctWord[i];
            }
        }
        updateDisplay();
        createKeyboard(); // Recreate keyboard to reset states
        letterInput.focus();
        // console.log("Hint (for testing): The answer is " + correctWord); // For debugging
    }

    function updateDisplay() {
        attemptsLeftDisplay.textContent = `Incorrect guesses left: ${maxIncorrectGuesses - incorrectGuesses}`;
        
        // Build the display string with individual spaces between letters and larger spaces between words
        let displayHtml = '';
        for (let i = 0; i < displayedWord.length; i++) {
            if (correctWord[i] === ' ') {
                displayHtml += '&nbsp;'; // ONE non-breaking spaces for word break (reduced from five)
            } else if (correctWord[i] === '-' || correctWord[i] === '&') {
                displayHtml += displayedWord[i]; // Display special characters directly
            } else {
                displayHtml += displayedWord[i]; // Letter or underscore
            }
        }
        wordDisplay.innerHTML = displayHtml.trim(); // Use innerHTML to render &nbsp; entities

        // Update the pizza indicator image based on incorrect guesses
        // Use Math.min to prevent index out of bounds if incorrectGuesses somehow exceeds maxAttempts
        pizzaIndicatorImg.src = pizzaImageStates[Math.min(incorrectGuesses, maxIncorrectGuesses)];
    }

    function createKeyboard() {
        keyboardContainer.innerHTML = ''; // Clear existing keyboard
        const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

        alphabet.forEach(letter => {
            const button = document.createElement('button');
            button.textContent = letter.toUpperCase();
            button.id = `key-${letter}`; // Unique ID for each key
            button.addEventListener('click', () => handleGuess(letter));
            keyboardContainer.appendChild(button);
        });
    }

    function updateKeyboard(letter, isCorrect) {
        const keyButton = document.getElementById(`key-${letter}`);
        if (keyButton) {
            keyButton.disabled = true;
            if (isCorrect) {
                keyButton.classList.add('correct');
            } else {
                keyButton.classList.add('incorrect');
            }
        }
    }

    function handleGuess(guessLetter) {
        guessLetter = guessLetter.toLowerCase();

        // Validate input for text field only
        if (letterInput.value && !/^[a-z]$/.test(guessLetter)) {
            messageDisplay.textContent = 'Please enter a single letter from A-Z.';
            letterInput.value = '';
            return;
        }

        if (guessedLetters.has(guessLetter)) {
            messageDisplay.textContent = `You already guessed "${guessLetter.toUpperCase()}". Try a different letter.`;
            letterInput.value = '';
            return;
        }

        guessedLetters.add(guessLetter);

        let correctGuessMadeForThisLetter = false; // Flag to track if the current guess was correct

        // Special handling for 'é'
        if (correctWord.includes('é')) {
            if (guessLetter === 'e' || guessLetter === 'é') {
                for (let i = 0; i < correctWord.length; i++) {
                    if (correctWord[i] === 'é') {
                        displayedWord[i] = 'é';
                        correctGuessMadeForThisLetter = true;
                    }
                }
                updateKeyboard('e', true); // Mark 'e' key as correct if 'é' was found
            }
        }
        
        // Standard letter checking (only if 'é' wasn't already fully handled by guess)
        for (let i = 0; i < correctWord.length; i++) {
            // Only fill if it's an underscore (not already revealed or a special character)
            if (correctWord[i].toLowerCase() === guessLetter && displayedWord[i] === '_') {
                displayedWord[i] = correctWord[i]; // Keep original case from correctWord
                correctGuessMadeForThisLetter = true;
            }
        }

        if (correctGuessMadeForThisLetter) {
            messageDisplay.textContent = `Good guess! "${guessLetter.toUpperCase()}" is in the word.`;
            // Only update keyboard for the exact guessed letter if it was correct and not 'é' related
            // We already handled 'e' for 'é', so ensure we don't re-mark it.
            if (!(correctWord.includes('é') && (guessLetter === 'e' || guessLetter === 'é'))) {
                updateKeyboard(guessLetter, true);
            }
        } else {
            // Only count as incorrect if it wasn't a correct guess *at all*
            incorrectGuesses++;
            messageDisplay.textContent = `Sorry, "${guessLetter.toUpperCase()}" is not in the word.`;
            updateKeyboard(guessLetter, false);
        }

        updateDisplay();
        letterInput.value = ''; // Clear input field

        checkGameStatus();
    }

    function checkGameStatus() {
        // Check if all unrevealed characters (underscores) are gone
        const solved = !displayedWord.includes('_');

        if (solved) {
            messageDisplay.textContent = `You win! The pizza flavor was "${correctWord}".`;
            endGame(true);
        } else if (incorrectGuesses >= maxIncorrectGuesses) {
            messageDisplay.textContent = `Game Over! The pizza flavor was "${correctWord}".`;
            endGame(false);
        }
    }

    function endGame(won) {
        letterInput.disabled = true;
        guessButton.disabled = true;
        // Disable all keyboard buttons
        keyboardContainer.querySelectorAll('button').forEach(button => {
            button.disabled = true;
        });
        resetGameButton.style.display = 'block';
    }

    // Event Listeners
    guessButton.addEventListener('click', () => handleGuess(letterInput.value));
    letterInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleGuess(letterInput.value); 
        }
    });
    resetGameButton.addEventListener('click', initializeGame);

    // Initial game setup
    initializeGame();
});
