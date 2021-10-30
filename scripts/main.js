const siteUrl = "https://thisDotBingo.co/game?room="
const createRoom = document.getElementById("create-room")
createRoom.onclick = async () => {

    let link = siteUrl + uuidv4();
    console.log(link);

    navigator.clipboard.writeText(link).then(() => {
        console.log('Game link copied !!');
    }, (err) => {
        console.error('Async: Could not copy text: ', err);
    });
    window.location = link
}

const joinRoom = document.getElementById("join-room")
joinRoom.onclick = () => {
    let inpId = document.getElementById("join-room-input").value

    const regex = /(https:\/\/thisDotBingo\.co\/game\?room=)/g;

    let link = inpId
    if (regex.test(inpId) == false) {
        link = siteUrl + link;
    }
    window.location = link
    console.log(link)
}