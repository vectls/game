import Laser from "./Laser.js"; // 必要に応じてimportパスを確認してください

// 定数管理（調整しやすくするため）
const ENEMY_CONFIG = {
  FIRE_RATE_MIN: 1000,
  FIRE_RATE_MAX: 3000,
  OFFSET_Y: 30, // ミサイル発射位置の調整
};

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame, health) {
    super(scene, x, y, texture, frame);

    // シーンへの追加
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 物理設定
    this.setCollideWorldBounds(true);
    this.setImmovable(true);
    this.setDepth(5);

    // パラメータ初期化
    this.health = health;
    this.movementTween = null;

    // 攻撃用タイマーの初期化
    this.setupNextFire();
  }

  // 次の発射時間をセットする
  setupNextFire() {
    this.nextFire = this.scene.time.now + Phaser.Math.Between(ENEMY_CONFIG.FIRE_RATE_MIN, ENEMY_CONFIG.FIRE_RATE_MAX);
  }

  // 外部から動き（Tween）を受け取って開始する
  startMovement(tweenConfigFactory) {
    if (this.movementTween) {
      this.movementTween.stop();
    }
    // 工場関数を実行してTweenを作成
    this.movementTween = tweenConfigFactory();
  }

  // ダメージ処理
  takeDamage(amount) {
    this.health -= amount;
    
    // 被弾演出（赤く点滅）
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => this.clearTint());

    if (this.health <= 0) {
      this.die();
    }
  }

  // 死亡処理
  die() {
    this.health = 0;
    
    // 動きを止める
    if (this.movementTween) {
      this.movementTween.stop();
    }

    // 破壊 (オブジェクトプールに戻す & 物理ボディを無効化)
    this.disableBody(true, true); // 【修正】Groupに戻すためのベストプラクティス
  }

  // 毎フレーム呼ばれるループ処理
  update() {
    // 画面外や死んでいるときは何もしない
    if (!this.active) return;

    // 攻撃タイミングのチェック
    if (this.scene.time.now > this.nextFire) {
      this.fireMissile();
    }
  }

  // ミサイル発射処理
  fireMissile() {
    // プレイヤーが生きていないと撃たない
    const player = this.scene.player;
    if (!player || !player.active) return;

    // Sceneからミサイルグループを取得
    const missileGroup = this.scene.enemyMissiles;
    if (!missileGroup) return;

    // ミサイルを生成（または再利用）
    const missile = missileGroup.get(
      this.x,
      this.y + ENEMY_CONFIG.OFFSET_Y,
      "space", 
      "laserGreen07.png" // 必要なら定数化推奨
    );

    if (missile) {
      missile.setActive(true);
      missile.setVisible(true);
      
      // プレイヤーの位置に向かって発射
      missile.fire(this.x, this.y, player.x, player.y);
      
      // 次の発射時間をセット
      this.setupNextFire();
    }
  }
}