'use strict';
(() => {
  const button = document.getElementById('installApp');
  const help = document.getElementById('installHelp');
  const status = document.getElementById('installStatus');
  const online = document.getElementById('networkStatus');
  let promptEvent = null;
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  function installed() {button.textContent='アプリで利用中';button.disabled=true;status.textContent='ホーム画面またはアプリ一覧から起動できます。';}
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();promptEvent=event;
    if(!standalone()){button.textContent='アプリをインストール';button.disabled=false;}
  });
  window.addEventListener('appinstalled', () => {promptEvent=null;installed();help.hidden=false;});
  button.addEventListener('click', async () => {
    help.hidden=false;
    if(!promptEvent){status.textContent=window.isSecureContext?'下の手順でブラウザのメニューから追加できます。項目がない場合は対応ブラウザで開いてください。':'GitHub PagesのHTTPSの公開URLから開いてください。';return;}
    const event=promptEvent;promptEvent=null;
    try {await event.prompt();const result=await event.userChoice;status.textContent=result.outcome==='accepted'?'インストールを開始しました。':'インストールを見送りました。ブラウザのメニューからも追加できます。';}
    catch {status.textContent='自動の案内を開けませんでした。下の手順をご利用ください。';}
    button.textContent='ホーム画面への追加方法';
  });
  function network(){online.hidden=navigator.onLine;online.textContent='現在オフラインです。依頼文の作成や記録は使えますが、外部AIへの相談にはインターネット接続が必要です。';}
  window.addEventListener('online',network);window.addEventListener('offline',network);network();
  if(standalone())installed();
  if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost' || location.hostname==='127.0.0.1')) {
    window.addEventListener('load', async () => {
      try {
        const registration=await navigator.serviceWorker.register('./sw.js', {scope:'./',updateViaCache:'none'});
        function update(){if(registration.waiting){status.textContent='更新版があります。会議を保存してから、このアプリのタブ・ウィンドウをすべて閉じ、開き直してください。';help.hidden=false;}}
        update();registration.addEventListener('updatefound',()=>registration.installing?.addEventListener('statechange',update));
      } catch {help.hidden=false;status.textContent='オフライン機能の準備に失敗しました。公開ファイルがすべてそろっているか確認し、通信できる状態で開き直してください。';}
    });
  }
})();
