class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }

    toString() {
        return `${this.value} ${this.getSuitSymbol()}`;
    }

    getSuitSymbol() {
        const symbols = {
            'Hearts': '♥',
            'Diamonds': '♦',
            'Spades': '♠',
            'Clubs': '♣'
        };
        return symbols[this.suit];
    }

    isRed() {
        return this.suit === 'Hearts' || this.suit === 'Diamonds';
    }
}

class Deck {
    constructor() {
        this.cards = [];
        const suits = ['Hearts', 'Diamonds', 'Spades', 'Clubs'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

        for (const suit of suits) {
            for (const value of values) {
                this.cards.push(new Card(suit, value));
            }
        }
    }

    deal() {
        const card = this.cards.pop();
        return card;
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
}

class Hand {
    constructor() {
        this.cards = [];
    }

    addCard(card) {
        this.cards.push(card);
    }

    getValue() {
        let value = 0;
        let aceCount = 0;

        for (const card of this.cards) {
            if (card.value === 'A') {
                value += 11;
                aceCount++;
            } else if (card.value === 'K' || card.value === 'Q' || card.value === 'J') {
                value += 10;
            } else {
                value += parseInt(card.value);
            }
        }

        while (value > 21 && aceCount > 0) {
            value -= 10;
            aceCount--;
        }

        return value;
    }
}

class Blackjack {
    constructor() {
        this.deck = new Deck();
        this.playerHand = new Hand();
        this.dealerHand = new Hand();
        this.gameOver = false;
        
        // UI Elements
        this.dealerCardsEl = document.getElementById('dealer-cards');
        this.playerCardsEl = document.getElementById('player-cards');
        this.messageEl = document.getElementById('message');
        this.dealerScoreEl = document.getElementById('dealer-score');
        this.playerScoreEl = document.getElementById('player-score');
        
        // Buttons
        this.hitButton = document.getElementById('hit-button');
        this.standButton = document.getElementById('stand-button');
        this.newGameButton = document.getElementById('new-game-button');
        
        // Event Listeners
        this.hitButton.addEventListener('click', () => this.playerHit());
        this.standButton.addEventListener('click', () => this.dealerPlay());
        this.newGameButton.addEventListener('click', () => this.start());

        // Add celebration container
        this.celebrationContainer = document.createElement('div');
        this.celebrationContainer.className = 'celebration';
        document.body.appendChild(this.celebrationContainer);
    }

    createCardElement(card, hidden = false) {
        const cardEl = document.createElement('div');
        cardEl.className = `card ${card.isRed() ? 'red' : ''}`;
        cardEl.textContent = hidden ? '?' : card.toString();
        return cardEl;
    }

    updateUI() {
        // Clear existing cards
        this.dealerCardsEl.innerHTML = '';
        this.playerCardsEl.innerHTML = '';

        // Update dealer's cards
        this.dealerHand.cards.forEach((card, index) => {
            const hidden = index === 1 && !this.gameOver;
            this.dealerCardsEl.appendChild(this.createCardElement(card, hidden));
        });

        // Update player's cards
        this.playerHand.cards.forEach(card => {
            this.playerCardsEl.appendChild(this.createCardElement(card));
        });

        // Update scores
        this.playerScoreEl.textContent = `(${this.playerHand.getValue()})`;
        
        // Only show dealer's score when game is over or just the first card's value
        if (this.gameOver) {
            this.dealerScoreEl.textContent = `(${this.dealerHand.getValue()})`;
        } else {
            // Calculate value of just the first card
            const firstCardValue = this.dealerHand.cards[0].value;
            let visibleScore = ['J', 'Q', 'K'].includes(firstCardValue) ? 10 : 
                              firstCardValue === 'A' ? 11 : 
                              parseInt(firstCardValue);
            this.dealerScoreEl.textContent = `(${visibleScore})`;
        }
    }

    start() {
        this.deck = new Deck();
        this.deck.shuffle();
        this.playerHand = new Hand();
        this.dealerHand = new Hand();
        this.gameOver = false;
        
        // Initial deal
        this.playerHand.addCard(this.deck.deal());
        this.dealerHand.addCard(this.deck.deal());
        this.playerHand.addCard(this.deck.deal());
        this.dealerHand.addCard(this.deck.deal());

        // Enable/disable buttons
        this.hitButton.disabled = false;
        this.standButton.disabled = false;
        
        // Clear message
        this.messageEl.textContent = '';
        
        this.updateUI();
    }

    playerHit() {
        this.playerHand.addCard(this.deck.deal());
        
        if (this.playerHand.getValue() > 21) {
            this.gameOver = true;
            this.messageEl.textContent = "Bust! You lose!";
            this.hitButton.disabled = true;
            this.standButton.disabled = true;
        }
        
        this.updateUI();
    }

    showCelebration() {
        this.celebrationContainer.innerHTML = `
            <div class="celebration-content">
                <h2 class="celebration-text">Congrats - You Won!</h2>
                <img src="https://media.giphy.com/media/JvYY6mPoEzntQ9u3ej/giphy.gif" alt="Curry Night Night">
            </div>
        `;
        this.celebrationContainer.style.display = 'flex';
        
        // Hide celebration after 3 seconds
        setTimeout(() => {
            this.celebrationContainer.style.display = 'none';
        }, 3000);
    }

    dealerPlay() {
        this.gameOver = true;
        this.hitButton.disabled = true;
        this.standButton.disabled = true;

        while (this.dealerHand.getValue() < 17) {
            this.dealerHand.addCard(this.deck.deal());
        }

        const dealerValue = this.dealerHand.getValue();
        const playerValue = this.playerHand.getValue();

        if (dealerValue > 21) {
            this.messageEl.textContent = "Dealer busts! You win!";
            this.showCelebration();
        } else if (dealerValue > playerValue) {
            this.messageEl.textContent = "Dealer wins!";
        } else if (dealerValue < playerValue) {
            this.messageEl.textContent = "You win!";
            this.showCelebration();
        } else {
            this.messageEl.textContent = "It's a tie!";
        }

        this.updateUI();
    }
}

// Start the game when the page loads
window.onload = () => {
    const game = new Blackjack();
    game.start();
}; 