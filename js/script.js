var textInput = document.getElementById('textInput');
var imeStatusLabel = document.getElementById('imeStatus');
var keyEventLabel = document.getElementById('keyEvent');
var isComposing = false;
var lastInputTime = 0;
var IME_CHECK_INTERVAL = 100; // 100ミリ秒ごとにチェック
// IME状態を定期的にチェック
setInterval(function () {
    var _a;
    var now = Date.now();
    // 最後の入力から500ミリ秒経過し、かつIMEがONの状態の場合
    if (now - lastInputTime > 500 && isComposing) {
        // IMEの状態を再確認
        if (!textInput.matches(':has(> *)') && !((_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.matches(':has(> *)'))) {
            isComposing = false;
            updateIMEStatus('OFF');
        }
    }
}, IME_CHECK_INTERVAL);
// compositionstart と compositionend を使ってフラグを管理
textInput.addEventListener('compositionstart', function () {
    isComposing = true;
    lastInputTime = Date.now();
    updateIMEStatus('ON');
    updateKeyEvent('IME入力開始');
});
textInput.addEventListener('compositionend', function () {
    isComposing = false;
    lastInputTime = Date.now();
    updateIMEStatus('OFF');
    updateKeyEvent('IME入力確定');
});
// keydownイベントでIME状態を判定
textInput.addEventListener('keydown', function (e) {
    lastInputTime = Date.now();
    if (e.isComposing || e.key === 'Process' || e.keyCode === 229) {
        isComposing = true;
        updateIMEStatus('ON');
    }
    else {
        // IME確定後の最初のキーイベントで状態を更新
        if (isComposing) {
            isComposing = false;
            updateIMEStatus('OFF');
        }
        // 特殊キーの処理
        var keyInfo = '';
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
                keyInfo = "".concat(e.key, "\u62BC\u4E0B");
                break;
            default:
                if (!e.ctrlKey && !e.altKey && !e.metaKey) {
                    keyInfo = "\u30AD\u30FC\u5165\u529B: ".concat(e.key);
                }
                else {
                    var modifiers = [];
                    if (e.ctrlKey)
                        modifiers.push('Ctrl');
                    if (e.altKey)
                        modifiers.push('Alt');
                    if (e.metaKey)
                        modifiers.push('Meta');
                    keyInfo = "".concat(modifiers.join('+'), "+").concat(e.key);
                }
        }
        updateKeyEvent(keyInfo);
    }
});
// inputイベントでIME状態を確認
textInput.addEventListener('input', function (e) {
    lastInputTime = Date.now();
    var inputEvent = e;
    var imeTypes = ['insertCompositionText', 'deleteCompositionText', 'insertFromComposition', 'deleteByComposition'];
    if (inputEvent.inputType && imeTypes.indexOf(inputEvent.inputType) !== -1) {
        isComposing = true;
        updateIMEStatus('ON');
    }
    else if (!isComposing) {
        updateIMEStatus('OFF');
    }
});
// フォーカスが外れた時の処理
textInput.addEventListener('blur', function () {
    if (isComposing) {
        isComposing = false;
        updateIMEStatus('OFF');
    }
});
// IME状態を更新する関数
function updateIMEStatus(status) {
    imeStatusLabel.textContent = "IME\u72B6\u614B: ".concat(status);
}
// キーイベント情報を更新する関数
function updateKeyEvent(eventInfo) {
    keyEventLabel.textContent = "\u30AD\u30FC\u30A4\u30D9\u30F3\u30C8: ".concat(eventInfo);
    // 3秒後に表示をクリア
    setTimeout(function () {
        keyEventLabel.textContent = 'キーイベント: なし';
    }, 3000);
}
