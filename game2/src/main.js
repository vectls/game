import GameScene from './GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false // デバッグ表示 (当たり判定の枠など)
        }
    },
    scene: [GameScene]
};

const game = new Phaser.Game(config);