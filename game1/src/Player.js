class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame); // ← frame を渡す！

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDrag(100);
    this.setDepth(10);

    this.speed = 200;
    this.health = 5;
    this.fireRate = 200;
    this.nextFire = 0;
  }

  update(cursors) {
    // キーボード入力による移動
    if (cursors.left.isDown) {
      this.setVelocityX(-this.speed);
    } else if (cursors.right.isDown) {
      this.setVelocityX(this.speed);
    } else {
      this.setVelocityX(0); // 左右キーが押されていない場合はX方向の速度を0に
    }

    if (cursors.up.isDown) {
      this.setVelocityY(-this.speed);
    } else if (cursors.down.isDown) {
      this.setVelocityY(this.speed);
    } else {
      this.setVelocityY(0); // 上下キーが押されていない場合はY方向の速度を0に
    }
  }

  fireLaser() {
    if (this.scene.time.now > this.nextFire) {
      // テクスチャキーとフレーム名を渡す
      const laser = this.scene.playerLasers.get(
        this.x,
        this.y - 30,
        "space",
        "laserBlue08.png"
      );

      if (laser) {
        laser.setActive(true);
        laser.setVisible(true);
        laser.fire(this.x, this.y - 30, -500); // 上方向に発射
        this.nextFire = this.scene.time.now + this.fireRate;
      }
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.setActive(false);
      this.setVisible(false);
      this.destroy(); // 自機を破壊
    }
  }
}

export default Player;
