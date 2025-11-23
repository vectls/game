import Player from "./Player.js";
import Enemy from "./Enemy.js";
import Laser from "./Laser.js";
import Missile from "./Missile.js";

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    this.score = 0;
    this.isGameOver = false;
    this.isGameClear = false;
  }

  preload() {
    // --- アセットのロード ---

    // Texture Atlas (Kenneyのsheet.png + sheet.xml/html)
    this.load.atlasXML(
      "space",
      "assets/sprites/sheet.png",
      "assets/sprites/sheet.xml"
    );

    // 背景画像
    this.load.image("background", "assets/images/background.png");

    // 爆発用スプライトはまだ用意していないのでコメントアウト
    // this.load.spritesheet("explosion", "assets/explosion.png", {
    //   frameWidth: 64,
    //   frameHeight: 64,
    // });
  }

  create() {
    console.log(this.textures.get("space").getFrameNames());

    // 背景
    this.add.image(400, 300, "background");

    // 爆発アニメーションは未使用なのでコメントアウト
    // this.anims.create({
    //   key: "explode",
    //   frames: this.anims.generateFrameNumbers("explosion", {
    //     start: 0,
    //     end: 15,
    //   }),
    //   frameRate: 20,
    //   repeat: 0,
    //   hideOnComplete: true,
    // });

    // プレイヤー（cockpitBlue_0.png）
    this.player = new Player(this, 400, 550, "space", "playerShip1_blue.png");

    // プレイヤーレーザーグループ
    this.playerLasers = this.physics.add.group({
      classType: Laser,
      maxSize: 10,
      runChildUpdate: true,
    });

    // 敵グループ
    this.enemies = this.physics.add.group({
      classType: Enemy,
      runChildUpdate: true,
    });

    // 敵1（cockpitRed_0.png）
    const enemy1 = new Enemy(this, 150, 100, "space", "enemyGreen1.png", 3);
    this.enemies.add(enemy1);
    enemy1.startMovement(() =>
      this.tweens.add({
        targets: enemy1,
        x: Phaser.Math.Between(50, 750),
        y: Phaser.Math.Between(50, 250),
        duration: Phaser.Math.Between(2000, 4000),
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
        onRepeat: () => enemy1.fireMissile(this.player.x, this.player.y),
      })
    );
    enemy1.setFlipY(true);

    // 敵2（cockpitGreen_0.png）
    const enemy2 = new Enemy(this, 400, 150, "space", "enemyGreen1.png", 5);
    this.enemies.add(enemy2);

    // 敵3（cockpitBlue_3.png）
    const enemy3 = new Enemy(this, 650, 100, "space", "enemyRed1.png", 2);
    this.enemies.add(enemy3);

    // 敵4：高速移動型
    const fastEnemy = new Enemy(this, 300, 80, "space", "enemyBlue2.png", 2);
    this.enemies.add(fastEnemy);
    fastEnemy.startMovement(() =>
      this.tweens.add({
        targets: fastEnemy,
        x: Phaser.Math.Between(50, 750),
        duration: 1000,
        ease: "Power2",
        yoyo: true,
        repeat: -1,
      })
    );

    // 敵ミサイルグループ
    this.enemyMissiles = this.physics.add.group({
      classType: Missile,
      maxSize: 20,
      runChildUpdate: true,
    });

    // キーボード入力
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on("keydown-SPACE", this.player.fireLaser, this.player);

    // 当たり判定
    this.physics.add.overlap(
      this.playerLasers,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );
    this.physics.add.overlap(
      this.enemyMissiles,
      this.player,
      this.hitPlayer,
      null,
      this
    );

    // UI
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "24px",
      fill: "#fff",
    });
    this.playerHealthText = this.add.text(
      16,
      48,
      `Player Health: ${this.player.health}`,
      { fontSize: "24px", fill: "#fff" }
    );
  }

  update() {
    if (this.isGameOver || this.isGameClear) {
      return;
    }

    // プレイヤー更新
    this.player.update(this.cursors);

    // UI更新
    this.playerHealthText.setText(`Player Health: ${this.player.health}`);

    // ゲームクリア判定
    if (this.enemies.countActive(true) === 0) {
      this.gameClear();
    }
  }

  // --- 当たり判定処理 ---
  hitEnemy(laser, enemy) {
    laser.destroy(); // レーザー削除
    enemy.takeDamage(1); // 敵にダメージ

    if (!enemy.active) {
      // 敵が倒された場合
      this.playExplosion(enemy.x, enemy.y);
      this.score += 100;
      this.scoreText.setText(`Score: ${this.score}`);
    }
  }

  hitPlayer(player, missile) {
    missile.destroy(); // ミサイル削除
    player.takeDamage(1); // プレイヤーにダメージ

    if (!player.active) {
      // プレイヤーが倒された場合
      this.playExplosion(player.x, player.y);
      this.gameOver();
    }
  }

  // --- 爆発演出（ダミー） ---
  playExplosion(x, y) {
    // 爆発画像がないので赤い円をフェードアウトさせる
    const circle = this.add.circle(x, y, 20, 0xff0000);
    this.tweens.add({
      targets: circle,
      alpha: 0,
      duration: 500,
      onComplete: () => circle.destroy(),
    });
  }

  gameOver() {
    this.isGameOver = true;
    this.physics.pause(); // 物理エンジン停止
    this.player.setVisible(false);
    this.add
      .text(400, 300, "GAME OVER", { fontSize: "64px", fill: "#f00" })
      .setOrigin(0.5);
  }

  gameClear() {
    this.isGameClear = true;
    this.physics.pause(); // 物理エンジン停止
    this.add
      .text(400, 300, "GAME CLEAR!", { fontSize: "64px", fill: "#0f0" })
      .setOrigin(0.5);
  }
}

export default GameScene;
