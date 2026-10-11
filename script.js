
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
        isDraggable:false,
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
                card.isDraggable=true;
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
        `<div class="card ${card.color}" id="${card.id}" draggable=${(card.isDraggable && card.isFaceUp) ? true : false}>
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



gameState.tableau.forEach((_,index)=> {
    const currentTableau = getElement(`tableau-${index}`,"id");
    if (!currentTableau) return ;

        currentTableau.addEventListener("dragstart",(e)=> {
            const cardElement = e.target.closest(".card");

            if (!cardElement) return ;

                const draggedCardId = parseInt(cardElement.id);
                const cardSource = gameState.tableau[index];
                const highestSelectedCardIndex = cardSource.findIndex(selCard=> selCard.id === draggedCardId);
                
                
                if (highestSelectedCardIndex !== -1 && cardSource[highestSelectedCardIndex].isFaceUp) {
                    
                    
                    gameState.isSelected = true;
                    gameState.sourceType = "tableau";
                    gameState.sourceIndex =index;
                    gameState.selectedCardIndexInSource = highestSelectedCardIndex;
                    gameState.selectedCards = cardSource.slice(highestSelectedCardIndex);
                    

                    

                }else {
                    e.preventDefault();
                }
            
            
        }
        );

        currentTableau.addEventListener("dragover",(e)=> {
            e.preventDefault();
        });
        currentTableau.addEventListener("drop",(e)=> {
            e.preventDefault();

            if (!gameState.isSelected || gameState.selectedCards.length ===0) return;
            const isSameSource = (gameState.sourceType==="tableau" && gameState.sourceIndex===index);

                if (!isSameSource && isTableauDropValid(gameState.selectedCards,gameState.tableau[index])) {
                    const movingCards = gameState.selectedCards;
                    cardRemoverFromSource();
                    gameState.tableau[index].push(...movingCards);
                    updateScore(gameState.sourceType==="waste" ? 5 : 0);
                    saveData();
                }
            clearSelectedState();
            gameUpdater();
        });
     

});

gameState.foundations.forEach((_,index)=> {
    const currentFoundation = getElement(`foundation-pile-${index}`,"id");
    if (!currentFoundation) return ;

         currentFoundation.addEventListener("dragover",(e)=> {
        e.preventDefault();
    })

    currentFoundation.addEventListener("drop",(e)=> {
        e.preventDefault();

        if (!gameState.isSelected || gameState.selectedCards.length === 0) return;


        if (isFoundationDropValid(gameState.selectedCards,gameState.foundations[index])) {
            const movingCards = gameState.selectedCards;
            cardRemoverFromSource();
            gameState.foundations[index].push(...movingCards);
            updateScore(10);
            saveData();
            clearSelectedState();
            gameUpdater();
            checkWinner();
            return;
        }
        clearSelectedState();
        gameUpdater();
        
    })
    
   
})



const wastePile = getElement("waste-pile","id");
wastePile.addEventListener("dragstart",(e)=> {
    const cardElement = e.target.closest(".card");
    if (!cardElement) return;

    const topCard = gameState.waste[gameState.waste.length-1];
    if (topCard && topCard.id === parseInt(cardElement.id)) {
        gameState.isSelected = true;
        gameState.sourceType = "waste";
        gameState.sourceIndex = null;
        gameState.selectedCardIndexInSource = gameState.waste.length - 1;
        gameState.selectedCards = [topCard];
    }else {
        e.preventDefault();
    }
                       
})


document.addEventListener("dragend",()=> {
  clearSelectedState();
  gameUpdater();
});


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







