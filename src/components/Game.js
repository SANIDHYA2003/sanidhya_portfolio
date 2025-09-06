import React, { useEffect, useRef, useState } from "react";
import * as Phaser from "phaser";

class BattleScene extends Phaser.Scene {
  constructor(onGameEnd, gameDuration) {
    super("BattleScene");
    this.onGameEnd = onGameEnd;
    this.gameDuration = gameDuration;
    this.remainingTime = gameDuration;
  }

  preload() {
    // ===== PLAYER (knight) — individual frames =====
// ===== FULLSTACK PLAYER (Biker) — sprite sheets =====
this.load.spritesheet("fs_idle", "game_asset/fullstack_player/Biker_idle.png", {
  frameWidth: 48,   // adjust based on actual sheet
  frameHeight: 48,
});
this.load.spritesheet("fs_run", "game_asset/fullstack_player/Biker_run.png", {
  frameWidth: 48,   // adjust based on actual sheet
  frameHeight: 48,
});
this.load.spritesheet("fs_attack", "game_asset/fullstack_player/Biker_attack3.png", {
  frameWidth: 48,   // adjust based on actual sheet
  frameHeight: 48,
});
this.load.spritesheet("fs_death", "game_asset/fullstack_player/Biker_death.png", {
  frameWidth: 48,   // adjust based on actual sheet
  frameHeight: 48,
});
this.load.spritesheet("fs_hurt", "game_asset/fullstack_player/Biker_hurt.png", {
  frameWidth: 48,   // adjust based on actual sheet
  frameHeight: 48,
});

// ===== PLAYER CYBORG (ranged strongest) =====
this.load.spritesheet("cyborg_idle", "game_asset/cyborg/Cyborg_idle.png", {
  frameWidth: 48,
  frameHeight: 48,
});
this.load.spritesheet("cyborg_run", "game_asset/cyborg/Cyborg_run.png", {
  frameWidth: 48,
  frameHeight: 48,
});
this.load.spritesheet("cyborg_attack", "game_asset/cyborg/Cyborg_attack3.png", {
  frameWidth: 48,
  frameHeight: 48,
});
this.load.spritesheet("cyborg_death", "game_asset/cyborg/Cyborg_death.png", {
  frameWidth: 48,
  frameHeight: 48,
});
this.load.spritesheet("cyborg_hurt", "game_asset/cyborg/Cyborg_hurt.png", {
  frameWidth: 48,
  frameHeight: 48,
});



for (let i = 1; i <= 10; i++) this.load.image(`e_idle${i}`, `game_asset/png/Idle_${i}.png`);
for (let i = 1; i <= 8; i++) this.load.image(`e_run${i}`, `game_asset/png/Run_${i}.png`);
for (let i = 1; i <= 8; i++) this.load.image(`e_attack${i}`, `game_asset/png/Melee_${i}.png`);
for (let i = 1; i <= 10; i++) this.load.image(`e_dead${i}`, `game_asset/png/Dead_${i}.png`);

    // ===== ENEMY (robot) — sprite sheets =====
    this.load.spritesheet("robot_idle", "game_asset/robot_melee/Idle.png", {
  frameWidth: 96,
  frameHeight: 96,
    });
    this.load.spritesheet("robot_walk", "game_asset/robot_melee/Walk.png", {
  frameWidth: 96,
  frameHeight: 96,
    });
    this.load.spritesheet("robot_attack", "game_asset/robot_melee/Attack3.png", {
  frameWidth: 96,
  frameHeight: 96,
    });
    this.load.spritesheet("robot_death", "game_asset/robot_melee/Death.png", {
  frameWidth: 96,
  frameHeight: 96,
    });
    this.load.spritesheet("robot_hurt", "game_asset/robot_melee/Hurt.png", {
  frameWidth: 96,
  frameHeight: 96,
    });
  }

  // ---- helpers ----
  hasAnim(key) {
    const anim = this.anims.get(key);
    return !!(anim && anim.frames && anim.frames.length > 0);
  }

