/* globals createCanvas, background, ellipse, fill, loop, noLoop rect, width, textSize, atan, sin, keyIsDown, cos, createVector, colorMode, HSB, random, height, mousePressed, checkCollisions stroke, text, keyCode, UP_ARROW, DOWN_ARROW, RIGHT_ARROW, LEFT_ARROW, collideRectRect, triangle mouseX, mouseY, line, strokeWeight, score, rounds, hit, collideRectCircle*/

let player, round, shoot, bullet, gameIsOver, score;
let healthbar = 40;
let bullets = [];
let zombies = [];
let zombieIncrease = 0;
let s1 = 1;
let s2 = 1.2;
let zombieNumber = 10;
let powerUp;
function setup() {
  createCanvas(900, 700);
  colorMode(HSB, 360, 100, 100);
  score = 0;
  round = 1;
  strokeWeight(2);
  createZombies();
  player = new Player();
  shoot = new Shoot();
  powerUp = new PowerUps();
}

function draw() {
  background(63, 75, 60);
  createHUD();
  // player.movePlayer();
  shoot.drawShooter();
  player.drawPlayer();
  player.movePlayer();
  shoot.moveShooter();
  powerUp.drawPower();
  powerUp.checkCollide();
  health();
  // bullet.drawBullet();
  waves();
  displayScore();
  displayRound();
  // keyPressed();
  // finish();
  // keyPressed();
  // Cont();
  restartGame();
  drawBullets();
  checkBulletZombie();
  rounds();

  // powerUps();
}

function keyPressed() {
  // Cont();
  restartGame();
}

function mouseClicked() {
  bullets.push(new Bullet());
}

function createHUD() {
  fill(35, 100, 100);
  rect(0, 0, width, 50);
  fill(39, 100, 100);
  rect(340, 10, 180, 30);
  fill(10);
  textSize(25);
  text("SURVIVOR", 365, 35);
}

function drawBullets() {
  let activeBullets = [];

  for (let bullet of bullets) {
    bullet.moveBullet();

    if (bullet.isOnScreen()) {
      bullet.drawBullet();
      activeBullets.push(bullet);
    }
  }
  bullets = activeBullets;
}

function waves() {
  for (let i = 0; i < zombies.length; i++) {
    // calculate next position
    zombies[i].updateSelf();

    // initialize boolean variables to keep track of collisions in the inner loop
    let noCollisionsX = true;
    let noCollisionsY = true;

    for (let j = 0; j < zombies.length; j++) {
      // don't check a zombie against itself (that would always be a collision)
      if (i != j) {
        // check if next x position will collide with any other current zombie position
        if (
          collideRectRect(
            zombies[i].nextX,
            zombies[i].y,
            zombies[i].size,
            zombies[i].size,
            zombies[j].x,
            zombies[j].y,
            zombies[j].size,
            zombies[j].size
          )
        ) {
          noCollisionsX = false;
        }

        // check if next y position will collide with any other current zombie position
        if (
          collideRectRect(
            zombies[i].x,
            zombies[i].nextY,
            zombies[i].size,
            zombies[i].size,
            zombies[j].x,
            zombies[j].y,
            zombies[j].size,
            zombies[j].size
          )
        ) {
          noCollisionsY = false;
        }
      }
    }

    // set canMoveX, canMoveY properties to the outcome of the inner loop's tracking boolean variables
    zombies[i].canMoveX = noCollisionsX;
    zombies[i].canMoveY = noCollisionsY;

    // move to next position
    zombies[i].moveSelf();

    if (!gameIsOver) {
      const hit = collideRectCircle(
        zombies[i].x,
        zombies[i].y,
        zombies[i].size,
        zombies[i].size,
        player.x,
        player.y,
        player.d
      );
      if (hit) {
        player.health--;
        healthbar -= 0.08;
        //add game over here
        checkGameOver();
        console.log(player.health);
      }
    }
    // draw zombies
    zombies[i].showSelf();
  }
}

// function mousePressed() {
//   bullet.drawBullet();
//   bullet.moveBullet();
// }

function createZombies() {
  while (zombies.length < zombieNumber) {
    let newZombie = new Zombie();
    let zombieCollision = false;
    for (let zombie of zombies) {
      if (
        collideRectRect(
          newZombie.x,
          newZombie.y,
          newZombie.size,
          newZombie.size,
          zombie.x,
          zombie.y,
          zombie.size,
          zombie.size
        )
      ) {
        zombieCollision = true;
      }
    }
    if (!zombieCollision) {
      zombies.push(newZombie);
    }
  }
}

class Zombie {
  constructor() {
    this.health = 1;
    let choicey = [0, height];
    let choicex = [0, width];
    this.y = random(choicey);
    this.x = random(width);
    this.nextX = this.x;
    this.nextY = this.y;
    this.canMoveX = true;
    this.canMoveY = true;
    this.size = 28;
    this.speed = random(0.5, 1);
  }

