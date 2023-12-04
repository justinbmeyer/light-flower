

function makeAudio(path) {
    const audio = new Audio(path);
    const promise = new Promise((resolve)=>{
        
        audio.addEventListener("loadeddata",()=>{
            resolve(audio);
        }) 
        audio.addEventListener("waiting", (event) => {
        });
    })
    return {audio, promise};
}




export const {audio: yawnish, promise: yawnishPromise} = makeAudio('./sounds/yawnish-short.mp3')
export const {audio: nightSounds, promise: nightSoundsPromise} = makeAudio('./sounds/night-sounds.mp3')

nightSounds.loop = true;
let nightSoundsPlayed = false;
const button = showSpeakerButton();


function attemptToPlayNightSounds(){
    if(nightSoundsPlayed) {
        return;
    }
    nightSounds.play().then(function(){
        nightSoundsPlayed = true;
        button.remove();
    })
}



document.body.addEventListener("click",()=>{
    attemptToPlayNightSounds();
    yawnish.play();
    
    //yawnish.volume = 0.01;
    
    setTimeout(function(){
        yawnish.pause();
        yawnish.currentTime = 0;
    },13)
})



function showSpeakerButton(){
    const button = document.createElement("button");
    button.innerHTML = `<img src="./sounds/speaker-wave.svg" width="150px" height="150px"/>`
    button.title = "Play sounds";
    button.onclick = function(){
        attemptToPlayNightSounds();
    }
    Object.assign(button.style,{
        position: "fixed",
        top: "0px",
        left: "0px"
    });
    document.body.appendChild(button);
    return button;
}

