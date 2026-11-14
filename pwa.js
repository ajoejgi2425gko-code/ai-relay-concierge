'use strict';
(() => {
  const button = document.getElementById('installApp');
  const help = document.getElementById('installHelp');
  const status = document.getElementById('installStatus');
  const online = document.getElementById('networkStatus');
  const displayMode = window.matchMedia('(display-mode: standalone)');
  let promptEvent = null;
  let installedThisSession = false;
  const standalone = () => displayMode.matches || navigator.standalone === true;
  function syncVisibility() {
    help.hidden = standalone() || installedThisSession;
    button.hidden = help.hidden || !promptEvent;
    if(help.hidden) help.open = false;
  }
  displayMode.addEventListener?.('change', syncVisibility);
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();promptEvent=event;syncVisibility();
  });
  window.addEventListener('appinstalled', () => {
    promptEvent=null;installedThisSession=true;syncVisibility();
  });
  button.addEventListener('click', async () => {
    if(!promptEvent || standalone()) return;
    const event=promptEvent;promptEvent=null;syncVisibility();
    try {
      await event.prompt();const result=await event.userChoice;
      status.textContent=result.outcome==='accepted'?'インストールを開始しました。':'インストールを見送りました。ブラウザのメニューからも追加できます。';
    } catch {status.textContent='自動の案内を開けませんでした。下の手順をご利用ください。';}
  });
  function network(){online.hidden=navigator.onLine;online.textContent='現在オフラインです。依頼文の作成や記録は使えますが、外部AIへの相談にはインターネット接続が必要です。';}
  window.addEventListener('online',network);window.addEventListener('offline',network);network();syncVisibility();
  if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost' || location.hostname==='127.0.0.1')) {
    window.addEventListener('load', async () => {
      try {
        const registration=await navigator.serviceWorker.register('./sw.js', {scope:'./',updateViaCache:'none'});
        function update(){if(registration.waiting)status.textContent='更新版があります。会議を保存してから、このアプリのタブ・ウィンドウをすべて閉じ、開き直してください。';}
        update();registration.addEventListener('updatefound',()=>registration.installing?.addEventListener('statechange',update));
      } catch {status.textContent='オフライン機能の準備に失敗しました。通信できる状態で開き直してください。';}
    });
  }
})();
