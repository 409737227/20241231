// === 全域變數宣告 ===
let isLoaded = false;  // 添加 isLoaded 變數
let scaleSize = 2;
let bgImage;  // 新增背景圖片變數
let bgX = 0;  // 新增背景位置變數

// 動畫相關
let animations = {
  player1: {},
  player2: {}
};

let sprites = {
  player1: {
    idle: {
      img: null,
      width: 343/6,  // 約 57.17
      height: 40,
      frames: 6
    },
    walk: {
      img: null,
      width: 366/7,  // 約 52.29
      height: 58,
      frames: 7
    },
    jump: {
      img: null,
      width: 492/7,  // 約 70.29
      height: 46,
      frames: 7
    },
    effect1: {
      img: null,
      width: 665/10,
      height: 63,
      frames: 10
    }
  },
  player2: {
    idle: {
      img: null,
      width: 515/8,
      height: 102,
      frames: 8
    },
    walk: {
      img: null,
      width: 974/11,
      height: 98,
      frames: 11
    },
    jump: {
      img: null,
      width: 685/10,
      height: 108,
      frames: 10
    },
    effect2: {
      img: null,
      width: 571/8,
      height: 67,
      frames: 8
    }
  }
};
let players = {
  player1: {
    position: { x: -200, y: 200 },
    velocity: { x: 0, y: 0 },
    facing: 1,
    health: 100,
    currentAction: 'idle',
    effectCooldown: 0
  },
  player2: {
    position: { x: 200, y: 200 },
    velocity: { x: 0, y: 0 },
    facing: -1,
    health: 100,
    currentAction: 'idle',
    effectCooldown: 0
  }
};

// 物理常數
const MOVE_SPEED = 8;
const JUMP_FORCE = -15;
const GRAVITY = 0.8;
const GROUND_Y = 0;
const MAX_X = 800;  // 修改：增加水平移動範圍 (原本是 350)

// 特效相關
let activeEffects = [];
const EFFECT_SPEED = 8;
const EFFECT_MAX_DISTANCE = 300;
const EFFECT_COOLDOWN = 3;  // 新增：特效冷卻時間
const DAMAGE = 10;

// 音效相關
let soundEffects = {
  effect1: null,
  effect2: null
};

// 在檔案開頭添加 Animation 類別定義
class Animation {
  constructor(frames) {
    this.frames = frames;
    this.currentFrame = 0;
    this.frameDelay = 5;
    this.frameCount = 0;
  }

  display(x, y) {
    if (this.frames.length > 0) {
      image(this.frames[this.currentFrame], x, y);
    }
  }

  next() {
    this.frameCount++;
    if (this.frameCount >= this.frameDelay) {
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      this.frameCount = 0;
    }
  }
}

// 保持原有的 sprites 物件...

function setup() {
  createCanvas(windowWidth, windowHeight);
  initializeAnimations();
}

function initializeAnimations() {
  try {
    // 初始化 player1 的動畫
    for (let action in sprites.player1) {
      console.log(`Initializing player1 ${action} animation`);
      let spriteData = sprites.player1[action]; // 取得動畫資料
      if (spriteData && spriteData.img) {
        let frames = [];
        for (let i = 0; i < spriteData.frames; i++) {
          let x = i * Math.floor(spriteData.width);
          let frame = spriteData.img.get(x, 0, Math.floor(spriteData.width), spriteData.height);
          frames.push(frame);
        }
        animations.player1[action] = new Animation(frames); // 創建動畫物件 
      }
    }

    // 初始化 player2 的動畫
    for (let action in sprites.player2) {
      console.log(`Initializing player2 ${action} animation`);
      let spriteData = sprites.player2[action]; // 取得動畫資料
      if (spriteData && spriteData.img) { // 確認動畫資料存在且包含圖片
        let frames = [];
        for (let i = 0; i < spriteData.frames; i++) {
          let x = i * Math.floor(spriteData.width);
          let frame = spriteData.img.get(x, 0, Math.floor(spriteData.width), spriteData.height);
          frames.push(frame);
        }
        animations.player2[action] = new Animation(frames); 
      }
    }

    // 特別檢查 effect2 的初始化
    let effect2Data = sprites.player2.effect2;
    if (effect2Data && effect2Data.img) {
      console.log('Initializing effect2 animation');
      let frames = [];
      for (let i = 0; i < effect2Data.frames; i++) {
        let x = i * Math.floor(effect2Data.width);
        let frame = effect2Data.img.get(x, 0, Math.floor(effect2Data.width), effect2Data.height);
        frames.push(frame);
      }
      animations.player2.effect2 = new Animation(frames);
      console.log('effect2 animation initialized');
    } else {
      console.error('effect2 sprite data or image is missing');
    }

    isLoaded = true;  // 設置載入完成標記
    console.log('Animations loaded:', animations); // 列印動畫物件
  } catch (e) {
    console.error('Error in initializeAnimations:', e); // 列印錯誤
  }
}

