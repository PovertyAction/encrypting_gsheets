//Reference: http://www.skipser.com/p/2/p/password-protect-google-drive-document.html

var GLOBALID = "SpreadSheetProtector0";

function clearDb() {
  var prop = PropertiesService.getUserProperties();
  if (prop.getProperty("sheetencrypted-state-"+GLOBALID) != null) {
    prop.deleteProperty("sheetencrypted-state-"+GLOBALID);
  }
  if (prop.getProperty("sheetencrypted-password-"+GLOBALID) != null) {
    prop.deleteProperty("sheetencrypted-password-"+GLOBALID);
  }
  if (prop.getProperty("sheetencrypted-id-"+GLOBALID) != null) {
    prop.deleteProperty("sheetencrypted-id-"+GLOBALID);
  }
}

function showChangePasswordForm() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  spreadsheet.show(HtmlService.createHtmlOutputFromFile('changepassword'));
}


function changePassword(obj) {
  Logger.log(obj.oldpassword);

  var prop = PropertiesService.getUserProperties();
  if (prop.getProperty("sheetencrypted-password-"+GLOBALID) != null) {
    if (prop.getProperty("sheetencrypted-password-"+GLOBALID) != obj.oldpassword) {
      return({'status':'notmatching'});
    }
  }

  prop.setProperty("sheetencrypted-password-"+GLOBALID, obj.newpassword);

  return({'status':'done'});
}

function checkstate1() {
  var prop = PropertiesService.getUserProperties();
  Logger.log("State - "+prop.getProperty("sheetencrypted-state-"+GLOBALID));
  Logger.log("Id - "+prop.getProperty("sheetencrypted-id-"+GLOBALID));
  Logger.log("Password - "+prop.getProperty("sheetencrypted-password-"+GLOBALID));

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var id = ss.getActiveSheet().getSheetId();
  Logger.log(DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId()).getUrl()+"&gid="+id);
  SpreadsheetApp.getActiveSpreadsheet().getSheets()[0].getRange('C1').setValue(ScriptApp.getService().getUrl());
}

function EncodeFromSheet() {
  Logger.log("Starting EncodeFromSheet");
  var prop = PropertiesService.getUserProperties();
  var encrypted = prop.getProperty("sheetencrypted-state-"+GLOBALID);
  if (encrypted == 2) {
    Browser.msgBox('ATTENTION', 'The sheet is already encrypted!!', Browser.Buttons.OK);
    return;
  }
  Logger.log("Sheet is un-encrypted. Proceeding.");

  var password='';
  if (prop.getProperty("sheetencrypted-password-"+GLOBALID) == null) {
    Logger.log("Got null password, asking for one");
    password=Browser.inputBox("Create a new password.", Browser.Buttons.OK_CANCEL);
    if(password == 'cancel') {
      return;
    }
    prop.setProperty("sheetencrypted-password-"+GLOBALID, sha256(password));
    prop.setProperty("sheetencrypted-id-"+GLOBALID, SpreadsheetApp.getActiveSpreadsheet().getId());
    prop.setProperty("sheetencrypted-url-"+GLOBALID, DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId()).getUrl());
    Logger.log("Going to encoding after getting password");
    EnCodeSheet(false, password);
  }
  else {
    Logger.log("Found password in DB. Asking for user password before launching encryption");
    SpreadsheetApp.getActiveSpreadsheet().show(HtmlService.createHtmlOutputFromFile('inputpasswordencrypt'));
  }
}
function encodeForRequest(obj) {
  var prop = PropertiesService.getUserProperties();
  Logger.log("|"+obj.password+"|"+prop.getProperty("sheetencrypted-password-"+GLOBALID)+"|");
  if (prop.getProperty("sheetencrypted-password-"+GLOBALID) != sha256(obj.password)) {
    Logger.log("Passwords not matching. Return false");
    return({'status':'failed'});
  }
  else {
    EnCodeSheet(false);
    return({'status':'success'});
  }
}
function EnCodeSheet(id, password) {
  var prop = PropertiesService.getUserProperties();
  Logger.log(id);

  var activesheet;
  if(id == false) {
    activesheet=SpreadsheetApp.getActiveSpreadsheet();
    activesheet.setActiveSelection("A1:A1");
  }
  else {
    activesheet=SpreadsheetApp.openById(prop.getProperty("sheetencrypted-id-"+GLOBALID));
  }

  //If encryption state is 'encrypted', do nothing
  if (prop.getProperty("sheetencrypted-state-"+GLOBALID) == 2) {
    return;
  }

  //Encrypt
  //For every sheet
  for (var k=0; k<activesheet.getSheets().length; k++) {
    //Get sheet
    var ss = activesheet.getSheets()[k];
    //Get data range
    var range = ss.getDataRange();
    //Get values
    var vals = range.getValues();

    //Start fron row 1 (dont want to encrypt header)
    for (var i=1;i<vals.length; i++) {
      //For every column
      for (var j=0; j<vals[i].length; j++) {
        //Do nothing if cell is empty
        if (vals[i][j] != "") {

          //Not sure why the +1 here
          if (ss.getRange(i+1, j+1, 1, 1).getFormula() == "") {
            vals[i][j]=encrypt(vals[i][j], password);
            ss.getRange(i+1, j+1, 1, 1).setValue(vals[i][j]);
          }
        }
      }
    }
  }
  prop.setProperty("sheetencrypted-state-"+GLOBALID, 2);
}

