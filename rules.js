
export function init_scoreboard({totalFlowerCount = 100, flowersToWin = 25, timeAllowed=70000} = {}){
    let flowersPicked = 0;
    const startTime = new Date();

    const scoreboardElement = document.createElement("div");
    scoreboardElement.className = "scoreboard"

    document.body.appendChild(scoreboardElement);

    const scoreboard = {
        pickedFlower(){
            flowersPicked++;
            updateScoreboard();
        },
        flowersPicked(){
            return flowersPicked;
        },
        flowersRemainingToWin(){
            return Math.max( flowersToWin - flowersPicked, 0  )
        },
        flowersRemaining(){
            return Math.max( totalFlowerCount - flowersPicked, 0  )
        },
        timeRemaining(){
            const timePassed = new Date() - startTime;
            return Math.round( Math.max(timeAllowed - timePassed , 0) / 1000);
        },
        flowersToWin(){
            return flowersToWin;
        }
    }
    scoreboardElement.innerHTML = scoreboardHTML(scoreboard);
    function updateScoreboard(){
        for( let element of scoreboardElement.querySelectorAll("[data-value]") ) {
            const fn = scoreboard[element.getAttribute("data-value")];
            if(fn) {
                element.textContent = fn.call(scoreboard);
            } else {
                throw new Error("no matching function "+element.getAttribute("data-value"));
            }
            
        }
    }
    function updateScoreboardEverySecond(){
        updateScoreboard();
        const timeRemaining = scoreboard.timeRemaining()
        if(timeRemaining > 0) {
            setTimeout(()=>{
                updateScoreboardEverySecond();
            }, timeRemaining % 1000)
        }

    }
    updateScoreboardEverySecond();
    
    return scoreboard;
}

function scoreboardHTML(scoreboard) {
    return `
        <p><span data-value="timeRemaining"></span>s</p>
        <p>
            <img height="63px" src="./objects/photos/head-on-arms-thumb.png"/>
            <span data-value="flowersRemainingToWin"></span>
        </p>
        
    `
}