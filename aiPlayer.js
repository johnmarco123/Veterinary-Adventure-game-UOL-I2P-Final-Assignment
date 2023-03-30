const NEWHIGHSCORE = false;
let adder = [];
let replay = false;
let output = false;
let currentCoords = 0;
const getGameState = () =>
{
    if(NEWHIGHSCORE)
    {
        document.getElementById('textBox').style.display = 'inline';
        adder.push([~~gameCharWorldX, ~~gameCharY])
    }
    if(replay == true)
    {
        let lastX, lastY;
        let thisX, thisY
        if(currentCoords + 1 < speedRunner[currentLevel].length)
        {
             thisX = speedRunner[currentLevel][currentCoords][0];
             thisY = speedRunner[currentLevel][currentCoords][1];

            if(currentCoords - 1 >= 0)
            {
                lastX = speedRunner[currentLevel][currentCoords - 1][0];
                lastY = speedRunner[currentLevel][currentCoords - 1][1];
            }

            if(thisX > lastX)
            {
                thisY <= lastY ? rightAnimation(thisX, thisY, true) : rightFallingAnimation(thisX, thisY, true);
            }else if(thisX < lastX)
            {
                thisY <= lastY ? leftAnimation(thisX, thisY, true) : leftFallingAnimation(thisX, thisY, true);
            }else
            {
                thisY <= lastY ? forwardAnimation(thisX, thisY, true) : forwardFallingAnimation(thisX, thisY, true);
            }
            currentCoords++;
        }else
        {
            thisX = speedRunner[currentLevel][speedRunner[currentLevel].length - 1][0]
            thisY = speedRunner[currentLevel][speedRunner[currentLevel].length - 1][1]
            forwardAnimation(thisX, thisY, true);
        }




    }
    if(output)
    {
        for(let i = 0; i < adder.length; i++)
        {
            adder[i][0] = '[' + adder[i][0];
            adder[i][1] = adder[i][1] + ']';
        }
        document.getElementById('textBox').innerHTML = adder
        output = false;
    }
}

