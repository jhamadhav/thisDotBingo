const firebaseConfig = {
    apiKey: "AIzaSyCBT2S8IWPdfWfzSrX4e3B7io0a7vyf_tQ",
    authDomain: "thisdotbingo.firebaseapp.com",
    projectId: "thisdotbingo",
    storageBucket: "thisdotbingo.appspot.com",
    messagingSenderId: "974386968415",
    appId: "1:974386968415:web:a23ba312a26f30af1b28ea"
}

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();
const rooms = firestore.collection('rooms')

// generate bingo board
const generateBingoArray = (num, maxNum = 25) => {
    let arr = [];
    while (arr.length < num) {
        var r = Math.floor(Math.random() * maxNum) + 1;
        if (arr.indexOf(r) === -1) arr.push(r);
    }
    return arr
}

const maxRoom = 500
let roomID, roomData
let myGameBoard, myGameBoardSelection, myPlayerId
let currentRoomData
const cells = document.getElementsByClassName("game-cell")


document.getElementsByClassName("link-copy-btn")[0].onclick = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        console.log('Game link copied !!');
    }, (err) => {
        console.error('Async: Could not copy text: ', err);
    });
}

window.onload = () => {

    // get room id from url
    let url_string = window.location.href
    let url = new URL(url_string);
    roomID = url.searchParams.get("room");

    document.getElementById("link").value = url_string
}

let myPlayerName = "Anonymous"
document.getElementById("play").onclick = async () => {
    document.getElementsByClassName("name-link-popup")[0].style.display = "none"
    myPlayerName = document.getElementById("name").value


    if (roomID == null) {
        window.location = "https://thisDotBingo.co"
        return
    }

    // if user if a first time user
    roomData = await rooms.doc(roomID).get();

    if (roomData.exists) {
        // if doc exists meaning we have a new player at hand
        currentRoomData = roomData.data()

        //if room is full reject 
        if (currentRoomData.playerCount >= maxRoom) {
            console.log("Sorry room is full\nPlay another time");

            // do something
            return
        }

        // add new player data to the DB
        let playerCount = currentRoomData.playerCount + 1
        let playerData = currentRoomData.playerData

        myGameBoard = generateBingoArray(25)
        myGameBoardSelection = new Array(25).fill(0)
        myPlayerId = playerCount

        playerData.push({
            "name": myPlayerName,
            "board": myGameBoard,
            "selection": myGameBoardSelection
        })

        let newPlayerData = {
            playerCount,
            playerData
        }
        rooms.doc(roomID).update(newPlayerData)
        console.log("Welcome to room: " + roomID);
        console.log("Your playerID: " + myPlayerId);
        console.log("Your bingo board: " + myGameBoard);

    } else {
        myGameBoard = generateBingoArray(25)
        myGameBoardSelection = new Array(25).fill(0)
        myPlayerId = 1

        let firstPlayerData = {
            "name": myPlayerName,
            selectedNum: [],
            playerCount: 1,
            currentPlayer: 1,
            playerData: [{
                "board": myGameBoard,
                "selection": myGameBoardSelection
            }]
        }
        rooms.doc(roomID).set(firstPlayerData)
        currentRoomData = await rooms.doc(roomID).get()
        currentRoomData = currentRoomData.data()
        console.log("Welcome to room: " + roomID);
        console.log("Your playerID: " + myPlayerId);
        console.log("Your bingo board: " + myGameBoard);
    }

    rooms.doc(roomID).onSnapshot((doc) => {
        let updatedData = doc.data()

        currentRoomData = updatedData
        let numArr = currentRoomData.selectedNum
        for (let i = 0; i < numArr.length; i++) {
            let num = parseInt(numArr[i])
            let index = myGameBoard.indexOf(num)
            updateCell(index)
        }
        updateCursor()

    });

    // load game stuff
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = myGameBoard[i]
        cells[i].addEventListener('click', () => {
            if (myPlayerId == currentRoomData.currentPlayer && myGameBoardSelection[i] == 0) {
                updateCell(i)
                updateDB(cells[i].innerText)
            }

        })
    }
}
const updateCell = (i) => {
    myGameBoardSelection[i] = 1;
    cells[i].style.background = "red"
}
const updateCursor = () => {
    let val = "pointer"
    if (myPlayerId != currentRoomData.currentPlayer) {
        val = "no-drop"
    }

    for (let i = 0; i < cells.length; i++) {
        cells[i].style.cursor = val
    };
}

const updateDB = (num = 5) => {
    let playerData = currentRoomData.playerData
    let currentPlayer = currentRoomData.currentPlayer
    currentPlayer = (currentPlayer + 1) % (currentRoomData.playerCount + 1)
    currentPlayer = (currentPlayer == 0) ? currentPlayer + 1 : currentPlayer
    selectedNum = currentRoomData.selectedNum
    selectedNum.push(num)

    playerData[myPlayerId - 1] = {
        "board": myGameBoard,
        "selection": myGameBoardSelection
    }

    let data = {
        currentPlayer,
        playerData,
        selectedNum
    }
    rooms.doc(roomID).update(data)
}

const popMsg = (msg = "hello") => {
    document.getElementsByClassName("msg-text")[0].innerText = msg
    let popWindow = document.getElementsByClassName("msg-pop")[0]
    popWindow.classList.add("pop-animation")

    popWindow.addEventListener("animationend", () => {
        popWindow.classList.remove("pop-animation")
    })
}