  showSelf() {
    fill("red");
    rect(this.x, this.y, this.size);
    console.log("showSelf");
  }

  updateSelf() {
    if (this.x < player.x) {
      this.nextX += this.speed;
    } else {
      this.nextX -= this.speed;
    }
    if (this.y < player.y) {
      this.nextY += this.speed;
    } else {
      this.nextY -= this.speed;
    }
  }

  moveSelf() {
    if (this.canMoveX) {
      // Can move: go to next x position
      this.x = this.nextX;
    } else {
      // Can't move: reset to previous x position
      this.nextX = this.x;
    }
    if (this.canMoveY) {
      // Can move: go to next y position
      this.y = this.nextY;
    } else {
      // Can't move: reset to previous y position
      this.nextY = this.y;
    }
  }
}
/*------------------------------------------*/
class Player {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    this.d = 30;
    this.speed = 5;
    this.health = 500;
    this.r = 18;
  }

  drawPlayer() {
    //code for the health bar
    let xPos = this.x - 20;
    let yPos = this.y + 50;
    fill(190, 43, 85);
    ellipse(this.x, this.y, this.d);
    fill(60);
    ellipse(this.x, this.y, this.r);
  }
  movePlayer() {
    if (keyIsDown(68) && keyIsDown(87) && this.x < width && this.y > 65) {
      this.x += this.speed;
      this.y -= this.speed;
    } else if (keyIsDown(65) && keyIsDown(87) && this.x > 0 && this.y > 65) {
      this.x -= this.speed;
      this.y -= this.speed;
    } else if (
      keyIsDown(68) &&
      keyIsDown(83) &&
      this.x < width &&
      this.y < height
    ) {
      this.x += this.speed;
      this.y += this.speed;
    } else if (
      keyIsDown(65) &&
      keyIsDown(83) &&
      this.x > 0 &&
      this.y < height - 0
    ) {
      this.x -= this.speed;
      this.y += this.speed;
    } else if (keyIsDown(87) && this.y > 65) {
      this.y -= this.speed;
    } else if (keyIsDown(68) && this.x < width - player.d) {
      this.x += this.speed;
    } else if (keyIsDown(65) && this.x > 0) {
      this.x -= this.speed;
    } else if (keyIsDown(83) && this.y < height - player.d) {
      this.y += this.speed;
    }
  }
}

class Shoot {
  constructor() {
    this.x = player.x;
    this.y = player.y;
    this.w = 40;
    this.h = 10;
    this.speed = 5;
    // this.e = 30 - (mouseX - this.x);
    // this.r = mouseY - this.y;
    // this.vec = createVector(player.x, player.y);
  }

  drawShooter() {
    strokeWeight(4);
    stroke;
    fill(50, 70, 70);
    const opp = mouseX - this.x;
    const adj = mouseY - this.y;
    const tan = opp / adj;
    const angle = atan(tan);
    const newOpp = sin(angle) * 30;
    const newAdj = cos(angle) * 30;
    if (mouseY > this.y) {
      line(this.x, this.y, this.x + newOpp, this.y + newAdj);
    } else {
      line(this.x, this.y, this.x - newOpp, this.y - newAdj);
    }
    strokeWeight(2);
  }
  moveShooter() {
    if (keyIsDown(68) && keyIsDown(87) && this.x < width && this.y > 65) {
      this.x += this.speed;
      this.y -= this.speed;
    } else if (keyIsDown(65) && keyIsDown(87) && this.x > 0 && this.y > 65) {
      this.x -= this.speed;
      this.y -= this.speed;
    } else if (
      keyIsDown(68) &&
      keyIsDown(83) &&
      this.x < width &&
      this.y < height
    ) {
      this.x += this.speed;
      this.y += this.speed;
    } else if (
      keyIsDown(65) &&
      keyIsDown(83) &&
      this.x > 0 &&
      this.y < height - 0
    ) {
      this.x -= this.speed;
      this.y += this.speed;
    } else if (keyIsDown(87) && this.y > 65) {
      this.y -= this.speed;
    } else if (keyIsDown(68) && this.x < width - player.d) {
      this.x += this.speed;
    } else if (keyIsDown(65) && this.x > 0) {
      this.x -= this.speed;
    } else if (keyIsDown(83) && this.y < height - player.d) {
      this.y += this.speed;
    }
  }
}

class Bullet {
  constructor() {
    this.x = player.x;
    this.y = player.y;
    this.d = 18;
    this.shoot = true;

    let v = 10;

    let deltaX = mouseX - this.x;
    let deltaY = mouseY - this.y;

    // Get angle (in radians) from player position to mouse position
    let angle = Math.atan(deltaY / deltaX);

    // If click in quadrant II or III, mirrors direction
    if (deltaX < 0) {
      angle = angle + Math.PI;
    }

    // Splits the velocity vector (hypotenuse) into x and y components
    this.vY = Math.sin(angle) * v;
    this.vX = Math.cos(angle) * v;
  }

