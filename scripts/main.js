const siteUrl = `${window.location.href}game.html?room=`

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

    let regex = /(https:\/\/thisdotbingo\.co\/game.html\?room=)/g;

    let link = inpId
    if (regex.test(inpId) == false) {
        link = siteUrl + link;
    }
    window.location = link
    console.log(link)
}