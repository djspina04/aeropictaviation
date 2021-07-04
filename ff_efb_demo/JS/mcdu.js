//noinspection JSUnresolvedFunction
var MCDU_BUTTON_DOWN = new Audio('Resources/mcdu/sounds/Button.mp3');
//var vibrationLength = 50;
//var MCDU_FAILURE = 0;
var MCDU_SelfTestCompleted = 0;
var MCDU_SecondsSelftesting = 0;
var ff = new FlightFactor('');
var scratchPad = '';

var colorYellow = "rgb(226,226,75)"; //Y
var colorWhite = "rgb(382,382,382)"; //W
var colorGreen = "rgb(79,238,79)"; //G
var colorBlue = "rgb(62,153,184)"; //B
var colorMagenta = "rgb(202,191,382)"; //M
var colorAmber = "rgb(225,149,37)"; //A
var colorRed = "rgb(382,0,0)"; //R
var colorGrey = "rgb(127,127,127)"; //X

var CharSquare = "□";
var CharOverfly = "";
var CharArrowLeft = ""; // "←"; &#x008B;
var CharArrowRight = ""; // "→"; &#x009B;
var CharDegree = "°";
var CharArrowUp = ""; // "↑"; &#x0086;
var CharArrowDown =""; // "↓"; &#x0087;
var CharSlash = "\\";

var fontSizeBig = '100%'; // 110%
var fontSizeSmall = '70%';

var DisplayLines1 = '';
var DisplayLines2 = '';
var DisplayLines3 = '';
var DisplayLines4 = '';
var DisplayLines5 = '';
var DisplayLines6 = '';
var DisplayLines7 = '';
var DisplayLines8 = '';
var DisplayLines9 = '';
var DisplayLines10 = '';
var DisplayLines11 = '';
var DisplayLines12 = '';
var DisplayLines13 = '';
var DisplayLines14 = '';

var DisplayAttrs1 = '';
var DisplayAttrs2 = '';
var DisplayAttrs3 = '';
var DisplayAttrs4 = '';
var DisplayAttrs5 = '';
var DisplayAttrs6 = '';
var DisplayAttrs7 = '';
var DisplayAttrs8 = '';
var DisplayAttrs9 = '';
var DisplayAttrs10 = '';
var DisplayAttrs11 = '';
var DisplayAttrs12 = '';
var DisplayAttrs13 = '';
var DisplayAttrs14 = '';
var GotMCDUData = 1;

var localOperation = 0;
var localMode = "STARTING";

var MCDU_HOST_IP = document.location.host.split(":")[0];
var MCDU_HOST_PORT = document.location.host.split(":")[1];

if (MCDU_HOST_IP == '') {
    MCDU_HOST_IP = 'localhost';
    MCDU_HOST_PORT = '';
}

//noinspection CoffeeScriptUnusedLocalSymbols,JSUnusedLocalSymbols
function disableSelect(e) {
    return false
}

function reEnable() {
    return true
}

//document.onselectstart = new Function ("return false");
if (window.sidebar){
    //document.onmousedown = disableSelect;
    document.onclick = reEnable;
}

window.addEventListener('resize', AdjustFontSize);
window.onload = function() {
    AdjustFontSize();
};

function AdjustFontSize(){
    var w = document.getElementById("MCDU_SCREEN").style.width;
    var h = document.getElementById("MCDU_SCREEN").clientHeight;

    document.body.style.fontSize = h/22 + "px";
}

function SettingsToggle(){
    document.getElementById("SETTINGS_HOST_IP").value = MCDU_HOST_IP;
    document.getElementById("SETTINGS_HOST_PORT").value = MCDU_HOST_PORT;
    if(document.getElementById("SETTINGS_DIV").style.display == "block"){
        document.getElementById("SETTINGS_DIV").style.display = "none";
    }else{
        document.getElementById("SETTINGS_DIV").style.display = "block";
    }

}

function SETTINGS_SAVE() {
    MCDU_HOST_IP = document.getElementById('SETTINGS_HOST_IP').value;
    MCDU_HOST_PORT = document.getElementById('SETTINGS_HOST_PORT').value;
    ff = new FlightFactor(MCDU_HOST_IP + ':' + MCDU_HOST_PORT);
    if (document.getElementById('SETTINGS_DIV').style.display == 'none') {
        document.getElementById('SETTINGS_DIV').style.display = 'block';
    } else {
        document.getElementById('SETTINGS_DIV').style.display = 'none';
    }
    MCDU_LastMessageReceived = 10;
}

