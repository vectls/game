import { ASSET_KEYS } from "./ASSET_KEYS.js"; // ★修正: ASSET_KEYSをインポート
import Player from "./Player.js";
import Enemy from "./Enemy.js";
import Laser from "./Laser.js";
import Missile from "./Missile.js";

// --- 設定定数 ---
// ASSET_KEYS の定義は削除（ASSET_KEYS.js に移動）

const GAME_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  SCORE_PER_ENEMY: 100,
};

// 敵の配置データ（レベルデザイン）
const ENEMY_WAVE_DATA = [
  { type: "sine", x: 150, y: 100, sprite: ASSET_KEYS.SPRITES.ENEMY_GREEN, health: 3 },
  { type: "static", x: 400, y: 150, sprite: ASSET_KEYS.SPRITES.ENEMY_GREEN, health: 5 },
  { type: "static", x: 650, y: 100, sprite: ASSET_KEYS.SPRITES.ENEMY_RED, health: 2 },
  { type: "fast", x: 300, y: 80, sprite: ASSET_KEYS.SPRITES.ENEMY_BLUE, health: 2 },
];

const UI_STYLES = {
  DEFAULT: { fontSize: "24px", fill: "#fff" },
  GAME_OVER: { fontSize: "64px", fill: "#f00" },
  GAME_CLEAR: { fontSize: "64px", fill: "#0f0" },
};

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    this.initProperties();
  }

  /**
   * プロパティの初期化（再起動時にも使用可能にするため分離）
   */
  initProperties() {
    this.score = 0;
    this.isGameOver = false;
    this.isGameClear = false;

    // ゲームオブジェクト
    this.player = null;
    this.playerLasers = null;
    this.enemies = null;
    this.enemyMissiles = null;
    this.cursors = null;
  }

  preload() {
    this.load.atlasXML(
      ASSET_KEYS.ATLAS,
      "assets/sprites/sheet.png",
      "assets/sprites/sheet.xml"
    );
    this.load.image(ASSET_KEYS.BACKGROUND, "assets/images/background.png");
  }

  create() {
    this.createBackground();
    this.createGroups();
    this.createPlayer();
    this.spawnEnemies();
    this.setupInputs();
    this.setupCollisions();

    // ★追加: UIシーンを起動（初期データを第2引数で渡すのがコツ！）
    this.scene.launch("UIScene", { 
        score: this.score, 
        health: this.player.health 
    });
  }

  update() {
    if (this.isGameOver || this.isGameClear) return;

    this.player.update(this.cursors);

    // ゲームクリア判定
    if (this.enemies.countActive(true) === 0) {
      this.handleGameClear();
    }
  }

  // ----------------------------------------------------------------
  // #region Create Helpers
  // ----------------------------------------------------------------

  createBackground() {
    this.add.image(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, ASSET_KEYS.BACKGROUND);
  }

  createGroups() {
    this.playerLasers = this.physics.add.group({
      classType: Laser,
      maxSize: 10,
      runChildUpdate: true,
      // ★修正: Groupにテクスチャとフレームを設定
      key: ASSET_KEYS.ATLAS,
      frame: ASSET_KEYS.SPRITES.LASER_PLAYER,
    });

    this.enemies = this.physics.add.group({
      classType: Enemy,
      runChildUpdate: true,
    });

    this.enemyMissiles = this.physics.add.group({
      classType: Missile,
      maxSize: 20,
      runChildUpdate: true,
      // ★修正: Groupにテクスチャとフレームを設定
      key: ASSET_KEYS.ATLAS,
      frame: ASSET_KEYS.SPRITES.LASER_ENEMY,
    });
  }

  createPlayer() {
    this.player = new Player(
      this,
      GAME_CONFIG.WIDTH / 2,
      550,
      ASSET_KEYS.ATLAS,
      ASSET_KEYS.SPRITES.PLAYER
    );
  }

  spawnEnemies() {
    ENEMY_WAVE_DATA.forEach((data) => {
      const enemy = new Enemy(this, data.x, data.y, ASSET_KEYS.ATLAS, data.sprite, data.health);
      this.enemies.add(enemy);

      // 敵の動きパターン適用
      this.applyEnemyMovement(enemy, data.type);
      
      // 画像の反転（必要であれば）
      if (data.type === "sine") enemy.setFlipY(true);
    });
  }

  /**
   * 敵のタイプに応じた動き（Tween）を適用する
   */
  applyEnemyMovement(enemy, type) {
    switch (type) {
      case "sine":
        enemy.startMovement(() =>
          this.tweens.add({
            targets: enemy,
            x: Phaser.Math.Between(50, 750),
            y: Phaser.Math.Between(50, 250),
            duration: Phaser.Math.Between(2000, 4000),
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: -1,
          })
        );
        break;

      case "fast":
        enemy.startMovement(() =>
          this.tweens.add({
            targets: enemy,
            x: Phaser.Math.Between(50, 750),
            duration: 1000,
            ease: "Power2",
            yoyo: true,
            repeat: -1,
          })
        );
        break;
        
      default:
        // "static" または定義なしの場合は何もしない
        break;
    }
  }

  setupInputs() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on("keydown-SPACE", () => {
      if (this.player.active) this.player.fireLaser();
    });
  }

  setupCollisions() {
    this.physics.add.overlap(this.playerLasers, this.enemies, this.handleHitEnemy, null, this);
    this.physics.add.overlap(this.enemyMissiles, this.player, this.handleHitPlayer, null, this);
  }

  // #endregion

  // ----------------------------------------------------------------
  // #region Logic & Handlers
  // ----------------------------------------------------------------

  updateUI() {
    // 削除：UISceneに移動したため不要
  }

  handleHitEnemy(laser, enemy) {
    // 【修正】destroy() ではなく disableBody(true, true) を使って、
    // オブジェクトプール（Group）に再利用可能として戻します。
    laser.disableBody(true, true);
    
    // 既に死んでいる敵に当たった場合のガード
    if (!enemy.active) return;

    enemy.takeDamage(1);

if (!enemy.active) {
      this.playExplosion(enemy.x, enemy.y);
      this.score += GAME_CONFIG.SCORE_PER_ENEMY;
      
      // イベントを飛ばす
      this.events.emit("updateScore", this.score);
    }
  }

  handleHitPlayer(player, missile) {
    missile.destroy();
    
    if (!player.active) return;

    player.takeDamage(1);

    // 体力が減ったことを通知
    this.events.emit("updateHealth", player.health);

    if (!player.active) {
      this.playExplosion(player.x, player.y);
      this.handleGameOver();
    }
  }

  addScore(points) {
    // 削除：スコア加算はhandleHitEnemyに集約
  }

  playExplosion(x, y) {
    const circle = this.add.circle(x, y, 20, 0xff0000);
    this.tweens.add({
      targets: circle,
      alpha: 0,
      duration: 500,
      onComplete: () => circle.destroy(),
    });
  }

  handleGameOver() {
    this.isGameOver = true;
    this.physics.pause();
    this.player.setVisible(false);
    this.showCenterMessage("GAME OVER", UI_STYLES.GAME_OVER);
  }

  handleGameClear() {
    this.isGameClear = true;
    this.physics.pause();
    this.showCenterMessage("GAME CLEAR!", UI_STYLES.GAME_CLEAR);
  }

  showCenterMessage(text, style) {
    this.add
      .text(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, text, style)
      .setOrigin(0.5);
  }
  // #endregion
}