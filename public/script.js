
// Constructor for Card Object
class Card {
    constructor(name, points, ability, rank) {
      this.name = name;
      this.points = points;
      this.ability = ability;
      this.rank = rank;
    }
  
    // Example of a card ability function
    applyAbility(board) {
      // Modify the board or other cards according to the ability
      switch (this.ability) {
        case 'buff':
          this.buffCard(board, row, slot);
          break;
        case 'destroy':
          this.destroyCard(board, row, slot);
          break;
        case 'block':
          this.blockSlot(board, row, slot);
          break;
        default:
          console.log(`${this.name} has no special ability.`);
      }
    }
    // Buff ability increases the points of the card by a given amount
    buffCard(board, row, slot) {
        const cardElement = board[row][slot];
        if (cardElement) {
        const points = parseInt(cardElement.dataset.points, 10);
        cardElement.dataset.points = points + 2;  // Example: Buff increases points by 2
        console.log(`${this.name} buffed the card at row ${row}, slot ${slot} by 2 points.`);
        }
    }
    // Destroy ability removes an opponent's card
    destroyCard(board, row, slot) {
        const cardElement = board[row][slot];
        if (cardElement && cardElement.classList.contains('opponent-card')) {
        board[row][slot].innerHTML = '';  // Remove the card from the slot
        console.log(`${this.name} destroyed the opponent's card at row ${row}, slot ${slot}.`);
        }
    }
  }

//Variables
  let playerNum = null; // Store the player's number (1 or 2)
  let opponent = null;
  let playerTurn = 1;
  let selectedCard = null;
  let skipCounter = 0;
  let lastSkippedPlayer = null;  // Tracks the player who last skipped
  const card1 = new Card('Cactuar', 3, 'buff', 2);
  const card2 = new Card('Ifrit', 5, 'destroy', 2);
  const card3 = new Card('Chocobo', 3, 'buff', 1);
  const card4 = new Card('Cloud', 4, 'buff', 4)
  const card5 = new Card('Tifa', 4, 'destroy', 4);
  const card6 = new Card('Barret', 3, 'buff', 2);
  const card7 = new Card('RedXIII', 5, 'destroy', 2);
  const card8 = new Card('Vincent', 3, 'buff', 1);
  const card9 = new Card('Cid', 4, 'buff', 4)
  const card10 = new Card('Aerith', 4, 'destroy', 4);

// Creating a deck for the player
const deck = [
    card1, card2, card3, card4, card5, card6, card7, card8, card9, card10
]

// ------------------------------------------SERVER--------------------------------------------

// -------------------------------------------Game Logic-----------------------------------------
//Shuffle Deck
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }
// Deal Hand
function dealHand() {
    const shuffledDeck = shuffleDeck([...deck]); // Copy and shuffle the deck
    const playerHand = shuffledDeck.slice(0, 5); // Take the first 5 cards for the player's hand
    // Assign a unique id to each card in the player's hand
    playerHand.forEach((card, index) => {
        card.id = `card-${index}`; // Assign a unique id using index
    });
    return playerHand;
}

// Creating the cards for the player's hand, for testing.
let player1Hand = dealHand();
let player2Hand = dealHand();

// Pawn counts for each slot
const pawnCounts = {
    'slot1-0': 1, 'slot1-1': 0, 'slot1-2': 0, 'slot1-3': 0, 'slot1-4': 1,
    'slot2-0': 1, 'slot2-1': 0, 'slot2-2': 0, 'slot2-3': 0, 'slot2-4': 1,
    'slot3-0': 1, 'slot3-1': 0, 'slot3-2': 0, 'slot3-3': 0, 'slot3-4': 1,
    
};

// Function to update pawn count display (optional for visual feedback)
function showPawnCountDisplay() {
    for (const slotId in pawnCounts) {
      const slotElement = document.getElementById(slotId);
      if(slotElement){
        slotElement.setAttribute('data-pawn-count', pawnCounts[slotId]); // Optional: Show pawn count in slot
        slotElement.innerHTML = `${pawnCounts[slotId]}`;
      }
    }
}
// Call this function to show the initial pawn counts
showPawnCountDisplay();

// Function to skip a turn
function skipTurn() {
  if (lastSkippedPlayer === playerTurn) {
    console.log(`Player ${playerTurn} already skipped their previous turn. You cannot skip consecutively.`);
    return; // Prevent consecutive skips from the same player
}

  skipCounter++;
  console.log(`Player ${playerTurn} skipped their turn.`);

  // If both players skip, end the game
  if (skipCounter >= 2) {
      endGame();
  } else {
      // Switch turns
      playerTurn = playerTurn === 1 ? 2 : 1;
      console.log(`It's now Player ${playerTurn}'s turn.`);
  }
}

