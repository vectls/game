class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame, health) {
    super(scene, x, y, texture, frame);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setImmovable(true);
    this.setDepth(5);

    this.health = health;
    this.fireRate = Phaser.Math.Between(1000, 3000);
    this.nextFire = scene.time.now + this.fireRate;
    this.movementTween = null;
  }

  // エネミーの動きを開始するメソッド
  startMovement(movementFunction) {
    this.movementTween = movementFunction();
  }

  // エネミーがダメージを受けた時の処理
  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.setActive(false);
      this.setVisible(false);
      if (this.movementTween) {
        this.movementTween.stop(); // 動きのTweenを停止
      }
      this.destroy(); // エネミーを破壊
    }
  }

  // エネミーがミサイルを発射する処理
  fireMissile(targetX, targetY) {
    if (this.active && this.scene.time.now > this.nextFire) {
      const missile = this.scene.enemyMissiles.get(this.x, this.y + 30, "space","laserGreen07.png"); // エネミーの下から発射
      if (missile) {
        missile.setActive(true);
        missile.setVisible(true);
        // 自機に向かって発射
        missile.fire(this.x, this.y + 30, targetX, targetY);
        this.nextFire = this.scene.time.now + this.fireRate;
      }
    }
  }

  update() {
    // 必要であれば、個別のエネミーの動きをここに記述することもできます
    // 今回はTweenで動きを制御しているため、基本的には空です。
    this.fireMissile(this.scene.player.x, this.scene.player.y); // 自機を追尾するミサイル
  }
}

export default Enemy;
