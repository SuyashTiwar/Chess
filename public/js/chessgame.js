const socket = io();

// socket.emit("churan"); // Send request to the backend
// socket.on("churan pap", () => { // Receive data from the backend
//     console.log("churan pap received")
// });

const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square", (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark");
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;
            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === "w" ? "white" : "black");
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;
                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: squareIndex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });
                pieceElement.addEventListener("dragend", () => {
                    draggedPiece = null;
                    sourceSquare = null;
                });
                squareElement.appendChild(pieceElement);
            }
            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            });
            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };
                    handleMove(sourceSquare, targetSquare);
                }
            });
            boardElement.appendChild(squareElement);
        });
    });
   // this condition is applied to flip the board in different server is in one there is white than at other place there will be black at the server...
    if(playerRole==='b'){
        boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped");
    }
};

const handleMove = (source, target) => {
    // Your move handling logic here
    const move={
        from:`${String.fromCharCode(97+source.col)}${8-source.row}`,
        to:`${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion:"q",
    }
    socket.emit("move",move);
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p: "♙",
        r: "♜",
        n: "♞",
        b: "♝",
        q: "♛",
        k: "♚",
        P: "♙",
        R: "♖",
        N: "♘",
        B: "♗",
        Q: "♕",
        K: "♔"
    };
    return unicodePieces[piece.type] || "";
};
socket.on("playerRole",(role)=>{
    playerRole=role;
    renderBoard();
});
socket.on("spectatorRole",()=>{
    playerRole=null;
    renderBoard();
});
socket.on("boardState",(fen)=>{
    chess.load(fen);
    renderBoard();
});
socket.on("move",(move)=>{
    chess.move(move);
    renderBoard();
});