class Missile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);

    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  // ミサイルを発射する (ターゲットを追尾する)
  fire(startX, startY, targetX, targetY) {
    this.body.reset(startX, startY);
    this.setActive(true);
    this.setVisible(true);

    const speed = 200; // ミサイルの速度

    // ターゲットに向かう角度を計算
    const angle = Phaser.Math.Angle.Between(startX, startY, targetX, targetY);

    // 速度ベクトルを設定
    this.setVelocityX(Math.cos(angle) * speed);
    this.setVelocityY(Math.sin(angle) * speed);

    // ミサイルの向きを調整 (画像が上向きの場合)
    this.rotation = angle + Math.PI / 2; // 画像の向きと合わせるため90度 (PI/2) 回転
  }

  // updateはPhaserのグループ設定で自動的に呼び出されます
  update(time, delta) {
    // 画面外に出たら消去
    if (
      this.y > this.scene.sys.game.config.height + 10 ||
      this.y < -10 ||
      this.x > this.scene.sys.game.config.width + 10 ||
      this.x < -10
    ) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}

export default Missile;