function updatePlayerPhysics() {  
  // 更新兩個玩家的物理
  for (let id in players) {   
    let player = players[id];
    
    // 更新位置
    player.position.x += player.velocity.x;   
    player.position.y += player.velocity.y;   
    
    // 套用重力
    player.velocity.y += GRAVITY;  
    
    // 地面碰撞檢測
    if (player.position.y > GROUND_Y) {
      player.position.y = GROUND_Y;
      player.velocity.y = 0;
    }
    
    // 限制水平移動範圍
    if (player.position.x < -MAX_X) player.position.x = -MAX_X;
    if (player.position.x > MAX_X) player.position.x = MAX_X;
  }
}
function keyPressed() {
  if (!isLoaded) return;

  // player1 的控制
  if (key === '1') {
    players.player1.velocity.x = -MOVE_SPEED;
    players.player1.facing = -1;
    players.player1.currentAction = 'walk';
  }
  if (key === '2') {
    if (players.player1.position.y >= GROUND_Y) {
      players.player1.velocity.y = JUMP_FORCE;
    }
    players.player1.currentAction = 'jump';
  }
  if (key === '3') {
    players.player1.velocity.x = MOVE_SPEED;
    players.player1.facing = 1;
    players.player1.currentAction = 'walk';
  }
  if (key === ' ' && players.player1.effectCooldown <= 0) {
    console.log("Player 1 firing effect");
    
    // 播放 effect1 音效
    if (soundEffects.effect1) {
      soundEffects.effect1.play();
    }
    
    // 計算 player1 當前的尺寸
    let currentSprite = sprites.player1[players.player1.currentAction];
    let playerHeight = currentSprite.height * 2;
    let playerWidth = currentSprite.width * 2;
    
    activeEffects.push({
      x: players.player1.position.x,
      y: players.player1.position.y,
      direction: players.player1.facing,
      player: 'player1',
      effect: 'effect1',
      currentFrame: 0,
      active: true
    });
    players.player1.effectCooldown = EFFECT_COOLDOWN;
  }

  // player2 的控制
  if (key === '8') {
    players.player2.velocity.x = -MOVE_SPEED;
    players.player2.facing = -1;
    players.player2.currentAction = 'walk';
  }
  if (key === '9') {
    if (players.player2.position.y >= GROUND_Y) {
      players.player2.velocity.y = JUMP_FORCE;
    }
    players.player2.currentAction = 'jump';
  }
  if (key === '0') {
    players.player2.velocity.x = MOVE_SPEED;
    players.player2.facing = 1;
    players.player2.currentAction = 'walk';
  }
  if ((key === 'm' || key === 'M') && players.player2.effectCooldown <= 0) {
    console.log("Player 2 firing effect");
    
    // 播放 effect2 音效
    if (soundEffects.effect2) {
      soundEffects.effect2.play();
    }
    
    activeEffects.push({
      x: players.player2.position.x,
      y: players.player2.position.y,
      direction: players.player2.facing,
      player: 'player2',
      effect: 'effect2',
      currentFrame: 0,
      active: true
    });
    players.player2.effectCooldown = EFFECT_COOLDOWN;
  }
}

function keyReleased() {
  if (key === '1' || key === '3') {
    players.player1.velocity.x = 0;
    players.player1.currentAction = 'idle';
  }
  if (key === '8' || key === '0') {
    players.player2.velocity.x = 0;
    players.player2.currentAction = 'idle';
  }
  return false;
}

function draw() {
  // 繪製背景
  drawScrollingBackground();
  
  if (!isLoaded) {
    fill(0);
    textSize(20);
    textAlign(CENTER, CENTER);
    text('Loading...', width/2, height/2);
    return;
  }

  updatePlayerPhysics();
  checkCollisions();

  // 繪製兩個玩家
  for (let id in players) {
    let player = players[id];
    
    push();
    translate(width/2 + player.position.x, height/2 + player.position.y);
    scale(scaleSize * player.facing, scaleSize);
    
    if (animations[id] && animations[id][player.currentAction]) {
      animations[id][player.currentAction].display(0, 0);
      animations[id][player.currentAction].next();
    }
    pop();
  }
  
  updateEffects();  // 更新特效狀態

  // 繪製特效
  for (let effect of activeEffects) {
    if (!effect.active) continue;  // 跳過非活躍特效

    push();
    translate(width/2 + effect.x, height/2 + effect.y);
    scale(scaleSize * effect.direction, scaleSize);
    
    let effectType = effect.player === 'player1' ? 'effect1' : 'effect2';
    let effectAnim = animations[effect.player][effectType];
    
    if (effectAnim) {
      effectAnim.display(0, 0);
      effectAnim.next();
    }
    
    pop();
  }

  // 顯示生命值
  drawHealthBars();

  // 顯示除錯資訊
  fill(0);
  textSize(12);
  text(`P1 Cooldown: ${players.player1.effectCooldown}`, 10, 160);
  text(`P2 Cooldown: ${players.player2.effectCooldown}`, 10, 180);
  text(`Active Effects: ${activeEffects.length}`, 10, 200);
}

