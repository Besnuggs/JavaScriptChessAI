//Essentials
var board;
var cfg;
var game;

//Game Details
var statusEl = $('#status'),
fenEl = $('#fen'),
pgnEl = $('#pgn');

//Game Initialization on window load
window.onload = function() {
    initGame();
    updateStatus();
}

// Button Clicks
document.getElementById('startBtn').addEventListener('click', window.onload)
document.getElementById('orientBtn').addEventListener('click', switchOrient)
document.getElementById('undoBtn').addEventListener('click', undoLast)


//Undo last move
function undoLast () {
game.undo();
game.fen();
board.position(game.fen());
updateStatus();
}

//Copy PGN to Clipboard
const copyToClipboard = (str) => {
const element = document.createElement('textarea');
element.value = str.innerText
document.body.appendChild(element);
element.select();
document.execCommand('copy');
document.body.removeChild(element);
}

function switchOrient (){
    let response = confirm('This will reset the board with you playing as the opposite color.')
    if(response){
        initGame()
        updateStatus()
        board.orientation('black')
    } else{
        initGame()
        updateStatus()
        board.orientation('white')
    }
}



var initGame = function(orientObj){
    var orientObj;
    var cfg = { 
        orientation: `${orientObj}` || 'white',
        draggable: true,
        position: 'start',
        onDrop: handleMove,
        onDragStart: onDragStart,
        onSnapEnd: onSnapEnd,
        switchOrient: switchOrient,
        undoLast: undoLast
    };

    board = new ChessBoard('gameBoard', cfg);
    game = new Chess();
}

// do not pick up pieces if the game is over
// only pick up pieces for White
var onDragStart = function(source, piece, position, orientation) {
    if (game.in_checkmate() === true || game.in_draw() === true ||
      piece.search(/^b/) !== -1) {
      return false;
    }
  };
  
//   Make Random Move function
//   var makeRandomMove = function() {
//     var possibleMoves = game.moves();
  
//     // game over
//     if (possibleMoves.length === 0) return;
  
//     var randomIndex = Math.floor(Math.random() * possibleMoves.length);
//     game.move(possibleMoves[randomIndex]);
//     board.position(game.fen());
//     updateStatus();
//   };

// Evaluation function and Piece Values
var evaluateBoard = function (board) {
    var totalEvaluation = 0;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            totalEvaluation = totalEvaluation + getPieceValue(board[i][j]);
        }
    }
    return totalEvaluation;
};

var getPieceValue = function (piece) {
    if (piece === null) {
        return 0;
    }
    var getAbsoluteValue = function (piece) {
        if (piece.type === 'p') {
            return 10;
        } else if (piece.type === 'r') {
            return 50;
        } else if (piece.type === 'n') {
            return 30;
        } else if (piece.type === 'b') {
            return 30 ;
        } else if (piece.type === 'q') {
            return 90;
        } else if (piece.type === 'k') {
            return 900;
        }
        throw "Unknown piece type: " + piece.type;
    };

    var absoluteValue = getAbsoluteValue(piece, piece.color === 'w');
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
};

var calculateBestMove = function() {
    //generate all the moves for a given position
    var newGameMoves = game.moves();
    if (newGameMoves.length === 0) return;

    let bestMove = null;
    let bestValue = -9999;

    //this 'for loop' is going through array of legal moves.
    //game.move will play each move
    for(var i = 0; i < newGameMoves.length; i++){
        let newGameMove = newGameMoves[i];
        game.move(newGameMove)
        //take the negative as AI plays as black
        let boardValue = -evaluateBoard(game.board())
        game.undo()
        
        if(boardValue > bestValue){
            bestValue = boardValue;
            bestMove = newGameMove
        }
    }
    game.move(bestMove);
    board.position(game.fen())
    updateStatus();
};
  
  // update the board position after the piece snap
  // for castling, en passant, pawn promotion
  var onSnapEnd = function() {
    board.position(game.fen());
     //Game Alerts for Checkmate/Draws
     if(game.in_checkmate()){
         let response = confirm('Game Over! Checkmate!')
         if(response){
         window.location.reload()
        }
    } else if (game.in_stalemate()){
        let response = confirm('Game Over! Stalemate!')
        if(response){
            window.location.reload()
           }
    } else if (game.insufficient_material()){
        let response = confirm('Game Over! Insufficient Material!')
        if(response){
            window.location.reload()
           }
    } else if (game.in_threefold_repetition()){
        let response = confirm('Game Over! Threefold Repetition!')
        if(response){
            window.location.reload()
           }
    } 
  };



var handleMove = function(source, target) {
     // see if the move is legal
     var move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
      });
    
      // illegal move
      if (move === null) return 'snapback';
    
      // make random legal move for black
      window.setTimeout(calculateBestMove, 250);

      updateStatus();
}

var promotionOptions = function(){
    //display modal - with images of knight, queen, bishop, and rook
    
    // when image is selected, it should return a string of the character that represents that piece.
    // Queen = 'q'
    // Bishop = 'b'
    // Knight = 'n'
    // Rook = 'r'
    
    //When selected, piece should replace pawn on square where it is promoted
}

var updateStatus = function() {
    var status = '';
  
    var moveColor = 'White';
    if (game.turn() === 'b') {
      moveColor = 'Black';
    }
  
    // checkmate?
    if (game.in_checkmate() === true) {
      status = 'Game over, ' + moveColor + ' is in checkmate.';
    }
  
    // draw?
    else if (game.in_draw() === true) {
      status = 'Game over, drawn position';
    }
  
    // game still on
    else {
      status = moveColor + ' to move';
  
      // check?
      if (game.in_check() === true) {
        status += ', ' + moveColor + ' is in check';
      }
    }
    

    statusEl.html(status);
    fenEl.html(game.fen());
    pgnEl.html(game.pgn());
  };

// Jquery Buttons