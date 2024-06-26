const breakoutScript = function() {

    let state
    let canvas; //= document.getElementById("myCanvas")
    let ctx; 

    // CONSTANTS
    const fillColor = "#0095DD"
    const ballRadius = 10
    const paddleHeight = 10
    const paddleWidth = 75
    const brickRowCount = 3
    const brickColumnCount = 5
    const brickWidth = 75
    const brickHeight = 20
    const brickPadding = 10
    const brickOffestTop = 30
    const brickOffsetLeft = 30 

    // FUNCTIONS 

    function createInitialPositionState(){
        return  {
            x : canvas.width / 2,
            y : canvas.height - 30,
            paddleX : (canvas.width - paddleWidth)/2,
            dx : 2,
            dy : -2,
            mouseXY : [0,0]
        }
    }


    function createInitialState(_canvas){
        const state = {
            score : 0,
            lives : 3,
            rightPressed : false,
            leftPressed : false,
            bricks : [],
            gameWon: false,
            gameOver: false,
            ...createInitialPositionState()
        }
        for (let c = 0; c < brickColumnCount; c++) {
            state.bricks[c] = []
            for(let r = 0; r < brickRowCount; r++) {
                const x = c * (brickWidth + brickPadding) + brickOffsetLeft
                const y = r * ( brickHeight + brickPadding) + brickOffestTop
                state.bricks[c][r] = {x , y, alive: true }
            }
        }
        return state
    }

    function setupGame(_canvas) {
        canvas = _canvas;
        ctx = canvas.getContext("2d");
        state = createInitialState()
/*        document.addEventListener("keydown", keyDownHandler, false)
        document.addEventListener("keyup", keyUpHandler, false)
        document.addEventListener("mousemove", mouseMoveHandler, false)*/
    }

    function restartGame(){
        state = null;
        state = createInitialState();
        /*document.removeEventListener("keydown", keyDownHandler, false)
        document.removeEventListener("keyup", keyUpHandler, false)
        document.removeEventListener("mousemove", mouseMoveHandler, false)*/
    }

    function drawLives(){
        ctx.font = "16px Arial"
        ctx.fillStyle = fillColor
        ctx.fillText(`Lives: ${state.lives}`, canvas.width - 65 , 20)
    }

    function mouseMoveHandler(e){

        state.mouseXY = [e.clientX, e.clientY]

        const relativeX = e.clientX - canvas.offsetLeft
        if(relativeX > 0 && relativeX < canvas.width) {
            state.paddleX = relativeX - paddleWidth / 2
        }
    }

    function drawScore() {
        ctx.font = "16px Arial"
        ctx.fillStyle = fillColor
        ctx.fillText(`Score: ${state.score}`, 8 , 20)
    }

    function keyDownHandler(e) {
        if(e.key === "Right" || e.key === "ArrowRight") {
            state.rightPressed = true
        } else if(e.key === "Left" || e.key == "ArrowLeft") {
            state.leftPressed = true
        }
    }

    function keyUpHandler(e) {
        if(e.key === "Right" || e.key === "ArrowRight") {
            state.rightPressed = false
        } else if (e.key === "Left" || e.key === "ArrowLeft"){
            state.leftPressed = false
        }
    }

    function drawBall(){
        ctx.beginPath()
        ctx.arc(state.x, state.y, ballRadius, 0, Math.PI *2 )
        ctx.fillStyle = fillColor
        ctx.fill()
        ctx.closePath()
    }

    function drawPaddle() {
        ctx.beginPath()
        ctx.rect(state.paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight)
        ctx.fillStyle = fillColor
        ctx.fill()
        ctx.closePath()

    }

    function drawBricks() {

        state.bricks.flat().forEach(brick => {
            if(brick.alive){
                ctx.beginPath()
                ctx.rect(brick.x, brick.y, brickWidth, brickHeight)
                ctx.fillStyle = fillColor
                ctx.fill()
                ctx.closePath()
            }
        });
    }

    function collisionDetection() {
        for(let c = 0; c < brickColumnCount; c++ ){
            for (let r = 0; r < brickRowCount; r++) {
                const b = state.bricks[c][r];
                if(
                    b.alive &&
                    state.x > b.x &&
                    state.x < b.x + brickWidth &&
                    state.y > b.y &&
                    state.y < b.y + brickHeight
                ){
                    state.dy = -state.dy
                    b.alive = false
                    state.score++
                    if(state.score === brickRowCount * brickColumnCount) {
                        state.gameWon = true
                        return;
                    }
                }
            }
        }
    }

    function drawGameFrame(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawBall()
        drawPaddle()
        drawScore()
        drawLives()
        drawBricks()

        collisionDetection()
        if(state.x + state.dx > canvas.width - ballRadius || state.x + state.dx < ballRadius) {
            state.dx = -state.dx
        }

        if(state.y + state.dy < ballRadius) {
            state.dy = -state.dy
         } else if(state.y + state.dy > canvas.height - ballRadius) {
            if(state.x > state.paddleX && state.x < state.paddleX + paddleWidth ) {
                state.dy = -state.dy
            } else {

                state.lives--
                if(!state.lives){
                    state.gameOver = true
                } else {
                    state = {
                        ...state,
                        ...createInitialPositionState()
                    }
                }

            }
        }

        if(state.gameOver || state.gameWon) {
            //state.gameOver ? alert("Game over") : alert("Game won")
            //teardownGame()
            console.log({state})
            return
        }
        if(state.rightPressed) {
            state.paddleX = Math.min(state.paddleX + 7, canvas.width - paddleWidth )
        } else if (state.leftPressed) {
            state.paddleX = Math.max(state.paddleX -7, 0 )
        }

        state.x += state.dx
        state.y += state.dy
       // requestAnimationFrame(draw)
    }

    function setPaddleMovementFromAngles(angles) {
        const threshold = 0.2;
    
        if (angles.z > -threshold && angles.z < threshold) {
            // Central position: stop moving
            state.leftPressed = false;
            state.rightPressed = false;
        } else if (angles.z <= -threshold) {
            // Move left
            state.leftPressed = true;
            state.rightPressed = false;
        } else if (angles.z >= threshold) {
            // Move right
            state.leftPressed = false;
            state.rightPressed = true;
        }
    }

    function isGameRunning() {
        return !state.gameOver && !state.gameWon
    }
    function getDirection(){
        return {l : state.leftPressed, r: state.rightPressed}
    }

    return {
        setupGame,
        drawGameFrame,
        isGameRunning,
        setPaddleMovementFromAngles,
        getDirection,
        restartGame
    }

}()