//FOR LOCAL OPS
function localButtonPressed(identifier){
    /*
     if(localmode=="ONLINE"){
     scratchpad = scratchpad.replace(/ /g, "");
     if(identifier=="btnCLR"){
     if(scratchpad=="CLR"){
     scratchpad="";
     }else{
     if(scratchpad!==""){
     scratchpad = scratchpad.substring(0, scratchpad.length-1);
     }else{
     scratchpad="CLR";
     }
     }

     }

     if(identifier.includes("btn")){
     if(identifier.substring(3).length==1){
     if(scratchpad.length <=22){
     scratchpad = scratchpad +  identifier.substring(3);
     }
     }
     if(identifier.substring(3)=="DOT"){
     if(scratchpad.length <=22){
     scratchpad = scratchpad +  ".";
     }
     }
     if(identifier.substring(3)=="SLASH"){
     if(scratchpad.length <=22){
     scratchpad = scratchpad +  CharSlash;
     }
     }



     }


     WriteTextToLine(14,"WWWWWWWWWWWWWWWWWWWWWWWW",		makeString24(scratchpad));

     }

     */

    if (localMode !== "ONLINE" && MCDU_SelfTestCompleted != 0){
        if(localMode == "SETTINGS"){
            if(identifier == "LSK_L2"){
                if(scratchPad == "CLR"){
                    WriteTextToLine(5, "WWWWWWWWWWWWWWWWWWWWWWWW", "                        ");
                    WriteTextToLine(14, "WWWWWWWWWWWWWWWWWWWWWWWW", "                        ");
                    scratchPad = "";
                    MCDU_HOST_IP = "";
                }else{
                    WriteTextToLine(5, "GGGGGGGGGGGGGGGGGGGGGGGG", makeString24(scratchpad));
                    WriteTextToLine(14, "WWWWWWWWWWWWWWWWWWWWWWWW", "                        ");
                    MCDU_HOST_IP = scratchPad;
                    scratchPad = "";
                }
            }

            if(identifier == "LSK_L3"){
                if(scratchPad == "CLR"){
                    WriteTextToLine(7, "WWWWWWWWWWWWWWWWWWWWWWWW", "                        ");
                    WriteTextToLine(14, "WWWWWWWWWWWWWWWWWWWWWWWW", "                        ");
                    scratchPad = "";
                    MCDU_HOST_PORT = "";
                }else{
                    WriteTextToLine(7, "GGGGGGGGGGGGGGGGGGGGGGGG", makeString24(scratchpad));
                    WriteTextToLine(14, "WWWWWWWWWWWWWWWWWWWWWWWW", "                        ");
                    MCDU_HOST_PORT = scratchPad;
                    scratchPad = "";
                }
            }

            if(identifier == "LSK_R6"){
                SETTINGS_SAVE();
                WriteTextToLine(13, "GGGGGGGGGGGGGGGGGGGGGGGG", "                   SAVED");
                localMode = "ONLINE";
                localOperation = 0;

            }
        }

        if(identifier == "btnCLR"){
            if(scratchPad == "CLR"){
                scratchPad = "";
            }else{
                if(scratchPad !== ""){
                    scratchPad = scratchPad.substring(0, scratchPad.length-1);
                }else{
                    scratchPad = "CLR";
                }
            }
        }

        if(identifier.includes("btn")){
            if(identifier.substring(3).length == 1){
                if(scratchPad.length <= 22){
                    scratchPad = scratchPad +  identifier.substring(3);
                }
            }
            if(identifier.substring(3) == "DOT"){
                if(scratchPad.length <=22){
                    scratchPad = scratchPad +  ".";
                }
            }
            if(identifier.substring(3) == "SLASH"){
                if(scratchPad.length <= 22){
                    scratchPad = scratchPad +  CharSlash;
                }
            }
        }

        WriteTextToLine(14, "WWWWWWWWWWWWWWWWWWWWWWWW", makeString24(scratchPad));
        if(localMode == "STARTING"){ }

        if(localMode == "NOCONNECTION"){
            if(identifier == "LSK_R6"){
                loadLocalPage("SETTINGS");
            }

            if(identifier=="LSK_L6"){
                location.reload();
            }
        }
    }
}

