/*
MIT License
Copyright (c) 2021 nononosuque

*/
jQuery.noConflict();

(function($, PLUGIN_ID) {
  'use strict';

  function makeTips(place,configName){

    // 設定情報を取得
    const CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);

    // TIPSの設定情報を取得する
    const CONFIG_TIPS = JSON.parse(CONFIG[configName]);
    const CONFIG_CSS = JSON.parse(CONFIG['cssConfig']);

    const BUTTON_CSS_DATA_KEY = 'TIPS';
    const BUTTON_CSS_DATA_KEY_A = 'TIPS-LINK';

    Object.keys(CONFIG_TIPS).forEach(function(key){

      const TIPS_NAME = CONFIG_TIPS[key]['TIPS名'];
      const TIPS_MESSAGE = CONFIG_TIPS[key]['TIPSの内容'];
      const FILED_ELEMENT = CONFIG_TIPS[key]['TIPSの要素'];
      const A_LINK = CONFIG_TIPS[key]['リンク先(a要素の場合)'];
      const TIPS_POSITION = CONFIG_TIPS[key]['TIPS表示位置'];
      let cssKey;
      
      // tipsのコンテンツを作成
      const TIPS = document.createElement('div');
      TIPS.className = 'tippyjs-content-custom';
      TIPS.innerText = TIPS_MESSAGE;

      // tipsのボタンを作成
      const BUTTON = document.createElement(FILED_ELEMENT);
      BUTTON.innerHTML = TIPS_NAME;
      BUTTON.className = 'tippyjs-button-custom';

      // tipsのボタンがa要素の場合のみ以下の処理を実施
      if(FILED_ELEMENT === 'a'){
        BUTTON.target = '_blank';
        BUTTON.rel = 'noopener noreferrer';
        BUTTON.href = A_LINK;
        cssKey = BUTTON_CSS_DATA_KEY_A;

        const SPAN = document.createElement('span');
        SPAN.textContent = 'LINK';
        SPAN.style.color = 'blue';
        SPAN.style.background = 'aliceblue';
        SPAN.style.borderRadius = '5px';
        SPAN.style.marginLeft = '5px';
        SPAN.style.paddingLeft = '3px';
        SPAN.style.paddingRight = '3px';
        SPAN.style.position = 'relative';
        SPAN.style.border = '1px solid slategray';
        BUTTON.appendChild(SPAN);

      }else{
        cssKey = BUTTON_CSS_DATA_KEY;
      }

      // デフォルトCSS
      BUTTON.style.fontSize = CONFIG_CSS[cssKey]['文字サイズ'] + 'px';
      BUTTON.style.color = CONFIG_CSS[cssKey]['文字色'];
      BUTTON.style.background = CONFIG_CSS[cssKey]['背景色'];
      BUTTON.style.fontStyle = 'normal';  // i要素がデフォルトでイタリック設定されているので上書きする。
      
      // マウスオーバー時の処理
      BUTTON.addEventListener('mouseover', function(){
        const HOVER = ':hover';
        BUTTON.style.fontSize = CONFIG_CSS[cssKey + HOVER]['文字サイズ'] + 'px';
        BUTTON.style.color = CONFIG_CSS[cssKey + HOVER]['文字色'];
        BUTTON.style.background = CONFIG_CSS[cssKey + HOVER]['背景色'];
      });

      // マウスアウト時の処理
      BUTTON.addEventListener('mouseout', function(){
        BUTTON.style.fontSize = CONFIG_CSS[cssKey]['文字サイズ'] + 'px';
        BUTTON.style.color = CONFIG_CSS[cssKey]['文字色'];
        BUTTON.style.background = CONFIG_CSS[cssKey]['背景色'];
      });

      tippy(BUTTON, {
        arrow: false,
        placement: TIPS_POSITION,
        interactiveBorder:0,
        maxWidth:'1000px',
        delay:[150,1000],
        theme:'light-border',
        distance:20,
        allowHTML:true,
        content: TIPS,
      });

      // 一覧ツールチップの場合
      if(place === 'LIST'){
        // 設定されたidが存在する場合のみツールチップを反映する
        if(document.getElementById(key) != null){
          document.querySelectorAll('#' + key)[0].appendChild(BUTTON);
        }
      // 作成・詳細・編集ツールチップの場合
      }else{
        
        kintone.app.record.getSpaceElement(key).appendChild(BUTTON);
      }
    });
  };

  kintone.events.on(
    ['app.record.index.show']
  , 
  function(){

    makeTips('LIST','tipsConfigList');
    
  });

  kintone.events.on(
    [
        'app.record.edit.show'
      , 'app.record.create.show'
      , 'app.record.detail.show'
    ], 
  function(){

    makeTips('DETAIL','tipsConfigDetail');

  });

})(jQuery, kintone.$PLUGIN_ID);
