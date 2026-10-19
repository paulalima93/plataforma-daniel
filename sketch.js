var player;
var ground;
var worldWidth = 2400;
var platformGroup;
var coinsGroup;
//variaveis temporárias
var platform1, platform2;

var platformsPositions;
var coinsPositions;

var moedasColetadas = 0;
var quantidadeMoedas;

var idle, run, jumping;
var coins;

var isJumping = false;

var estadoJogo = "jogando";

var groundImg, bgImg, coinImg, clockImg;
var bgSound;
var time = 0;
var isTimerActive = false;
var fonte;

function preload() {
  platformsPositions = loadJSON("platforms.json");
  coinsPositions = loadJSON("coins.json");
  idle = loadAnimation(
    "assets/img/idle/Idle 01.png",
    "assets/img/idle/Idle 02.png",
    "assets/img/idle/Idle 03.png",
    "assets/img/idle/Idle 04.png",
    "assets/img/idle/Idle 05.png"
  );

  run = loadAnimation(
    "assets/img/run/Run 01.png",
    "assets/img/run/Run 02.png",
    "assets/img/run/Run 03.png",
    "assets/img/run/Run 04.png",
    "assets/img/run/Run 05.png",
    "assets/img/run/Run 06.png"
  )

  coins = loadAnimation(
    "assets/img/coins/01.png",
    "assets/img/coins/02.png",
    "assets/img/coins/03.png",
    "assets/img/coins/04.png"
  )

  jumping = loadAnimation(
    "assets/img/jump/Jump 01.png",
    "assets/img/jump/Jump 02.png",
    "assets/img/jump/Jump 03.png"
  )

  jumping.looping = false;

  groundImg = loadImage("assets/img/ground.png");
  bgImg = loadImage("assets/img/bg.png");
  coinImg = loadImage("assets/img/coins/01.png");
  clockImg = loadImage("assets/img/clock-icon.png");
  bgSound = loadSound("assets/sounds/som.mp3");
  fonte = loadFont("assets/fonte/comic.ttf");
}

function setup() {
  createCanvas(800, 600);

  player = createSprite(200, 0, 20, 50);
  //player.shapeColor = "lightgreen";
  player.addAnimation("idle", idle);
  player.addAnimation("run", run);
  player.addAnimation("jump", jumping);

  player.scale = 1.5;
  player.debug = false;
  player.setCollider('rectangle', 0, 0, 20, 25)
  ground = createSprite(worldWidth / 2, 600, worldWidth, 50);
  ground.addImage(groundImg);
  // platform1 = createSprite(400, 500, 80, 10);
  // platform2 = createSprite(480, 450, 80, 10);

  platformGroup = new Group();
  coinsGroup = new Group();

  // platformGroup.add(platform1);
  // platformGroup.add(platform2);

  const platformsArray = Object.values(platformsPositions);

  for (var i = 0; i < platformsArray.length; i++) {
    var dados = platformsArray[i];
    var platform = createSprite(dados.x, dados.y, dados.w, dados.h);
    platform.shapeColor = "#FBC997"
    platformGroup.add(platform);
  }

  const coinsArray = Object.values(coinsPositions);
  quantidadeMoedas = coinsArray.length;

  for (var i = 0; i < coinsArray.length; i++) {
    var dados = coinsArray[i];
    var coin = createSprite(dados.x, dados.y, 8, 10);
    coin.addAnimation("coins", coins);
    coinsGroup.add(coin);
  }

  startTimer(15);
  //bgSound.loop();
  //bgSound.play();
  bgSound.setVolume(0.1);

}

function draw() {
  background("#C39490");

  if (estadoJogo === "jogando") {
    image(bgImg, 0, 0, 2400, 660);

    move();
    jump();
    moveCamera();
    gameWin();

    player.collide(ground);
    player.collide(platformGroup);

    if (player.velocityY === 0) {
      isJumping = false;
    }

    player.velocityY += 1; //gravidade
    player.overlap(coinsGroup, collectCoins);

    updateTimer();

    camera.off();
    fill("gray")
    rect(45, 20, 80,60);
    fill("#FFF");
    textSize(25);
    text(moedasColetadas, 85, 50);
    text(time, 85, 75);
    image(coinImg, 50, 25, 30,30)
    image(clockImg, 56, 53, 20,25)
    camera.on();

    drawSprites();
  } else if(estadoJogo === "vitoria"){
    camera.off();
    textSize(50);
    textFont(fonte);
    text("Vitoria", 300, 300);
  } else if(estadoJogo === "gameOver"){
    camera.off();
    textFont(fonte);
    textSize(50);
    text("Perdeu, seu noob!", 200, 300);
  }
}

function move() {
  if (keyDown(LEFT_ARROW) || keyDown('A')) {
    if (player.x > 25) {
      player.x -= 5;
    }

    if (keyDown("SHIFT")) {
      player.x -= 10;
    }

    if (!isJumping) {
      player.changeAnimation("run");
    }

    player.mirrorX(-1);
  }

  if ((keyDown(RIGHT_ARROW) || keyDown('D'))) {
    if (player.x < worldWidth - 25) {
      player.x += 5;
    }
    if (keyDown("SHIFT")) {
      player.x += 10;
    }
    if (!isJumping) {
      player.changeAnimation("run");
    }
    player.mirrorX(1);
  }

  if (!(keyDown('A') || keyDown('D'))) {
    player.changeAnimation("idle")
  }
}

function jump() {
  if (keyDown('SPACE') && (player.collide(ground) || player.collide(platformGroup))) {
    player.velocityY = -20;
    player.changeAnimation("jump");
    isJumping = true;
  }

}

function moveCamera() {
  camera.position.x = player.position.x + 150

  camera.position.x = constrain(camera.position.x, width / 2, worldWidth - width / 2);
}

function collectCoins(player, coin) {
  coin.remove();
  moedasColetadas += 1;
}

function gameWin(){
  if(moedasColetadas === quantidadeMoedas){
    estadoJogo = "vitoria";
  }
}

function startTimer(seconds){
  time = seconds;
  isTimerActive = true
}

function updateTimer(){
  if(!isTimerActive || estadoJogo !== "jogando") return;

  if(frameCount % 45 == 0 && time > 0 ){
    time--;
  }

  if(time <= 0) {
    time = 0;
    isTimerActive = false;
    estadoJogo = "gameOver"
  }

}

function keyPressed() {
  getAudioContext().resume();

  if (!bgSound.isPlaying()) {
    bgSound.loop();
  }
}

