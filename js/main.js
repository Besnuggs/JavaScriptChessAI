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
// document.getElementById('orientBtn').addEventListener('click', switchOrient)
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

// function switchOrient (){
//     let response = confirm('This will reset the board with you playing as the opposite color.')
//     if(response){
//         initGame()
//         updateStatus()
//         board.orientation('black')
//     } else{
//         initGame()
//         updateStatus()
//         board.orientation('white')
//     }
// }



var initGame = function(orientObj){
    var orientObj;
    var cfg = { 
        orientation: `${orientObj}` || 'white',
        draggable: true,
        position: 'start',
        onDrop: handleMove,
        onDragStart: onDragStart,
        onSnapEnd: onSnapEnd,
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
  


  // update the board position after the piece snap
  // for castling, en passant, pawn promotion
  var onSnapEnd = function() {
    board.position(game.fen());
    endgameConditions()
  };

  function endgameConditions (){
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
  }



var handleMove = function(source, target) {
     // see if the move is legal
     var move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
      });
    
      // illegal move
      if (move === null) return 'snapback';

      //GreySquares
      removeGreySquares();
      if (move === null) {
          return 'snapback';
      }
    
      // make best legal move for black
      window.setTimeout(makeBestMove, 250);
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

// Grey Squares
var onMouseoverSquare = function(square, piece) {
    var moves = game.moves({
        square: square,
        verbose: true
    });

    if (moves.length === 0) return;

    greySquare(square);

    for (var i = 0; i < moves.length; i++) {
        greySquare(moves[i].to);
    }
};

var onMouseoutSquare = function(square, piece) {
    removeGreySquares();
};

var removeGreySquares = function() {
    $('#board .square-55d63').css('background', '');
};

var greySquare = function(square) {
    var squareEl = $('#board .square-' + square);

    var background = '#a9a9a9';
    if (squareEl.hasClass('black-3c85d') === true) {
        background = '#696969';
    }

    squareEl.css('background', background);
};

// Jquery Buttons