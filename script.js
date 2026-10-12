
const suits = [
    {name:"Hearts",color:"red",symbol:"♥"},
    {name:"Diamonds",color:"red",symbol:"♦"},
    {name:"Clubs",color:"black",symbol:"♣" },
    {name:"Spades",color:"black",symbol:"♠" }
];

const cardRanks = [
    {name:"Ace", value: 1,rankSymbol:"A"},
    {name:"2", value:2 ,rankSymbol:"2"},
    {name:"3", value:3, rankSymbol:"3"},
    {name:"4", value:4, rankSymbol:"4"},
    {name:"5", value:5, rankSymbol:"5"},
    {name:"6", value:6, rankSymbol:"6"},
    {name:"7", value:7, rankSymbol:"7"},
    {name:"8", value:8, rankSymbol:"8"},
    {name:"9", value:9, rankSymbol:"9"},
    {name:"10", value:10, rankSymbol:"10"},
    {name:"Jack", value:11, rankSymbol:"J"},
    {name:"Queen", value:12, rankSymbol:"Q"},
    {name:"King", value:13, rankSymbol:"K"}
];
function deckCreator() {
let id = 0; 
const deck = []
suits.forEach((suit)=>cardRanks.forEach((rank)=> deck.push(
    {
        id:id++,
        value:rank.value,
        suit:suit.name,
        symbol:suit.symbol,
        rank:rank.name,
        rankSymbol:rank.rankSymbol,
        color:suit.color,
        isFaceUp:false,
    }
)));
return deck;
}

const gameState = {
    deck: deckCreator(),
    waste:[],
    tableau:[[],[],[],[],[],[],[]],
    foundations: [[],[],[],[]],
    score:0,

    isSelected: false,
    selectedCards: [],
    sourceType: null,
    sourceIndex: null,
    selectedCardIndexInSource: null,
};
const randomCardIndex = (remainingDeckLength) => {
    return (Math.floor(Math.random()*remainingDeckLength))
}
const deckShuffle = ()=> {
    
    for (let i=0;i<gameState.tableau.length;i++) {

        for(let j=0; j<=i;j++) {
            if (j===i) {
                const cardIndex = randomCardIndex(gameState.deck.length);
                const cardArray = gameState.deck.splice(cardIndex,1);
                const card = cardArray[0];
                card.isFaceUp=true;
                
                gameState.tableau[i].push(card);
                continue;
                
            }
            const cardIndex = randomCardIndex(gameState.deck.length);
            const cardArray = gameState.deck.splice(cardIndex,1);
            const card = cardArray[0];
            gameState.tableau[i].push(card);
            
        }
        
    }
}

const getElement = (id,identifier)=> {
if (identifier==="id") {
    return document.getElementById(id);
}
else {
    return document.querySelector(id);
}
}

const cardElementCreator = (card)=> {

    const faceUpCard = (`<div class="face-up-card">
        <div class="top">${card.rankSymbol}</div>
        <div class="mid">${card.symbol}</div>
        <div class="bottom">${card.rankSymbol}</div>
        </div>`);

    const faceDownCard = (`<div class="face-down-card"></div>`);
    return (
        `<div class="card ${card.color}" id="${card.id}">
        ${card.isFaceUp ? faceUpCard : faceDownCard}
        </div>`
    )
}

const gameRender = ()=> {
gameState.tableau.forEach((tableauPile,tableauPileindex)=> {
    const currentTableau = getElement(`tableau-${tableauPileindex}`,"id");
    const tableauCards = tableauPile.map((cardInfo,index)=> {
        if (index===tableauPile.length-1) {
            cardInfo.isFaceUp=true;
            cardInfo.isDraggable=true;
        }
        return cardElementCreator(cardInfo);
    }).join("");
    currentTableau.innerHTML = tableauCards;
    
})
}

const handleFoundation = ()=> {
    gameState.foundations.forEach((foundation,index)=> {
        const currentFoundation = getElement(`foundation-pile-${index}`,"id");
        if (!currentFoundation) return ;
        
        
           const foundationCards =  foundation.map((cardInfo)=> cardElementCreator({...cardInfo,isDraggable: false})).join("");
        
        currentFoundation.innerHTML = foundationCards  ? foundationCards : `<div class="placeholder-foundation-card"></div>`; 
    })
}

