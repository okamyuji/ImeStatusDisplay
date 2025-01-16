const textInput = document.getElementById('textInput') as HTMLInputElement;
const imeStatusLabel = document.getElementById('imeStatus') as HTMLLabelElement;
const keyEventLabel = document.getElementById('keyEvent') as HTMLLabelElement;

let isComposing: boolean = false;
const isIOSSafari = /iP(ad|hone|od).+Version\/[\d\.]+ Safari/i.test(navigator.userAgent);
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isChrome = /chrome/i.test(navigator.userAgent);

// compositionstart と compositionend を使ってフラグを管理
textInput.addEventListener('compositionstart', () => {
  isComposing = true;
  updateIMEStatus('ON');
  updateKeyEvent('IME入力開始');
});

textInput.addEventListener('compositionend', () => {
  isComposing = false;
  updateIMEStatus('OFF');
  updateKeyEvent('IME入力確定');
});

// keydownイベントでIME状態を判定
textInput.addEventListener('keydown', (e: KeyboardEvent) => {
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
  const inputEvent = e as InputEvent;
  const imeTypes = ['insertCompositionText', 'deleteCompositionText', 'insertFromComposition', 'deleteByComposition'];

  if (inputEvent.inputType && imeTypes.indexOf(inputEvent.inputType) !== -1) {
    isComposing = true;
    updateIMEStatus('ON');
  } else if (isIOSSafari) {
    // iOS Safari 固有の処理
    const hasImeInput = textInput.value.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/);
    if (hasImeInput) {
      isComposing = true;
      updateIMEStatus('ON');
    }
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
