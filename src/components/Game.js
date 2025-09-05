import React, { useEffect, useRef, useState } from "react";
import * as Phaser from "phaser";

class BattleScene extends Phaser.Scene {
  constructor(onGameEnd, gameDuration) {
    super("BattleScene");
    this.onGameEnd = onGameEnd;
    this.gameDuration = gameDuration;
    this.remainingTime = gameDuration;
  }

  create() {
    // Game State
    this.isPaused = false;

    // Groups
    this.players = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.drops = this.physics.add.group();

    // Economy + default avatar
    this.coins = 15;
    this.spawnType = "fullstack";

    // Battlefield boundaries
    this.boundary = new Phaser.Geom.Rectangle(100, 100, 600, 400);
    this.createBackground();
    this.drawBattleBoundary();

    // Bases
    this.playerBaseHP = 100;
    this.playerBase = this.add.rectangle(120, 300, 40, 160, 0x00aa00);
    this.physics.add.existing(this.playerBase, true);

    this.enemyBaseHP = 100;
    this.enemyBase = this.add.rectangle(680, 300, 40, 160, 0xaa0000);
    this.physics.add.existing(this.enemyBase, true);

    this.playerBaseText = this.add.text(20, 60, "Job HP: 100", {
      fontSize: "18px",
      fill: "#fff",
      backgroundColor: "#000",
    });

    this.enemyBaseText = this.add.text(650, 60, "AI HP: 100", {
      fontSize: "18px",
      fill: "#fff",
      backgroundColor: "#000",
    });

    this.coinText = this.add.text(340, 20, `Coins: ${this.coins}`, {
      fontSize: "20px",
      fill: "#ffdd00",
      backgroundColor: "#222",
    });

    this.gameTimerText = this.add.text(340, 50, "Time: " + this.remainingTime, {
      fontSize: "20px",
      fill: "#fff",
      backgroundColor: "#222",
    });

    // UI
    this.createAvatarButtons();

    this.playerBaseShielded = false;
    this.playerShieldGraphic = null;

    // Mouse input
    this.input.on("pointerdown", (pointer) => {
      if (this.isPaused) return;
      if (this.tryPickDrop(pointer)) return;
      if (this.boundary.contains(pointer.x, pointer.y)) {
        this.trySpawn(pointer.y);
      }
    });

    // Enemy spawn loop
    this.time.addEvent({
      delay: 1500,
      loop: true,
      callback: () => this.spawnEnemy(),
    });

    // Colliders
    this.physics.add.collider(this.players, this.enemies, this.handleFight, null, this);
    this.physics.add.collider(this.enemies, this.playerBase, (a, b) => this.handleBaseAttack(a, b), null, this);
    this.physics.add.collider(this.players, this.enemyBase, (a, b) => this.handleBaseAttack(a, b), null, this);
    this.physics.add.overlap(this.projectiles, this.enemies, (proj, enemy) => this.handleProjectileHit(proj, enemy), null, this);

    // Timer update event
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });
  }

  // --- Background + boundary ---
  createBackground() {
    const g = this.add.graphics();
    g.lineStyle(1, 0x222222);
    for (let x = 0; x < 800; x += 50) g.lineBetween(x, 0, x, 600);
    for (let y = 0; y < 600; y += 50) g.lineBetween(0, y, 800, y);
  }

  drawBattleBoundary() {
    const g = this.add.graphics();
    g.lineStyle(4, 0x00ffff, 0.8);
    g.strokeRectShape(this.boundary);
  }

  // --- Avatar UI ---
  createAvatarButtons() {
    const avatars = [
      { type: "fullstack", label: "Fullstack (5c)", x: 150 },
      { type: "cybersec", label: "CyberSec (15c)", x: 350 },
      { type: "aiml", label: "AI/ML (30c)", x: 550 },
    ];
    this.avatarButtons = [];
    avatars.forEach((a) => {
      const rect = this.add.rectangle(a.x, 20, 150, 40, 0x444444).setInteractive();
      const txt = this.add.text(a.x, 20, a.label, { fontSize: "14px", fill: "#fff" }).setOrigin(0.5);
      rect.on("pointerdown", () => this.setSpawnType(a.type));
      rect.on("pointerover", () => rect.setFillStyle(0x666666));
      rect.on("pointerout", () => {
        if (this.spawnType !== a.type) rect.setFillStyle(0x444444);
      });
      this.avatarButtons.push({ type: a.type, rect, txt });
    });
    this.highlightSelected("fullstack");
  }

  highlightSelected(type) {
    this.avatarButtons.forEach((btn) => {
      btn.rect.setFillStyle(btn.type === type ? 0x8888ff : 0x444444);
    });
  }

  setSpawnType(type) {
    this.spawnType = type;
    this.highlightSelected(type);
  }

  // --- Player spawn ---
  trySpawn(y) {
    const costs = { fullstack: 5, cybersec: 15, aiml: 30 };
    if (this.coins < costs[this.spawnType]) return;
    this.coins -= costs[this.spawnType];
    this.updateCoinText();
    this.spawnPlayer(Phaser.Math.Clamp(y, this.boundary.top + 40, this.boundary.bottom - 40), this.spawnType);
  }

  spawnPlayer(y, type) {
    let color = 0x00ffff, hp = 12, atk = 2, speed = 140;
    if (type === "cybersec") { color = 0x00ff00; hp = 18; atk = 3; speed = 120; }
    if (type === "aiml") { color = 0xff88ff; hp = 14; atk = 2; speed = 150; }

    const unit = this.add.circle(this.boundary.left + 30, y, 15, color);
    this.physics.add.existing(unit);
    unit.body.setCollideWorldBounds(true).setBounce(0).setImmovable(false).setCircle(15);
    unit.body.onWorldBounds = true;

    unit.side = "player"; unit.type = type;
    unit.hp = hp; unit.maxHp = hp; unit.attack = atk; unit.speed = speed;
    unit.fighting = false; unit.attackingBase = false;
    unit.healthBar = this.add.graphics();
    this.updateHealthBar(unit);
    this.players.add(unit);
    
    // Breathing animation
    this.tweens.add({
      targets: unit,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    if (type === "cybersec") this.createPlayerFirewall(5000);
    if (type === "aiml") {
      unit.aiPulseTimer = this.time.addEvent({
        delay: 1600,
        loop: true,
        callback: () => {
          if (!unit.active) return;
          const target = this.findPriorityEnemyFor(unit);
          if (!target) return;
          const pulse = this.add.circle(unit.x, unit.y, 6, 0x00ffff);
          this.physics.add.existing(pulse);
          pulse.attack = 6;
          this.projectiles.add(pulse);
          this.physics.moveToObject(pulse, target, 300);
          this.time.delayedCall(2200, () => pulse.destroy());
        },
      });
    }
  }

  createPlayerFirewall(durationMs = 5000) {
    if (this.playerBaseShieldTimer) this.playerBaseShieldTimer.remove(false);
    else {
      this.playerShieldGraphic = this.add.rectangle(this.playerBase.x + 30, 300, 30, 180, 0x00ff88, 0.25);
      this.playerBaseShielded = true;
      // Shield animation
      this.tweens.add({
          targets: this.playerShieldGraphic,
          alpha: 0.7,
          duration: 500,
          yoyo: true,
          repeat: -1
      });
    }
    this.playerBaseShieldTimer = this.time.delayedCall(durationMs, () => {
      this.playerBaseShielded = false;
      this.playerShieldGraphic?.destroy();
      this.playerShieldGraphic = null;
      this.playerBaseShieldTimer = null;
    });
  }

  // --- Enemy spawn ---
  spawnEnemy() {
    const y = Phaser.Math.Between(this.boundary.top + 40, this.boundary.bottom - 40);
    const roll = Phaser.Math.Between(1, 100);
    let type = "weak";
    if (roll > 70 && roll <= 90) type = "medium";
    else if (roll > 90) type = "strong";

    let color = 0xff4444, hp = 10, atk = 1, speed = 120, size=15;
    if (type === "medium") { color = 0xffaa00; hp = 16; atk = 2; speed = 110; size=18; }
    if (type === "strong") { color = 0xaa00ff; hp = 20; atk = 3; speed = 130; size=22; }

    const unit = this.add.rectangle(this.boundary.right - 30, y, size, size, color);
    this.physics.add.existing(unit);
    unit.body.setCollideWorldBounds(true).setBounce(0).setImmovable(false);
    unit.body.onWorldBounds = true;

    unit.side = "enemy"; unit.type = type;
    unit.hp = hp; unit.maxHp = hp; unit.attack = atk; unit.speed = speed;
    unit.fighting = false; unit.attackingBase = false;
    unit.healthBar = this.add.graphics();
    this.updateHealthBar(unit);
    this.enemies.add(unit);

    // Wobble animation
    this.tweens.add({
        targets: unit,
        angle: 10,
        duration: 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });


    if (type === "strong") {
      unit.aiPulseTimer = this.time.addEvent({
        delay: 2000,
        loop: true,
        callback: () => {
          if (!unit.active) return;
          const target = this.findPriorityPlayerFor(unit);
          if (!target) return;
          const pulse = this.add.circle(unit.x, unit.y, 6, 0xff00ff);
          this.physics.add.existing(pulse);
          pulse.attack = 5;
          this.projectiles.add(pulse);
          this.physics.moveToObject(pulse, target, 250);
          this.time.delayedCall(2200, () => pulse.destroy());
        },
      });
    }

    this.physics.moveToObject(unit, this.playerBase, unit.speed);
  }

  // --- Drops ---
  spawnDrop(x, y) {
    if (!this.boundary.contains(x, y)) return;
    const drop = this.add.rectangle(x, y, 20, 20, 0xffff00);
    this.physics.add.existing(drop);
    drop.setInteractive();
    drop.isCertificate = true;
    this.drops.add(drop);
    // Drop animation
    this.tweens.add({
        targets: drop,
        y: y - 10,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    this.time.delayedCall(5000, () => { if (drop.active) drop.destroy(); });
  }

  tryPickDrop(pointer) {
    let picked = false;
    this.drops.getChildren().forEach((d) => {
      if (d.getBounds().contains(pointer.x, pointer.y)) {
        this.coins += 10;
        this.updateCoinText();
        this.bombEnemies(d.x, d.y);
        d.destroy();
        picked = true;
      }
    });
    return picked;
  }

  bombEnemies(x, y) {
    const explosion = this.add.circle(x, y, 10, 0xff0000, 0.5);
    // Explosion animation
    this.tweens.add({
        targets: explosion,
        radius: 80,
        alpha: 0,
        duration: 300,
        onComplete: () => explosion.destroy()
    });
    this.enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (dist <= 80) {
        enemy.hp -= 8;
        if (enemy.hp <= 0) {
          if (Phaser.Math.Between(1, 100) <= 30) this.spawnDrop(enemy.x, enemy.y);
          this.unitDeathEffect(enemy);
        }
      }
    });
  }
  
  updateTimer() {
    this.remainingTime--;
    this.gameTimerText.setText(`Time: ${Math.max(0, this.remainingTime)}`);
    if (this.remainingTime <= 0) {
      this.timerEvent.remove(false);
      this.handleGameEnd();
    }
  }

  // --- Update ---
  update() {
    if (this.isPaused) return;

    const clampUnit = (u) => {
      if (!u.active) return;
      // Laser boundary damage
      const laserDamage = 0.05;
      if (
        u.x <= this.boundary.left + 20 ||
        u.x >= this.boundary.right - 20 ||
        u.y <= this.boundary.top + 20 ||
        u.y >= this.boundary.bottom - 20
      ) {
        u.hp -= laserDamage;
        if (u.hp <= 0) {
            this.unitDeathEffect(u);
        }
      }

      u.x = Phaser.Math.Clamp(u.x, this.boundary.left + 20, this.boundary.right - 20);
      u.y = Phaser.Math.Clamp(u.y, this.boundary.top + 20, this.boundary.bottom - 20);
    };

    this.players.getChildren().forEach((u) => {
      if (!u.active) return;
      if (u.fighting) u.body.setVelocity(0, 0);
      else {
        const t = this.findPriorityEnemyFor(u);
        if (t) this.physics.moveToObject(u, t, u.speed);
        else this.physics.moveToObject(u, this.enemyBase, u.speed);
      }
      this.updateHealthBar(u);
      clampUnit(u);
    });

    this.enemies.getChildren().forEach((u) => {
      if (!u.active) return;
      if (u.fighting) u.body.setVelocity(0, 0);
      else {
        const t = this.findPriorityPlayerFor(u);
        if (t) this.physics.moveToObject(u, t, u.speed);
        else this.physics.moveToObject(u, this.playerBase, u.speed);
      }
      this.updateHealthBar(u);
      clampUnit(u);
    });
  }

  updateHealthBar(unit) {
    if (!unit.healthBar || !unit.active) return;
    unit.healthBar.clear();
    const w = 30, h = 4, x = unit.x - w / 2, y = unit.y - 25;
    const pct = Math.max(unit.hp / unit.maxHp, 0);
    unit.healthBar.fillStyle(0x222222).fillRect(x, y, w, h);
    unit.healthBar.fillStyle(0x00ff00).fillRect(x, y, w * pct, h);
  }

  // --- Helpers ---
  findPriorityEnemyFor(playerUnit) {
    const enemies = this.enemies.getChildren().filter(e => e.active);
    if (!enemies.length) return null;
    return enemies.reduce((a, b) =>
      Phaser.Math.Distance.Between(playerUnit.x, playerUnit.y, a.x, a.y) <
      Phaser.Math.Distance.Between(playerUnit.x, playerUnit.y, b.x, b.y) ? a : b
    );
  }

  findPriorityPlayerFor(enemyUnit) {
    const players = this.players.getChildren().filter(p => p.active);
    if (!players.length) return null;
    return players.reduce((a, b) =>
      Phaser.Math.Distance.Between(enemyUnit.x, enemyUnit.y, a.x, a.y) <
      Phaser.Math.Distance.Between(enemyUnit.x, enemyUnit.y, b.x, b.y) ? a : b
    );
  }
  
  unitDeathEffect(unit) {
    if (!unit.active) return;
    // Particle explosion
    for(let i = 0; i < 10; i++) {
        const particle = this.add.circle(unit.x, unit.y, Phaser.Math.Between(2,5), unit.fillColor);
        this.physics.add.existing(particle);
        particle.body.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200));
        this.tweens.add({
            targets: particle,
            alpha: 0,
            duration: 500,
            onComplete: () => particle.destroy()
        });
    }
    unit.healthBar?.destroy(); 
    unit.destroy();
  }

  // --- Fight + Base logic ---
  handleFight(a, b) {
    let player = a.side === "player" ? a : b.side === "player" ? b : null;
    let enemy = a.side === "enemy" ? a : b.side === "enemy" ? b : null;
    if (!player || !enemy || player.fighting || enemy.fighting) return;

    player.fighting = true; enemy.fighting = true;
    player.body.setVelocity(0, 0); enemy.body.setVelocity(0, 0);

    const fightTick = this.time.addEvent({
      delay: 400,
      loop: true,
      callback: () => {
        if (!player.active || !enemy.active) {
          fightTick.remove(false);
          if (player.active) player.fighting = false;
          if (enemy.active) enemy.fighting = false;
          return;
        }

        const dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
        if (dist > 60) {
          player.fighting = false;
          enemy.fighting = false;
          fightTick.remove(false);
          return;
        }
        
        // Attack animation
        this.tweens.add({ targets: player, scaleX: 1.3, scaleY: 1.3, duration: 100, yoyo: true });
        this.tweens.add({ targets: enemy, angle: enemy.angle + 20, duration: 100, yoyo: true });

        player.hp -= enemy.attack;
        enemy.hp -= player.attack;

        if (enemy.hp <= 0) {
          if (Phaser.Math.Between(1, 100) <= 30) this.spawnDrop(enemy.x, enemy.y);
          this.unitDeathEffect(enemy);
          this.coins += 3; this.updateCoinText();
          player.fighting = false;
          fightTick.remove(false);
        }
        if (player.hp <= 0) {
          this.unitDeathEffect(player);
          enemy.fighting = false;
          fightTick.remove(false);
        }
      },
    });
  }

  handleBaseAttack(obj1, obj2) {
    let unit = obj1.side ? obj1 : obj2.side ? obj2 : null;
    let base = unit === obj1 ? obj2 : obj1;
    if (!unit || !unit.active || unit.attackingBase) return;

    unit.fighting = true; unit.attackingBase = true;
    unit.body.setVelocity(0, 0);

    const tick = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        if (!unit.active) { tick.remove(false); return; }
        // Base attack animation
        const isPlayerBase = base === this.playerBase;
        const hitEffect = this.add.circle(
            isPlayerBase ? base.x + 20 : base.x - 20, 
            unit.y, 10, 
            isPlayerBase ? 0xff0000 : 0x00ffff
        );
        this.tweens.add({targets: hitEffect, alpha: 0, duration: 200, onComplete: () => hitEffect.destroy()});

        if (isPlayerBase) {
          const dmg = unit.attack * (this.playerBaseShielded ? 0.5 : 1);
          this.playerBaseHP -= dmg;
          this.playerBaseText.setText("Job HP: " + Math.ceil(Math.max(this.playerBaseHP, 0)));
          if (this.playerBaseHP <= 0) this.endGame("AI Wins! You're outsourced!");
        } else {
          this.enemyBaseHP -= unit.attack;
          this.enemyBaseText.setText("AI HP: " + Math.ceil(Math.max(this.enemyBaseHP, 0)));
          if (this.enemyBaseHP <= 0) this.endGame("You Win! The Job is safe!");
        }
      },
    });
  }

  handleProjectileHit(proj, enemy) {
    if (!proj.active || !enemy.active) return;
    enemy.hp -= proj.attack ?? 6;
    proj.destroy();
    if (enemy.hp <= 0) {
      if (Phaser.Math.Between(1, 100) <= 30) this.spawnDrop(enemy.x, enemy.y);
      this.unitDeathEffect(enemy);
      this.coins += 3; this.updateCoinText();
    }
  }

  updateCoinText() {
    this.coinText.setText(`Coins: ${this.coins}`);
  }

  handleGameEnd() {
    let message = "Time's up! It's a draw.";
    if (this.playerBaseHP > this.enemyBaseHP) {
      message = "You Win! The Job is safe!";
    } else if (this.enemyBaseHP > this.playerBaseHP) {
      message = "AI Wins! You're outsourced!";
    }
    this.endGame(message);
  }

  endGame(msg) {
    if(this.isPaused) return;
    this.isPaused = true;
    this.physics.pause();
    this.time.removeAllEvents();
    this.onGameEnd(msg);
  }
}

