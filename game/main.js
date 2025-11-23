// スコアを管理する変数
let score = 0;

// HTML要素を取得
const scoreElement = document.getElementById('score');
const clickButton = document.getElementById('click-button');

// ボタンがクリックされた時の処理
clickButton.addEventListener('click', function() {
    // スコアを増やす
    score += 1;
    // 画面の表示を更新する
    scoreElement.textContent = score;
    
    // アニメーションなどのちょっとした演出
    clickButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
        clickButton.style.transform = 'scale(1)';
    }, 100);
});