// Function to calculate the total points for all rows
function calculateTotalPoints() {
  let player1Total = 0;
  let player2Total = 0;

  // Sum the points from all rows
  for (let row = 1; row <= 3; row++) {
      const { player1Points, player2Points } = calculateRowPoints(row);
      player1Total += player1Points;
      player2Total += player2Points;
  }

  return { player1Total, player2Total };
}

// Function to end the game
function endGame() {
  const { player1Total, player2Total } = calculateTotalPoints();
  console.log(`Player 1 Total Points: ${player1Total}`);
  console.log(`Player 2 Total Points: ${player2Total}`);

  if (player1Total > player2Total) {
      alert('Player 1 Wins!');
  } else if (player2Total > player1Total) {
      alert('Player 2 Wins!');
  } else {
      alert('It\'s a tie!');
  }
    // After displaying the result, reset the game
    setTimeout(resetGame(), 3000); // Wait 3 seconds before resetting the game
  // You can add more logic to reset or restart the game here
}

// Function to place the selected card in a slot
const placeCard = (slotElement) => {

  let cardPoints = selectedCard.points;

    // Is there a card selected?
    if (!selectedCard) {
        alert("Select a card first!");
        return;
    }

    let spaceControlled = parseInt(slotElement.getAttribute('data-controlled-by'), 10);
    // Is this space occupied?
    const slotPawnCount = parseInt(slotElement.getAttribute('data-pawn-count'), 10);
    if (slotElement.getAttribute('data-occupied') === 'true' && slotPawnCount <= selectedCard.rank || slotPawnCount == 0 || spaceControlled !== playerTurn) {
        alert("Cannot play this card here. If this slot is'nt already occupied, then increase the pawns on this space");
        return;
    }
    else if(slotPawnCount > selectedCard.rank){
      alert(`Cannot play this card yet. Pawn Count is ${slotPawnCount} and your card is rank ${selectedCard.rank}` );
      return;
    }

    // Place the card in the slot
    slotElement.innerHTML = `<div class="card">${selectedCard.name} (${selectedCard.points})</div>`;

    //Update the slot to occupied
    slotElement.setAttribute('data-occupied', 'true');

    // Remove the card from the player's hand after placing it
    let cardInHand;
    if (playerTurn === 1) {
      cardInHand = document.querySelector(`#player1-hand [data-card-id="${selectedCard.id}"]`);
    } else {
      cardInHand = document.querySelector(`#player2-hand [data-card-id="${selectedCard.id}"]`);
    }

    // Remove the selected card visually
    if (cardInHand) {
      cardInHand.remove();
      console.log(`${selectedCard.name} was played by Player ${playerTurn} at ${slotElement.id}`);
    } else {
      console.error("Could not find the selected card in the player's hand.");
    }

    let cardIndex;
    // Find the index of the selected card in the playerHand array
    if(playerTurn == 1)
    {
      cardIndex = player1Hand.findIndex(card => card.id === selectedCard.id);
      if (cardIndex !== -1) {
          // Remove the card from the array
          player1Hand.splice(cardIndex, 1);
      }
    }
    else
    {
      cardIndex = player2Hand.findIndex(card => card.id === selectedCard.id);
      if (cardIndex !== -1) {
          // Remove the card from the array
          player2Hand.splice(cardIndex, 1);
      }
    }

    console.log(`The card at the backend index ${cardIndex} was removed`);
    selectedCard = null; // Reset selected card after placementUp

    //Update this the point value for this slot
    slotElement.setAttribute('data-points', `${cardPoints}`);
    slotElement.setAttribute('data-occupied', 'true');
    slotElement.setAttribute('data-controlled-by', playerTurn); // Assign control to current player
    console.log(`Point value here is ${cardPoints}`);

    updateAdjacentPawnCounts(slotElement);

    const slotDes = slotElement.id;

    
   
    // Split the slotDes string to extract row and column
    const splitResult = slotDes.split('-'); // ["slot1", "2"]
    const row = parseInt(splitResult[0].replace('slot', ''), 10); // Extract row number from "slotX"

    updateRowPointsDisplay(row);

    // Reset the skip counter and the last skipped player if a card is played
    skipCounter = 0;
    lastSkippedPlayer = null;

    playerTurn = playerTurn === 1 ? 2 : 1;
  
    console.log(`It's now Player ${playerTurn}'s turn`);
    
  };