export default function Game() {
  const phaserGame = useRef(null);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [gameMessage, setGameMessage] = useState(null);
  const [gameDuration, setGameDuration] = useState(60);

  const startGame = () => {
    setGameMessage(null);
    setIsGameRunning(true);
  };

  const quitGame = () => {
    if (phaserGame.current) {
        phaserGame.current.destroy(true);
        phaserGame.current = null;
    }
    setIsGameRunning(false);
    setGameMessage(null);
  };

  useEffect(() => {
    if (isGameRunning && !phaserGame.current) {
       class GameScene extends BattleScene {
        constructor() {
          super(setGameMessage, gameDuration);
        }
      }
      
      const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        backgroundColor: "#111133",
        physics: { default: "arcade", arcade: { gravity: { y: 0 }, debug: false } },
        scene: GameScene,
        parent: "phaser-container",
      };
      phaserGame.current = new Phaser.Game(config);
    }

    return () => {
      if (phaserGame.current) {
        phaserGame.current.destroy(true);
      }
    };
  }, [isGameRunning, gameDuration]);
  
  const durations = [20, 40, 60, 120];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div id="phaser-container" className="relative w-full max-w-4xl rounded-lg shadow-lg overflow-hidden border-4 border-cyan-400" style={{width: '800px', height: '600px'}}>
        {!isGameRunning && !gameMessage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black bg-opacity-70">
            <div className="text-center p-4">
              <h1 className="text-5xl md:text-6xl font-bold mb-8 text-cyan-400">BrawlBots</h1>
              <p className="text-lg md:text-xl mb-8">Defend the Job from the AI onslaught!</p>
            </div>
          </div>
        )}
        {gameMessage && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-black bg-opacity-80 p-10 rounded-xl shadow-2xl text-center animate-pulse">
              <h2 className="text-5xl md:text-6xl font-extrabold mb-6 text-yellow-400 drop-shadow-lg">{gameMessage}</h2>
              <button
                onClick={quitGame}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-8 flex flex-col items-center space-y-4">
        <div className="flex space-x-2">
          {durations.map((d) => (
            <button
              key={d}
              onClick={() => setGameDuration(d)}
              className={`py-2 px-4 rounded-full font-bold transition-colors duration-200 ${
                gameDuration === d ? "bg-blue-600 text-white shadow-md" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              disabled={isGameRunning}
            >
              {d}s
            </button>
          ))}
        </div>
        {!isGameRunning ? (
          <button
            onClick={startGame}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Start Game
          </button>
        ) : (
          <button
            onClick={quitGame}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Quit
          </button>
        )}
      </div>
    </div>
  );
}
// SECOND ANMATED FINALIZED
