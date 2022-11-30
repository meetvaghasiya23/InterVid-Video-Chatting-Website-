const APP_ID='a096b30982c041f289bd6b1b6e2f9861'
const CHANNEL = sessionStorage.getItem('room')
const TOKEN = sessionStorage.getItem('token')
let UID = Number(sessionStorage.getItem('UID'))
let NAME = sessionStorage.getItem('name')

console.log("Streams.js Connected")

const client=AgoraRTC.createClient({mode:'rtc', codec:'vp8'})


let localTracks = []

let remoteUsers = {}

let joinAndDisplayLocalStream = async() =>{

    document.getElementById('room-name').innerText = CHANNEL

    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft) 

    try{
        UID = await client.join(APP_ID, CHANNEL, TOKEN, UID)
    }catch(error){
        console.error(error)
        window.open('/', '_self')
    }

    //UID = await client.join(APP_ID, CHANNEL, TOKEN, null) //Pass UID in place of Null

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    let player = `<div class="video-container" id="user-container-${UID}">
        <div class="username-wrapper" ><span class="user-name" ></span></div>
    <div class="video-player" id="user-${UID}"></div>
    </div>`

    console.log(typeof(player))

    var parser = new DOMParser();
    var doc = parser.parseFromString(player, 'text/html');

    console.log(typeof(doc))

    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
    //index 0 audio track
    //index 1 video track
    localTracks[1].play(`user-${UID}`)

    await client.publish([localTracks[0], localTracks[1]])

}

let handleUserJoined  = async(user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    if(mediaType==='video'){        // '===' checks the data type
        let player = document.getElementById(`user-container-${user.uid}`)
        if(player!=null){
            player.remove()
        }
        player = `<div class="video-container" id="user-container-${user.uid}">
                <div class="username-wrapper" ><span class="user-name" ></span></div>
                <div class="video-player" id="user-${user.uid}"></div>
                </div>`

        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)      
        
        user.videoTrack.play(`user-${user.uid}`)
    }

    if(mediaType==='audio'){
        user.audioTrack.play()
    }
  
}

let handleUserLeft = async(user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream = async() =>{

    for (let i=0; i<localTracks.length; i++){
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()
    window.open('/', '_self')
}

let toggleCamera = async(e) => {
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor='#fff'
    }
    else{
        await localTracks[1].setMuted(true)
        e.target.style.backgroundColor='rgb(255, 80, 80, 1)'
    }
}

let toggleMic = async(e) => {
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.style.backgroundColor='#fff'
    }
    else{
        await localTracks[0].setMuted(true)
        e.target.style.backgroundColor='rgb(255, 80, 80, 1)'
    }
}


joinAndDisplayLocalStream()

document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)

 