  drawBullet() {
    fill(60, 100, 100);
    ellipse(this.x, this.y, this.d);
  }

  isOnScreen() {
    return this.x > 0 && this.x < width && this.y > 0 && this.y < height;
  }

  moveBullet() {
    this.x += this.vX;
    this.y += this.vY;
  }
}

/*------------------------------------------*/
//class Health {
//text("Health", 20, 50);
//}

function health() {
  fill(10);
  textSize(15);
  text(`Health: ${player.health}`, width / 20, 30);
  fill(39, 20, 94);
  rect(player.x - 20, player.y + 40, 40, 10);
  //width goes down, color changes.
  fill(87, 95, 77);
  rect(player.x - 20, player.y + 40, healthbar, 10);
}

function displayScore() {
  fill(10);
  textSize(15);
  text(`Score: ${score}`, (width / 6) * 5, 30);
}

function displayRound() {
  text(`Round ${round}`, (width / 6) * 4, 30);
  // round++;
  // loop();
}

function checkGameOver() {
  if (player.health <= -2) {
    gameIsOver = true;
    player.health = 0;
    fill(92, 62, 49);
    rect(150, 150, 600, 400);
    fill(10);
    textSize(90);
    text("GAME OVER", width / 5, height / 2);
    fill(100);
    textSize(20);
    text(
      "There's too many of them! You've been overrun by the hoard.",
      180,
      height / 2 + 100
    );
    textSize(20);
    text("Click *SPACE* to restart", 345, height / 2 + 130);
    noLoop();
  }
}

function restartGame() {
  console.log("restart", keyCode);
  if (keyCode == 32 && player.health == 0) {
    player.health = 500;
    score = 0;
    round = 1;
    gameIsOver = false;
    healthbar = 40;
    let newArray = [];
    zombies = newArray;
    createZombies();
    loop();
  }
}

function checkBulletZombie() {
  let moreZ = [];
  for (let i = zombies.length - 1; i >= 0; i--) {
    for (let j = bullets.length - 1; j >= 0; j--) {
      if (
        collideRectCircle(
          zombies[i].x,
          zombies[i].y,
          zombies[i].size,
          zombies[i].size,
          bullets[j].x,
          bullets[j].y,
          bullets[j].d
        )
      ) {
        console.log("registering");
        score++;
        bullets[j].x = 1000;
        // zombies.splice(i, 1);
        // bullets.splice(i, 1);
        moreZ.push(i);
        // used moreZ.push(zombies[i]), this took a zombie object, so random
        // zombies.splice(a, 1);
      } else {
        //moreZ.push(zombies[i]);
      }
    }
  }
  for (let k = moreZ.length - 1; k >= 0; k--) {
    zombies.splice(moreZ[k], 1);
  }

  // zombies = moreZ;
  // // createZombies();
  //  console.log(zombies)
  //   for (let k =0; k< checkZ.length; k++){
  //  zombies[checkZ[k]]--;
  // }
}
let multi = 1;

function rounds() {
  if (zombies.length == 0) {
    zombieIncrease += 3;
    round++;
    player.speed += 0.5;
    shoot.speed = player.speed;
    zombieNumber++;
    multi = multi * 1.1;
    fill(100);
    text(`ROUND ${round}`, width / 5, height / 2);
    powerUp = new PowerUps();
    createZombies();
  //  powerUp = new PowerUps();
    for (let h = 0; h < zombieIncrease.length; h++) {
      zombies.push(new Zombie());
    }
    for (let i = 0; i < zombies.length; i++) {
      zombies[i].speed *= multi;
    }
  }
}

class PowerUps {
  constructor() {
    let list = [1, 2, 3];
    this.x = random(0, width - 30);
    this.y = random(80, height - 30);
    this.power = random[list];
    this.size = 12;
    this.hit = false;
  }

  drawPower() {
    if (this.power == 1) {
 //     fill(39, 20, 94);
      fill (0)
    } else if (this.power == 2) {
      //fill(176, 97, 95);
      fill(0)
    } else if (this.power == 3) {
   //   fill(39, 100, 100);
      fill(0)
    }
    rect(this.x, this.y, this.size);
  }

  checkCollide() {
    this.hit = collideRectRect(
      this.x,
      this.y,
      this.size,
      this.size,
      player.x,
      player.y,
      player.d,
      player.d
    );
    if (this.hit) {
      if (this.power == 1) {
        health += 100;
      } else if (this.power == 2) {
        bullet.d++;
      } else if (this.power == 3) {
         zombies.speed -= 0.5;
      }
      this.x = -100
    }
  }
}

