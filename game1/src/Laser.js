class Laser extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  fire(x, y, speedY) {
    this.body.reset(x, y);
    this.setActive(true);
    this.setVisible(true);
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
