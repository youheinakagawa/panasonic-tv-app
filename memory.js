// memory.js

// メモリバンクの初期化
let memoryBank = new Array(256); // 256バイトのメモリバンク
memoryBank.fill(0); // すべての要素を0で初期化

// メモリバンクの確認用
function displayMemory() {
  for (let i = 0; i < memoryBank.length; i++) {
    console.log(`Memory[${i}] = ${memoryBank[i]}`);
  }
}