// Display the cards in the player's hand
const playerHandElement = document.getElementById('player1-hand');

player1Hand.forEach(card => {
  const cardElement = document.createElement('div');
  cardElement.classList.add('card');
  cardElement.innerHTML = `${card.name} (${card.points}) Rank: ${card.rank}`;
  cardElement.dataset.cardId = card.id;
  
  // Add click event to select the card
  cardElement.addEventListener('click', () => selectCard(cardElement, card));
  
  playerHandElement.appendChild(cardElement);
});

// Display the cards in the Opponent's hand
const player2HandElement = document.getElementById('player2-hand');
player2Hand.forEach(card => {
  const cardElement = document.createElement('div');
  cardElement.classList.add('card');
  cardElement.innerHTML = `${card.name} (${card.points}) Rank: ${card.rank}`;
  cardElement.dataset.cardId = card.id;
  
  // Add click event to select the card
  cardElement.addEventListener('click', () => selectCard(cardElement, card));
  
  player2HandElement.appendChild(cardElement);
});


// Function to handle card selection
function selectCard(cardElement, card) {
  const cardPlayer = cardElement.closest(".player-hand").getAttribute("data-player"); // Get the player's hand

  if (cardPlayer != playerTurn) {
      alert("You cannot select cards from the other player's hand.");
      return; // Prevent selecting the other player's cards
  }

    // Deselect any previously selected card
    document.querySelectorAll('.card').forEach(el => el.classList.remove('selected'));
    
    // Mark this card as selected
    if (cardElement.classList.contains('selected')) {
      cardElement.classList.remove('selected');
      console.log();
      selectedCard = null;
    }
    cardElement.classList.add('selected');
    selectedCard = card;
    console.log(`${selectedCard.name} was selected`);
}

const slots = document.querySelectorAll('.slot');
// Add click event listener to each slot
slots.forEach(slot => {
      slot.addEventListener('click', function() {
        console.log("Clicked Slot ID:", this.id);
        placeCard(this);
        // Pass the clicked selected card to the placeCard function
      });
});

// Game Logic
// Can this card be placed here.
const validPlacement = (card, slotPawns) => {
    return card.pawns <= slotPawns;
};

//  Scoring system
function calculateRowPoints(row) {
  let player1Points = 0;
  let player2Points = 0;
  
  document.querySelectorAll(`#row${row} .slot`).forEach(slot => {
      const points = parseInt(slot.getAttribute('data-points'), 10);
      const controlledBy = slot.getAttribute('data-controlled-by');

      if (controlledBy === '1') {
          player1Points += points;
      } else if (controlledBy === '2') {
          player2Points += points;
      }
  });
  return { player1Points, player2Points };
}

// Call this function whenever a card is placed to update the points
const updateRowPointsDisplay = (row) => {
  const { player1Points, player2Points } = calculateRowPoints(row);
  
  document.getElementById(`row${row}-player1-points`).innerText = `Player 1: ${player1Points} points`;
  document.getElementById(`row${row}-player2-points`).innerText = `Player 2: ${player2Points} points`;
};

// Function to update all row points (call this after a card is placed)
function updateAllRowPoints() {
    calculateRowPoints(1);  // Update row 1 points
    calculateRowPoints(2);  // Update row 2 points
    calculateRowPoints(3);  // Update row 3 points
}

// Need to update this later on. Currently calculates scores wrong
const checkWinner = () => {
    const player1Score = calculateRowPoints(1) + calculateRowPoints(2);
    const player2Score = calculateRowPoints(3);
  
    if (player1Score > player2Score) {
      console.log('Player 1 wins!');
    } else {
      console.log('Player 2 wins!');
    }
};