const handleDeckPile = ()=> {
    
    const deckPile = getElement("deck-pile","id");
    if (!deckPile) return;
    
    deckPile.classList.toggle("empty",gameState.deck.length ===0);
    
    
    deckPile.innerHTML = gameState.deck.length===0 ? "" : `<div class="face-down-card"></div>`
}
const wastePileCardRenderer = ()=> {
const wastePile = getElement("waste-pile","id");
handleDeckPile();
gameState.waste.forEach((currentCard,index,wasteArr)=> currentCard.isDraggable= index===wasteArr.length-1)

const wastePileCards = gameState.waste.slice(-3).map((cardInfo)=> cardElementCreator(cardInfo)).join("");
wastePile.innerHTML = gameState.waste.length>0 ? wastePileCards : "";
};

const gameUpdater = ()=> {
    gameRender();
    handleFoundation();
    wastePileCardRenderer();
};

const clearSelectedState = ()=> {
    gameState.isSelected = false;
    gameState.selectedCards = [];
    gameState.sourceType = null;
    gameState.sourceIndex = null;
    gameState.selectedCardIndexInSource = null;
}

const cardRemoverFromSource = ()=> {
    if(gameState.sourceType === "tableau") {
        gameState.tableau[gameState.sourceIndex].splice(gameState.selectedCardIndexInSource);
    }else if (gameState.sourceType === "waste") {
        gameState.waste.pop();
    } else if (gameState.sourceType === "foundation") {
        gameState.foundations[gameState.sourceIndex].pop();
    }
}


const isFoundationDropValid = (cards,foundation)=> {

    if (gameState.selectedCards.length!==1) return false;

    const card = cards[0];

    if (foundation.length===0  ) {
        return card.rank === "Ace";
    }

const topFoundationCard  = foundation[foundation.length-1];

return ((card.value === topFoundationCard.value + 1) && card.suit === topFoundationCard.suit) 
   

}

const isTableauDropValid = (cards,tableau) => {
    if (cards.length===0) return false;
    const highestCard = cards[0]
    if (tableau.length===0 ) {
        return highestCard.rank === "King";
    }
    const topCard = tableau[tableau.length-1];
    return topCard.value === highestCard.value + 1 && topCard.color !== highestCard.color;
    
};

let drag=null;

const dropCardOnTableau = (index) => {
    if (!gameState.isSelected || gameState.selectedCards.length ===0) return false;
    const isSameSource = (gameState.sourceType==="tableau" && gameState.sourceIndex===index);
    if (isSameSource || !isTableauDropValid(gameState.selectedCards,gameState.tableau[index])) return false; 
    const movingCards = gameState.selectedCards;
    cardRemoverFromSource();
    gameState.tableau[index].push(...movingCards);
    const points = gameState.sourceType === "waste" ? 5 : gameState.sourceType === "foundation" ? -15 : 0;
    updateScore(points);
    saveData();
    return true;
} 

const dropCardOnFoundation = (index) => {
    if (gameState.sourceType === "foundation") return false;
        if (!gameState.isSelected || gameState.selectedCards.length === 0) return false;


        if (!isFoundationDropValid(gameState.selectedCards,gameState.foundations[index])) return false;
            const movingCards = gameState.selectedCards;
            cardRemoverFromSource();
            gameState.foundations[index].push(...movingCards);
            updateScore(10);
            saveData();
            clearSelectedState();
            gameUpdater();
            checkWinner();
            return true;
        
}

const finishDrag = ()=> {
    if(drag && drag.ghost) drag.ghost.remove();
    drag=null;
    clearSelectedState();
    gameUpdater();
}

document.addEventListener("pointerdown", (e)=> {
    if (drag) return;
    if (e.pointerType === "mouse" && e.button !==0) return;

    const cardEl = e.target.closest(".card");
    if (!cardEl) return;

    const id = parseInt(cardEl.id);

    const tableauEl = cardEl.closest(".tableau");
    const foundationEl = cardEl.closest(".foundation-pile");
    const wasteEl = cardEl.closest("#waste-pile");

    if (tableauEl) {
        const index = parseInt(tableauEl.id.split("-")[1]);
        const pile = gameState.tableau[index];
        const cardIndex = pile.findIndex((c)=> c.id === id);
        if (cardIndex === -1 || !pile[cardIndex].isFaceUp) return;

        gameState.sourceType = "tableau";
        gameState.sourceIndex = index;
        gameState.selectedCardIndexInSource = cardIndex;
        gameState.selectedCards = pile.slice(cardIndex);
    }
    else if (wasteEl) {
        const topCard = gameState.waste[gameState.waste.length - 1];
        if (!topCard || topCard.id !== id) return;

        gameState.sourceType = "waste";
        gameState.sourceIndex = "null";
        gameState.selectedCardIndexInSource = gameState.waste.length - 1;
        gameState.selectedCards = [topCard];
    }
    else if (foundationEl) {
        const index = parseInt(foundationEl.id.split("-")[2]);
        const pile = gameState.foundations[index];
        const topCard = pile[pile.length - 1];
        if (!topCard || topCard.id !== id) return;

        gameState.sourceType = "foundation";
        gameState.sourceIndex = index;
        gameState.selectedCardIndexInSource = pile.length - 1;
        gameState.selectedCards = [topCard];
    }
    else {
        return;
    }

    gameState.isSelected = true;
    const rect = cardEl.getBoundingClientRect();
    drag = {
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        ghost:null,
    };
});


