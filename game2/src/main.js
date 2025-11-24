// 1. UISceneのインポートを追加
import GameScene from './GameScene.js';
import UIScene from './UIScene.js'; 

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
    // 2. scene配列にUISceneを追加
    scene: [GameScene, UIScene]
};

const game = new Phaser.Game(config);