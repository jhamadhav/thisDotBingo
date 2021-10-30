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


//when a user clicks the send message button 
document.getElementById("send-message").addEventListener("click", function (event) {
    console.log("send message");
});


    // Reference Firestore collections for signaling
    // const callDoc = firestore.collection('calls').doc();
    // const offerCandidates = callDoc.collection('offerCandidates');
    // const answerCandidates = callDoc.collection('answerCandidates');