function makeString24(inputstring){
    var modString = String(inputstring + "                        ").slice(0, 24);
    return modString.toUpperCase();
}

function loadLocalPage(page){
    localOperation = 1;

    if(page=="SETTINGS"){
        localMode = "SETTINGS";
        WriteTextToLine(1,  "WWWWWWWWWWWWWWWWWWWWWWWW", "                        ");
        WriteTextToLine(2,  "AAAAAAAAAAAAAAAAAAAAAAAA", "        SETTINGS        ");
        WriteTextToLine(3,  "WWWWWWWWWWWWWWWWWWWWWWWW", "                        ");
        WriteTextToLine(4,  "wwwwwwwwwwwwwwwwwwwwwwww", "HOST ADDRESS:           ");
        WriteTextToLine(5,  "BBBBBBBBBBBBBBBBBBBBBBBB", makeString24(MCDU_HOST_IP));
        WriteTextToLine(6,  "wwwwwwwwwwwwwwwwwwwwwwww", "HOST PORT:              ");
        WriteTextToLine(7,  "BBBBBBBBBBBBBBBBBBBBBBBB", makeString24(MCDU_HOST_PORT));
        WriteTextToLine(8,  "WWWWWWWWWWWWWWWWWWWWWWWW", "                        ");
        WriteTextToLine(9,  "WWWWWWWWWWWWWWWWWWWWWWWW", "                        ");
        WriteTextToLine(10, "WWWWWWWWWWWWWWWWWWWWWWWW", "                        ");
        WriteTextToLine(11, "WWWWWWWWWWWWWWWWWWWWWWWW", "                        ");
        WriteTextToLine(12, "WWWWWWWWWWWWWWWWWWWWWWWW", "                        ");
        WriteTextToLine(13, "gggggggggggggggggggggggg", "                   SAVE>");
        WriteTextToLine(14, "WWWWWWWWWWWWWWWWWWWWWWWW", "                        ");
    }
}

function extractIdentifier(identifier){
    if (!identifier) {
        identifier = window.event;
    }
    var sender = identifier.srcElement || identifier.target;

    //maybe some nested element.. find the actual table cell parent.
    while (sender && sender.nodeName.toLowerCase() != "div")
        sender = sender.parentNode;

    var myId = sender.id;
    return(myId);
}

function LSK_L1_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispLine', '0');
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispSide', '0');
}

function LSK_L2_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispLine', '1');
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispSide', '0');
}

function LSK_L3_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispLine', '2');
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispSide', '0');
}

function LSK_L4_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispLine', '3');
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispSide', '0');
}

function LSK_L5_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispLine', '4');
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispSide', '0');
}

function LSK_L6_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispLine', '5');
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispSide', '0');
}

function LSK_R1_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispLine', '0');
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispSide', '1');
}

function LSK_R2_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispLine', '1');
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispSide', '1');
}

function LSK_R3_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispLine', '2');
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispSide', '1');
}

function LSK_R4_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispLine', '3');
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispSide', '1');
}

function LSK_R5_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispLine', '4');
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispSide', '1');
}

function LSK_R6_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispLine', '5');
    ff.Set('Aircraft.FMGS.MCDU1.PressedDispSide', '1');
}

function btnDIR_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedMenuPage', '0');
}

function btnPROG_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedMenuPage', '1');
}

function btnPERF_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedMenuPage', '2');
}

function btnINIT_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedMenuPage', '3');
}

function btnDATA_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedMenuPage', '4');
}

function btnDATAr_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    alert(GetTextFromLine(prompt('Line'), prompt('Position')))
}

function btnBRT_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    MCDU_BUTTON_DOWN['play']();
}

function btnFPLAN_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedMenuPage', '5');
}

function btnRADNAV_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedMenuPage', '6');
}

function btnFUELPRED_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedMenuPage', '7');
}

function btnSECFPLAN_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedMenuPage', '8');
}

function btnATCCOMM_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedMenuPage', '9');
}

function btnMCDUMENU_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedMenuPage', '10');
}

