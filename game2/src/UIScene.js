const UI_STYLES = {
  DEFAULT: { fontSize: "24px", fill: "#fff" },
};

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene" });
  }

  // GameScene.launchの第2引数で渡したデータがここに入ってきます
  create(data) {
    // 初期データの受け取り（データがない場合の保険で || 0 を入れています）
    const initialScore = data.score || 0;
    const initialHealth = data.health || 0;

    // UIテキストの作成
    this.scoreText = this.add.text(16, 16, `Score: ${initialScore}`, UI_STYLES.DEFAULT);
    this.healthText = this.add.text(16, 48, `Player Health: ${initialHealth}`, UI_STYLES.DEFAULT);

    // GameSceneへの参照を取得
    const gameScene = this.scene.get("GameScene");

    // --- イベントリスナーの設定 ---

    // スコア更新イベントを受け取る
    gameScene.events.on("updateScore", (score) => {
      this.scoreText.setText(`Score: ${score}`);
    });

    // 体力更新イベントを受け取る
    gameScene.events.on("updateHealth", (health) => {
      this.healthText.setText(`Player Health: ${health}`);
    });
    
    // シーンが終了するとき（リスタートなど）はイベントリスナーを解除する
    // これを忘れると、再起動するたびにイベントが重複して重くなります
    this.events.on("shutdown", () => {
        gameScene.events.off("updateScore");
        gameScene.events.off("updateHealth");
    });
  }
}