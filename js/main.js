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
}

// Button Clicks
document.getElementById('startBtn').addEventListener('click', window.onload)
document.getElementById('orientBtn').addEventListener('click', switchOrient)

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
        switchOrient: switchOrient
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
  
  var makeRandomMove = function() {
    var possibleMoves = game.moves();
  
    // game over
    if (possibleMoves.length === 0) return;
  
    var randomIndex = Math.floor(Math.random() * possibleMoves.length);
    game.move(possibleMoves[randomIndex]);
    board.position(game.fen());
    updateStatus();
  };

  
  // update the board position after the piece snap
  // for castling, en passant, pawn promotion
  var onSnapEnd = function() {
    board.position(game.fen());

     //Game Alerts for Checkmate/Draws
     if(game.in_checkmate() === true){
         let response = confirm('Game Over! Checkmate!')
         if(response){
         window.location.reload()
        }
    } else if (game.in_stalemate() === true){
        let response = confirm('Game Over! Stalemate!')
        if(response){
            window.location.reload()
           }
    } else if (game.insufficient_material() === true){
        let response = confirm('Game Over! Insufficient Material!')
        if(response){
            window.location.reload()
           }
    } else if (game.in_threefold_repetition() === true){
        let response = confirm('Game Over! Threefold Repetition!')
        if(response){
            window.location.reload()
           }
    } else if (game.half_moves >= 100){
        let response = confirm('Game Over! Game has exceeded 100 moves.')
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
      window.setTimeout(makeRandomMove, 250);

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
  updateStatus();

// Jquery Buttons