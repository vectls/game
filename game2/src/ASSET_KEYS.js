// src/ASSET_KEYS.js
// すべてのアセットキーとフレーム名を一元管理する
export const ASSET_KEYS = {
    // アトラスキー
    ATLAS: "space",
    // 背景画像キー
    BACKGROUND: "background",
    
    // スプライトフレーム名
    SPRITES: {
        PLAYER: "playerShip1_blue.png",
        ENEMY_GREEN: "enemyGreen1.png",
        ENEMY_RED: "enemyRed1.png",
        ENEMY_BLUE: "enemyBlue2.png",
        
        // 弾フレーム名
        LASER_PLAYER: "laserBlue08.png", // Playerが使用
        LASER_ENEMY: "laserGreen07.png",  // Enemyが使用
    },
};