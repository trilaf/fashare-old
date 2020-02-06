const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase_tools = require('firebase-tools');
admin.initializeApp();
const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
    setTimeout(() => {
        response.send("Hello from Firebase!");
    }, 15000);
});

exports.recursiveDelete = functions
.runWith({
    timeoutSeconds: 540,
    memory: '2GB'
})
.https.onCall((data, context) => {
    let duration;
    const path = data.path;
    if(data.type === 'direct') { duration = 0; }
    if(data.type === 'auto') { duration = 3660000; }
    setTimeout(() => {
    return firebase_tools.firestore
        .delete(path, {
            project: process.env.GCLOUD_PROJECT,
            recursive: true,
            yes: true
        })
        .then(() => {
            return {
                path: path
            };
        });
    }, duration)
});