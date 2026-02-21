/**
 * ChaCopy コンテンツスクリプトのエントリポイント。
 *
 * このスクリプトは ChatGPT ページに注入され、以下の処理を実行:
 * 1. ページ読み込み時に既存のアシスタントメッセージに MD ボタンを注入
 * 2. 新しいメッセージの追加を監視し、即座にボタンを注入開始
 */

import { injectButtonsIntoPage } from './ui/button';
import { startObserver } from './ui/observer';

injectButtonsIntoPage();
startObserver();