document.addEventListener("pointermove",(e)=> {
    if(!drag) return;

    if(!drag.ghost) {

        if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 5) return;

        gameState.selectedCards.forEach((c)=> {
            const el = getElement(c.id,"id");
            if (el) el.classList.add("drag-hidden");
        });

        const ghost = document.createElement("div");
        ghost.className = "drag-ghost";
        ghost.innerHTML = gameState.selectedCards.map((c)=> cardElementCreator(c)).join("");
        ghost.querySelectorAll(".card").forEach((c)=> c.removeAttribute("id"));
        document.body.appendChild(ghost);
        drag.ghost = ghost;
    }

    drag.ghost.style.transform = `translate(${e.clientX - drag.offsetX}px, ${e.clientY - drag.offsetY}px)`;
});

document.addEventListener("pointerup", (e)=> {
    if(!drag) return;
     let won = false;
     if (drag.ghost) {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        const tableauEl = target && target.closest(".tableau");
        const foundationEl = target && target.closest(".foundation-pile");
        
        if (tableauEl) {
            dropCardOnTableau(parseInt(tableauEl.id.split("-")[1]));
        }
        else if (foundationEl) {
            won = dropCardOnFoundation(parseInt(foundationEl.id.split("-")[2]));
        }
     }

     finishDrag();
     if (won) checkWinner();
})

document.addEventListener("pointercancel",finishDrag);

const handleWastepile = ()=> {
    
    
    if (gameState.deck.length===0) {
        if (gameState.waste.length>0) updateScore(-20);
         while (gameState.waste.length>0) {
            const card = gameState.waste.pop();
            card.isFaceUp = false;
            card.isDraggable =false;
            gameState.deck.push(card);
        }
    }else {
        gameState.waste.forEach((card)=> card.isDraggable=false);
        const noOfCardsToDraw  = Math.min(3,gameState.deck.length);
        for (let i=0;i<noOfCardsToDraw;i++) {
            const card = gameState.deck.pop();
            card.isFaceUp = true;
            if (i=== noOfCardsToDraw - 1) {
                card.isDraggable=true;
            }else {
                card.isDraggable=false;
            }
            gameState.waste.push(card);
    }
    }
       
}
const deckPile = getElement("deck-pile","id");
if (deckPile) {
  deckPile.addEventListener("click",()=>{
    handleWastepile();
    wastePileCardRenderer();
    saveData();
});
  
}

const renderOrResetGameScore = ()=> {

    const gameScore = getElement("game-score","id");
    if (gameScore) {
        gameScore.textContent = `Score: ${gameState.score}`; 
    };
    return true;
};


const updateScore  = (scoreToAdd)=> {
    gameState.score = Math.max(0, gameState.score + scoreToAdd);
    
    renderOrResetGameScore();
    return true;
}

const checkWinner = ()=> {
    const hasWon = gameState.foundations.every((foundation)=> foundation.length===13);
    if (hasWon) {
        alert("Congratulations on winning this wonderful solitare game from teamDevs.")
    }
}

const resetGame = ()=> {

gameState.deck = deckCreator();
gameState.waste = [];
gameState.tableau = [[],[],[],[],[],[],[]];
gameState.foundations = [[],[],[],[]];
gameState.score = 0;
gameState.isSelected = false;
clearSelectedState();
localStorage.removeItem("SolitareGameState");
deckShuffle();
gameUpdater();

renderOrResetGameScore();

    
}


const resetButton = getElement("reset-button","id");
if (resetButton) {
    resetButton.addEventListener("click",resetGame);
}


const saveData = ()=> {
    const {deck,waste,tableau,foundations,score} = gameState;
    localStorage.setItem("SolitareGameState",JSON.stringify({deck,waste,tableau,foundations,score}));
}


const loadData = ()=> {
    const data = localStorage.getItem("SolitareGameState");
    if (!data) return false;
     try {

        const parsedData = JSON.parse(data);
        Object.assign(gameState,parsedData);
     }catch (err) {
        localStorage.removeItem("SolitareGameState");
        return false;
     }
     clearSelectedState();
    gameUpdater();
    renderOrResetGameScore();
    return true;
    
}

const startGame = ()=> {
    const isGameSaved = loadData();
    if (!isGameSaved) {
        resetGame();
    } 
}
startGame();