function DecodeFromSheet() {
  var prop = PropertiesService.getUserProperties();
  if (prop.getProperty("sheetencrypted-state-"+GLOBALID) == 1) {
    Browser.msgBox('ATTENTION', 'The sheet is already in normal state!!', Browser.Buttons.OK);
    return;
  }

  if (prop.getProperty("sheetencrypted-password-"+GLOBALID) == null) {
    Browser.msgBox("You have not encoded the file yet!!!!");
    return;
  }
  else {
    SpreadsheetApp.getActiveSpreadsheet().show(HtmlService.createHtmlOutputFromFile('inputpassworddecrypt'));
  }
}
function decodeForRequest(obj) {
  Logger.log('holaaaaaaaa');
  var prop = PropertiesService.getUserProperties();

  Logger.log("Starting decodeForRequest - " +obj.password);
  if (prop.getProperty("sheetencrypted-password-"+GLOBALID) != sha256(obj.password)) {
    Logger.log("Login failed");
    return({'status':'failed'});
  }
  else {
    Logger.log("Login success");
    DeCodeSheet(false, obj.password);
    return({'status':'success'});
  }
}

// 1 - sheet is in normal state.
// 2 - sheet is encrypted.



function DeCodeSheet(id, password) {
  Logger.log("From DecodeSheet");
  var prop = PropertiesService.getUserProperties();
  var activesheet;
  if(id == false) {
    activesheet=SpreadsheetApp.getActiveSpreadsheet();
    activesheet.setActiveSelection("A1:A1");
  }
  else {
    activesheet=SpreadsheetApp.openById(prop.getProperty("sheetencrypted-id-"+GLOBALID));
  }

  if (prop.getProperty("sheetencrypted-state-"+GLOBALID) == 1) {
    Logger.log("Already decoded");
    return;
  }

  for (var k=0; k<activesheet.getSheets().length; k++) {
    var ss = activesheet.getSheets()[k];
    var range = ss.getDataRange();
    var vals = range.getValues();
    //var actvals=[];

    //Skip header
    for (var i=1;i<vals.length; i++) {
      for (var j=0; j<vals[i].length; j++) {
        if (vals[i][j] != "") {
          if (ss.getRange(i+1, j+1, 1, 1).getFormula() == "") {
            vals[i][j]=decrypt(vals[i][j], password);
            ss.getRange(i+1, j+1, 1, 1).setValue(vals[i][j]);
          }
        }
      }
    }
  }

  prop.setProperty("sheetencrypted-state-"+GLOBALID, 1);
}