function checkCollisions() {
  // 檢查特效與玩家的碰撞
  for (let effect of activeEffects) {
    let targetPlayer = effect.player === 'player1' ? players.player2 : players.player1;
    let effectX = width/2 + effect.x;
    let effectY = height/2 + effect.y;
    let playerX = width/2 + targetPlayer.position.x;
    let playerY = height/2 + targetPlayer.position.y;
    
    // 簡單的矩形碰撞檢測
    if (Math.abs(effectX - playerX) < 30 && Math.abs(effectY - playerY) < 30) {
      targetPlayer.health = Math.max(0, targetPlayer.health - DAMAGE);
      activeEffects.splice(activeEffects.indexOf(effect), 1);
    }
  }
}

function drawHealthBars() {
  // 繪製生命值條
  textSize(16);
  fill(0);
  
  // Player 1 生命值
  fill(255, 0, 0);
  text('Player 1: ' + players.player1.health, 20, 30);
  fill(255, 0, 0);
  rect(10, 40, players.player1.health * 2, 20);
  
  // Player 2 生命值
  fill(255, 0, 0);
  text('Player 2: ' + players.player2.health, width - 150, 30);
  fill(255, 0, 0);
  rect(width - 210, 40, players.player2.health * 2, 20);
}

function preload() {
  console.log("Starting to load assets...");
  
  // 載入音效
  soundEffects.effect1 = loadSound('./assets/effect1.mp3',
    () => console.log('Effect1 sound loaded'));
  soundEffects.effect2 = loadSound('./assets/effect2.mp3',
    () => console.log('Effect2 sound loaded'));
  
  // 載入背景圖片
  bgImage = loadImage('./assets/background.png',
    () => console.log('Background loaded'));
  
  // 載入 player1 的圖片
  sprites.player1.idle.img = loadImage('./assets/player1/idle.png', 
    () => console.log('Player1 idle loaded'));
  sprites.player1.walk.img = loadImage('./assets/player1/walk.png',
    () => console.log('Player1 walk loaded'));
  sprites.player1.jump.img = loadImage('./assets/player1/jump.png',
    () => console.log('Player1 jump loaded'));
  sprites.player1.effect1.img = loadImage('./assets/player1/effect1.png',
    () => console.log('Player1 effect1 loaded'));
  
  // 載入 player2 的圖片
  sprites.player2.idle.img = loadImage('./assets/player2/idle.png',
    () => console.log('Player2 idle loaded'));
  sprites.player2.walk.img = loadImage('./assets/player2/walk.png',
    () => console.log('Player2 walk loaded'));
  sprites.player2.jump.img = loadImage('./assets/player2/jump.png',
    () => console.log('Player2 jump loaded'));
  sprites.player2.effect2.img = loadImage('./assets/player2/effect2.png',
    () => console.log('Player2 effect2 loaded'));
}

function updateEffects() {
  // 更新冷卻時間
  players.player1.effectCooldown = Math.max(0, players.player1.effectCooldown - 1);
  players.player2.effectCooldown = Math.max(0, players.player2.effectCooldown - 1);

  // 更新特效
  for (let i = activeEffects.length - 1; i >= 0; i--) {
    let effect = activeEffects[i];
    if (!effect.active) continue;  // 跳過非活躍特效

    effect.x += EFFECT_SPEED * effect.direction;

    // 檢查特效是否超出範圍
    if (Math.abs(effect.x) > EFFECT_MAX_DISTANCE) {
      effect.active = false;
      activeEffects.splice(i, 1);
    }
  }
}

// 新增背景繪製函數
function drawScrollingBackground() {
  if (!bgImage) return;

  // 計算背景位置
  let player1X = players.player1.position.x;
  let player2X = players.player2.position.x;
  
  // 使用兩個玩家的平均位置來決定背景移動
  let averageX = (player1X + player2X) / 2;
  
  // 計算背景偏移量（讓背景移動速度比玩家慢，產生視差效果）
  bgX = -averageX * 0.3;  // 修改：降低背景移動速度（原本是 0.5）
  
  // 確保背景不會超出邊界
  let maxBgShift = bgImage.width - width;
  bgX = constrain(bgX, -maxBgShift * 1.5, maxBgShift * 0.5);  // 修改：增加背景移動範圍
  
  // 繪製背景
  push();
  imageMode(CORNER);
  
  // 繪製多個背景以確保覆蓋整個移動範圍
  for (let i = -2; i <= 2; i++) {  // 修改：增加背景重複次數
    image(bgImage, bgX + width/2 + (bgImage.width * i), 0, bgImage.width, height);
  }
  
  pop();
}