  // map "idle/run/attack/dead" => side-specific anim keys
// map "idle/run/attack/dead" => side+type-specific anim keys
animKey(unit, action) {
  if (!unit) return null;

    // Fullstack player (biker)
    if (unit.type === "fullstack") {
      if (action === "idle") return "fs_idle";
      if (action === "run") return "fs_run";
      if (action === "attack") return "fs_attack";
      if (action === "dead") return "fs_dead";}

    if (unit.type === "cyborg") {
      if (action === "idle") return "c_idle";
      if (action === "run") return "c_run";
      if (action === "attack") return "c_attack";
      if (action === "dead") return "c_dead";
    }

      
  // ENEMIES
  if (unit.side === "enemy") {
    if (unit.type === "weak") {
      // weak = knight-style
      if (action === "idle") return "e_idle";
      if (action === "run") return "e_run";
      if (action === "attack") return "e_attack";
      if (action === "dead") return "e_dead";
    } else {
      // medium/strong = robot-style
      if (action === "idle") return "r_idle";
      if (action === "run") return "r_walk";
      if (action === "attack") return "r_attack";
      if (action === "dead") return "r_dead";
    }
  }

  return null;
}

  firstFrameKeyFor(key) {
    // Only used if an animation is missing; give a safe still-frame fallback
    if (["p_idle", "p_run", "p_attack", "p_dead"].includes(key)) {
      if (key === "p_idle") return "idle1";
      if (key === "p_run") return "run1";
      if (key === "p_attack") return "attack1";
      if (key === "p_dead") return "dead1";
    }
    // robots always use sheets, so no static key fallback here
    return null;
  }

  safePlay(sprite, key, ignoreIfPlaying = false) {
    if (!sprite || !sprite.active) return;
    if (this.hasAnim(key)) {
      sprite.anims?.play(key, ignoreIfPlaying);
    } else {
      const fallback = this.firstFrameKeyFor(key);
      if (fallback && this.textures.exists(fallback)) sprite.setTexture(fallback);
    }
  }

  verifyAssets() {
    const mustHave = [
      ...Array.from({ length: 10 }, (_, i) => `idle${i + 1}`),
      ...Array.from({ length: 8 }, (_, i) => `run${i + 1}`),
      ...Array.from({ length: 8 }, (_, i) => `attack${i + 1}`),
      ...Array.from({ length: 10 }, (_, i) => `dead${i + 1}`),
    ];
    const missing = mustHave.filter((k) => !this.textures.exists(k));
    if (missing.length) console.warn("[assets] Missing player textures:", missing);
  }

  die(unit) {
    if (!unit || !unit.active) return;
    const k = this.animKey(unit, "dead");
    if (this.hasAnim(k)) {
      this.safePlay(unit, k);
      unit.once("animationcomplete", () => unit.destroy());
    } else {
      this.time.delayedCall(120, () => unit.destroy());
    }
    if (unit.healthBar) unit.healthBar.destroy();
  }

