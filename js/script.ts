const textInput = document.getElementById('textInput') as HTMLInputElement;
const imeStatusLabel = document.getElementById('imeStatus') as HTMLLabelElement;
const keyEventLabel = document.getElementById('keyEvent') as HTMLLabelElement;

let isComposing: boolean = false;
let lastInputTime: number = 0;
const IME_CHECK_INTERVAL: number = 100; // 100ミリ秒ごとにチェック

const isIOSSafari = /iP(ad|hone|od).+Version\/[\d\.]+ Safari/i.test(navigator.userAgent);

// IME状態を定期的にチェック
setInterval(() => {
  const now = Date.now();
  // 最後の入力から500ミリ秒経過し、かつIMEがONの状態の場合
  if (now - lastInputTime > 500 && isComposing) {
    // IMEの状態を再確認
    if (!textInput.matches(':has(> *)') && !document.activeElement?.matches(':has(> *)')) {
      isComposing = false;
      updateIMEStatus('OFF');
    }
  }
}, IME_CHECK_INTERVAL);

// compositionstart と compositionend を使ってフラグを管理
textInput.addEventListener('compositionstart', () => {
  isComposing = true;
  lastInputTime = Date.now();
  updateIMEStatus('ON');
  updateKeyEvent('IME入力開始');
});

textInput.addEventListener('compositionend', () => {
  isComposing = false;
  lastInputTime = Date.now();
  updateIMEStatus('OFF');
  updateKeyEvent('IME入力確定');
});

// keydownイベントでIME状態を判定
textInput.addEventListener('keydown', (e: KeyboardEvent) => {
  lastInputTime = Date.now();
  if (e.isComposing || e.key === 'Process' || e.keyCode === 229) {
    isComposing = true;
    updateIMEStatus('ON');
  } else {
    // IME確定後の最初のキーイベントで状態を更新
    if (isComposing) {
      isComposing = false;
      updateIMEStatus('OFF');
    }
    // 特殊キーの処理
    let keyInfo = '';
    switch (e.key) {
      case 'Enter':
        keyInfo = 'Enter押下';
        break;
      case 'Backspace':
        keyInfo = 'Backspace押下';
        break;
      case 'Delete':
        keyInfo = 'Delete押下';
        break;
      case 'Tab':
        keyInfo = 'Tab押下';
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown':
        keyInfo = `${e.key}押下`;
        break;
      default:
        if (!e.ctrlKey && !e.altKey && !e.metaKey) {
          keyInfo = `キー入力: ${e.key}`;
        } else {
          const modifiers = [];
          if (e.ctrlKey) modifiers.push('Ctrl');
          if (e.altKey) modifiers.push('Alt');
          if (e.metaKey) modifiers.push('Meta');
          keyInfo = `${modifiers.join('+')}+${e.key}`;
        }
    }
    updateKeyEvent(keyInfo);
  }
});

// inputイベントでIME状態を確認
textInput.addEventListener('input', (e: Event) => {
  lastInputTime = Date.now();
  const inputEvent = e as InputEvent;
  const imeTypes = ['insertCompositionText', 'deleteCompositionText', 'insertFromComposition', 'deleteByComposition'];

  if (inputEvent.inputType && imeTypes.includes(inputEvent.inputType)) {
    isComposing = true;
    updateIMEStatus('ON');
  } else if (isIOSSafari) {
    // iOS Safari 固有の処理
    if (isComposing && Date.now() - lastInputTime > 300) {
      isComposing = false;
      updateIMEStatus('OFF');
    }
  } else if (!isComposing) {
    updateIMEStatus('OFF');
  }
});

// フォーカスが外れた時の処理
textInput.addEventListener('blur', () => {
  if (isComposing) {
    isComposing = false;
    updateIMEStatus('OFF');
  }
});

// IME状態を更新する関数
function updateIMEStatus(status: string): void {
  imeStatusLabel.textContent = `IME状態: ${status}`;
}

// キーイベント情報を更新する関数
function updateKeyEvent(eventInfo: string): void {
  keyEventLabel.textContent = `キーイベント: ${eventInfo}`;
  // 3秒後に表示をクリア
  setTimeout(() => {
    keyEventLabel.textContent = 'キーイベント: なし';
  }, 3000);
}
