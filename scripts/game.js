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

let roomID, roomData
let myGameBoard, myGameBoardSelection, myPlayerId
window.onload = async () => {
    // get room id from url
    let url_string = window.location.href
    let url = new URL(url_string);
    roomID = url.searchParams.get("room");


    if (roomID == null) {
        window.location = "https://thisDotBingo.co"
    }

    // if user if a first time user
    roomData = await rooms.doc(roomID).get();

    if (roomData.exists) {
        // if doc exists meaning we have a new player at hand
        currentRoomData = roomData.data()

        //if room is full reject 
        if (currentRoomData.playerCount >= 5) {
            console.log("Sorry room is full\nPlay another time");

            // do something
            return
        }

        // add new player data to the DB
        let playerCount = currentRoomData.playerCount + 1
        console.log(playerCount);
        let playerData = currentRoomData.playerData

        myGameBoard = generateBingoArray(25)
        myGameBoardSelection = new Array(25).fill(0)
        myPlayerId = playerCount

        playerData.push({
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
            playerCount: 1,
            currentPlayer: 1,
            playerData: [{
                "board": myGameBoard,
                "selection": myGameBoardSelection
            }]
        }
        rooms.doc(roomID).set(firstPlayerData)
        console.log("Welcome to room: " + roomID);
        console.log("Your playerID: " + myPlayerId);
        console.log("Your bingo board: " + myGameBoard);
    }

}

//when a user clicks the send message button 
document.getElementById("send-message").addEventListener("click", function (event) {
    console.log("send message");
});