function test_cypher(){

  var encryptedMessage = CryptoJS['Rabbit'].encrypt('this is my message to be encrypted', 'this is my passphrase').toString();
  // var decryptedMessage = cipher.decrypt (encryptedMessage);
  var decryptedMessage = CryptoJS['Rabbit'].decrypt(encryptedMessage, 'this is my passphrase').toString(CryptoJS.enc.Utf8);
  Logger.log (encryptedMessage);
  Logger.log (decryptedMessage);
}

function encrypt(text, key) {

  //Transform to string case text is a number
  text = text.toString(16);

  encryptedMessage = CryptoJS['Rabbit'].encrypt(text, key).toString();
  Logger.log(encryptedMessage);
  return encryptedMessage;
}

function decrypt(text, key) {

  //Transform to string case text is a number
  text = text.toString(16);

  dencryptedMessage = CryptoJS['Rabbit'].decrypt(text, key).toString(CryptoJS.enc.Utf8);
  return dencryptedMessage;
}

function getHtml(msg,butt) {
  html='<html>'+
  '<head>'+
  '</head>'+
    '<body>'+
    '<div style="width:100%; text-align:center; font-family:Georgia;">'+
      '<h2 style="font-size:40px;"><i>Input You password.</i></h2>'+
        '<form type="submit" action="'+ScriptApp.getService().getUrl()+'" method="post" style="font-size:22px;">'+
        '<label>'+msg+'</label>'+
        '<input type="password" name="password" value="" style="padding:5px; width:300px;" />'+
        '<input type="submit" name="submit" value="'+butt+'" style="padding:5px;" />'+
      '</form>'+
    '</div>'+
      '</body>'+
    '</html>';
  return html;
}

function doGet() {
  var prop = PropertiesService.getUserProperties();
  var password='';
  var html='';
  if (prop.getProperty("sheetencrypted-password-"+GLOBALID) == null) {
    html='<html><body>You have not set any password</body></html>';
  }
  else {
    var butt;
    if(prop.getProperty("sheetencrypted-state-"+GLOBALID) == 1) {
      butt='Encrypt';
    }
    else {
      butt='decrypt';
    }
    html=getHtml('',butt);
  }
  return HtmlService.createHtmlOutput(html)
}


function get_passowrd() {
  var prop = PropertiesService.getUserProperties();
  pass = prop.getProperty("sheetencrypted-password-"+GLOBALID);
  Logger.log(pass);
  }

function doPost(e) {
  var prop = PropertiesService.getUserProperties();
  var html='';
  if (prop.getProperty("sheetencrypted-password-"+GLOBALID) == null) {
    html='<html><body>You have not set any password</body></html>';
  }
  else {
    var butt;
    if(prop.getProperty("sheetencrypted-state-"+GLOBALID) == 1) {
      butt='Encrypt';
    }
    else {
      butt='Decrypt';
    }

    var docurl=prop.getProperty("sheetencrypted-url-"+GLOBALID);

    if(e.parameter.password != prop.getProperty("sheetencrypted-password-"+GLOBALID)) {
      html=getHtml('<span style="color:red;">Incorrect password. Please retry!!!</span><br/>', butt);
      return HtmlService.createHtmlOutput(html);
    }
    else {
      if(e.parameter.submit == 'Encrypt') {
        EnCodeSheet(true);
        html=getHtml('<span style="color:green;">Encoded Successfully!! <a href="'+docurl+'">Click here to go back.</a></span><br/>', 'Decrypt');
      }
      else {
        DeCodeSheet(true);
        html=getHtml('<span style="color:green;">Decoded Successfully!!  <a href="'+docurl+'">Click here to go back.</a></span><br/>', 'Encrypt');
      }
      return HtmlService.createHtmlOutput(html);
    }
  }
}


function onOpen() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menuEntries = [ {name: "Initialize", functionName: "Initialize"},
                      null,
                      {name: "Encrypt File", functionName: "EncodeFromSheet"},
                      {name: "Decrypt File", functionName: "DecodeFromSheet"},
                      null,
                     {name: "Change Password", functionName: "showChangePasswordForm"}];
  ss.addMenu("Protect File", menuEntries);
}


function onInstall() {
  onOpen();
}

function Initialize() {
  return;
}
