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

// 
const sendToHome = () => {
    window.location = "https://thisDotBingo.co"
}

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
const playerName = document.getElementById("current-player")

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
    document.getElementById("name").addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            await beginGame();
        }
    });
}

let myPlayerName = "Anonymous"
document.getElementById("play").onclick = async () => {
    await beginGame()
}

const beginGame = async () => {
    document.getElementsByClassName("name-link-popup")[0].style.display = "none"
    myPlayerName = document.getElementById("name").value
    myPlayerName = myPlayerName.trim()
    if (myPlayerName.length == 0) {
        myPlayerName = "Anonymous"
    }


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
            name: myPlayerName,
            board: myGameBoard,
            selection: myGameBoardSelection
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
            selectedNum: [],
            playerCount: 1,
            currentPlayer: 1,
            playerData: [{
                name: myPlayerName,
                board: myGameBoard,
                selection: myGameBoardSelection
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

        // announce new player
        try {

            if (updatedData.playerCount > currentRoomData.playerCount) {
                let playerName = updatedData.playerData[updatedData.playerCount - 1].name
                console.log(playerName);
                popMsg(`${playerName} joined`)
            }
        } catch (e) {
            console.log(e);
        }

        // announce number
        try {
            if (updatedData.selectedNum.length > currentRoomData.selectedNum.length) {
                let index;
                if (updatedData.currentPlayer == 1) {
                    index = updatedData.playerCount - 1;
                } else {
                    index = updatedData.currentPlayer - 2
                }
                console.log(index);
                let playerName = updatedData.playerData[index].name
                console.log(playerName);
                popMsg(`${playerName} choose ${updatedData.selectedNum[updatedData.selectedNum.length - 1]}`)
            }
        } catch (e) {
            console.log(e);
        }

        playerName.innerText = updatedData.playerData[updatedData.currentPlayer - 1].name
        console.log(updatedData.playerData[updatedData.currentPlayer - 1]);

        // check if someone won
        if (updatedData.won) {
            popMsg(`${updatedData.won} won !!!`)
            document.getElementsByClassName("win-pop")[0].style.zIndex = 100
            document.getElementsByClassName("win-pop")[0].style.visibility = "visible"
            document.getElementById("winner").innerText = updatedData.won
        }


        currentRoomData = updatedData
        let numArr = currentRoomData.selectedNum
        for (let i = 0; i < numArr.length; i++) {
            let num = parseInt(numArr[i])
            let index = myGameBoard.indexOf(num)
            updateCell(index)
        }
        updateCursor()

        // check if this player won
        let iWin = checkMyBingo()
        if (iWin) {
            rooms.doc(roomID).update({ "won": myPlayerName })
        }

    });

    // load game stuff
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = myGameBoard[i]
        cells[i].addEventListener('click', () => {
            if (myPlayerId == currentRoomData.currentPlayer && myGameBoardSelection[i] == 0 && !currentRoomData.won) {
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
        "name": myPlayerName,
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

const checkMyBingo = () => {
    let arr = myGameBoardSelection
    let flag = 0;

    for (let i = 0; i < 5; i++) {
        let sum = 0
        for (let j = 0; j < 5; j++) {
            index = i * 5 + j
            sum += arr[index]
        }
        if (sum == 5) {
            flag = 1
        }
    }
    for (let i = 0; i < 5; i++) {
        let sum = 0
        for (let j = 0; j < 5; j++) {
            index = j * 5 + i
            sum += arr[index]
        }
        if (sum == 5) {
            flag = 1
        }
    }

    let sum = 0
    for (let i = 0; i < 5; i++) {
        index = i * 5 + i
        sum += arr[index]
    }
    if (sum == 5) {
        flag = 1
    }

    sum = 0
    for (let i = 0, j = 4; i < 5; i++, j--) {
        index = i * 5 + j
        sum += arr[index]
        // console.log(`i: ${i},j: ${i},index: ${index}`);
        // console.log(sum);
    }
    if (sum == 5) {
        flag = 1
    }

    return flag
}