function btnDIM_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    MCDU_BUTTON_DOWN['play']();
}

function btnAIRPORT_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedMenuPage', '11');
}

function btnAIRPORTr_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
}

function btnARRLEFT_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedMenuPage', '12');
}

function btnARRUP_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedMenuPage', '13');
}

function btnARRRIGHT_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedMenuPage', '14');
}

function btnARRDOWN_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
    ff.Set('Aircraft.FMGS.MCDU1.PressedMenuPage', '15');
}

function btn1_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedNum', '0');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btn2_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedNum', '1');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btn3_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedNum', '2');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btn4_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedNum', '3');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btn5_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedNum', '4');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btn6_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedNum', '5');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btn7_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedNum', '6');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btn8_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedNum', '7');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btn9_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedNum', '8');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnDOT_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedNum', '9');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btn0_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedNum', '10');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnPLUSMINUS_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedNum', '11');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnA_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '0');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnB_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '1');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnC_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '2');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnD_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '3');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnE_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '4');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnF_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '5');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnG_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '6');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnH_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '7');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnI_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '8');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnJ_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '9');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnK_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '10');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnL_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '11');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnM_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '12');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnN_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '13');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnO_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '14');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnP_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '15');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnQ_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '16');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnR_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '17');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnS_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '18');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnT_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '19');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnU_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '20');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnV_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '21');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnW_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '22');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnX_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '23');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnY_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '24');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnZ_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '25');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnSLASH_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '26');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnSP_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '27');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnOVFY_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN['play']();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '28');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

function btnCLR_Click(identifier) {
    localButtonPressed(extractIdentifier(identifier));
    MCDU_BUTTON_DOWN.play();
    ff.Set('Aircraft.FMGS.MCDU1.PressedKey', '29');
    if (GotMCDUData == 1) {
        GotMCDUData = 0;
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }
}

var MCDU_LastMessageReceived = 10;

$(document).ready(function() {
    //noinspection JSUnusedLocalSymbols
    var refresh_aircraft_id = setInterval(function() {
        if (MCDU_LastMessageReceived >= 20) {
            MCDU_LastMessageReceived = 10
        }
        MCDU_LastMessageReceived = MCDU_LastMessageReceived + 1;
        UpdateScreen();
        ff.Get('Aircraft.FMGS.MCDU1', MCDUData);
    }, 300);
});

//var test = 0;
function MCDUData(data){
    localMode = "ONLINE";
    DisplayLines1 = ConvertChars(data.DisplayLines1);
    DisplayLines2 = ConvertChars(data.DisplayLines2);
    DisplayLines3 = ConvertChars(data.DisplayLines3);
    DisplayLines4 = ConvertChars(data.DisplayLines4);
    DisplayLines5 = ConvertChars(data.DisplayLines5);
    DisplayLines6 = ConvertChars(data.DisplayLines6);
    DisplayLines7 = ConvertChars(data.DisplayLines7);
    DisplayLines8 = ConvertChars(data.DisplayLines8);
    DisplayLines9 = ConvertChars(data.DisplayLines9);
    DisplayLines10 = ConvertChars(data.DisplayLines10);
    DisplayLines11 = ConvertChars(data.DisplayLines11);
    DisplayLines12 = ConvertChars(data.DisplayLines12);
    DisplayLines13 = ConvertChars(data.DisplayLines13);
    DisplayLines14 = ConvertChars(data.DisplayLines14);
    scratchPad = DisplayLines14;
    DisplayAttrs1 = data.DisplayAttrs1;
    DisplayAttrs2 = data.DisplayAttrs2;
    DisplayAttrs3 = data.DisplayAttrs3;
    DisplayAttrs4 = data.DisplayAttrs4;
    DisplayAttrs5 = data.DisplayAttrs5;
    DisplayAttrs6 = data.DisplayAttrs6;
    DisplayAttrs7 = data.DisplayAttrs7;
    DisplayAttrs8 = data.DisplayAttrs8;
    DisplayAttrs9 = data.DisplayAttrs9;
    DisplayAttrs10 = data.DisplayAttrs10;
    DisplayAttrs11 = data.DisplayAttrs11;
    DisplayAttrs12 = data.DisplayAttrs12;
    DisplayAttrs13 = data.DisplayAttrs13;
    DisplayAttrs14 = data.DisplayAttrs14;
    GotMCDUData = 1;
    MCDU_LastMessageReceived = 0.1;
    UpdateScreen();
}

