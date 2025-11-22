const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
let player;

function preload() {
    this.load.image('player', 'assets/images/character.png'); // キャラクタ画像を読み込み
}

function create() {
    player = this.add.image(400, 300, 'player'); // キャラクタを配置

    // マウスの動きに追従
    this.input.on('pointermove', function (pointer) {
        player.x = pointer.x;
        player.y = pointer.y;
    });
}

function update() {
    // 毎フレームの処理（今回は不要）
}