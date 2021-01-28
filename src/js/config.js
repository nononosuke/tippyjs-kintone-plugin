/*
MIT License
Copyright (c) 2021 nononosuque
https://github.com/nononosuque/tippyjs-kintone-plugin
*/

jQuery.noConflict();
(function($, PLUGIN_ID) {
  'use strict';

  // TIPS詳細画面設定情報の列名(先頭のスペース要素idは除く)
  const COLUMN_TIPS_CONFIG_DETAIL = ['TIPS名','TIPSの要素','TIPS表示位置','TIPSの内容','リンク先(a要素の場合)'];
  const TIPS_CONFIG_DETAIL_KEY = 'tipsConfigDetail';


  const TIPS_CONFIG_LIST_KEY = 'tipsConfigList';

  
  const TABLE_COLUMNS_TYPE_LIST_NEW = ['input','input','select','select','textarea','input','button'];
  const TABLE_COLUMNS_TYPE_LIST = ['','input','select','select','textarea','input','button'];
  const TABLE_COLUMNS_LIST = ['tipId','tipName','tipElement','tipPosition','tipDetail','tipLink', 'tipsDelButton'];


  // CSS設定情報の列名
  const COLUMN_CSS_CONFIG = ['文字色','文字サイズ','背景色'];
  const CSS_CONFIG_KEY = 'cssConfig';

  // TIPSリスト画面コンフィグの行を追加するボタン
  const TIPS_CONFIG_LIST_ADD_BUTTON = $('.tips-config-list-add-button');

  // CSVエクスポートボタン
  const CSV_EXPORT_BUTTON = $('.csvExport');

  // Get configuration settings
  const CONF = kintone.plugin.app.getConfig(PLUGIN_ID);
  let $form = $('.js-submit-settings');
  let $cancelButton = $('.js-cancel-button');

  // 設定情報を登録するテーブル要素を取得する
  // TIPS詳細画面設定情報(TABLE要素)
  let $tipsConfigDetail = $('table[name="tips-config-detail"]');

  // TIPS一覧設定情報(TABLE要素)
  let $tipsConfigList = $('table[name="tips-config-list"]');

  // CSS設定情報(TABLE要素)
  let $cssConfigData = $('table[name="css-config"]');

  /**
   * HTML要素をエスケープする
   * @param {*} htmlstr 
   */
  function escapeHtml(htmlstr) {
    return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /**
   * HTML要素をエスケープする
   * @param {*} htmlstr 
   */
  function escapeHtmlNotAmpersand(htmlstr) {
    return htmlstr.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /**
   * リスト要素を作成する
   * @param {Array} selectValues 選択肢の配列
   * @returns {HTMLSelectElement}
   */
  function setDropDown(selectValues) {
    // select要素の作成
    var $selectElement = $('<select>');

    for (let i = 0; i < selectValues.length; i++){
      // option要素の作成
      var $selectElementOption = $('<option>');
      $selectElementOption.attr('value', selectValues[i]);
      $selectElementOption.text(selectValues[i]);

      // select要素にoption要素を追加する
      $selectElement.append($selectElementOption);
    }

    return $selectElement;
  }

  /**
   * コンフィグのデータを取得する
   * @param {jsonData} jsonData 
   * @param {HTMLTableElement} tableData 
   * @param {Array} columns
   */
  function getConfigData(jsonData, tableData, columns){

    if(jsonData !== undefined){

      // JSONをオブジェクトにパースする
      const CONFIG_OBJ = JSON.parse(jsonData);

      // テーブル要素から列要素を取得する
      const TR_DATA = tableData[0].children[0].children;

      // コンフィグ情報の件数分ループ処理
      for(let i = 1; i < TR_DATA.length; i++){

        // TR要素からTD要素(列)を取得する
        const TD_DATA = TR_DATA[i].children;

        // TD要素の1列目がコンフィグ取得時のキーとなっているため取得する
        const KEY = TD_DATA[0].textContent;

        // 保存されている対象のみ値を設定する
        if(CONFIG_OBJ.hasOwnProperty(KEY)){

          // TD要素の数分ループ処理
          for(let a = 1; a < TD_DATA.length; a++){
            TD_DATA[a].firstChild.value = CONFIG_OBJ[KEY][columns[a-1]];
          }
        }
      }
    }
  }

  /**
   * テーブル構造の列名を除く行を全て削除する
   * @param {HTMLTableElement} table 
   */
  function delTipsInfoList(table){
    const TBODY = table[0].children[0];
    const TR_LEN = TBODY.childElementCount;

    for(let i = TR_LEN -1 ; i > 0; i--){
      const TR = TBODY.children[i];
      TR.remove();
    };
  };

  /**
   * 一覧テーブル
   * @param {*} jsonData 
   * @param {*} table 
   */
  function setTipsInfoList(jsonData,table){

    // JSONをオブジェクトにパースする
    const CONFIG_OBJ = JSON.parse(jsonData);
    let i = 1;

    for(let key of Object.keys(CONFIG_OBJ)) {
      createTipsConfigTable(
        table
        , TABLE_COLUMNS_TYPE_LIST
        , TABLE_COLUMNS_LIST
        , key
      );
      
      // 作成したTR要素を取得
      let tr = table[0].children[0].children[i];

      tr.children[1].children[0].value = CONFIG_OBJ[key]['TIPS名'];
      tr.children[2].children[0].value = CONFIG_OBJ[key]['TIPSの要素'];
      tr.children[3].children[0].value = CONFIG_OBJ[key]['TIPS表示位置'];
      tr.children[4].children[0].value = CONFIG_OBJ[key]['TIPSの内容'];
      tr.children[5].children[0].value = CONFIG_OBJ[key]['リンク先(a要素の場合)'];

      // 削除ボタン押下時の処理
      delButtonTipsConfigList();
      
      i++;
    };
  }

  /**
   * TIPS詳細画面設定情報入力欄を作成して、保存済みの情報があれば設定する
   */
  function setTipsInfoDetail() {
    // Create a dropdown menu containing a list of Space fields in the config.
    return KintoneConfigHelper.getFields('SPACER').then(function(res) {

      const TABLE_COLUMNS_TYPE = ['','input','select','select','textarea','input'];
      const TABLE_COLUMNS = ['tipId','tipName','tipElement','tipPosition','tipDetail','tipLink'];

      res.forEach(function(field) {
        // idが設定されている要素のみを対象とする
        if (field.elementId !== ''){

          // テーブル内部を作成する
          createTipsConfigTable(
            $tipsConfigDetail
            , TABLE_COLUMNS_TYPE
            , TABLE_COLUMNS
            , field.elementId
          );
        }
      });

      // コンフィグ保存情報から値を設定する
      if(CONF.hasOwnProperty(TIPS_CONFIG_DETAIL_KEY)){
        getConfigData(
          CONF[TIPS_CONFIG_DETAIL_KEY]    // コンフィグ保存情報
          ,　$tipsConfigDetail          // テーブル要素
          , COLUMN_TIPS_CONFIG_DETAIL   // 列オブジェクトのキー要素
        );
      }

    }).catch(function(err) {
      return alert('エラーが発生しました。' + '\n' + err.message);
    });
  }

  /**
   * tipsコンフィグ情報のテーブル部分を作成する
   * @param {*} tipsTable 
   * @param {*} tableColumnsFieldType 
   * @param {*} tableColumnsName 
   * @param {*} key
   */
  function createTipsConfigTable(
    tipsTable
    , tableColumnsFieldType
    , tableColumnsName
    , key
  ){
    // tr要素の作成
    let $tr = $('<tr>');

    for (let i = 0; i < tableColumnsFieldType.length; i++){

      // td要素の作成
      let $td = $('<td>');

      switch (tableColumnsFieldType[i]){
        case '':
          $td.text(escapeHtml(key));
          break;
        case 'input':
          let $input = $('<input>');
          $td.append($input.clone());
          break;
        case 'select':
          let ary;
          if (tableColumnsName[i] === 'tipElement'){
            ary = ['i','a'];
          }else{
            ary = ['top', 'right', 'left', 'bottom'];
          };

          // select要素を作成する
          let $select = setDropDown(ary);
          $td.append($select.clone());
          break;
        
        case 'textarea':
          let $textarea = $('<textarea>');
          $td.append($textarea.clone());
          break;
        
        case 'button' :
          let $button = $('<input type="button" value=" tips削除 " class="del-tips-config-list">');

          $td.append($button.clone());
          break;
      }

      // tr要素にtd要素を追加する
      $tr.append($td.clone());
    }

    // table要素にtr要素を追加する
    tipsTable.append($tr.clone());
  };

  /**
   * プラグイン画面で入力された設定情報を保存用にJSONに整形する
   * @param {*} config 
   * @param {*} tableName 
   * @param {*} trData 
   * @param {Array(string)} columns 設定情報を保存する際に利用する列のキー
   * @returns {jsonData} 設定情報をJSON化したもの
   */
  function setConfigData(config, tableName, trData, columns){

    const TIPS_INFO = {};

    // 行数分ループ処理
    for (let i = 1; i < trData.length; i++){

      // tr要素からtd要素群を取得する
      const TD_DATA = trData[i].children;

      // TIPS名が設定されていない場合はスキップする
      if (TD_DATA[1].firstChild.value === ''){
        continue;
      }
      
      // TIPSを特定するキー値(TIPSのID)を取り出す
      const KEY = TD_DATA[0].childElementCount === 1
        ? escapeHtml(TD_DATA[0].children[0].value)
        : escapeHtml(TD_DATA[0].textContent);
      
      const OBJ = {};

      // 設定項目の件数分ループ処理
      for (let a = 1; a < TD_DATA.length; a++){
        OBJ[columns[a-1]] = TD_DATA[a].firstChild.value;
      }

      TIPS_INFO[KEY] = OBJ;
    }

    // オブジェクトをJSON形式にしてリターンする
    config[tableName] = JSON.stringify(TIPS_INFO);
  };

  /**
   * 一覧画面TIPS設定テーブルの「TIPS削除」ボタン押下時の処理
   */
  function delButtonTipsConfigList(){

    // TIPS削除ボタン押下時の処理を実装
    // TIPS追加押下時に押下した対象行の「TIPS削除」ボタンにのみ削除処理を追加する
    $('.del-tips-config-list:last').on('click', function(e){

      let id = '';
      let blnInput = e.currentTarget.parentNode.parentNode.children[0].childElementCount;
      
      if(blnInput === 1){
        id = e.currentTarget.parentNode.parentNode.children[0].children[0].value;
      }else{
        id = e.currentTarget.parentNode.parentNode.children[0].value;
      }
      
      if(id !== ''){
        if(!window.confirm('idが入力されていますが、削除しますか？')){
          return;
        }
      }
      
      e.currentTarget.parentNode.parentNode.remove();
    });
  };

  // 詳細画面部分の生成・設定
  setTipsInfoDetail()
  .then(function(){
    // 一覧画面部分の生成・設定
    if(CONF.hasOwnProperty(TIPS_CONFIG_LIST_KEY)){
      setTipsInfoList(
        CONF[TIPS_CONFIG_LIST_KEY]
        , $tipsConfigList
      );
    }
  })
  .then(function(){
    // CSS部分の生成・設定
    if(CONF.hasOwnProperty(CSS_CONFIG_KEY)){
      getConfigData(
        CONF[CSS_CONFIG_KEY]  // コンフィグ保存情報
        , $cssConfigData      // テーブル要素
        , COLUMN_CSS_CONFIG   // 列オブジェクトのキー要素
      );
    };
  });

  /**
   * テーブルに行を追加する
   */
  TIPS_CONFIG_LIST_ADD_BUTTON.click(function(e){
    createTipsConfigTable(
      $tipsConfigList
      , TABLE_COLUMNS_TYPE_LIST_NEW
      , TABLE_COLUMNS_LIST
      , ''
    );

    // TIPS削除ボタン押下時の処理を実装
    delButtonTipsConfigList();
  });

  /**
   * CSVをエクスポートする。
   */
  CSV_EXPORT_BUTTON.click(function(){

    // CSVインポートする対象を取得する
    let importType = document.getElementById('csvImportType');
    importType = importType[importType.selectedIndex].value;

    let setTable;       // 設定するテーブル要素

    // 詳細画面の場合
    if (importType === 'DETAIL'){
      setTable = $tipsConfigDetail;
    // CSSの場合
    }else if(importType === 'CSS'){
      setTable = $cssConfigData;
    // 一覧画面の場合
    }else if(importType === 'LIST'){
      setTable = $tipsConfigList;
    }

    // 行数を取得
    let rowCount = setTable[0].children[0].childElementCount;

    // 設定情報が1行もない場合
    if(rowCount < 2){
      window.alert('設定情報がありません。エクスポート処理を中断します。');
      return;
    }

    let formatCSVData = '';
    // 行列データ
    const TRS = setTable[0].children[0].children;
    for(let row = 1; row < TRS.length; row++){

      if(row !== 1){
        // 行ごとに改行コードを挟む
        formatCSVData += ',"*"\n';
      }

      // 行データ
      const TR = TRS[row];

      for(let clm = 0; clm < TR.childElementCount; clm++){
        
        // 列データ
        let clmType = 'input'; // input:入力選択する列 text:入力選択できない列
        let delimiter = '';
        const TD = TR.children[clm];

        // 各行ごとのキーとなる値が未入力の場合は、対象行をスルーします。
        if(clm === 0){
          if(TD.childElementCount === 0){
            clmType = 'text';
          }
        }

        let val = '';
        if(clmType === 'text'){
          val = TD.textContent;
        }else if(clmType === 'input'){
          val = TD.children[0].value;
        }

        // 各行のキー項目が未設定の場合は、CSV出力対象から除外する
        if(clm === 0 && val === ''){
          break;
        }

        if(clm > 0){
          delimiter = ',';
        }

        formatCSVData += delimiter + csvTextFormat(val);
      }
    }

    // ダウンロードするCSVファイル名
    let dt = new Date();
    const DT_STR = dt.getFullYear()
      + ('00' + (dt.getMonth() + 1)).slice(-2)
      + ('00' + (dt.getDate())).slice(-2)
      + ('00' + (dt.getHours())).slice(-2)
      + ('00' + (dt.getMinutes())).slice(-2)
      + ('00' + (dt.getSeconds())).slice(-2)
    const FILE_NAME = importType + '_' + DT_STR + '.csv';

    // BOMを付与（Excelでの文字化け対策）
    const BOM = new Uint8Array([0xef, 0xbb, 0xbf]);

    // Blobでデータを作成する
    const BLOB = new Blob([BOM,formatCSVData], {type: 'text/csv'});

    //BlobからオブジェクトURLを作成する
    const URL = (window.URL || window.webkitURL).createObjectURL(BLOB);

    //ダウンロード用にリンクを作成する
    const DOWNLOAD = document.createElement('a');

    //リンク先に上記で生成したURLを指定する
    DOWNLOAD.href = URL;
    
    //download属性にファイル名を指定する
    DOWNLOAD.download = FILE_NAME;
    
    //作成したリンクをクリックしてダウンロードを実行する
    DOWNLOAD.click();

    //createObjectURLで作成したオブジェクトURLを開放する
    (window.URL || window.webkitURL).revokeObjectURL(URL);
    
  });

  function csvTextFormat(val){
    const CIRCLE_TEXT = '"';
    return CIRCLE_TEXT + val + CIRCLE_TEXT
  }

  // インポートボタン押下時の処理
  function csvImport(text){

    // CSVインポートする対象を取得する
    let importType = document.getElementById('csvImportType');
    importType = importType[importType.selectedIndex].value;

    let setTable;       // 設定するテーブル要素
    let columnPropaty;  // オブジェクト作成時に使用するオブジェクトのキー値（列名）

    // 詳細画面の場合
    if (importType === 'DETAIL'){
      setTable = $tipsConfigDetail;
      columnPropaty = COLUMN_TIPS_CONFIG_DETAIL;
    // CSSの場合
    }else if(importType === 'CSS'){
      setTable = $cssConfigData;
      columnPropaty = COLUMN_CSS_CONFIG;
    // 一覧画面の場合
    }else if(importType === 'LIST'){
      setTable = $tipsConfigList;
      columnPropaty = COLUMN_TIPS_CONFIG_DETAIL;
    }

    const CSV_ROWS = text.split(',\"*\"');
    const COFIG_DATA = {};

    for(let row = 0; row < CSV_ROWS.length; row++){

      const CSV_ROW = CSV_ROWS[row];
      const CSV_CLMS = CSV_ROW.split('\",');

      const CONFIG_ROW = {};

      for(let clm = 1; clm < CSV_CLMS.length; clm++){

        let csvClm = CSV_CLMS[clm];
        CONFIG_ROW[columnPropaty[clm-1]] = csvClm.replace(/\"/g,'');
      }
      COFIG_DATA[CSV_CLMS[0].replace(/\r?\n/g,'').replace(/\"/g,'')] = CONFIG_ROW;
    };

    // 一覧のみ行数が変動するので、以下の処理にてCSVデータを反映
    if(importType === 'LIST'){
      // 現在設定されている行を削除する
      delTipsInfoList(setTable);

      setTipsInfoList(
        JSON.stringify(COFIG_DATA)
        , setTable  
      );
    // 詳細とCSSは行が固定のため、以下の処理にてCSVデータを反映
    }else{
      getConfigData(
        JSON.stringify(COFIG_DATA)    // コンフィグ保存情報
        , setTable                    // テーブル要素
        , columnPropaty               // 列オブジェクトのキー要素
      );
    }
  };

  // プラグイン設定画面
  // 保存ボタン押下時の処理
  $form.on('submit', function(e) {
    e.preventDefault();
    var config = [];

    // TIPSの設定情報をJSON
    setConfigData(
      config
      , TIPS_CONFIG_DETAIL_KEY
      , $tipsConfigDetail[0].children[0].children
      , COLUMN_TIPS_CONFIG_DETAIL
    );

    // 一覧用TIPSの設定情報をJSON形式にして保存する
    setConfigData(
      config
      , TIPS_CONFIG_LIST_KEY
      , $tipsConfigList[0].children[0].children
      , COLUMN_TIPS_CONFIG_DETAIL
    );

    // CSSの設定情報をJSON形式にして保存する
    setConfigData(
      config
      , CSS_CONFIG_KEY
      , $cssConfigData[0].children[0].children
      , COLUMN_CSS_CONFIG
    );

    // 設定情報を保存する
    kintone.plugin.app.setConfig(config, function() {
      alert('設定内容を保存しました。');
      window.location.href = '/k/admin/app/flow?app=' + kintone.app.getId();
    });
  });

  // プラグイン設定画面
  // キャンセルボタン押下時の処理
  $cancelButton.click(function() {
    // プラグイン一覧画面に遷移する
    window.location.href = '/k/admin/app/' + kintone.app.getId() + '/plugin/';
  });

  // CSVファイルインポートエリア
  // ドラッグ&ドロップ時に使用する
  var fileArea = document.getElementById('dropArea');
  var fileInput = document.getElementById('uploadFile');

  // CSVファイルインポートエリア
  // ドラッグオーバー時の処理
  fileArea.addEventListener('dragover', function(e){
    e.preventDefault();
    fileArea.classList.add('dragover');
  });

  // CSVファイルインポートエリア
  // ドラッグアウト時の処理
  fileArea.addEventListener('dragleave',function(e){
    e.preventDefault();
    fileArea.classList.remove('dragover');
  });

  // CSVファイルインポートエリア
  // ドロップ時の処理
  fileArea.addEventListener('drop', function(e){
    e.preventDefault();
    fileArea.classList.remove('dragover');

    // インポート前チェック
    if(!beforeCheckCsvImport()){
      fileInput.value = null;
      return;
    }

    // ドロップ時の処理
    var files = e.dataTransfer.files;

    // 取得したファイルをinput[type=file]に設定
    fileInput.value = null;
    fileInput.files = files;

    if(typeof files[0] !== 'undefined'){
      // ファイルを正常に受け取れた場合
      updateUploadCsvFileInfo(files[0]);

    }else{
      // ファイルを正常に受け取れない場合
    }
  });

  // input[type=file]に変更があれば実行する
  // ドロップ以外でも発火する
  fileInput.addEventListener('change', function(e){

    // インポート前チェック
    if(!beforeCheckCsvImport()){
      fileInput.value = null;
      return;
    }
    
    const FILE = e.target.files[0];

    if(typeof FILE !== 'undefined'){
      // ファイルを正常に受け取れた場合
      updateUploadCsvFileInfo(FILE);
      fileInput.value = null;
    }else{
      // ファイルを正常に受け取れない場合
    }
  }, false);

  /**
   * CSVインポート前の更新確認ダイアログを表示する
   * @returns {boolean} 更新する：true/更新しない：false
   */
  function beforeCheckCsvImport(){

    let blnCheck = true;

    // CSVをインポートする対象を取得する
    let importType = document.getElementById('csvImportType');
    importType = importType[importType.selectedIndex].text;

    // 登録データを上書きします。
    if(!window.confirm(`【${importType}】の設定情報をCSVファイルの内容に更新してもよろしいですか？`)){
      blnCheck = false;
    }

    return blnCheck;
  }

  function updateUploadCsvFileInfo(file){

    const UPLOAD_FILE_DIV = document.getElementById('inputFileInfo');
    const INFO_LABEL =['File Name：','File Text：','File Size：'];
    const INFO_VALUE_PROPATY = ['name','type','size']

    if(UPLOAD_FILE_DIV.childElementCount !== 0){
      
      for(let i = 0; i < INFO_LABEL.length; i++){
        UPLOAD_FILE_DIV.firstElementChild.remove();
      };
    };

    for(let i = 0; i< INFO_LABEL.length; i++){
      const ELEMENT_P = document.createElement('p');
      ELEMENT_P.textContent = INFO_LABEL[i] + file[INFO_VALUE_PROPATY[i]];
      UPLOAD_FILE_DIV.append(ELEMENT_P);
    };

    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function() {
      csvImport(reader.result);
    };

  };

})(jQuery, kintone.$PLUGIN_ID);