function ConvertChars(inputstring){
    var outputString = inputstring.replace(/c/g, CharArrowRight);
    outputString = outputString.replace(/b/g, CharArrowLeft);
    outputString = outputString.replace(/d/g, CharSquare);
    outputString = outputString.replace(/e/g, CharDegree);
    outputString = outputString.replace(/f/g, CharArrowUp);
    outputString = outputString.replace(/g/g, CharArrowDown);

    //var outputString = inputstring;

    return outputString
}

function UpdateScreen() {
    if (MCDU_SecondsSelftesting == 6) {
        MCDU_SelfTestCompleted = 1
    }
    if (MCDU_SelfTestCompleted == 0) {
        localMode = "SELFTEST";
        WriteTextToLine(1, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
        WriteTextToLine(2, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
        WriteTextToLine(3, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
        WriteTextToLine(4, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
        WriteTextToLine(5, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
        WriteTextToLine(6, 'GGGGGGGGGGGGGGGGGGGGGGGG', '      PLEASE WAIT       ');
        WriteTextToLine(7, 'GGGGGGGGGGGGGGGGGGGGGGGG', '  SELF TEST MAX 10 SEC  ');
        WriteTextToLine(8, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
        WriteTextToLine(9, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
        WriteTextToLine(10, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
        WriteTextToLine(11, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
        WriteTextToLine(12, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
        WriteTextToLine(13, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
        WriteTextToLine(14, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
        MCDU_SecondsSelftesting = MCDU_SecondsSelftesting + 1;
    } else {
        if (MCDU_LastMessageReceived == 0) {
            localMode = "NOCONNECTION";
            WriteTextToLine(1, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
            WriteTextToLine(2, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
            WriteTextToLine(3, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
            WriteTextToLine(4, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
            WriteTextToLine(5, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
            WriteTextToLine(6, 'GGGGGGGGGGGGGGGGGGGGGGGG', '        FAILURE         ');
            WriteTextToLine(7, 'GGGGGGGGGGGGGGGGGGGGGGGG', '     NO CONNECTION      ');
            WriteTextToLine(8, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
            WriteTextToLine(9, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
            WriteTextToLine(10, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
            WriteTextToLine(11, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
            WriteTextToLine(12, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
            WriteTextToLine(13, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
            WriteTextToLine(14, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
            localOperation = 1;
        } else {
            if ((MCDU_LastMessageReceived) >= 10) {
                localMode = "NOCONNECTION";
                WriteTextToLine(1, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
                WriteTextToLine(2, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
                WriteTextToLine(3, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
                WriteTextToLine(4, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
                WriteTextToLine(5, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
                WriteTextToLine(6, 'GGGGGGGGGGGGGGGGGGGGGGGG', '        FAILURE         ');
                WriteTextToLine(7, 'GGGGGGGGGGGGGGGGGGGGGGGG', '     NO CONNECTION      ');
                WriteTextToLine(8, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
                WriteTextToLine(9, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
                WriteTextToLine(10, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
                WriteTextToLine(11, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
                WriteTextToLine(12, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
                WriteTextToLine(13, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
                WriteTextToLine(14, 'WWWWWWWWWWWWWWWWWWWWWWWW', '                        ');
                localOperation = 1;
            } else {
                WriteTextToLine(1, DisplayAttrs1, DisplayLines1);
                WriteTextToLine(2, DisplayAttrs2, DisplayLines2);
                WriteTextToLine(3, DisplayAttrs3, DisplayLines3);
                WriteTextToLine(4, DisplayAttrs4, DisplayLines4);
                WriteTextToLine(5, DisplayAttrs5, DisplayLines5);
                WriteTextToLine(6, DisplayAttrs6, DisplayLines6);
                WriteTextToLine(7, DisplayAttrs7, DisplayLines7);
                WriteTextToLine(8, DisplayAttrs8, DisplayLines8);
                WriteTextToLine(9, DisplayAttrs9, DisplayLines9);
                WriteTextToLine(10, DisplayAttrs10, DisplayLines10);
                WriteTextToLine(11, DisplayAttrs11, DisplayLines11);
                WriteTextToLine(12, DisplayAttrs12, DisplayLines12);
                WriteTextToLine(13, DisplayAttrs13, DisplayLines13);
                WriteTextToLine(14, DisplayAttrs14, DisplayLines14);
            }
        }
    }
}

function WriteTextToLine(Line, Attrs, Text){
    if (Text.length < 24) {
        return;
    }
    for (let i = 0, len = 24; i < len; i++) {
        let CurrentCell = "LCD_LINE" + Line + "_CHAR" + (i+1);
        var CharToSet = Text[i];
        if (CharToSet != 'undefined') {
            if (CharToSet.charCodeAt(0) == "65533") {
                CharToSet = "°"; // '\xB0'
            }
        }
        document.getElementById(CurrentCell).innerHTML = CharToSet;
    }

    for (let i = 0, len = 24; i < len; i++) {
        var cellColor = "white";
        var cellFontSize = fontSizeBig;
        let CurrentCell = "LCD_LINE" + Line + "_CHAR" + (i+1);

        if(Attrs[i]=="W"){
            cellColor = colorWhite;
            cellFontSize = fontSizeBig;
        }
        if(Attrs[i]=="w"){
            cellColor = colorWhite;
            cellFontSize = fontSizeSmall;
        }
        if(Attrs[i]=="G"){
            cellColor = colorGreen;
            cellFontSize = fontSizeBig;
        }
        if(Attrs[i]=="g"){
            cellColor = colorGreen;
            cellFontSize = fontSizeSmall;
        }
        if(Attrs[i]=="B"){
            cellColor = colorBlue;
            cellFontSize = fontSizeBig;
        }
        if(Attrs[i]=="b"){
            cellColor = colorBlue;
            cellFontSize = fontSizeSmall;
        }
        if(Attrs[i]=="M"){
            cellColor = colorMagenta;
            cellFontSize = fontSizeBig;
        }
        if(Attrs[i]=="m"){
            cellColor = colorMagenta;
            cellFontSize = fontSizeSmall;
        }
        if(Attrs[i]=="Y"){
            cellColor = colorYellow;
            cellFontSize = fontSizeBig;
        }
        if(Attrs[i]=="y"){
            cellColor = colorYellow;
            cellFontSize = fontSizeSmall;
        }
        if(Attrs[i]=="A"){
            cellColor = colorAmber;
            cellFontSize = fontSizeBig;
        }
        if(Attrs[i]=="a"){
            cellColor = colorAmber;
            cellFontSize = fontSizeSmall;
        }
        if(Attrs[i]=="R"){
            cellColor = colorRed;
            cellFontSize = fontSizeBig;
        }
        if(Attrs[i]=="r"){
            cellColor = colorRed;
            cellFontSize = fontSizeSmall;
        }
        if(Attrs[i]=="X"){
            cellColor = colorGrey;
            cellFontSize = fontSizeBig;
        }
        if(Attrs[i]=="x"){
            cellColor = colorGrey;
            cellFontSize = fontSizeSmall;
        }

        document.getElementById(CurrentCell).style.color = cellColor;
        document.getElementById(CurrentCell).style.fontSize = cellFontSize;
    }
}

function GetTextFromLine(Line,Position){
    var Output = "";
    if(Line==1){
        Output = DisplayLines1;
    }
    if(Line==2){
        Output = DisplayLines2;
    }
    if(Line==3){
        Output = DisplayLines3;
    }
    if(Line==4){
        Output = DisplayLines4;
    }
    if(Line==5){
        Output = DisplayLines5;
    }
    if(Line==6){
        Output = DisplayLines6;
    }
    if(Line==7){
        Output = DisplayLines7;
    }
    if(Line==8){
        Output = DisplayLines8;
    }
    if(Line==9){
        Output = DisplayLines9;
    }
    if(Line==10){
        Output = DisplayLines10;
    }
    if(Line==11){
        Output = DisplayLines11;
    }
    if(Line==12){
        Output = DisplayLines12;
    }
    if(Line==13){
        Output = DisplayLines13;
    }
    if(Line==14){
        Output = DisplayLines14;
    }

    return Output.substr(Position, Position) + "\nCharcode: " + Output.charCodeAt(Position);
}