//Updating Pawn count
function updateAdjacentPawnCounts(slotId) {
    // slotId = String(slotId);
   const slotDes = slotId.id;
   
    // Split the slotDes string to extract row and column
    const splitResult = slotDes.split('-'); // ["slot1", "2"]
    const row = parseInt(splitResult[0].replace('slot', ''), 10); // Extract row number from "slotX"
    const col = parseInt(splitResult[1], 10); // Extract column number

    // Update the left slot (if it's not the first column)
    if (col > 1) {
      const leftSlotId = `slot${row}-${col - 1}`;
      if (pawnCounts[leftSlotId] !== undefined) {
        pawnCounts[leftSlotId]++;
        updatePawnCountDisplayForSlot(leftSlotId);
      }
    }
  
    // Update the right slot (if it's not the last column)
    if (col < 5) { // Assuming 5 columns
      const rightSlotId = `slot${row}-${col + 1}`;
      if (pawnCounts[rightSlotId] !== undefined) {
        pawnCounts[rightSlotId]++;
        updatePawnCountDisplayForSlot(rightSlotId);
      }
    }
  
    // Update the top slot (if it's not the first row)
    if (row > 1) {
      const topSlotId = `slot${row - 1}-${col}`;
      if (pawnCounts[topSlotId] !== undefined) {
        pawnCounts[topSlotId]++;
        updatePawnCountDisplayForSlot(topSlotId);
      }
    }
  
    // Update the bottom slot (if it's not the last row)
    if (row < 3) { // Assuming 3 rows
      const bottomSlotId = `slot${row + 1}-${col}`;
      if (pawnCounts[bottomSlotId] !== undefined) {
        pawnCounts[bottomSlotId]++;
        updatePawnCountDisplayForSlot(bottomSlotId);
      }
    }
}
  
// Helper function to update the display for a single slot
function updatePawnCountDisplayForSlot(slotId) {
    const slotElement = document.getElementById(slotId);
    let slotCount = parseInt(slotElement.getAttribute('data-pawn-count'), 10);
    if (slotElement && slotElement.getAttribute('data-occupied') !== 'true') {
        slotCount++;
        slotElement.setAttribute('data-pawn-count', slotCount);
        slotElement.innerHTML = `${slotCount}`;
    }
    if (playerTurn == 1) {
      slotElement.classList.add('player1-control');
    }
    else{
      slotElement.classList.add('player2-control');
    }
}

// Function to reset the game
function resetGame() {
  // Reset the board
  const slots = document.querySelectorAll('.slot');
  slots.forEach(slot => {
      slot.innerHTML = ''; // Remove any cards from slots
      slot.setAttribute('data-occupied', 'false');
      slot.setAttribute('data-points', '0');
      slot.setAttribute('data-controlled-by', '0');
      slot.classList.remove('player1-control', 'player2-control');
      // Reset pawn counts: first and last slot of each row to 1, others to 0
      const slotId = slot.id; // Get the slot ID (e.g., slot1-0, slot1-4)
      const [row, col] = slotId.split('-').map(part => parseInt(part.replace('slot', ''))); // Extract row and col

      if (col === 0 || col === 4) {
          // First and last slot in the row
          slot.setAttribute('data-pawn-count', '1');
          slot.innerHTML = '1';
      } else {
          // Other slots
          slot.setAttribute('data-pawn-count', '0');
          slot.innerHTML = '0';
      }
  });

  // Reset player points display
  for (let row = 1; row <= 3; row++) {
      document.getElementById(`row${row}-player1-points`).innerText = '0 points';
      document.getElementById(`row${row}-player2-points`).innerText = '0 points';
  }

  // Reset game variables
  skipCounter = 0;
  lastSkippedPlayer = null;
  playerTurn = 1;

  // Reset player hands (generate new hands)
  player1Hand = dealHand(); // Generate a new hand for Player 1
  player2Hand = dealHand(); // Generate a new hand for Player 2

  // Clear and update the hand display for Player 1
  const player1HandElement = document.getElementById('player1-hand');
  player1HandElement.innerHTML = ''; // Clear previous hand
  player1Hand.forEach(card => {
      const cardElement = document.createElement('div');
      cardElement.classList.add('card');
      cardElement.innerHTML = `${card.name} (${card.points}) Rank: ${card.rank}`;
      cardElement.dataset.cardId = card.id;

      // Add click event to select the card
      cardElement.addEventListener('click', () => selectCard(cardElement, card));

      player1HandElement.appendChild(cardElement);
  });

  // Clear and update the hand display for Player 2
  const player2HandElement = document.getElementById('player2-hand');
  player2HandElement.innerHTML = ''; // Clear previous hand
  player2Hand.forEach(card => {
      const cardElement = document.createElement('div');
      cardElement.classList.add('card');
      cardElement.innerHTML = `${card.name} (${card.points}) Rank: ${card.rank}`;
      cardElement.dataset.cardId = card.id;

      // Add click event to select the card
      cardElement.addEventListener('click', () => selectCard(cardElement, card));

      player2HandElement.appendChild(cardElement);
  });

  console.log("The game has been reset. Player 1 starts.");
}

  




  
  