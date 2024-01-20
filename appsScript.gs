const yourApiKey = "";
const yourInstance = "";

function saveToSpreadSheed(lastId,cell) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.getRange(cell).setValue(lastId.join(','));
}

function loadFromSpreadSheet(cell) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastId = sheet.getRange(cell).getValue().split(',');
  return lastId;
}

function getNames(object) {
    if (!object || typeof object !== 'object') return [];
    if ('name' in object) return [object.name];
    return Object.values(object).reduce((r, v) => [...r, ...getNames(v)], []);
}

function mainFunction(apikey, server, cell) {
  var instanceUrl = 'https://' + server; 
  var oldNames = loadFromSpreadSheet(cell);
  var apiUrl = instanceUrl + '/api/emojis';

  var options = {
      'method': 'GET',
      'headers' : {'Content-Type': 'application/json'},
      'payload':JSON.stringify({i : apikey}) 
    };

  var response = UrlFetchApp.fetch(apiUrl, options);
  var responseData = JSON.parse(response.getContentText());
  var names = getNames(responseData);
  var add = false;
  var newText = '新しい絵文字が追加されました\n';

  var newEmoji = names.filter(i => oldNames.indexOf(i) == -1)

  for (var i = 0; i < newEmoji.length; i++) {
    var emoji = newEmoji[i];

    if (newText.length > 2900){
      postToMisskey(newText, {server: server, token: apikey})
      newText = '新しい絵文字が追加されました\n';
    }

    newText += '$[x3 :' + emoji + ':]\n `' + emoji + '`\n\n';
    add = true;
  }

  if(add){
    postToMisskey(newText, {server: server, token: apikey})
    // 最後の要素のidを取得して保存
    saveToSpreadSheed(names, cell);
  }
}

function postToMisskey(text, options) {
  return UrlFetchApp.fetch(
    `https://${options.server}/api/notes/create`, 
    {
      'method': 'POST',
      'headers' : {'Content-Type': 'application/json'},
      'payload':JSON.stringify({i : options.token, text: text})
    }
  );
}

//実行関数
function execTrigger(){
  mainFunction(yourApiKey,yourInstance,'A1:A1');
}