  create() {


    //enemyknights for weak

    this.anims.create({
  key: "e_idle",
  frames: Array.from({ length: 10 }, (_, i) => ({ key: `e_idle${i + 1}` })),
  frameRate: 6,
  repeat: -1,
});
this.anims.create({
  key: "e_run",
  frames: Array.from({ length: 8 }, (_, i) => ({ key: `e_run${i + 1}` })),
  frameRate: 10,
  repeat: -1,
});
this.anims.create({
  key: "e_attack",
  frames: Array.from({ length: 8 }, (_, i) => ({ key: `e_attack${i + 1}` })),
  frameRate: 12,
  repeat: 0,
});
this.anims.create({
  key: "e_dead",
  frames: Array.from({ length: 10 }, (_, i) => ({ key: `e_dead${i + 1}` })),
  frameRate: 10,
  repeat: 0,
});

    // Verify knight frames loaded
    this.verifyAssets();

   // ===== FULLSTACK PLAYER ANIMS =====
this.anims.create({
  key: "fs_idle",
  frames: this.anims.generateFrameNumbers("fs_idle", { start: 0, end: 3 }),
  frameRate: 6,
  repeat: -1,
});
this.anims.create({
  key: "fs_run",
  frames: this.anims.generateFrameNumbers("fs_run", { start: 0, end: 5 }),
  frameRate: 10,
  repeat: -1,
});
this.anims.create({
  key: "fs_attack",
  frames: this.anims.generateFrameNumbers("fs_attack", { start: 0, end: 5 }),
  frameRate: 12,
  repeat: 0,
});
this.anims.create({
  key: "fs_dead",
  frames: this.anims.generateFrameNumbers("fs_death", { start: 0, end: 5 }),
  frameRate: 10,
  repeat: 0,
});
this.anims.create({
  key: "fs_hurt",
  frames: this.anims.generateFrameNumbers("fs_hurt", { start: 0, end: 1 }),
  frameRate: 8,
  repeat: 0,
});

// ===== CYBORG ANIMS =====
this.anims.create({
  key: "c_idle",
  frames: this.anims.generateFrameNumbers("cyborg_idle", { start: 0, end: 3 }),
  frameRate: 6,
  repeat: -1,
});
this.anims.create({
  key: "c_run",
  frames: this.anims.generateFrameNumbers("cyborg_run", { start: 0, end: 5 }),
  frameRate: 10,
  repeat: -1,
});
this.anims.create({
  key: "c_attack",
  frames: this.anims.generateFrameNumbers("cyborg_attack", { start: 0, end: 6 }),
  frameRate: 12,
  repeat: 0,
});
this.anims.create({
  key: "c_dead",
  frames: this.anims.generateFrameNumbers("cyborg_death", { start: 0, end: 5 }),
  frameRate: 10,
  repeat: 0,
});
this.anims.create({
  key: "c_hurt",
  frames: this.anims.generateFrameNumbers("cyborg_hurt", { start: 0, end: 1 }),
  frameRate: 8,
  repeat: 0,
});


    // ===== ROBOT ANIMS (from sheets) =====
    this.anims.create({
      key: "r_idle",
      frames: this.anims.generateFrameNumbers("robot_idle", { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "r_walk",
      frames: this.anims.generateFrameNumbers("robot_walk", { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "r_attack",
      frames: this.anims.generateFrameNumbers("robot_attack", { start: 0, end: 5 }),
      frameRate: 12,
      repeat: 0,
    });
    this.anims.create({
      key: "r_dead",
      frames: this.anims.generateFrameNumbers("robot_death", { start: 0, end: 5 }),
      frameRate: 10,
      repeat: 0,
    });
    this.anims.create({
      key: "r_hurt",
      frames: this.anims.generateFrameNumbers("robot_hurt", { start: 0, end: 1 }),
      frameRate: 8,
      repeat: 0,
    });

    // ===== GAME STATE =====
    this.isPaused = false;
    this.players = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.drops = this.physics.add.group();

    this.coins = 15;
    this.spawnType = "fullstack";

    // Battlefield
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

    // Input
    this.input.on("pointerdown", (pointer) => {
      if (this.isPaused) return;
      if (this.tryPickDrop(pointer)) return;
      if (this.boundary.contains(pointer.x, pointer.y)) this.trySpawn(pointer.y);
    });

    // Colliders
    this.physics.add.collider(this.players, this.enemies, this.handleFight, null, this);
    this.physics.add.collider(this.enemies, this.playerBase, (a, b) => this.handleBaseAttack(a, b), null, this);
    this.physics.add.collider(this.players, this.enemyBase, (a, b) => this.handleBaseAttack(a, b), null, this);
    this.physics.add.overlap(this.projectiles, this.enemies, (proj, enemy) => this.handleProjectileHit(proj, enemy), null, this);

    // Timer
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // Enemy spawns
this.time.delayedCall(500, () => {
  this.time.addEvent({
    delay: 1500,
    loop: true,
    callback: () => {
      // Pick a random enemy type
      const enemyTypes = ["weak", "medium", "strong"];
      const type = Phaser.Utils.Array.GetRandom(enemyTypes);

      // Pick a random y inside the battlefield
      const y = Phaser.Math.Between(this.boundary.top + 40, this.boundary.bottom - 40);

      this.spawnEnemy(y, type);
    },
  });
});

  }
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

  createAvatarButtons() {
    const avatars = [
      { type: "fullstack", label: "Fullstack (5c)", x: 150 },
      { type: "cybersec", label: "CyberSec (15c)", x: 350 },
      { type: "cyborg", label: "AI/ML (5c)", x: 550 },
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

  trySpawn(y) {
    const costs = { fullstack: 5, cybersec: 15, aiml: 30 };
    if (this.coins < costs[this.spawnType]) return;
    this.coins -= costs[this.spawnType];
    this.updateCoinText();
    this.spawnPlayer(Phaser.Math.Clamp(y, this.boundary.top + 40, this.boundary.bottom - 40), this.spawnType);
  }

spawnPlayer(y, type) {
  let hp = 12, atk = 2, speed = 140;
  let unit;

  if (type === "cybersec") {
    hp = 18; atk = 3; speed = 120;
  }
  if (type === "cyborg") {
    hp = 26; atk = 5; speed = 100; // 🔥 strongest
  }

  if (type === "cyborg") {
    unit = this.add.sprite(this.boundary.left + 30, y, "cyborg_idle", 0).setScale(1.2);
    this.physics.add.existing(unit);
    this.safePlay(unit, "c_run");
  } else {
    unit = this.add.sprite(this.boundary.left + 30, y, "idle1").setScale(0.8);
    this.physics.add.existing(unit);
    this.safePlay(unit, "p_run");
  }

  // Players face right
  unit.setFlipX(false);

  // Physics
  unit.body.setCollideWorldBounds(true).setBounce(0).setImmovable(false);
  unit.body.onWorldBounds = true;

  // Stats
  unit.side = "player";
  unit.type = type;
  unit.hp = hp;
  unit.maxHp = hp;
  unit.attack = atk;
  unit.speed = speed;
  unit.fighting = false;
  unit.attackingBase = false;
  unit.healthBar = this.add.graphics();
  this.updateHealthBar(unit);
  this.players.add(unit);

  // ✅ Cyborg ranged attack logic
  if (type === "cyborg") {
    unit.shootTimer = this.time.addEvent({
      delay: 1400,
      loop: true,
      callback: () => {
        if (!unit.active) return;
        const target = this.findPriorityEnemyFor(unit);
        if (!target) return;

        // Fire projectile
        const projectile = this.add.circle(unit.x, unit.y, 5, 0x00ff00);
        this.physics.add.existing(projectile);
        projectile.attack = unit.attack * 2; // 🔥 stronger damage
        this.projectiles.add(projectile);

        this.physics.moveToObject(projectile, target, 300);

        this.time.delayedCall(2200, () => projectile.destroy());
        this.safePlay(unit, "c_attack");
      },
    });
  }

  // Adjust collision box
  unit.body.setSize(unit.width * 0.35, unit.height * 0.75);
  unit.body.setOffset(unit.width * 0.32, unit.height * 0.25);

  return unit;
}


  createPlayerFirewall(durationMs = 5000) {
    if (this.playerBaseShieldTimer) this.playerBaseShieldTimer.remove(false);
    else {
      this.playerShieldGraphic = this.add.rectangle(this.playerBase.x + 30, 300, 30, 180, 0x00ff88, 0.25);
      this.playerBaseShielded = true;
    }
    this.playerBaseShieldTimer = this.time.delayedCall(durationMs, () => {
      this.playerBaseShielded = false;
      this.playerShieldGraphic?.destroy();
      this.playerShieldGraphic = null;
      this.playerBaseShieldTimer = null;
    });
  }

spawnEnemy(y, type) {
  let hp = 12, atk = 2, speed = 120;
  if (type === "medium") { hp = 18; atk = 3; speed = 100; }
  if (type === "strong") { hp = 24; atk = 4; speed = 80; }

  let unit;

  if (type === "weak") {
    // === Weak enemy (knight-style) ===
    unit = this.add.sprite(this.boundary.right - 30, y, "e_idle").setScale(0.1);
    this.physics.add.existing(unit);
    this.safePlay(unit, "e_run");
    unit.setFlipX(true);
  } else {
    // === Medium / Strong enemy (robot-style) ===
    unit = this.add.sprite(this.boundary.right - 30, y, "robot_idle", 0).setScale(0.9);
    this.physics.add.existing(unit);
    this.safePlay(unit, "r_walk");
    unit.setFlipX(true);
  }

  // Physics
  unit.body.setCollideWorldBounds(true).setBounce(0).setImmovable(false);
  unit.body.onWorldBounds = true;

  // Stats
  unit.side = "enemy";
  unit.type = type;
  unit.hp = hp;
  unit.maxHp = hp;
  unit.attack = atk;
  unit.speed = speed;
  unit.fighting = false;
  unit.attackingBase = false;

  // Health bar
  unit.healthBar = this.add.graphics();
  this.updateHealthBar(unit);
  this.enemies.add(unit);

  // ✅ Adjust hitbox
  unit.body.setSize(unit.width * 0.35, unit.height * 0.75);
  unit.body.setOffset(unit.width * 0.32, unit.height * 0.25);
}



  spawnDrop(x, y) {
    if (!this.boundary.contains(x, y)) return;
    const drop = this.add.rectangle(x, y, 20, 20, 0xffff00);
    this.physics.add.existing(drop);
    drop.setInteractive();
    drop.isCertificate = true;
    this.drops.add(drop);
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
    const explosion = this.add.circle(x, y, 40, 0xff0000, 0.5);
    this.time.delayedCall(300, () => explosion.destroy());
    this.enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (dist <= 80) {
        enemy.hp -= 8;
        if (enemy.hp <= 0) {
          if (Phaser.Math.Between(1, 100) <= 30) this.spawnDrop(enemy.x, enemy.y);
          this.die(enemy);
          this.coins += 3; this.updateCoinText();
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

  update() {
    if (this.isPaused) return;

    const clampUnit = (u) => {
      if (!u.active) return;
      const laserDamage = 0.05;
      if (
        u.x <= this.boundary.left + 20 ||
        u.x >= this.boundary.right - 20 ||
        u.y <= this.boundary.top + 20 ||
        u.y >= this.boundary.bottom - 20
      ) {
        u.hp -= laserDamage;
        if (u.hp <= 0) this.die(u);
      }

      u.x = Phaser.Math.Clamp(u.x, this.boundary.left + 20, this.boundary.right - 20);
      u.y = Phaser.Math.Clamp(u.y, this.boundary.top + 20, this.boundary.bottom - 20);
    };

    this.players.getChildren().forEach((u) => {
      if (!u.active) return;
      if (u.fighting) {
        u.body.setVelocity(0, 0);
      } else {
        this.safePlay(u, this.animKey(u, "run"), true);
        const t = this.findPriorityEnemyFor(u);
        if (t) this.physics.moveToObject(u, t, u.speed);
        else this.physics.moveToObject(u, this.enemyBase, u.speed);
      }
      this.updateHealthBar(u);
      clampUnit(u);
    });

    this.enemies.getChildren().forEach((u) => {
      if (!u.active) return;
      if (u.fighting) {
        u.body.setVelocity(0, 0);
      } else {
        this.safePlay(u, this.animKey(u, "run"), true);
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
    const w = 40, h = 5, x = unit.x - w / 2, y = unit.y - 30;
    const pct = Math.max(unit.hp / unit.maxHp, 0);
    unit.healthBar.fillStyle(0x222222).fillRect(x, y, w, h);
    unit.healthBar.fillStyle(0x00ff00).fillRect(x, y, w * pct, h);
  }

  findPriorityEnemyFor(playerUnit) {
    const enemies = this.enemies.getChildren().filter((e) => e.active);
    if (!enemies.length) return null;
    return enemies.reduce((a, b) =>
      Phaser.Math.Distance.Between(playerUnit.x, playerUnit.y, a.x, a.y) <
      Phaser.Math.Distance.Between(playerUnit.x, playerUnit.y, b.x, b.y) ? a : b
    );
  }

  findPriorityPlayerFor(enemyUnit) {
    const players = this.players.getChildren().filter((p) => p.active);
    if (!players.length) return null;
    return players.reduce((a, b) =>
      Phaser.Math.Distance.Between(enemyUnit.x, enemyUnit.y, a.x, a.y) <
      Phaser.Math.Distance.Between(enemyUnit.x, enemyUnit.y, b.x, b.y) ? a : b
    );
  }

  // ====== COMBAT ======
  handleFight(a, b) {
    let player = a.side === "player" ? a : b.side === "player" ? b : null;
    let enemy = a.side === "enemy" ? a : b.side === "enemy" ? b : null;
    if (!player || !enemy || player.fighting || enemy.fighting) return;

    player.fighting = true; enemy.fighting = true;
    player.body.setVelocity(0, 0); enemy.body.setVelocity(0, 0);

    this.safePlay(player, this.animKey(player, "attack"), true);
    this.safePlay(enemy, this.animKey(enemy, "attack"), true);

    const fightTick = this.time.addEvent({
      delay: 800,
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

        this.safePlay(player, this.animKey(player, "attack"));
        this.safePlay(enemy, this.animKey(enemy, "attack"));

        player.hp -= enemy.attack;
        enemy.hp -= player.attack;

        if (enemy.hp <= 0) {
          if (Phaser.Math.Between(1, 100) <= 30) this.spawnDrop(enemy.x, enemy.y);
          this.die(enemy);
          this.coins += 3; this.updateCoinText();
          player.fighting = false;
          fightTick.remove(false);
        }
        if (player.hp <= 0) {
          this.die(player);
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
    this.safePlay(unit, this.animKey(unit, "attack"), true);

    const tick = this.time.addEvent({
      delay: 800,
      loop: true,
      callback: () => {
        if (!unit.active) { tick.remove(false); return; }

        this.safePlay(unit, this.animKey(unit, "attack"), true);

        if (base === this.playerBase) {
          const dmg = unit.attack * (this.playerBaseShielded ? 0.5 : 1);
          this.playerBaseHP -= dmg;
          this.playerBaseText.setText("Job HP: " + Math.max(0, Math.ceil(this.playerBaseHP)));
          if (this.playerBaseHP <= 0) this.endGame("AI Wins! You're outsourced!");
        } else {
          this.enemyBaseHP -= unit.attack;
          this.enemyBaseText.setText("AI HP: " + Math.max(0, Math.ceil(this.enemyBaseHP)));
          if (this.enemyBaseHP <= 0) this.endGame("You Win! The Job is safe!");
        }
      },
    });
  }

  // ===== projectiles =====
  handleProjectileHit(proj, enemy) {
    if (!proj.active || !enemy.active) return;
    enemy.hp -= proj.attack ?? 6;
    proj.destroy();
    if (enemy.hp <= 0) {
      if (Phaser.Math.Between(1, 100) <= 30) this.spawnDrop(enemy.x, enemy.y);
      this.die(enemy);
      this.coins += 3; this.updateCoinText();
    }
  }

  updateCoinText() {
    this.coinText.setText(`Coins: ${this.coins}`);
  }

  handleGameEnd() {
    let message = "Time's up! It's a draw.";
    if (this.playerBaseHP > this.enemyBaseHP) message = "You Win! The Job is safe!";
    else if (this.enemyBaseHP > this.playerBaseHP) message = "AI Wins! You're outsourced!";
    this.endGame(message);
  }

  endGame(msg) {
    if (this.isPaused) return;
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
    if (phaserGame.current?.scene?.scenes[0]?.isPaused) {
      phaserGame.current.scene.resume("BattleScene");
    }
    phaserGame.current?.destroy(true);
    phaserGame.current = null;
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
        physics: {
          default: "arcade",
          arcade: { gravity: { y: 0 }, debug: false }
        },
        scene: GameScene,
        parent: "phaser-container",
        pixelArt: true
      };
      phaserGame.current = new Phaser.Game(config);
    }

    return () => {
      if (phaserGame.current) {
        phaserGame.current.destroy(true);
        phaserGame.current = null;
      }
    };
  }, [isGameRunning, gameDuration]);

  const durations = [20, 40, 60, 120];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div
        id="phaser-container"
        className="relative w-full max-w-4xl rounded-lg shadow-lg overflow-hidden border-4 border-cyan-400"
        style={{ width: "800px", height: "600px" }}
      >
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
