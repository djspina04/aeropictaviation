/**
 * Created by cep.6ep on 12.10.2017.
 */

var Settings = function() {
    var self = this;
    var ff = new FlightFactor();
    var jqQuality;
    var jqReflection;
    var jqRain;
    var jqServerPort;
    var jqServerUser;
    var jqServerPass;
    var jqIRSAlignment;
    var jqStatesList;
    var jqTurnAround;
    var jqLastRestore;
    var jqSpecialStatesList;
    var jqGoogleKey;
	var jqJoyAxesInput;
    var jqInteractionType;
    var jqInteractionActivation;
    var jqProtectedClicks;
    var jqInteractionVR;
    var jqToolTips;
    var jqDataRef;
    var jqBackGround;

    var modalAlertEl;
    var alertDescriptionEl;

    var modalAlertSpecialStateEl;

    var qualityPattern = {
        Low: {
            NormalizeSpace: 0,
            NormalizeEyeVector: 0,
            NormalizeBumpMap: 0,
            UseSpecularTex: 0,
            UseBumpMapTex: 0,
            QualityDyn: 1,
            QualityTex: 3,
            GenPanelMips: 0
        },
        Normal: {
            NormalizeSpace: 0,
            NormalizeEyeVector: 0,
            NormalizeBumpMap: 0,
            UseSpecularTex: 1,
            UseBumpMapTex: 0,
            QualityDyn: 0,
            QualityTex: 2,
            GenPanelMips: 1
        },
        Hi: {
            NormalizeSpace: 1,
            NormalizeEyeVector: 1,
            NormalizeBumpMap: 1,
            UseSpecularTex: 1,
            UseBumpMapTex: 1,
            QualityDyn: 0,
            QualityTex: 1,
            GenPanelMips: 1
        }
    };
    var settingsState = {
        quality: '',
        reflection: '',
        rain: '',
        irsAlignment: '',
        turnAround: '',
        lastRestore: '',
		joyAxesInput:'',
        _mouseWheel: '',
        _interactionActivation: '',
        _interactionDMS: '',
        _vrGlewControl: '',
        _tooltip: '',
        _tooltip_dataref: '',
        _tooltipBackground: ''
    };

    dataStore.addValue(new DataValue({
        valueName: 'irsAlignment',
        callExec: function(value) {

        }
    }));

    var setQualitySettings = function (pattern) {
        for (let field in pattern) {
            if (pattern.hasOwnProperty(field)) {
                let path = 'Simulation.' + field;
                ff.Set(path, pattern[field]);
            }
        }
    };

    var getStateList = function () {
        ff.Get("Simulation.StateList", function (val) {
            let opt = val.split('\n').slice(0, -1);
            jqStatesList.listbox('setList', opt);
        });
    };

    var updateStateList = function () {
        ff.Set("Simulation.StateListUpdate", 1);
        jqStatesList.listbox('disabled');
        $('#state_load').addClass('disabled');
        var tid = setTimeout(function scan() {
            ff.Get("Simulation.StateListUpdate", function (update) {
                if (update) {
                    tid = setTimeout(scan, 100);
                } else {
                    getStateList();
                    jqStatesList.listbox('disabled');
                    $('#state_load').removeClass('disabled');
                }
            });
        }, 100);
    };

    var clarifyPatternQuality = function (simulation) {
        let comparePattern = function (pattern) {
            for (let field in pattern) {
                if (pattern.hasOwnProperty(field) && simulation.hasOwnProperty(field)) {
                    if (pattern[field] !== simulation[field]) {
                        return false;
                    }
                }
            }

            return true;
        };

        for (let patternName in qualityPattern) {
            if (qualityPattern.hasOwnProperty(patternName)) {
                let ret = comparePattern(qualityPattern[patternName]);
                if (ret) {
                    jqQuality.dropdown('set selected', patternName);
                    settingsState.quality = patternName;
                    break;
                }
            }
        }
    };

    this.ready =  function () {

        jqQuality = $('#quality');
        jqReflection = $('#reflection');
        jqRain = $('#rain');
        jqServerPort = $('#iServerPors');
        jqServerUser = $('#iServerUser');
        jqServerPass = $('#iServerPass');
        jqIRSAlignment = $('#irsAlignment');
        jqStatesList = $('#states_list');
        jqTurnAround = $('#turnAround');
        jqLastRestore = $('#lastRestore');
        jqSpecialStatesList = $('#special_states_list');
        jqGoogleKey = $('#iGoogleApiKey');
        jqInteractionType = $('#interactionType');
        jqInteractionActivation = $('#interactionActivation');
        jqProtectedClicks = $('#protectedClicks');
        jqInteractionVR = $('#interactionVR');
        jqToolTips = $('#toolTips');
        jqDataRef = $('#dataRef');
        jqBackGround = $('#backGround');
		jqJoyAxesInput = $('#joyAxesInput');

        modalAlertEl = $('#alertSettings').modal({
            onApprove: function(){
                alertMessage.platform.state = false;
                alertMessage.server.state = false;
            },
            closable: false,
            centered: false
        });
        alertDescriptionEl = $('#alertSettings .description');

        modalAlertSpecialStateEl = $('#alertSpecialState').modal({
            onApprove: function(){
                let specialStateName = jqSpecialStatesList.dropdown('get value');
                ff.Set("Simulation.StateType", 0);
                ff.Set("Simulation.StateSave", '"' + specialStateName + '"');
            },
            closable: false,
            centered: false
        });

        var alertMessage = {
            platform: {
                state: false,
                mess: 'Settings will be applied only after reload.'
            },
            server: {
                state: false,
                mess: 'Without an installed user and password, external connections will not be available.'
            }
        };

        var saveVrSettings = function() {
            var newAxesInput = jqJoyAxesInput.dropdown('get value');
            var newInteractionTypeValue = jqInteractionType.dropdown('get value');
            var newInteractionActivationValue = jqInteractionActivation.dropdown('get value');
            var newProtectedClicksValue = jqProtectedClicks.dropdown('get value');
            var newInteractionVRValue = jqInteractionVR.dropdown('get value');
            var newToolTipsValue = jqToolTips.dropdown('get value');
            var newDataRefValue = jqDataRef.dropdown('get value');
            var newBackGroundValue = jqBackGround.dropdown('get value');

            if (newAxesInput != settingsState.joyAxesInput){
                ff.Set("Simulation.AxesInput", newAxesInput);
                settingsState.joyAxesInput = newAxesInput;
            }
            if (newInteractionTypeValue != settingsState._mouseWheel) {
                ff.Set("Simulation._mouseWheel", newInteractionTypeValue);
                settingsState._mouseWheel = newInteractionTypeValue;
            }
            if (newInteractionActivationValue != settingsState._interactionActivation) {
                ff.Set("Simulation._interactionActivation", newInteractionActivationValue);
                settingsState._interactionActivation = newInteractionActivationValue;
            }
            if (newProtectedClicksValue != settingsState._interactionDMS) {
                ff.Set("Simulation._interactionDMS", newProtectedClicksValue);
                settingsState._interactionDMS = newProtectedClicksValue
            }
            if (newInteractionVRValue != settingsState._vrGlewControl) {
                ff.Set("Simulation._vrGlewControl", newInteractionVRValue);
                settingsState._vrGlewControl = newInteractionVRValue;
            }
            if (newToolTipsValue != settingsState._tooltip) {
                ff.Set("Simulation._tooltip", newToolTipsValue);
                settingsState._tooltip = newToolTipsValue;
            }
            if (newDataRefValue != settingsState._tooltip_dataref) {
                ff.Set("Simulation._tooltip_dataref", newDataRefValue);
                settingsState._tooltip_dataref = newDataRefValue;
            }
            if (newBackGroundValue != settingsState._tooltipBackground) {
                ff.Set("Simulation._tooltipBackground", newBackGroundValue);
                settingsState._tooltipBackground = newBackGroundValue;
            }
        };

        $('.vr-opt').on('change', saveVrSettings);

        $('#apply_settings').on('click', function () {
            var newQualityValue = jqQuality.dropdown('get value');
            var newReflectionValue = jqReflection.checkbox('is checked');
            var newRainValue = jqRain.dropdown('get value');

            var newServerPort = jqServerPort.val();
            var newServerUser = jqServerUser.val();
            var newServerPass = jqServerPass.val();

            if (newQualityValue != settingsState.quality) {
                alertMessage.platform.state = true;
                setQualitySettings(qualityPattern[newQualityValue]);
            }

            if (newReflectionValue != settingsState.reflection) {
                alertMessage.platform.state = true;
                ff.Set("Simulation.ReflectEffect", newReflectionValue ? 1 : 0);
                settingsState.reflection = newReflectionValue;
            }

            if (newRainValue != settingsState.rain) {
                alertMessage.platform.state = true;
                ff.Set("Simulation.RainSize", newRainValue);
            }

            ff.Set("Simulation.ServerPort", newServerPort);
            ff.Set("Simulation.ServerUser", '"' + newServerUser + '"');
            ff.Set("Simulation.ServerPass", '"' + newServerPass + '"');

            ff.Set("Simulation.GoogleKey", '"' + jqGoogleKey.val() + '"');

            if (newServerPort == '' || newServerUser == '' || newServerPass == '') {
                alertMessage.server.state = true;
            }

            let allMessage = '';
            if (alertMessage.platform.state) {
                allMessage += '<br/ >' + alertMessage.platform.mess;
            }
            if (alertMessage.server.state) {
                allMessage += '<br/ >' + alertMessage.server.mess;
            }

            if (allMessage) {
                alertDescriptionEl.html(allMessage);
                modalAlertEl.modal('show');
            }

            ff.Set("Simulation.FlushSettings", 1);
        });

        $('#apply_states').on('click', function () {
            var newTurnAroundValue = jqTurnAround.checkbox('is checked');
            var newLastRestoreValue = jqLastRestore.checkbox('is checked');

            if (newTurnAroundValue != settingsState.turnAround) {
                ff.Set("Simulation.TurnAround", newTurnAroundValue ? 1 : 0);
                settingsState.turnAround = newTurnAroundValue;
            }

            if (newLastRestoreValue != settingsState.lastRestore) {
                ff.Set("Simulation.LastRestore", newLastRestoreValue ? 1 : 0);
                settingsState.lastRestore = newLastRestoreValue;
            }

            ff.Set("Simulation.FlushSettings", 1);
        });

        jqIRSAlignment.on('change', function () {
            let newIRSValue = parseInt(jqIRSAlignment.dropdown('get value'));
            if (newIRSValue != settingsState.irsAlignment && settingsState.irsAlignment != '') {
                ff.Set("Aircraft.Navigation.ADIRS.ADIRU1.IR.AlignTimeDiv", newIRSValue);
                ff.Set("Aircraft.Navigation.ADIRS.ADIRU2.IR.AlignTimeDiv", newIRSValue);
                ff.Set("Aircraft.Navigation.ADIRS.ADIRU3.IR.AlignTimeDiv", newIRSValue);
                ff.Get("Aircraft.Navigation.ADIRS.ADIRU1.IR.AlignTimeDiv", function (val) {
                    settingsState.irsAlignment = val;
                });

                dataStore.setValue('irsAlignment', newIRSValue);
            }
        });

        jqInteractionType.on('change', function(){
            let val = jqInteractionType.dropdown('get value');
            if (val < 2) {
                jqInteractionActivation.addClass('disabled');
                jqProtectedClicks.addClass('disabled');
                $('div.ttRightVal').removeClass('disabled');
                $('div.ttMiddleVal').removeClass('disabled');
            } else {
                jqInteractionActivation.removeClass('disabled');
                jqProtectedClicks.removeClass('disabled');
                jqInteractionActivation.trigger('change');
            }
        });

        jqInteractionActivation.on('change', function(){
            let actionValue = jqInteractionActivation.dropdown('get value');
            let toolTipsValue = jqToolTips.dropdown('get value');
            if (actionValue == 0) { // 0 - middle
                //  if value of tooltips equal middle - 1 change to right, middle - disabled
                if (toolTipsValue == 1) {
                    jqToolTips.dropdown('set selected', 0 + '');
                }
                $('div.ttMiddleVal').addClass('disabled');
                $('div.ttRightVal').removeClass('disabled');
            }
            if (actionValue == 1) { // 1 - right
                // if value of tooltips equal right - 0 change to middle, right - disabled
                if (toolTipsValue == 0) {
                    jqToolTips.dropdown('set selected', 1 + '');
                }
                $('div.ttRightVal').addClass('disabled');
                $('div.ttMiddleVal').removeClass('disabled');
            }
            if (actionValue != 0 && actionValue != 1) {
                $('div.ttRightVal').removeClass('disabled');
                $('div.ttMiddleVal').removeClass('disabled');
            }
        });

        $('#states_update').on('click', updateStateList);

        $('#state_save').on('click', function () {
            let jqSaveStateName = $('#save_state_name');
            let stateName = jqSaveStateName.val();
            if (stateName.length) {
                ff.Set("Simulation.StateType", 1);
                ff.Set("Simulation.StateSave", '"' + stateName + '"');
                updateStateList();
                jqSaveStateName.val('');
            }
        });

        $('#state_load').on('click', function () {
            let val = jqStatesList.listbox('val');
            if (val.length) {
                ff.Set("Simulation.StateType", 1);
                ff.Set("Simulation.StateLoad", '"' + val + '"');
            }
        });

        $('#special_state_save').on('click', function() {
            modalAlertSpecialStateEl.modal('show');
        });

        $('#platform_alert').hide();
        $('#server_alert').hide();

        var loaded = 0;
		var graphicModeSet = 0;
        var initLoop = setInterval(function(){
            if (loaded == 0) {
                ff.Get("Aircraft.Loaded", function(response) {
                    if (response == 1) {
                        loaded = 1;
                        self.init();
                        //clearInterval(initLoop);
                    }
                });
            }
        }, 1000);
    };

    this.init = function() {
        ff.Get("Simulation", function (simulation) {
            // init quality
            clarifyPatternQuality(simulation);
            
			var vulcanMode = 0;
			if (simulation.hasOwnProperty('VulcanMode')) {
				vulcanMode = simulation['VulcanMode'];
			}
			
			if (!vulcanMode){
				// init reflection
				if (simulation.hasOwnProperty('ReflectEffect')) {
					jqReflection.checkbox(simulation['ReflectEffect'] ? 'check' : 'uncheck');
					settingsState.reflection = jqReflection.checkbox('is checked');
				}
				// init rain
				if (simulation.hasOwnProperty('RainSize')) {
					jqRain.dropdown('set selected', simulation['RainSize'] + '');
					settingsState.rain = simulation['RainSize'] + '';
				}
			}
			else{
				$('#reflectionCaption').hide();
				jqReflection.hide();
				$('#rainCaption').hide();
				jqRain.hide();
			}
            // init server
            if (simulation.hasOwnProperty('ServerPort')) {
                jqServerPort.val(simulation['ServerPort']);
            }
            if (simulation.hasOwnProperty('ServerUser')) {
                jqServerUser.val(simulation['ServerUser']);
            }
            if (simulation.hasOwnProperty('ServerPass')) {
                jqServerPass.val(simulation['ServerPass']);
            }

            if (simulation.hasOwnProperty('GoogleKey')) {
                jqGoogleKey.val(simulation['GoogleKey']);
            }
            // init ss
            if (simulation.hasOwnProperty('TurnAround')) {
                jqTurnAround.checkbox(simulation['TurnAround'] ? 'check' : 'uncheck');
                settingsState.turnAround = jqTurnAround.checkbox('is checked');
            }
            if (simulation.hasOwnProperty('LastRestore')) {
                jqLastRestore.checkbox(simulation['LastRestore'] ? 'check' : 'uncheck');
                settingsState.lastRestore = jqLastRestore.checkbox('is checked');
            }
            // Vr
            if (simulation.hasOwnProperty('AxesInput')){
                jqJoyAxesInput.dropdown('set selected', simulation['AxesInput'] + '');
                settingsState.joyAxesInput = simulation['AxesInput'] + '';
            }
            if (simulation.hasOwnProperty('_mouseWheel')) {
                jqInteractionType.dropdown('set selected', simulation['_mouseWheel'] + '');
                settingsState._mouseWheel = simulation['_mouseWheel'] + '';
            }
            if (simulation.hasOwnProperty('_interactionActivation')) {
                jqInteractionActivation.dropdown('set selected', simulation['_interactionActivation'] + '');
                settingsState._interactionActivation = simulation['_interactionActivation'] + '';
                if (parseInt(settingsState._mouseWheel) < 2) {
                    jqInteractionActivation.addClass('disabled');
                    jqProtectedClicks.addClass('disabled');
                }
            }
            if (simulation.hasOwnProperty('_interactionDMS')) {
                jqProtectedClicks.dropdown('set selected', simulation['_interactionDMS'] + '');
                settingsState._interactionDMS = simulation['_interactionDMS'] + '';
            }
            if (simulation.hasOwnProperty('_vrGlewControl')) {
                jqInteractionVR.dropdown('set selected', simulation['_vrGlewControl'] + '');
                settingsState._vrGlewControl = simulation['_vrGlewControl'] + '';
            }
            if (simulation.hasOwnProperty('_tooltip')) {
                jqToolTips.dropdown('set selected', simulation['_tooltip'] + '');
                settingsState._tooltip = simulation['_tooltip'] + '';
            }
            if (simulation.hasOwnProperty('_tooltip_dataref')) {
                jqDataRef.dropdown('set selected', simulation['_tooltip_dataref'] + '');
                settingsState._tooltip_dataref = simulation['_tooltip_dataref'] + '';
            }
            if (simulation.hasOwnProperty('_tooltipBackground')) {
                jqBackGround.dropdown('set selected', simulation['_tooltipBackground'] + '');
                settingsState._tooltipBackground = simulation['_tooltipBackground'] + '';
            }
        });

        // init save / load
        getStateList();

        // IRS alignment speed
        ff.Get("Aircraft.Navigation.ADIRS.ADIRU1.IR.AlignTimeDiv", function (val) {
            var storeValue = dataStore.getValue('irsAlignment');
            if (storeValue == 0) {
                storeValue = val;
            }
            jqIRSAlignment.dropdown('set selected', storeValue);
            settingsState.irsAlignment = storeValue;
        });
    };

    this.update = function() {
        updateStateList()
    };

    this.showValue = function() {
        console.log(settingsState);
    };
};

var moduleSettings = new Settings();
$(document).ready(moduleSettings.ready);