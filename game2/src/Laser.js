class Laser extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

fire(x, y, speedY) {
    // 物理ボディを有効化し、新しい開始位置 (x, y) にリセット
    this.enableBody(true, x, y, true, true); 
    
    this.setVelocityY(speedY);
  }

  update(time, delta) {
    if (this.y < -10) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}

export default Laser;
