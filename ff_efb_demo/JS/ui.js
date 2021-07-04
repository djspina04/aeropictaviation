/**
 * Created by cep.6ep on 02.11.2016.
 */
var dbg = null;
var dbgBtn = null;

console.log('v.2.3.0');


function DataValue(settings) {
    var valueName = settings.valueName;
    var callback = settings.callExec;
    var value = 0;

    this.exec = function(receivedVal) {
        if (value != receivedVal) {
            value = receivedVal;
            callback(value);
        }
    };

    this.getName = function() {
        return valueName;
    };

    this.getValue = function() {
        return value;
    };

    this.setValue = function(val) {
        value = val;
    };
}

function DataStore() {
    var store = new Map();

    var dataToStore = function() {
        let data = {};
        //noinspection CoffeeScriptInfiniteLoop
        for (let [key, value] of store.entries()) {
            data[key] = value.getValue();
        }

        return data;
    };

    this.addValue = function(dataVal) {
        store.set(dataVal.getName(), dataVal);
    };

    this.ready = function() {
        ff.Get('Simulation.DataStore', function(responseData) {
            if (responseData != "") {
                let data = JSON.parse(atob(responseData));
                for (let key in data) {
                    store.get(key).setValue(data[key]);
                }
            }
        });
    };

    this.update = function() {
        ff.Get('Simulation.DataStore', function(responseData) {
            if (responseData != "") {
                let data = JSON.parse(atob(responseData));
                for (let key in data) {
                    store.get(key).exec(data[key]);
                }
            }
        });
    };

    this.setValue = function(name, val) {
        store.get(name).setValue(val);
        ff.Set('Simulation.DataStore', '"' + btoa(JSON.stringify(dataToStore())) + '"');
    };

    this.getValue = function(name) {
        return store.get(name).getValue();
    };
}

var dataStore = new DataStore();

$(document).ready(function() {
    dbg = $('#console');
    //dbg.html('test');
    //dbg.text('[START]:' + (new Date()).getTime());

    var contentPanels = $('.a320-content-panel-group').children();
    var ff = new FlightFactor();
    var cDate = new Date();
    var efbData = {
        day: cDate.getDay(),
        month: cDate.getMonth() + 1,
        year: cDate.getYear() + 2000,
        pax: 0,
        paxA: 0, // pax count
        paxB: 0,
        paxC: 0,
        paxWeightA: 0,
        paxWeightB: 0,
        paxWeightC: 0,
        allPaxWeight: 0,
        cargo: 0,
        cargo1: 0,
        cargo3: 0,
        cargo4: 0,
        cargo5: 0,
        ttlBagWeight: 0,
        cargo1Max: 3402,
        cargo3Max: 4536, // 2426
        cargo4Max: 2110,
        cargo5Max: 1197,
        fuel: 0,
        fuelCenter: 0,
        fuelWingLeft: 0,
        fuelWingRight: 0,
        fuelOuterLeft: 0,
        fuelOuterRight: 0,
        fuelCenterMax: 6478, //6498, //6478,
        fuelWingLeftMax: 5440, //5567, //5440,
        fuelWingRightMax: 5440, //5567, //5440,
        fuelOuterLeftMax: 691, //684, //691,
        fuelOuterRightMax: 691, //684, //691,
        fuelDensity: 0.784, // kg/L

        wingTankInnerMax: 6939.0,
        wingTankOuterMax: 882.0,
        centerTankMax: 8273.2, // Liters
        wingTankInnerOuterLine: 5000.0,
        wingTankOuterInnerLine: 300.0,
        fuelTransferRatio: 0,

        fuelCenterWeight: 0,
        fuelWingLeftWeight: 0,
        fuelWingRightWeight: 0,
        fuelOuterLeftWeight: 0,
        fuelOuterRightWeight: 0,
        fuelCorrection: 0,
        totalWeight: 0,
        doi: 50,
        dow: 41244,

        middleAdultWeight: 84,

        // Value index per 1 kg
        trimBag1: -0.006479190476105, // -0.00642
        trimBag3: 0.004, // +0.00401
        trimBag4: 0.0075, // +0.00741
        trimBag5: 0.010476190, // +0.01048

        // Value index per 1 kg, in meters?
        trimWeightPaxA: -0.0065683,// - 0.002,
        trimWeightPaxB: 0.0010167,// - 0.002,
        trimWeightPaxC: 0.0082133,// - 0.002,

        // Index influence of 1 pax
        trimPaxA: 0, //-0.5454545455, // -0.55174
        trimPaxB: 0, //0.08222222, // +0.08540
        trimPaxC: 0, //0.6842105263, // +0.68992

        // Index influence per 1 kg
        // 0C -0.006568
        // 0B +0.001017
        // 0C +0.008213

        dIndex: 0,
        zfwMac: 0,
        zfw: 0,
        towMac: 0,

        loadColdAndDark: -1
    };
    var FMGS = {
        zfw: 46000,
        block: 6000,
        cg: 35
    };
    var loaded = 0;

    var paxShift = 0.002;
    efbData.trimWeightPaxA = efbData.trimWeightPaxA - paxShift;
    efbData.trimWeightPaxB = efbData.trimWeightPaxB - paxShift;
    efbData.trimWeightPaxC = efbData.trimWeightPaxC - paxShift;

    efbData.trimPaxA = efbData.trimWeightPaxA * efbData.middleAdultWeight; //-0.5454545455, // -0.55174
    efbData.trimPaxB = efbData.trimWeightPaxB * efbData.middleAdultWeight; //0.08222222, // +0.08540
    efbData.trimPaxC = efbData.trimWeightPaxC * efbData.middleAdultWeight; //0.6842105263, // +0.68992

    efbData.fuelTransferRatio = ((efbData.wingTankInnerMax - efbData.wingTankInnerOuterLine) / efbData.wingTankOuterInnerLine + 1);

    // indexing from 0
    function Trigger(number, callback) {
        var triggers = [];
        var init = function() {
            for (var i = 0; i < number; i++) {
                triggers.push(false);
            }
        };
        var checkAndCall = function() {
            var isCall = true;
            for (var i = 0; i < triggers.length; i++) {
                if (triggers[i] == false) {
                    isCall = false;
                }
            }
            var getType = {};
            if (isCall && callback && getType.toString.call(callback) === '[object Function]') {
                callback();
            }
        };
        this.setTrigger = function(index) {
            triggers[index] = true;
            checkAndCall();
        };
        this.reset = function() {
            init();
        };
        init();
    }

    function Container(settings) {
        var min = settings.min;
        var max = settings.max;
        var selector = settings.selector;

        var lockCall = function() {
            $(selector).range('setChanging', $(selector).attr('id'));
        };

        var releaseCall = function() {
            $(selector).range('releaseChanging');
        };

        this.set = function(value) {
            var validValue = value;
            validValue = validValue < min ? min : validValue;
            validValue = validValue > max ? max : validValue;
            $(selector).range('setValue', validValue);
        };

        this.get = function() {
            return $(selector).range('getValue');
        };

        this.outerSet = function(value) {
            lockCall();
            this.set(value);
            releaseCall();
        };

        this.getSettings = function() {
            return $(selector).range("getSettings");
        };
    }

    function ButtonToggle(settings) {
        var buttonSelector = settings.buttonSelector;
        var buttonLabels   = (settings.buttonLabels) ? settings.buttonLabels : {
            on: 'On',
            off: 'Off'
        };
        var requestPath  = settings.requestPath;
        var responsePath = settings.responsePath;
        var onToggle     = settings.onToggle;

        var switcherState = 0;

        var self = this;

        $(buttonSelector).on('click', function() {
            switcherState = (switcherState == 0) ? 1 : 0;
            ff.Set(requestPath, switcherState);
            self.init();
        });

        this.init = function() {
            ff.Get(responsePath, function(value) {
                switcherState = value ? 1 : 0; // to 1 or 0
                toggle(switcherState);
            });
        };

        this.getState = function() {
            return !switcherState;
        };

        this.setOnToggleCall = function(callack) {
            onToggle = callack;
        };

        var toggle = function(state) {
            $(buttonSelector).text(state ? buttonLabels.on : buttonLabels.off);

            if (onToggle) {
                onToggle();
            }
        };
    }

    function ServiceSwitcher(settings) {
        var iconSelector = settings.iconSelector;
        var buttonSelector = settings.buttonSelector;
        var buttonLabels = (settings.buttonLabels) ? settings.buttonLabels : {
            on: 'On',
            off: 'Off'
        };
        var schemeSelector = settings.schemeSelector;
        var requestPath = settings.requestPath;
        var responsePath = settings.responsePath;
        var onToggle = settings.onToggle;
        var outerCondition = (settings.condition) ? settings.condition : {
            getState: function() {return true},
            setOnToggleCall: function() {}
        };

        var labelOn = buttonLabels.on;
        var labelOff = buttonLabels.off;
        var colorOn = '#3662ff'; // #6284ff
        var colorOff = '#c4c4c4';
        var colorAnimate = '#6284ff';
        var switcherState = 0;
        var responseValue = 0;
        var isDisable = false;
        var parts;
        var scheme;
        var self = this;

        this.init = function() {
            parts = $(iconSelector).find('.svg-parts');
            scheme = $(schemeSelector);

            ff.Get(responsePath, function(value) {
                responseValue = value;
                switcherState = value;
                toggle(switcherState);
            });
        };

        this.setToggleCallback = function(callback) {
            onToggle = callback;
        };

        this.getState = function() {
            return switcherState;
        };

        this.disable = function() {
            switchDisabled(true);
        };

        this.enable = function() {
            switchDisabled(false);
        };

        var switchDisabled = function(onOff) {
            if (isDisable != onOff) {
                isDisable = onOff;
                if (isDisable) {
                    parts.css('fill-opacity', 0.45);
                    $(buttonSelector).addClass('disabled');
                } else {
                    parts.css('fill-opacity', 1);
                    $(buttonSelector).removeClass('disabled');
                }
            }
        };

        this.switchOutside = function(state) {
            responseValue = state;
            if (switcherState != responseValue) {
                animate();
            }
        };

        function animate() {
            animateStateToggle(true);
            var it = 0;
            var tId = setTimeout(function scan() {
                ff.Get(responsePath, function(value) {
                    responseValue = value;
                    if (responseValue == switcherState) {
                        it++;
                        if (it > 100) {
                            clearTimeout(tId);
                            it = 0;
                            animateStateToggle(false);
                        } else {
                            tId = setTimeout(scan, 100);
                        }
                    } else { // animate done
                        switcherState = responseValue;
                        animateStateToggle(false);
                        toggle(switcherState);
                        clearTimeout(tId);
                    }
                });
            }, 100);
        }

        $(buttonSelector).on('click', function() {
            ff.Set(requestPath, (switcherState) ? 0 : 1);
            animate();
        });

        var indicate = function (state) {

            state = (state == undefined) ? switcherState : state;

            scheme.css({
                'fill': (state && outerCondition.getState()) ? colorAnimate : colorOff,
                'stroke': (state && outerCondition.getState()) ? colorAnimate : colorOff
            });
        };

        var toggle = function(state) {
            parts.css('fill', (state) ? colorOn : colorOff);

            indicate(state);

            $(buttonSelector).text(state ? labelOff : labelOn);

            if (state) {
                $(buttonSelector).addClass('a320-switcherOn');
            } else {
                $(buttonSelector).removeClass('a320-switcherOn');
            }

            if (onToggle) {
                onToggle();
            }
        };

        var animateStateToggle = function(onOff) {
            parts.css('fill', (onOff) ? colorAnimate : (switcherState ? colorOn : colorOff));

            $(buttonSelector).text(onOff ? 'Request' : (switcherState ? labelOff : labelOn)); // 'Off' : 'On'

            if (onOff) {
                $(buttonSelector).addClass('a320-animate-state');
            } else {
                $(buttonSelector).removeClass('a320-animate-state');
            }
        };

        outerCondition.setOnToggleCall(indicate);
    }

    function ButtonDisabler(settings) {
        this.listen = function(onOff) {
            if (onOff) {
                $(settings.groupId).find('.ui').removeClass('disabled');
            } else {
                $(settings.groupId).find('.ui').addClass('disabled');
            }
        }
    }

    function SwitcherGroup(settings) {
        var group = [];
        var state = false;
        var externalLock = 1;
        this.addSwitcher = function(switcher) {
            switcher.setToggleCallback(listenState);
            group.push(switcher);
        };
        this.lock = function() {
            state = false;
            toggleState();
        };

        this.externalLock = function(onOff) {
            externalLock = onOff;
            listenState();
        };

        this.getState = function() {
            return state;
        };

        var toggleState = function() {
            if (state && externalLock == 1) {
                $(settings.groupId).find('.ui').removeClass('disabled');
            } else {
                $(settings.groupId).find('.ui').addClass('disabled');
            }
        };

        var updateState = function() {
            state = false;
            for (var i = 0; i < group.length; i++) {
                if (group[i].getState()) {
                    state = true;
                }
            }
        };

        var listenState = function() {
            updateState();
            toggleState();
        };
    }

    function AcfVariable(settings) {
        var variableName = settings.variableName;
        var signer = settings.signer;

        this.update = function(acf) {
            if (acf.hasOwnProperty(variableName)) {
                if (signer.getState() == acf[variableName]) {
                    return;
                }
                //console.log(variableName + ': ' + signer.getState() + ' - ' + acf[variableName]);
                signer.switchOutside(acf[variableName]);
            }
        }
    }

    function AcfObserver() {
        var list = [];
        this.add = function(acfVariable) {
            list.push(acfVariable);
        };

        this.update = function() {
            var isReady = true;
            if (isReady) {
                isReady = false;
                ff.Get('Aircraft', function(acfRequest){
                    for (let acfVariable of list) {
                        acfVariable.update(acfRequest);
                    }
                    isReady = true;
                });
            }
        };
    }

    dataStore.addValue(new DataValue({
        valueName: 'paxA',
        callExec: function(value){
            efbData.paxA = value;
            pax.cabinA.outerSet(efbData.paxA);
        }
    }));
    dataStore.addValue(new DataValue({
        valueName: 'paxB',
        callExec: function(value){
            efbData.paxB = value;
            pax.cabinB.outerSet(efbData.paxB);
        }
    }));
    dataStore.addValue(new DataValue({
        valueName: 'paxC',
        callExec: function(value){
            efbData.paxC = value;
            pax.cabinC.outerSet(efbData.paxC);
        }
    }));
    dataStore.addValue(new DataValue({
        valueName: 'cargo1',
        callExec: function(value){
            efbData.cargo1 = value;
            allCargo.firstCargo.outerSet(efbData.cargo1);
        }
    }));
    dataStore.addValue(new DataValue({
        valueName: 'cargo3',
        callExec: function(value){
            efbData.cargo3 = value;
            allCargo.thirdCargo.outerSet(efbData.cargo3);
        }
    }));
    dataStore.addValue(new DataValue({
        valueName: 'cargo4',
        callExec: function(value){
            efbData.cargo4 = value;
            allCargo.fourthCargo.outerSet(efbData.cargo4);
        }
    }));
    dataStore.addValue(new DataValue({
        valueName: 'cargo5',
        callExec: function(value){
            efbData.cargo5 = value;
            allCargo.fifthCargo.outerSet(efbData.cargo5);
        }
    }));
    dataStore.addValue(new DataValue({
        valueName: 'fuelCenterWeight',
        callExec: function(value){
            efbData.fuelCenterWeight = value;
            tanks.central.outerSet(efbData.fuelCenterWeight);
        }
    }));
    dataStore.addValue(new DataValue({
        valueName: 'fuelWingLeftWeight',
        callExec: function(value){
            efbData.fuelWingLeftWeight = value;
            tanks.left.outerSet(efbData.fuelWingLeftWeight);
        }
    }));
    dataStore.addValue(new DataValue({
        valueName: 'fuelWingRightWeight',
        callExec: function(value){
            efbData.fuelWingRightWeight = value;
            tanks.right.outerSet(efbData.fuelWingRightWeight);
        }
    }));
    dataStore.addValue(new DataValue({
        valueName: 'fuelOuterLeftWeight',
        callExec: function(value){
            efbData.fuelOuterLeftWeight = value;
            tanks.outerLeft.outerSet(efbData.fuelOuterLeftWeight);
        }
    }));
    dataStore.addValue(new DataValue({
        valueName: 'fuelOuterRightWeight',
        callExec: function(value){
            efbData.fuelOuterRightWeight = value;
            tanks.outerRight.outerSet(efbData.fuelOuterRightWeight);
        }
    }));
    dataStore.addValue(new DataValue({
        valueName: 'CaD',
        callExec: function(value) {
            efbData.loadColdAndDark = value;
        }
    }));
    dataStore.addValue(new DataValue({
        valueName: 'failures',
        callExec: onFailuresUpdated
    }));
    initFailuresStorage('failures', dataStore);


    var getStoredPax = function() {
        return dataStore.getValue('paxA') + dataStore.getValue('paxB') + dataStore.getValue('paxC');
    };

    var getStoredPaxWeight = function() {
        return getStoredPax() * efbData.middleAdultWeight;
    };

    var getStoredCargo = function() {
        return dataStore.getValue('cargo1') + dataStore.getValue('cargo3') + dataStore.getValue('cargo4') + dataStore.getValue('cargo5');
    };

    var getStorePayload = function() {
        return getStoredPaxWeight() + getStoredCargo();
    };

    var getWeightFromAirplane = function(callback, callInit) {
        var settings = $('#rCabinAll').range('getSettings');
        var convertWeightToNumberPax = function(paxWeight) {
            let numberPax = parseInt(paxWeight / efbData.middleAdultWeight);
            if (numberPax > settings.max) {
                numberPax = settings.max;
            }

            return numberPax;
        };

        ff.Get("Aircraft.PayloadWeight", function(value) {
            var numberPax = 0;
            var cargoWeight = 0;

            if (getStorePayload() && callInit != undefined) {
                if (callInit == 'pax') {
                    var newNumberPax = Math.round((value - getStoredCargo()) / efbData.middleAdultWeight);
                    if (newNumberPax == getStoredPax()) {
                        efbData.paxA = dataStore.getValue('paxA');
                        efbData.paxB = dataStore.getValue('paxB');
                        efbData.paxC = dataStore.getValue('paxC');
                    } else {
                        //numberPax = convertWeightToNumberPax(newPaxWeight);
                        setPaxTo(newNumberPax);
                    }
                }
                if (callInit == 'cargo') {
                    cargoWeight = value - getStoredPaxWeight();
                    if (cargoWeight == getStoredCargo()) {
                        efbData.cargo1 = dataStore.getValue('cargo1');
                        efbData.cargo3 = dataStore.getValue('cargo3');
                        efbData.cargo4 = dataStore.getValue('cargo4');
                        efbData.cargo5 = dataStore.getValue('cargo5');
                    } else {
                        autoDistributeCargo(cargoWeight);
                    }
                }
            } else {
                if (value > 800) {
                    var paxWeight = value * 0.8;
                    numberPax = convertWeightToNumberPax(paxWeight);
                    var givenWeight = numberPax * efbData.middleAdultWeight;
                    cargoWeight = value - givenWeight;
                } else {
                    numberPax = convertWeightToNumberPax(value);
                    cargoWeight = 0;
                }

                setPaxTo(numberPax);
                autoDistributeCargo(cargoWeight);
            }

            callback(); // {numberPax: numberPax, cargoWeight: cargoWeight}
        });
    };

    //----------------------------------------- SERVICES ----------------------------------------

    var gpuSwitcher = new ServiceSwitcher({
        iconSelector: '#gpu_icon',
        buttonSelector: '#gpu_switch',
        schemeSelector: '#gpu',
        requestPath: 'Aircraft.ExtPowerRequest',
        responsePath: 'Aircraft.ExtPowerConnected'
    });

    var asuSwitcher = new ServiceSwitcher({
        iconSelector: '#asu_icon',
        buttonSelector: '#asu_switch',
        schemeSelector: '#asu',
        requestPath: 'Aircraft.ExtBleedRequest',
        responsePath: 'Aircraft.ExtBleedConnected'
    });

    var chocksSwitcher = new ServiceSwitcher({
        iconSelector: '#shocks_icon',
        buttonSelector: '#shocks_switch',
        requestPath: 'Aircraft.ShocksRequest',
        responsePath: 'Aircraft.ShocksInstalled'
    });

    //-------------------------------------------------------------------------------------------
    //--------------------------------------------- FUEL ----------------------------------------

    function updateFuelBlock() {
        efbData.fuel = efbData.fuelCenterWeight +
        efbData.fuelWingLeftWeight + efbData.fuelWingRightWeight +
        efbData.fuelOuterLeftWeight + efbData.fuelOuterRightWeight;
    }

    var fuelTruck = new ServiceSwitcher({
        iconSelector: '',
        buttonSelector: '#fuelTruck',
        buttonLabels: {
            on: 'Call',
            off: 'Remove'
        },
        schemeSelector: '#fuel_truck',
        requestPath: 'Aircraft.RefuelRequest',
        responsePath: 'Aircraft.RefuelConnected',
        onToggle: ''
    });

    var fuelControllGroup = new SwitcherGroup({
        groupId: '#fuelControllGroup'
    });
    fuelControllGroup.lock();
    fuelControllGroup.addSwitcher(fuelTruck);

    var fuelButtonGroup = new ButtonDisabler({
        groupId: '#fuelButtonGroup'
    });

    function SchemeTanks(settings) {

        var elCenterTank = null;
        var elLeftTank = null;
        var elRightTank = null;
        var elOuterLeftTank = null;
        var elOuterRightTank = null;
        var isReady = false;
        var onLoadCall = settings.setOnLoadCall;

        this.init = function() {
            var fuelSchemeDoc = $('svg#fuel_scheme');

            elCenterTank = fuelSchemeDoc.find('#center_tank');
            elLeftTank = fuelSchemeDoc.find('#left_tank');
            elRightTank = fuelSchemeDoc.find('#right_tank');
            elOuterLeftTank = fuelSchemeDoc.find('#outer_left_tank');
            elOuterRightTank = fuelSchemeDoc.find('#outer_right_tank');

            isReady = true;
            if (onLoadCall) {
                onLoadCall();
            }
        };

        this.centerSetOpacity = function(opacity) {
            setOpacity(elCenterTank, opacity);
        };
        this.leftSetOpacity = function(opacity) {
            setOpacity(elLeftTank, opacity);
        };
        this.rightSetOpacity = function(opacity) {
            setOpacity(elRightTank, opacity);
        };
        this.outerLeftSetOpacity = function(opacity) {
            setOpacity(elOuterLeftTank, opacity);
        };
        this.outerRightSetOpacity = function(opacity) {
            setOpacity(elOuterRightTank, opacity);
        };

        this.isReady = function() {
            return isReady;
        };

        this.setOnLoadCall = function(callback) {
            onLoadCall = callback;
        };

        var setOpacity = function(element, opacity) {
            if (isReady) {
                element.css('fill-opacity', opacity);
            }
        }
    }

    function FuelTanks() {
        this.central = new Container({
            min: 60,
            max: efbData.fuelCenterMax,
            selector: '#cTankRange'
        });
        this.left = new Container({
            min: 60,
            max: efbData.fuelWingLeftMax,
            selector: '#lTankRange'
        });
        this.right = new Container({
            min: 60,
            max: efbData.fuelWingRightMax,
            selector: '#rTankRange'
        });
        this.outerLeft = new Container({
            min: 0,
            max: efbData.fuelOuterLeftMax,
            selector: '#olTankRange'
        });
        this.outerRight = new Container({
            min: 0,
            max: efbData.fuelOuterRightMax,
            selector: '#orTankRange'
        });

        this.filledAllTanks = function() {
            return this.central.get() + this.left.get() + this.right.get() + this.outerLeft.get() + this.outerRight.get();
        }
    }

    var getFuelValueFromAirplane = function(callback) {
        var trigger = new Trigger(5, callback);

        ff.Get("Aircraft.FuelCenter", function(value) {
            efbData.fuelCenterWeight = Math.round(value);
            tanks.central.outerSet(efbData.fuelCenterWeight);
            efbData.fuelCenter = efbData.fuelCenterWeight;
            updateFuelBlock();
            trigger.setTrigger(0);
        });
        ff.Get("Aircraft.FuelInnerL", function(value) {
            efbData.fuelWingLeftWeight = Math.round(value);
            tanks.left.outerSet(efbData.fuelWingLeftWeight);
            efbData.fuelWingLeft = efbData.fuelWingLeftWeight;
            updateFuelBlock();
            trigger.setTrigger(1);
        });
        ff.Get("Aircraft.FuelInnerR", function(value) {
            efbData.fuelWingRightWeight = Math.round(value);
            tanks.right.outerSet(efbData.fuelWingRightWeight);
            efbData.fuelWingRight = efbData.fuelWingRightWeight;
            updateFuelBlock();
            trigger.setTrigger(2);
        });
        ff.Get("Aircraft.FuelOuterL", function(value) {
            efbData.fuelOuterLeftWeight = Math.round(value);
            tanks.outerLeft.outerSet(efbData.fuelOuterLeftWeight);
            efbData.fuelOuterLeft = efbData.fuelOuterLeftWeight;
            updateFuelBlock();
            trigger.setTrigger(3);
        });
        ff.Get("Aircraft.FuelOuterR", function(value) {
            efbData.fuelOuterRightWeight = Math.round(value);
            tanks.outerRight.outerSet(efbData.fuelOuterRightWeight);
            efbData.fuelOuterRight = efbData.fuelOuterRightWeight;
            updateFuelBlock();
            trigger.setTrigger(4);
        });
    };

    var debugFuelTanksValue = function() {
        if (document.location.host == '') {
            console.log("Fuel init from aircraft.");
            console.log("Aircraft.FuelCenter = " + Aircraft.FuelCenter);
            console.log("Aircraft.FuelInnerL = " + Aircraft.FuelInnerL);
            console.log("Aircraft.FuelInnerR = " + Aircraft.FuelInnerR);
            console.log("Aircraft.FuelOuterL = " + Aircraft.FuelOuterL);
            console.log("Aircraft.FuelOuterR = " + Aircraft.FuelOuterR);
        }
    };

    // transmit data of fuel from 'efbData'
    var transmitFuelValue = function() {
        //debugFuelTanksValue();
        tanks.central.outerSet(efbData.fuelCenterWeight);
        tanks.left.outerSet(efbData.fuelWingLeftWeight);
        tanks.right.outerSet(efbData.fuelWingRightWeight);
        tanks.outerLeft.outerSet(efbData.fuelOuterLeftWeight);
        tanks.outerRight.outerSet(efbData.fuelOuterRightWeight);
    };

    var tanks = new FuelTanks();
    var schemeTanks = new SchemeTanks({
        setOnLoadCall: transmitFuelValue
    });

    var changeAllCapacity = function(element, value) {
        updateFuelFromLS(value);
        var settings;

        settings = $('#cTankRange').range('getSettings');
        schemeTanks.centerSetOpacity((efbData.fuelCenterWeight - settings.min) / (settings.max - settings.min));
        tanks.central.set(efbData.fuelCenterWeight);

        settings = $('#lTankRange').range('getSettings');
        schemeTanks.leftSetOpacity((efbData.fuelWingLeftWeight - settings.min) / (settings.max - settings.min));
        tanks.left.set(efbData.fuelWingLeftWeight);

        settings = $('#rTankRange').range('getSettings');
        schemeTanks.rightSetOpacity((efbData.fuelWingRightWeight - settings.min) / (settings.max - settings.min));
        tanks.right.set(efbData.fuelWingRightWeight);

        settings = $('#olTankRange').range('getSettings');
        schemeTanks.outerLeftSetOpacity((efbData.fuelOuterLeftWeight - settings.min) / (settings.max - settings.min));
        tanks.outerLeft.set(efbData.fuelOuterLeftWeight);

        settings = $('#orTankRange').range('getSettings');
        schemeTanks.outerRightSetOpacity((efbData.fuelOuterRightWeight - settings.min) / (settings.max - settings.min));
        tanks.outerRight.set(efbData.fuelOuterRightWeight);

        updateFuelBlock();

        //dataStore.setValue('fuelCenterWeight', efbData.fuelCenterWeight);
        //dataStore.setValue('fuelWingLeftWeight', efbData.fuelWingLeftWeight);
        //dataStore.setValue('fuelWingRightWeight', efbData.fuelWingRightWeight);
        //dataStore.setValue('fuelOuterLeftWeight', efbData.fuelOuterLeftWeight);
        //dataStore.setValue('fuelOuterRightWeight', efbData.fuelOuterRightWeight);
    };

    var changeOneTank = function(element, value, settings) {
        $('#allTankRange').range('setValue', tanks.filledAllTanks());

        var opacity = (value - settings.min) / (settings.max - settings.min);

        switch ($(element).attr('id')) {
            case 'cTankRange':
                efbData.fuelCenterWeight = tanks.central.get();
                schemeTanks.centerSetOpacity(opacity);
                //dataStore.setValue('fuelCenterWeight', efbData.fuelCenterWeight);
                break;
            case 'lTankRange':
                efbData.fuelWingLeftWeight = tanks.left.get();
                schemeTanks.leftSetOpacity(opacity);
                //dataStore.setValue('fuelWingLeftWeight', efbData.fuelWingLeftWeight);
                break;
            case 'rTankRange':
                efbData.fuelWingRightWeight = tanks.right.get();
                schemeTanks.rightSetOpacity(opacity);
                //dataStore.setValue('fuelWingRightWeight', efbData.fuelWingRightWeight);
                break;
            case 'olTankRange':
                efbData.fuelOuterLeftWeight = tanks.outerLeft.get();
                schemeTanks.outerLeftSetOpacity(opacity);
                //dataStore.setValue('fuelOuterLeftWeight', efbData.fuelOuterLeftWeight);
                break;
            case 'orTankRange':
                efbData.fuelOuterRightWeight = tanks.outerRight.get();
                schemeTanks.outerRightSetOpacity(opacity);
                //dataStore.setValue('fuelOuterRightWeight', efbData.fuelOuterRightWeight);
                break;
            default:
                break;
        }

        updateFuelBlock();
    };

    function loadToAcfValueTanks() {
        ff.Set("Aircraft.FuelCenter", efbData.fuelCenterWeight); // tanks.central.get()
        ff.Set("Aircraft.FuelInnerL", efbData.fuelWingLeftWeight); // tanks.left.get()
        ff.Set("Aircraft.FuelInnerR", efbData.fuelWingRightWeight); // tanks.right.get()
        ff.Set("Aircraft.FuelOuterL", efbData.fuelOuterLeftWeight); // tanks.outerLeft.get()
        ff.Set("Aircraft.FuelOuterR", efbData.fuelOuterRightWeight); // tanks.outerRight.get()
        dataStore.setValue('fuelCenterWeight', efbData.fuelCenterWeight);
        dataStore.setValue('fuelWingLeftWeight', efbData.fuelWingLeftWeight);
        dataStore.setValue('fuelWingRightWeight', efbData.fuelWingRightWeight);
        dataStore.setValue('fuelOuterLeftWeight', efbData.fuelOuterLeftWeight);
        dataStore.setValue('fuelOuterRightWeight', efbData.fuelOuterRightWeight);

    }

    $('#cTankRange').range({
        min: 60, // min = 60
        max: efbData.fuelCenterMax, // the capacity of central tank
        start: 60,
        input: $('#cTankInput'),
        onChange: changeOneTank
    });

    $('#lTankRange').range({
        min: 60, // min = 60
        max: efbData.fuelWingLeftMax, // the capacity of tank in left wing
        start: 60,
        input: $('#lTankInput'),
        onChange: changeOneTank
    });

    $('#rTankRange').range({
        min: 60, // min = 60
        max: efbData.fuelWingRightMax, // the capacity of tank in right wing
        start: 60,
        input: $('#rTankInput'),
        onChange: changeOneTank
    });

    $('#olTankRange').range({
        min: 0,
        max: efbData.fuelOuterLeftMax, // the capacity of outer tank in left wing
        input: $('#olTankInput'),
        onChange: changeOneTank
    });

    $('#orTankRange').range({
        min: 0,
        max: efbData.fuelOuterRightMax, // the capacity of outer tank in right wing
        input: $('#orTankInput'),
        onChange: changeOneTank
    });

    $('#allTankRange').range({
        min: 60 + 60 + 60, // minimum fuel in all tanks = 180 kg
        max: efbData.fuelCenterMax + efbData.fuelWingLeftMax + efbData.fuelWingRightMax + efbData.fuelOuterLeftMax + efbData.fuelOuterRightMax, // the capacity of all tanks
        start: 60 + 60 + 60,
        input: $('#allTankInput'),
        onChange: changeAllCapacity
    });

    // load fuel to aircraft
    $('#setFuelValue').on('click', function() {
        loadToAcfValueTanks();
        //ff.Set("Aircraft.FuelCenter", efbData.fuelCenterWeight); // tanks.central.get()
        //ff.Set("Aircraft.FuelInnerL", efbData.fuelWingLeftWeight); // tanks.left.get()
        //ff.Set("Aircraft.FuelInnerR", efbData.fuelWingRightWeight); // tanks.right.get()
        //ff.Set("Aircraft.FuelOuterL", efbData.fuelOuterLeftWeight); // tanks.outerLeft.get()
        //ff.Set("Aircraft.FuelOuterR", efbData.fuelOuterRightWeight); // tanks.outerRight.get()
    });

    $('#getFuelValue').on('click', getFuelValueFromAirplane);

    //-------------------------------------------------------------------------------------------
    //------------------------------------------- PAX -------------------------------------------
    var stairsToggleLF = new ButtonToggle({
        buttonSelector: '#stairsToggleLF',
        buttonLabels: {
            on: 'Gate',
            off: 'Stairs'
        },
        requestPath: 'Aircraft.ExtAirStairsLF',
        responsePath: 'Aircraft.ExtAirStairsLF',
        onToggle: ''
    });

    var stairsToggleRF = new ButtonToggle({
        buttonSelector: '#stairsToggleRF',
        buttonLabels: {
            on: 'Gate',
            off: 'Stairs'
        },
        requestPath: 'Aircraft.ExtAirStairsRF',
        responsePath: 'Aircraft.ExtAirStairsRF',
        onToggle: ''
    });

    var stairsToggleLB = new ButtonToggle({
        buttonSelector: '#stairsToggleLB',
        buttonLabels: {
            on: 'Gate',
            off: 'Stairs'
        },
        requestPath: 'Aircraft.ExtAirStairsLB',
        responsePath: 'Aircraft.ExtAirStairsLB',
        onToggle: ''
    });

    var stairsToggleRB = new ButtonToggle({
        buttonSelector: '#stairsToggleRB',
        buttonLabels: {
            on: 'Gate',
            off: 'Stairs'
        },
        requestPath: 'Aircraft.ExtAirStairsRB',
        responsePath: 'Aircraft.ExtAirStairsRB',
        onToggle: ''
    });

    var airStairsLF = new ServiceSwitcher({
        iconSelector: '',
        buttonSelector: '#airStairsLF',
        buttonLabels: {
            on: 'Call',
            off: 'Remove'
        },
        schemeSelector: '#LF',
        requestPath: 'Aircraft.AirStairsRequestLF',
        responsePath: 'Aircraft.AirStairsInstalledLF',
        onToggle: '',
        condition: stairsToggleLF
    });

    var airStairsRF = new ServiceSwitcher({
        iconSelector: '',
        buttonSelector: '#airStairsRF',
        buttonLabels: {
            on: 'Call',
            off: 'Remove'
        },
        schemeSelector: '#RF',
        requestPath: 'Aircraft.AirStairsRequestRF',
        responsePath: 'Aircraft.AirStairsInstalledRF',
        onToggle: '',
        condition: stairsToggleRF
    });

    var airStairsLB = new ServiceSwitcher({
        iconSelector: '',
        buttonSelector: '#airStairsLB',
        buttonLabels: {
            on: 'Call',
            off: 'Remove'
        },
        schemeSelector: '#LB',
        requestPath: 'Aircraft.AirStairsRequestLB',
        responsePath: 'Aircraft.AirStairsInstalledLB',
        onToggle: '',
        condition: stairsToggleLB
    });

    var airStairsRB = new ServiceSwitcher({
        iconSelector: '',
        buttonSelector: '#airStairsRB',
        buttonLabels: {
            on: 'Call',
            off: 'Remove'
        },
        schemeSelector: '#RB',
        requestPath: 'Aircraft.AirStairsRequestRB',
        responsePath: 'Aircraft.AirStairsInstalledRB',
        onToggle: '',
        condition: stairsToggleRB
    });

    var paxControllGroup = new SwitcherGroup({
        groupId: '#paxControllGroup'
    });
    paxControllGroup.lock();
    paxControllGroup.addSwitcher(airStairsLF);
    paxControllGroup.addSwitcher(airStairsLB);
    paxControllGroup.addSwitcher(airStairsRF);
    paxControllGroup.addSwitcher(airStairsRB);

    var paxButtonGroup = new ButtonDisabler({
        groupId: '#paxButtonGroup'
    });

    function Cabin(settings) {
        var seats = new Array(settings.numberSeats);
        var jqSeats = new Array(settings.numberSeats);
        var jqRange = $(settings.selector);
        var rangeSettings;

        for (var i = 0; i < settings.numberSeats; i++) {
            jqSeats[i] = $('#' + settings.selectorPrefix + (i + 1)); // +1 DOM element id begin from 1
        }

        var fillSeats = function(onOff) {
            var filler = (onOff) ? true : false;
            for (var i = 0; i < settings.numberSeats; i++) {
                seats[i] = filler;
                jqSeats[i].css('fill-opacity', (onOff) ? 1 : 0);
            }
        };

        var onByNumber = function(number) {
            var validNum = parseInt(number);
            validNum = (validNum > settings.numberSeats) ? settings.numberSeats : validNum;
            validNum = (validNum < 0) ? 0 : validNum;

            var cabinPattern = new Array(settings.numberSeats);
            for (var i = 0; i < cabinPattern.length; i++) {
                cabinPattern[i] = i;
            }


            for (i = 0; i < validNum; i++) {
                var rndIdx = Math.floor(Math.random() * (cabinPattern.length));
                var seatsIdx = cabinPattern.splice(rndIdx, 1)[0];
                seats[seatsIdx] = true;
                jqSeats[seatsIdx].css('fill-opacity', 1);
            }
        };

        this.onRnd = function(number) {
            if (this.getNumber() != number) {
                fillSeats(false);
                onByNumber(number);
            }
        };

        //this.onRndNumber = function() {
        //    var rndNum = Math.floor(Math.random() * (settings.numberSeats + 1));
        //    this.onRnd(rndNum);
        //};

        //this.offAll = function() {
        //    fillSeats(false);
        //};

        this.getNumber = function() {
            var number = 0;
            for (var i = 0; i < seats.length; i++) {
                if (seats[i]) {
                    number++;
                }
            }

            return number;
        };

        var lockCall = function() {
            jqRange.range('setChanging', jqRange.attr('id'));
        };

        var releaseCall = function() {
            jqRange.range('releaseChanging');
        };

        this.set = function(value) {
            if (rangeSettings == undefined) {
                rangeSettings = jqRange.range('getSettings');
            }

            var validValue = value;
            validValue = validValue < rangeSettings.min ? rangeSettings.min : validValue;
            validValue = validValue > rangeSettings.max ? rangeSettings.max : validValue;
            jqRange.range('setValue', validValue);
        };

        this.outerSet = function(value) {
            lockCall();
            this.set(value);
            releaseCall();
        }
    }

    function Pax(settings) {
        var onLoadCall = settings.setOnLoadCall;
        this.cabinA = null;
        this.cabinB = null;
        this.cabinC = null;

        this.init = function() {
            this.cabinA = new Cabin({
                selectorPrefix: 'a_',
                numberSeats: 16,
                selector: '#rCabinA'
            });
            this.cabinB = new Cabin({
                selectorPrefix: 'b_',
                numberSeats: 60,
                selector: '#rCabinB'
            });
            this.cabinC = new Cabin({
                selectorPrefix: 'c_',
                numberSeats: 60,
                selector: '#rCabinC'
            });

            if (onLoadCall) {
                onLoadCall();
            }
        };

        this.seatCabinA = function(number) {
            this.cabinA.onRnd(number)
        };
        this.seatCabinB = function(number) {
            this.cabinB.onRnd(number)
        };
        this.seatCabinC = function(number) {
            this.cabinC.onRnd(number)
        };

        this.getPaxInCabinA = function() {
            return this.cabinA.getNumber()
        };
        this.getPaxInCabinB = function() {
            return this.cabinB.getNumber()
        };
        this.getPaxInCabinC = function() {
            return this.cabinC.getNumber()
        };

        this.allPaxInCabin = function() {
            return this.cabinA.getNumber() + this.cabinB.getNumber() + this.cabinC.getNumber();
        };

        this.setRangeCabinA = function(value) {
            this.cabinA.set(value);
        };
        this.setRangeCabinB = function(value) {
            this.cabinB.set(value);
        };
        this.setRangeCabinC = function(value) {
            this.cabinC.set(value);
        };

        this.distributePaxInAllCabin = function(number) {
            var settings = $('#rCabinAll').range('getSettings');
            var percent = number / settings.max * 100;
            var numberCabinA = Math.floor((percent * 16) / 100);
            var numberCabinB = Math.ceil((percent * 60) / 100);
            var numberCabinC = number - (numberCabinA + numberCabinB);

            pax.seatCabinA(numberCabinA);
            pax.setRangeCabinA(numberCabinA);
            efbData.paxA = numberCabinA;
            pax.seatCabinB(numberCabinB);
            pax.setRangeCabinB(numberCabinB);
            efbData.paxB = numberCabinB;
            pax.seatCabinC(numberCabinC);
            pax.setRangeCabinC(numberCabinC);
            efbData.paxC = numberCabinC;
        };
    }

    var getPaxWeightFromAirplane = function() {
        getWeightFromAirplane(transmitPaxValue, 'pax');
    };

    var transmitPaxValue = function() {
        pax.cabinA.outerSet(efbData.paxA);
        pax.cabinB.outerSet(efbData.paxB);
        pax.cabinC.outerSet(efbData.paxC);
    };

    var pax = new Pax({
        setOnLoadCall: transmitPaxValue
    });

    var changeAllCabin = function(element, value) {
        pax.distributePaxInAllCabin(value);

        efbData.paxA = pax.getPaxInCabinA();
        efbData.paxB = pax.getPaxInCabinB();
        efbData.paxC = pax.getPaxInCabinC();
        //dataStore.setValue('paxA', efbData.paxA);
        //dataStore.setValue('paxB', efbData.paxB);
        //dataStore.setValue('paxC', efbData.paxC);
    };

    var changeOneCabin = function(element, value) {
        switch ($(element).attr('id')) {
            case 'rCabinA':
                pax.seatCabinA(value);
                efbData.paxA = pax.getPaxInCabinA();
                //dataStore.setValue('paxA', efbData.paxA);
                break;
            case 'rCabinB':
                pax.seatCabinB(value);
                efbData.paxB = pax.getPaxInCabinB();
                //dataStore.setValue('paxB', efbData.paxB);
                break;
            case 'rCabinC':
                pax.seatCabinC(value);
                efbData.paxC = pax.getPaxInCabinC();
                //dataStore.setValue('paxC', efbData.paxC);
                break;
            default:
                break;
        }

        $('#rCabinAll').range('setValue', pax.allPaxInCabin());
    };

    $('#rCabinA').range({
        min: 0,
        max: 16,
        start: 0,
        input: $('#fCabinA'),
        onChange: changeOneCabin
    });

    $('#rCabinB').range({
        min: 0,
        max: 60,
        start: 0,
        input: $('#fCabinB'),
        onChange: changeOneCabin
    });

    $('#rCabinC').range({
        min: 0,
        max: 60,
        start: 0,
        input: $('#fCabinC'),
        onChange: changeOneCabin
    });

    $('#rCabinAll').range({
        min: 0,
        max: 136,
        start: 0,
        input: $('#fCabinAll'),
        onChange: changeAllCabin
    });

    $('#setPaxEmptyValue').on('click', function() {
        var jqRangeCabinAll = $('#rCabinAll');
        pax.distributePaxInAllCabin(0);
        jqRangeCabinAll.range('setValue', 0);
    });

    $('#setPax1To3Value').on('click', function() {
        var jqRangeCabinAll = $('#rCabinAll');
        var settings = jqRangeCabinAll.range('getSettings');
        var value = parseInt(settings.max * 0.33);
        pax.distributePaxInAllCabin(value);
        jqRangeCabinAll.range('setValue', value);
    });

    $('#setPax2To3Value').on('click', function() {
        var jqRangeCabinAll = $('#rCabinAll');
        var settings = jqRangeCabinAll.range('getSettings');
        var value = parseInt(settings.max * 0.66);
        pax.distributePaxInAllCabin(value);
        jqRangeCabinAll.range('setValue', value);
    });

    $('#setPaxFullValue').on('click', function() {
        var jqRangeCabinAll = $('#rCabinAll');
        var settings = jqRangeCabinAll.range('getSettings');
        pax.distributePaxInAllCabin(settings.max);
        jqRangeCabinAll.range('setValue', settings.max);
    });

    $('#setPaxValue').on('click', function() {
        loadPayloadToAcf();
    });

    $('#getPaxValue').on('click', getPaxWeightFromAirplane);

    //-------------------------------------------------------------------------------------------
    //------------------------------------------ CARGO ------------------------------------------

    var baggageLoaderF = new ServiceSwitcher({
        iconSelector: '',
        buttonSelector: '#baggageLoaderF',
        buttonLabels: {
            on: 'Call',
            off: 'Remove'
        },
        schemeSelector: '#BaggageLoaderF',
        requestPath: 'Aircraft.CargoRequestF',
        responsePath: 'Aircraft.CargoInstalledF',
        onToggle: ''
    });

    var baggageLoaderB = new ServiceSwitcher({
        iconSelector: '',
        buttonSelector: '#baggageLoaderB',
        buttonLabels: {
            on: 'Call',
            off: 'Remove'
        },
        schemeSelector: '#BaggageLoaderB',
        requestPath: 'Aircraft.CargoRequestB',
        responsePath: 'Aircraft.CargoInstalledB',
        onToggle: ''
    });

    var cargoControllGroupF = new SwitcherGroup({
        groupId: '#cargoControllGroupF'
    });
    cargoControllGroupF.lock();
    cargoControllGroupF.addSwitcher(baggageLoaderF);

    var cargoControllGroupB = new SwitcherGroup({
        groupId: '#cargoControllGroupB'
    });
    cargoControllGroupB.lock();
    cargoControllGroupB.addSwitcher(baggageLoaderB);

    var cargoButtonGroup = new ButtonDisabler({
        groupId: '#cargoButtonGroup'
    });

    var cargoControllGroupAll = new SwitcherGroup({
        groupId: '#cargoControllGroupAll'
    });
    cargoControllGroupAll.lock();
    cargoControllGroupAll.addSwitcher(baggageLoaderF);
    cargoControllGroupAll.addSwitcher(baggageLoaderB);

    function SchemeCargo(settings) {

        var cargo1 = null;
        var cargo2 = null;
        var cargo3 = null;
        var cargo4 = null;
        var isReady = false;
        var onLoadCall = settings.setOnLoadCall;

        this.init = function() {
            var cargoSchemeDoc = $('svg#cargo_scheme');

            cargo1 = cargoSchemeDoc.find('#cargo_1');
            cargo2 = cargoSchemeDoc.find('#cargo_2');
            cargo3 = cargoSchemeDoc.find('#cargo_3');
            cargo4 = cargoSchemeDoc.find('#cargo_4');

            isReady = true;
            if (onLoadCall) {
                onLoadCall();
            }
        };

        this.firstCargoOpacity = function(opacity) {
            setOpacity(cargo1, opacity);
        };
        this.secondCargoOpacity = function(opacity) {
            setOpacity(cargo2, opacity);
        };
        this.thirdCargoOpacity = function(opacity) {
            setOpacity(cargo3, opacity);
        };
        this.fourthCargoOpacity = function(opacity) {
            setOpacity(cargo4, opacity);
        };

        this.isReady = function() {
            return isReady;
        };

        this.setOnLoadCall = function(callback) {
            onLoadCall = callback;
        };

        var setOpacity = function(element, opacity) {
            if (isReady) {
                element.css('fill-opacity', opacity);
            }
        }
    }

    function AllCargo() {
        this.firstCargo = new Container({
            min: 0,
            max: 3402,
            selector: '#rCargo1'
        });
        this.thirdCargo = new Container({
            min: 0,
            max: 4536,
            selector: '#rCargo2'
        });
        this.fourthCargo = new Container({
            min: 0,
            max: 2110,
            selector: '#rCargo3'
        });
        this.fifthCargo = new Container({
            min: 0,
            max: 1197,
            selector: '#rCargo4'
        });

        this.filledAllCargo = function() {
            return this.firstCargo.get() + this.thirdCargo.get() + this.fourthCargo.get() + this.fifthCargo.get();
        };
    }

    var getCargoValueFromAirplane = function() {
        getWeightFromAirplane(transmitCargoValue, 'cargo');
    };

    var transmitCargoValue = function() {
        allCargo.firstCargo.outerSet(efbData.cargo1);
        allCargo.thirdCargo.outerSet(efbData.cargo3);
        allCargo.fourthCargo.outerSet(efbData.cargo4);
        allCargo.fifthCargo.outerSet(efbData.cargo5);
    };

    var allCargo = new AllCargo();
    var schemeCargo = new SchemeCargo({
        setOnLoadCall: transmitCargoValue
    });

    var changeAllCargo = function(element, value) {
        let qRangeAllCargo = $('#rCargoAll');
        let holdenCargo1 = efbData.cargo1Max;
        let holdenCargo3 = efbData.cargo3Max;
        let holdenCargo4 = efbData.cargo4Max;
        let holdenCargo5 = efbData.cargo5Max;
        let holdenMin = 0;
        let holdenMax = holdenCargo1 + holdenCargo3 + holdenCargo4 + holdenCargo5;

        let fState = cargoControllGroupF.getState();
        let bState = cargoControllGroupB.getState();

        if (!fState) {
            holdenCargo1 = allCargo.firstCargo.get();
            holdenMin = holdenCargo1;
            holdenMax = holdenMin + holdenCargo3 + holdenCargo4 + holdenCargo5;
        }
        if (!bState) {
            holdenCargo3 = allCargo.thirdCargo.get();
            holdenCargo4 = allCargo.fourthCargo.get();
            holdenCargo5 = allCargo.fifthCargo.get();
            holdenMin = holdenCargo3 + holdenCargo4 + holdenCargo5;
            holdenMax = holdenMin + holdenCargo1
        }
        if (!fState && !bState) {
            holdenMin = holdenMax = holdenCargo1 + holdenCargo3 + holdenCargo4 + holdenCargo5;
        }

        qRangeAllCargo.range('setMin', holdenMin);
        qRangeAllCargo.range('setMax', holdenMax);

        var settings;
        if (bState) {
            var fourthValue = value - (holdenCargo1 + holdenCargo3 + holdenCargo4);
            allCargo.fifthCargo.set(fourthValue);
            settings = $('#rCargo4').range('getSettings');
            schemeCargo.fourthCargoOpacity((fourthValue - settings.min) / (settings.max - settings.min));

            var thirdValue = value - (holdenCargo1 + holdenCargo3);
            allCargo.fourthCargo.set(thirdValue);
            settings = $('#rCargo3').range('getSettings');
            schemeCargo.thirdCargoOpacity((thirdValue - settings.min) / (settings.max - settings.min));

            var secondValue = value - holdenCargo1;
            allCargo.thirdCargo.set(secondValue);
            settings = $('#rCargo2').range('getSettings');
            schemeCargo.secondCargoOpacity((secondValue - settings.min) / (settings.max - settings.min));
        }

        if (fState) {
            allCargo.firstCargo.set(value - holdenMin);
            settings = $('#rCargo1').range('getSettings');
            schemeCargo.firstCargoOpacity(((value - holdenMin) - settings.min) / (settings.max - settings.min));
        }

        efbData.cargo1 = allCargo.firstCargo.get();
        efbData.cargo3 = allCargo.thirdCargo.get();
        efbData.cargo4 = allCargo.fourthCargo.get();
        efbData.cargo5 = allCargo.fifthCargo.get();
        //dataStore.setValue('cargo1', efbData.cargo1);
        //dataStore.setValue('cargo3', efbData.cargo3);
        //dataStore.setValue('cargo4', efbData.cargo4);
        //dataStore.setValue('cargo5', efbData.cargo5);
    };

    var changeOneCargo = function(element, value, settings) {
        $('#rCargoAll').range('setValue', allCargo.filledAllCargo());

        var opacity = (value - settings.min) / (settings.max - settings.min);

        switch ($(element).attr('id')) {
            case 'rCargo1':
                schemeCargo.firstCargoOpacity(opacity);
                efbData.cargo1 = allCargo.firstCargo.get();
                //dataStore.setValue('cargo1', efbData.cargo1);
                break;
            case 'rCargo2':
                schemeCargo.secondCargoOpacity(opacity);
                efbData.cargo3 = allCargo.thirdCargo.get();
                //dataStore.setValue('cargo3', efbData.cargo3);
                break;
            case 'rCargo3':
                schemeCargo.thirdCargoOpacity(opacity);
                efbData.cargo4 = allCargo.fourthCargo.get();
                //dataStore.setValue('cargo4', efbData.cargo4);
                break;
            case 'rCargo4':
                schemeCargo.fourthCargoOpacity(opacity);
                efbData.cargo5 = allCargo.fifthCargo.get();
                //dataStore.setValue('cargo5', efbData.cargo5);
                break;
            default:
                break;
        }
    };

    $('#rCargo1').range({
        min: 0,
        max: 3402, // the capacity first from bow to stern
        start: 0,
        input: $('#fCargo1'),
        onChange: changeOneCargo
    });

    $('#rCargo2').range({
        min: 0,
        max: 4536, // the capacity second from bow to stern
        start: 0,
        input: $('#fCargo2'),
        onChange: changeOneCargo
    });

    $('#rCargo3').range({
        min: 0,
        max: 2110, // the capacity third from bow to stern
        start: 0,
        input: $('#fCargo3'),
        onChange: changeOneCargo
    });

    $('#rCargo4').range({
        min: 0,
        max: 1197, // the capacity fourth from bow to stern
        start: 0,
        input: $('#fCargo4'),
        onChange: changeOneCargo
    });

    $('#rCargoAll').range({
        min: 0,
        max: 11245, // the capacity all parts
        start: 0,
        input: $('#fCargoAll'),
        onChange: changeAllCargo
    });

    $('#setCargoValue').on("click", function() {
        loadPayloadToAcf();
    });

    $('#getCargoValue').on("click", getCargoValueFromAirplane);

    //-------------------------------------------------------------------------------------------
    //--------------------------------------- PERF DATA -----------------------------------------

    // canvas size: h = 325, w = 660
    var bgColor = '#363636';
    var bgPolyColor = 'rgb(100, 100, 100)';
    var axisColor = 'rgb(146, 146, 146)';
    var strokePolyColor = 'rgb(166, 166, 166)';
    var indicatorLineColor = '#6687ff'; //'#3662ff';
    var indicatorLineColorZFW = indicatorLineColor; //'#f4a460';

    var drawScale = function(ctx) {
        ctx.font = '11px sans-serif';
        ctx.fillStyle = strokePolyColor;

        // Y scale
        var stepY = 6.23;
        var offsetY = 24;
        ctx.beginPath();
        var YScaleLabelOffset;
        for (var y = 0; y < 46; y++) {
            YScaleLabelOffset = y % 5 ? 6 : 3;
            if (!(y % 5)) {
                ctx.fillText((80 - y) + '', 2, y * stepY + offsetY + 4);
            }
            ctx.moveTo(14 + YScaleLabelOffset, y * stepY + offsetY);
            ctx.lineTo(24, y * stepY + offsetY);
        }

        // X scale
        var stepX = 7.88;
        var offsetX = 24;
        var XScaleLabelOffset;
        for (var x = 0; x < 80; x++) {
            XScaleLabelOffset = x % 10 ? (x % 5 ? 3 : 6) : 9;
            ctx.moveTo(x * stepX + offsetX, 304);
            ctx.lineTo(x * stepX + offsetX, 306 + XScaleLabelOffset);
        }
        for (var labelNum = 0; labelNum < 23; labelNum++) {
            ctx.fillText((labelNum + 17) + '', labelNum * 26.4 + 44, 20);
        }
        ctx.stroke();
    };

    var drawVerticalAxis = function(ctx) {
        var coord = [
            [24, 106, 133, 291],
            [24, 68, 144, 291],
            [24, 17, 157, 291],
            [48, 11, 166, 291],
            [75, 11, 178, 291],
            [101, 11, 191, 291],
            [127, 11, 202, 291],
            [154, 11, 213, 291],
            [179, 11, 225, 291],
            [207, 11, 237, 291],
            [232, 11, 249, 291],
            [259, 11, 259, 291],
            [287, 11, 272, 291],
            [312, 11, 283, 291],
            [339, 11, 294, 291],
            [365, 11, 306, 291],
            [393, 11, 318, 291],
            [419, 11, 329, 291],
            [445, 11, 341, 291],
            [470, 11, 354, 291],
            [497, 11, 364, 291],
            [523, 11, 376, 291],
            [549, 11, 388, 291],
            [577, 11, 400, 291],
            [603, 11, 411, 291],
            [629, 11, 422, 291],
            [652, 17, 435, 291],
            [652, 47, 445, 291],
            [652, 75, 456, 291],
            [652, 101, 469, 291],
            [652, 120, 480, 291]
        ];

        ctx.strokeStyle = axisColor;
        ctx.beginPath();
        for (var l = 0; l < coord.length; l++) {
            ctx.moveTo(coord[l][0], coord[l][1] + 13);
            ctx.lineTo(coord[l][2], coord[l][3] + 13);
        }
        ctx.stroke();
    };

    var drawHorizontalAxis = function(ctx) {
        var offsetY = 42.15;
        var stepY = 31.15;
        ctx.strokeStyle = axisColor;
        ctx.beginPath();
        for (var i = 0; i < 8; i++) {
            ctx.moveTo(24, i * stepY + offsetY + 13);
            ctx.lineTo(652, i * stepY + offsetY + 13);
        }
        ctx.stroke();
        //ctx.font = '12px sans-serif';
        //ctx.fillText('Test', 300, 6);
        //ctx.font = '11px sans-serif';
    };

    var drawPolygon = function(ctx) {
        var coord1 = [
            [127, 180],
            [136, 116],
            [112, 60],
            [162, 50],
            [377, 29],
            [532, 29],
            [611, 67],
            [556, 129],
            [400, 214],
            [362, 278]
        ];
        var coord2 = [
            [156, 208],
            [162, 176],
            [156, 163],
            [160, 135],
            [156, 129],
            [577, 129],
            [436, 278]
        ];

        var idx;
        ctx.fillStyle = bgPolyColor;
        ctx.strokeStyle = strokePolyColor;

        ctx.beginPath();
        ctx.moveTo(188, 278 + 13);
        for (idx = 0; idx < coord1.length; idx++) {
            ctx.lineTo(coord1[idx][0], coord1[idx][1] + 13);
        }
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(202, 278 + 13);
        for (idx = 0; idx < coord2.length; idx++) {
            ctx.lineTo(coord2[idx][0], coord2[idx][1] + 13);
        }
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(188, 278 + 13);
        for (idx = 0; idx < coord1.length; idx++) {
            ctx.lineTo(coord1[idx][0], coord1[idx][1] + 13);
        }
        ctx.moveTo(202, 278 + 13);
        for (idx = 0; idx < coord2.length; idx++) {
            ctx.lineTo(coord2[idx][0], coord2[idx][1] + 13);
        }
        ctx.stroke();
    };

    var drawChart = function(ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(24, 24, 628, 280);
        ctx.lineWidth = 2;
        ctx.strokeStyle = axisColor;
        ctx.strokeRect(24, 24, 628, 280);
        ctx.lineWidth = 1;
        drawScale(ctx);
        ctx.lineWidth = 2;
        drawPolygon(ctx);
        ctx.lineWidth = 1;
        drawVerticalAxis(ctx);
        drawHorizontalAxis(ctx);
    };

    var pixelOfIndex = function(index) {
        return 21 + ((index - 20) * 7.95);
    };

    var pixelOfWeight = function(weight) {
        return (80 - weight) * 6.3 + 21;
    };

    var perfDataFormUpdate = function() {

        var getTrimPos = function(cg) {
            //var trim = new Map();
            //trim.set(17.4, 'UP 2.5');
            var trim = [
                {cg: 17.4, trim: 'UP 2.5'},
                {cg: 17.5, trim: 'UP 2.4'},
                {cg: 17.8, trim: 'UP 2.3'},
                {cg: 18.2, trim: 'UP 2.2'},
                {cg: 18.7, trim: 'UP 2.1'},
                {cg: 19.1, trim: 'UP 2.0'},
                {cg: 19.6, trim: 'UP 1.9'},
                {cg: 20,   trim: 'UP 1.8'},
                {cg: 20.5, trim: 'UP 1.7'},
                {cg: 21,   trim: 'UP 1.6'},
                {cg: 21.4, trim: 'UP 1.5'},
                {cg: 21.9, trim: 'UP 1.4'},
                {cg: 22.3, trim: 'UP 1.3'},
                {cg: 22.8, trim: 'UP 1.2'},
                {cg: 23.3, trim: 'UP 1.1'},
                {cg: 23.7, trim: 'UP 1.0'},
                {cg: 24.2, trim: 'UP 0.9'},

                {cg: 24.6, trim: 'UP 0.8'},
                {cg: 25.1, trim: 'UP 0.7'},
                {cg: 25.6, trim: 'UP 0.6'},
                {cg: 26,   trim: 'UP 0.5'},
                {cg: 26.5, trim: 'UP 0.4'},
                {cg: 26.9, trim: 'UP 0.3'},
                {cg: 27.4, trim: 'UP 0.2'},
                {cg: 27.9, trim: 'UP 0.1'},
                {cg: 28.3, trim: 'UP 0'},
                {cg: 28.8, trim: 'DN 0.1'},
                {cg: 29.2, trim: 'DN 0.2'},
                {cg: 29.7, trim: 'DN 0.3'},
                {cg: 30.2, trim: 'DN 0.4'},
                {cg: 30.6, trim: 'DN 0.5'},
                {cg: 31.1, trim: 'DN 0.6'},
                {cg: 31.5, trim: 'DN 0.7'},
                {cg: 32,   trim: 'DN 0.8'},

                {cg: 32.5, trim: 'DN 0.9'},
                {cg: 32.9, trim: 'DN 1.0'},
                {cg: 33.4, trim: 'DN 1.1'},
                {cg: 33.8, trim: 'DN 1.2'},
                {cg: 34.3, trim: 'DN 1.3'},
                {cg: 34.8, trim: 'DN 1.4'},
                {cg: 35.2, trim: 'DN 1.5'},
                {cg: 35.7, trim: 'DN 1.6'},
                {cg: 36.1, trim: 'DN 1.7'},
                {cg: 36.6, trim: 'DN 1.8'},
                {cg: 37.1, trim: 'DN 1.9'},
                {cg: 37.5, trim: 'DN 2.0'},
                {cg: 38,   trim: 'DN 2.1'},
                {cg: 38.4, trim: 'DN 2.2'},
                {cg: 38.9, trim: 'DN 2.3'},
                {cg: 39.4, trim: 'DN 2.4'},
                {cg: 39.8, trim: 'DN 2.5'}
            ];

            cg = cg < 17.4 ? 17.4 : cg;
            cg = cg > 39.8 ? 39.8 : cg;

            let pos = null;
            let prevPos = null;
            for (let idx in trim) {
                pos = trim[idx];
                if (pos.cg <= cg) {
                    prevPos = pos;
                }
                if (pos.sg > cg) {
                    return prevPos.trim;
                }
            }

            return prevPos.trim;
        };

        var pdCanvas = $("#PDCanvas").get(0);
        if (pdCanvas.getContext) {
            var ctx = pdCanvas.getContext("2d");
            ctx.clearRect(0, 0, 700, 700);
            ctx.strokeStyle = axisColor;
            drawChart(ctx);
        }

        updateFuelBlock();

        var cargoWeightRef = (efbData.doi +
            efbData.cargo1 * efbData.trimBag1 +
            efbData.cargo3 * efbData.trimBag3 +
            efbData.cargo4 * efbData.trimBag4 +
            efbData.cargo5 * efbData.trimBag5
        );

        var weightRef = (cargoWeightRef +
            efbData.paxA * efbData.trimPaxA +
            efbData.paxB * efbData.trimPaxB +
            efbData.paxC * efbData.trimPaxC
        );

        var fromCanvasX = function(x) { return (x - 262); };
        var fromCanvasY = function(y) { return (520 - y); };
        var toCanvasX = function(x) { return (x + 262); };
        var toCanvasY = function(y) { return (520 - y); };

        var calcXbyY = function(x1, y1, y2) {
            let ratio = y1 / x1;
            return (y2 / ratio);
        };

        var x = pixelOfIndex(weightRef + fuelCorrectionFromFuel(
            efbData.fuelCenterWeight,
            efbData.fuelWingLeftWeight,
            efbData.fuelWingRightWeight,
            efbData.fuelOuterLeftWeight,
            efbData.fuelOuterRightWeight));
        var y = pixelOfWeight((efbData.zfw + efbData.fuel - 200) / 1000);

        var y2 = 24;
        var x2 = toCanvasX(calcXbyY(fromCanvasX(x), fromCanvasY(y), fromCanvasY(y2)));

        ctx.strokeStyle = '#a6a6a6';
        ctx.beginPath();
        ctx.lineTo(x2, y2);
        ctx.lineTo(x, y);
        //ctx.strokeStyle = indicatorLineColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        x = pixelOfIndex(weightRef);
        y = pixelOfWeight(efbData.zfw / 1000);

        y2 = 24;
        x2 = toCanvasX(calcXbyY(fromCanvasX(x), fromCanvasY(y), fromCanvasY(y2)));

        ctx.beginPath();
        ctx.lineTo(x2, y2);
        ctx.lineTo(x, y);
        //ctx.strokeStyle = indicatorLineColorZFW;
        ctx.lineWidth = 2;
        ctx.stroke();

        x = pixelOfIndex(weightRef + fuelCorrectionFromFuel(
            efbData.fuelCenterWeight,
            efbData.fuelWingLeftWeight,
            efbData.fuelWingRightWeight,
            efbData.fuelOuterLeftWeight,
            efbData.fuelOuterRightWeight));
        y = pixelOfWeight((efbData.zfw + efbData.fuel - 200) / 1000);
        ctx.beginPath();
        ctx.moveTo(25, y);
        ctx.lineTo(x, y);
        //ctx.strokeStyle = indicatorLineColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        x = pixelOfIndex(weightRef);
        y = pixelOfWeight(efbData.zfw / 1000);
        ctx.beginPath();
        ctx.moveTo(25, y);
        ctx.lineTo(x, y);
        //ctx.strokeStyle = indicatorLineColorZFW;
        ctx.lineWidth = 2;
        ctx.stroke();

        x = pixelOfIndex(weightRef + fuelCorrectionFromFuel(
            efbData.fuelCenterWeight,
            efbData.fuelWingLeftWeight,
            efbData.fuelWingRightWeight,
            efbData.fuelOuterLeftWeight,
            efbData.fuelOuterRightWeight));
        y = pixelOfWeight((efbData.zfw + efbData.fuel) / 1000);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = indicatorLineColor;
        ctx.lineWidth = 2;

        var counter = 0;
        var fuelTanks = {
            center: 0,
            left: 0,
            right: 0,
            outerLeft: 0,
            outerRight: 0,
            set: function(c, l, r, oL, oR) {
                this.center = c;
                this.left = l;
                this.right = r;
                this.outerLeft = oL;
                this.outerRight = oR;
            },
            get: function() {
                return this.center + this.left + this.right + this.outerLeft + this.outerRight;
            }
        };

        fuelTanks.set(efbData.fuelCenterWeight,
            efbData.fuelWingLeftWeight, efbData.fuelWingRightWeight,
            efbData.fuelOuterLeftWeight, efbData.fuelOuterRightWeight
        );

        efbData.towMac = Math.round(((efbData.dIndex + fuelCorrectionFromFuel(
            fuelTanks.center, fuelTanks.left, fuelTanks.right, fuelTanks.outerLeft, fuelTanks.outerRight
        ) - 50) * 1000 / (efbData.zfw + efbData.fuel) / 4.193 * 100 + 25) * 10) / 10;

        var fuel = fuelTanks.get();
        var changeFuel = function(amount) {
            if (parseInt(amount) < 0) {
                while (amount < 0) {
                    if (parseInt(fuelTanks.center) > 0) {
                        fuelTanks.center += amount;
                        if (fuelTanks.center < 0) {
                            amount = fuelTanks.center;
                            fuelTanks.center = 0;
                        } else {
                            amount = 0;
                        }
                    }
                    if (parseInt(fuelTanks.center) <= 0) {
                        if (fuelTanks.outerLeft == 0) {
                            fuelTanks.outerRight += amount;
                            amount = 0;
                        }
                        if (fuelTanks.outerRight == 0) {
                            fuelTanks.outerLeft += amount;
                            amount = 0;
                        }
                        if (fuelTanks.outerRight > 0 || fuelTanks.outerLeft > 0) {
                            fuelTanks.outerRight += amount / 2;
                            fuelTanks.outerLeft += amount / 2;
                        }
                        amount = 0;
                        if (fuelTanks.outerLeft < 0) {
                            amount = fuelTanks.outerLeft;
                            fuelTanks.outerLeft = 0;
                        }
                        if (fuelTanks.outerRight < 0) {
                            amount += fuelTanks.outerRight;
                            fuelTanks.outerRight = 0;
                        }
                    }
                    if (fuelTanks.center == 0 && fuelTanks.outerLeft == 0 && fuelTanks.outerRight == 0) {
                        if (fuelTanks.left == 0) {
                            fuelTanks.right += amount;
                        }
                        if (fuelTanks.right == 0) {
                            fuelTanks.left += amount;
                        }
                        if (fuelTanks.right > 0 || fuelTanks.left > 0) {
                            fuelTanks.right += amount / 2;
                            fuelTanks.left += amount / 2;
                        }
                        amount = 0;
                        if (fuelTanks.left < 0) {
                            amount = fuelTanks.left;
                            fuelTanks.left = 0;
                        }
                        if (fuelTanks.right < 0) {
                            amount += fuelTanks.right;
                            fuelTanks.right = 0;
                        }
                    }
                    if (fuelTanks.center == 0 && fuelTanks.left == 0 && fuelTanks.right == 0 && fuelTanks.outerLeft == 0 && fuelTanks.outerRight == 0) {
                        amount = 0;
                    }
                }
            }
        };
        while (fuel > 100) {
            changeFuel(-50);
            counter++;
            fuel = fuelTanks.get();
            ctx.lineTo(
                pixelOfIndex(weightRef + fuelCorrectionFromFuel(fuelTanks.center, fuelTanks.left, fuelTanks.right, fuelTanks.outerLeft, fuelTanks.outerRight)),
                pixelOfWeight((efbData.zfw + fuel) / 1000)
            );
        }
        ctx.stroke();
        ctx.lineWidth = 1;

        $('#sDOW').text(efbData.dow);
        $('#iPassenger').val(efbData.allPaxWeight);
        $('#iCargo').val(efbData.ttlBagWeight);
        $('#sZFW').text(efbData.allPaxWeight + efbData.ttlBagWeight + efbData.dow);
        $('#iTFoB').val(efbData.fuel);
        $('#sGWeight').text(efbData.allPaxWeight + efbData.ttlBagWeight + efbData.dow + efbData.fuel);
        $('#sWeight').text(efbData.dow);
        $('#sHarm').text(Math.round((((efbData.doi - 50) * 100 + 18.8499 * efbData.dow) / efbData.dow) * 100) / 100);
        $('#sDOI').text(efbData.doi);
        $('#sDate').text(efbData.day + '.' + efbData.month + '.' + (parseInt(efbData.year) - 100));
        $('#sHOP').text('HOP');
        $('#iCargo1').val(efbData.cargo1);
        $('#iCargo3').val(efbData.cargo3);
        $('#iCargo4').val(efbData.cargo4);
        $('#iCargo5').val(efbData.cargo5);
        $('#iCabinA').val(efbData.paxA);
        $('#iCabinB').val(efbData.paxB);
        $('#iCabinC').val(efbData.paxC);
        $('#sI_ZFW').text(efbData.zfwMac);
        $('#sI_TOW').text(efbData.towMac);
        $('#iTrimPos').text(getTrimPos(efbData.towMac));
    };

    var setPaxTo = function(paxCount) {
        if (isNaN(paxCount)) {
            return;
        }

        paxCount = parseInt(paxCount);
        paxCount = paxCount > 136 ? 136 : paxCount;
        paxCount = paxCount < 0 ? 0 : paxCount;

        efbData.pax = paxCount;
        efbData.paxA = Math.round(paxCount * 0.1176470588235294);
        efbData.paxB = Math.round(paxCount * 0.4411764705882353);
        efbData.paxC = paxCount - (efbData.paxA + efbData.paxB);

        dataStore.setValue('paxA', efbData.paxA);
        dataStore.setValue('paxB', efbData.paxB);
        dataStore.setValue('paxC', efbData.paxC);

        calculateCG();
    };

    var autoDistributeCargo = function(TTLWeightToBeLoaded) {
        if (isNaN(TTLWeightToBeLoaded)) {
            return;
        }

        TTLWeightToBeLoaded = TTLWeightToBeLoaded > 11245 ? 11245 : TTLWeightToBeLoaded;
        TTLWeightToBeLoaded = TTLWeightToBeLoaded < 0 ? 0 : TTLWeightToBeLoaded;

        var triggerCompartmentE = efbData.cargo1Max + efbData.cargo3Max + efbData.cargo4Max;
        var triggerCompartmentD = efbData.cargo1Max + efbData.cargo3Max;
        var triggerCompartmentC = efbData.cargo1Max;

        setBagTo(1, Math.round(TTLWeightToBeLoaded * 0.3025344597598933));
        setBagTo(3, Math.round(TTLWeightToBeLoaded * 0.4033792796798577));
        setBagTo(4, Math.round(TTLWeightToBeLoaded * 0.187638950644731));
        setBagTo(5, Math.round(TTLWeightToBeLoaded * 0.106447309915518));

        if (efbData.towMac > 30) {
            if (TTLWeightToBeLoaded > triggerCompartmentC) {
                setBagTo(1, efbData.cargo1Max);
                setBagTo(3, (TTLWeightToBeLoaded - triggerCompartmentC));
                setBagTo(4, 0);
                setBagTo(5, 0);
            }
            if (TTLWeightToBeLoaded > triggerCompartmentD) {
                setBagTo(1, efbData.cargo1Max);
                setBagTo(3, efbData.cargo3Max);
                setBagTo(4, (TTLWeightToBeLoaded - triggerCompartmentD));
                setBagTo(5, 0);
            }
            if (TTLWeightToBeLoaded > triggerCompartmentE) {
                setBagTo(1, efbData.cargo1Max);
                setBagTo(3, efbData.cargo3Max);
                setBagTo(4, efbData.cargo4Max);
                setBagTo(5, (TTLWeightToBeLoaded - triggerCompartmentE));
            }
            if (TTLWeightToBeLoaded <= efbData.cargo1Max) {
                setBagTo(1, TTLWeightToBeLoaded);
                setBagTo(3, 0);
                setBagTo(4, 0);
                setBagTo(5, 0);
            }
        }

        if (efbData.towMac < 20) {
            if (TTLWeightToBeLoaded > triggerCompartmentC) {
                setBagTo(1, (TTLWeightToBeLoaded - triggerCompartmentC));
                setBagTo(3, efbData.cargo3Max);
                setBagTo(4, efbData.cargo4Max);
                setBagTo(5, efbData.cargo5Max);
            }
            if (TTLWeightToBeLoaded > triggerCompartmentD) {
                setBagTo(1, 0);
                setBagTo(3, (TTLWeightToBeLoaded - triggerCompartmentD));
                setBagTo(4, efbData.cargo4Max);
                setBagTo(5, efbData.cargo5Max);
            }
            if (TTLWeightToBeLoaded > triggerCompartmentE) {
                setBagTo(1, 0);
                setBagTo(3, 0);
                setBagTo(4, (TTLWeightToBeLoaded - triggerCompartmentE));
                setBagTo(5, efbData.cargo5Max);
            }
            if (TTLWeightToBeLoaded <= efbData.cargo4Max) {
                setBagTo(1, 0);
                setBagTo(3, 0);
                setBagTo(4, 0);
                setBagTo(5, TTLWeightToBeLoaded);
            }
        }
    };

    var updateFuelFromLS = function(amount) {
        if (isNaN(amount)) {
            return;
        }
        amount = parseInt(amount);

        efbData.fuelWingLeft = 0;
        efbData.fuelWingRight = 0;
        efbData.fuelOuterLeft = 0;
        efbData.fuelOuterRight = 0;
        efbData.fuelCenter = 0;

        let remainingFuelCenter = 60;
        let remainingFuelInnerWing = 120;
        let remainingFuel = remainingFuelCenter + remainingFuelInnerWing;
        //let allOuterTanksWeight = Math.round(efbData.wingTankOuterMax * efbData.fuelDensity) * 2;
        //let allInnerTanksWeight = Math.round(efbData.wingTankInnerMax * efbData.fuelDensity) * 2;
        let allOuterTanksWeight = efbData.fuelOuterLeftMax + efbData.fuelOuterRightMax;
        let allInnerTanksWeight = efbData.fuelWingLeftMax + efbData.fuelWingRightMax;

        if (amount > remainingFuel && amount <= (allOuterTanksWeight + remainingFuel)) {
            efbData.fuelOuterLeft = Math.round((amount - remainingFuel) / 2);
            efbData.fuelOuterRight = efbData.fuelOuterLeft;
        }

        if (amount > (allOuterTanksWeight + remainingFuel) && amount <= (allInnerTanksWeight + allOuterTanksWeight + remainingFuelCenter)) {
            efbData.fuelOuterLeft = allOuterTanksWeight / 2;
            efbData.fuelOuterRight = efbData.fuelOuterLeft;
            efbData.fuelWingLeft = Math.round((amount - allOuterTanksWeight - remainingFuelCenter) / 2);
            efbData.fuelWingRight = efbData.fuelWingLeft;
        }

        if (amount > (allInnerTanksWeight + allOuterTanksWeight + remainingFuelCenter)) {
            efbData.fuelOuterLeft = allOuterTanksWeight / 2;
            efbData.fuelOuterRight = efbData.fuelOuterLeft;
            efbData.fuelWingLeft = allInnerTanksWeight / 2;
            efbData.fuelWingRight = efbData.fuelWingLeft;
            efbData.fuelCenter = Math.round(amount - (allInnerTanksWeight + allOuterTanksWeight));
        }

        efbData.fuelWingLeft = efbData.fuelWingLeft < 60 ? 60 : efbData.fuelWingLeft;
        efbData.fuelWingRight = efbData.fuelWingRight < 60 ? 60 : efbData.fuelWingRight;
        efbData.fuelCenter = efbData.fuelCenter < 60 ? 60 : efbData.fuelCenter;

        if (parseInt(efbData.fuelCenter) >= 0 && parseInt(efbData.fuelCenter) <= efbData.fuelCenterMax) {
            efbData.fuelCenterWeight = efbData.fuelCenter;
        } else {
            console.log("I wont set fuel in center tank. OUT OF LIMIT");
        }
        if (parseInt(efbData.fuelWingLeft) >= 0 && parseInt(efbData.fuelWingLeft) <= efbData.fuelWingLeftMax) {
            efbData.fuelWingLeftWeight = efbData.fuelWingLeft;
        } else {
            console.log("I wont set fuel in left wing tank. OUT OF LIMIT");
        }
        if (parseInt(efbData.fuelWingRight) >= 0 && parseInt(efbData.fuelWingRight) <= efbData.fuelWingRightMax) {
            efbData.fuelWingRightWeight = efbData.fuelWingRight;
        } else {
            console.log("I wont set fuel in right wing tank. OUT OF LIMIT");
        }
        if (parseInt(efbData.fuelOuterLeft) >= 0 && parseInt(efbData.fuelOuterLeft) <= efbData.fuelOuterLeftMax) {
            efbData.fuelOuterLeftWeight = efbData.fuelOuterLeft;
        } else {
            console.log("I wont set fuel in left outer wing tank. OUT OF LIMIT");
        }
        if (parseInt(efbData.fuelOuterRight) >= 0 && parseInt(efbData.fuelOuterRight) <= efbData.fuelOuterRightMax) {
            efbData.fuelOuterRightWeight = efbData.fuelOuterRight;
        } else {
            console.log("I wont set fuel in right outer wing tank. OUT OF LIMIT");
        }

        efbData.fuelCorrection = fuelCorrectionFromFuel(
            efbData.fuelCenterWeight,
            efbData.fuelWingLeftWeight,
            efbData.fuelWingRightWeight,
            efbData.fuelOuterLeftWeight,
            efbData.fuelOuterRightWeight
        );

        calculateCG();
    };

    var setBagTo = function(compartment, bagWeight) {
        if (bagWeight < 0) {
            bagWeight = 0;
            //console.log("ATTENTION:I wont set negative weight in CPT" + compartment + "! You will have now 0kg in there!");
            efbData.cargo1 = efbData.cargo1 < 0 ? 0 : efbData.cargo1;
            efbData.cargo3 = efbData.cargo3 < 0 ? 0 : efbData.cargo3;
            efbData.cargo4 = efbData.cargo4 < 0 ? 0 : efbData.cargo4;
            efbData.cargo5 = efbData.cargo5 < 0 ? 0 : efbData.cargo5;
        }

        if ((compartment == 1) && (bagWeight > efbData.cargo1Max)) {
            bagWeight = efbData.cargo1Max;
        }
        if ((compartment == 3) && (bagWeight > efbData.cargo3Max)) {
            bagWeight = efbData.cargo3Max;
        }
        if ((compartment == 4) && (bagWeight > efbData.cargo4Max)) {
            bagWeight = efbData.cargo4Max;
        }
        if ((compartment == 5) && (bagWeight > efbData.cargo5Max)) {
            bagWeight = efbData.cargo5Max;
        }

        if (compartment == 1) {
            efbData.cargo1 = parseInt(bagWeight);
        }
        if (compartment == 3) {
            efbData.cargo3 = parseInt(bagWeight);
        }
        if (compartment == 4) {
            efbData.cargo4 = parseInt(bagWeight);
        }
        if (compartment == 5) {
            efbData.cargo5 = parseInt(bagWeight);
        }

        dataStore.setValue('cargo1', efbData.cargo1);
        dataStore.setValue('cargo3', efbData.cargo3);
        dataStore.setValue('cargo4', efbData.cargo4);
        dataStore.setValue('cargo5', efbData.cargo5);

        calculateCG();
    };

    var paxByLoadsSheet = function(cabin, paxCount) {
        paxCount = parseInt(paxCount);
        if (cabin == 'A') {
            paxCount = paxCount < 0 ? 0 : paxCount;
            paxCount = paxCount > 16 ? 16 : paxCount;
            efbData.paxA = paxCount;
        }
        if (cabin == 'B') {
            paxCount = paxCount < 0 ? 0 : paxCount;
            paxCount = paxCount > 60 ? 60 : paxCount;
            efbData.paxB = paxCount;
        }
        if (cabin == 'C') {
            paxCount = paxCount < 0 ? 0 : paxCount;
            paxCount = paxCount > 60 ? 60 : paxCount;
            efbData.paxC = paxCount;
        }

        efbData.pax = (efbData.paxA) + (efbData.paxB) + (efbData.paxC);

        calculateCG();
    };

    var fuelCorrectionFromFuel = function(centerWeight, leftWeight, rightWeight, outerLeftWeight, outerRightWeight) {
        var ret;
        ret = 0.00346200868035245 * outerLeftWeight;
        ret += 0.00346200868035245 * outerRightWeight;
        ret += -0.00147167034584253 * centerWeight;
        ret += 2.39396790268385 * Math.pow(10, -11) * Math.pow(leftWeight, 3) + leftWeight * -0.00115036086559691;
        ret += 2.39396790268385 * Math.pow(10, -11) * Math.pow(rightWeight, 3) + rightWeight * -0.00115036086559691;

        return ret;
    };

    function calcZfwMac() {
        efbData.zfw = efbData.dow + efbData.allPaxWeight + efbData.ttlBagWeight;
        efbData.dIndex = efbData.doi +
        efbData.paxA * efbData.trimPaxA +
        efbData.paxB * efbData.trimPaxB +
        efbData.paxC * efbData.trimPaxC +
        efbData.cargo1 * efbData.trimBag1 +
        efbData.cargo3 * efbData.trimBag3 +
        efbData.cargo4 * efbData.trimBag4 +
        efbData.cargo5 * efbData.trimBag5;

        efbData.zfwMac = Math.round(
            ((efbData.dIndex - 50) * 1000 / efbData.zfw / 4.193 * 100 + 25) * 10
        ) / 10;
    }

    var calculateCG = function() {
        efbData.paxWeightA = efbData.paxA * efbData.middleAdultWeight;
        efbData.paxWeightB = efbData.paxB * efbData.middleAdultWeight;
        efbData.paxWeightC = efbData.paxC * efbData.middleAdultWeight;

        efbData.allPaxWeight = efbData.paxWeightA + efbData.paxWeightB + efbData.paxWeightC;
        efbData.totalWeight = efbData.cargo1 + efbData.cargo3 + efbData.cargo4 + efbData.cargo5;
        efbData.ttlBagWeight = efbData.totalWeight;
        calcZfwMac();
        perfDataFormUpdate();
    };

    var perfDataInit = function() {
        efbData.fuelCorrection = fuelCorrectionFromFuel(
            efbData.fuelCenterWeight,
            efbData.fuelWingLeftWeight,
            efbData.fuelWingRightWeight,
            efbData.fuelOuterLeftWeight,
            efbData.fuelOuterRightWeight);

        calculateCG();
    };

    var loadPayloadToAcf = function(boarding) {

        dataStore.setValue('paxA', efbData.paxA);
        dataStore.setValue('paxB', efbData.paxB);
        dataStore.setValue('paxC', efbData.paxC);
        dataStore.setValue('cargo1', efbData.cargo1);
        dataStore.setValue('cargo3', efbData.cargo3);
        dataStore.setValue('cargo4', efbData.cargo4);
        dataStore.setValue('cargo5', efbData.cargo5);

        calculateCG();
        var shiftPax = 0;
        var shiftBag = 0;
        var shift = 0;
        if (efbData.allPaxWeight > 0) {
            shiftPax = (efbData.paxWeightA / efbData.allPaxWeight) * (efbData.trimWeightPaxA * 1000) +
                (efbData.paxWeightB / efbData.allPaxWeight) * (efbData.trimWeightPaxB * 1000) +
                (efbData.paxWeightC / efbData.allPaxWeight) * (efbData.trimWeightPaxC * 1000);
        }
        if (efbData.ttlBagWeight > 0) {
            shiftBag = (efbData.cargo1 / efbData.ttlBagWeight) * (efbData.trimBag1 * 1000) +
                (efbData.cargo3 / efbData.ttlBagWeight) * (efbData.trimBag3 * 1000) +
                (efbData.cargo4 / efbData.ttlBagWeight) * (efbData.trimBag4 * 1000) +
                (efbData.cargo5 / efbData.ttlBagWeight) * (efbData.trimBag5 * 1000);
        }
        if (efbData.allPaxWeight > 0 && efbData.ttlBagWeight > 0) {
            shift = (efbData.allPaxWeight / (efbData.ttlBagWeight + efbData.allPaxWeight)) * shiftPax +
                (efbData.ttlBagWeight / (efbData.ttlBagWeight + efbData.allPaxWeight)) * shiftBag;
        }
        if (efbData.allPaxWeight > 0 && efbData.ttlBagWeight == 0) {
            shift = (efbData.allPaxWeight / (efbData.allPaxWeight)) * shiftPax;
        }
        if (efbData.ttlBagWeight > 0 && efbData.allPaxWeight == 0) {
            shift = (efbData.ttlBagWeight / (efbData.ttlBagWeight)) * shiftBag;
        }

        //dbg.text(shift);
        ff.Set('Aircraft.PayloadCenterZ', shift);
        ff.Set('Aircraft.PayloadWeight', efbData.allPaxWeight + efbData.ttlBagWeight);
        if (/*dataStore.getValue('CaD') != -1 ||*/ boarding === true) {
            ff.Set('Aircraft.TakeoffCenterDry', efbData.zfwMac); //  efbData.towMac
            ff.Set('Aircraft.TakeoffWeightDry', efbData.dow + efbData.allPaxWeight + efbData.ttlBagWeight);
        }
    };

    var loadFuelToAcf = function(boarding) {
        updateFuelBlock();
        ff.Set('Aircraft.FuelOuterL', efbData.fuelOuterLeft);
        ff.Set('Aircraft.FuelInnerL', efbData.fuelWingLeft);
        ff.Set('Aircraft.FuelCenter', efbData.fuelCenter);
        ff.Set('Aircraft.FuelInnerR', efbData.fuelWingRight);
        ff.Set('Aircraft.FuelOuterR', efbData.fuelOuterRight);
        if (/*dataStore.getValue('CaD') != -1 ||*/ boarding === true) {
            ff.Set('Aircraft.TakeoffBlockFuel', efbData.fuel);
        }
    };

    var loadFromPerfForm = function(boarding) {
        loadPayloadToAcf(boarding);
        loadFuelToAcf(boarding);
    };

    $('#iPerfData').on('change', function(event) {
        let jqTarget = $(event.target);
        let value = (jqTarget.val() == "") ? 0 : jqTarget.val();
        switch (jqTarget.attr('id')) {
            case 'iPassenger':
                setPaxTo(Math.round(value / efbData.middleAdultWeight));
                break;
            case 'iCargo':
                autoDistributeCargo(value);
                break;
            case 'iTFoB':
                updateFuelFromLS(value);
                break;
            case 'iCargo1':
                setBagTo(1, value);
                break;
            case 'iCargo3':
                setBagTo(3, value);
                break;
            case 'iCargo4':
                setBagTo(4, value);
                break;
            case 'iCargo5':
                setBagTo(5, value);
                break;
            case 'iCabinA':
                paxByLoadsSheet('A', value);
                break;
            case 'iCabinB':
                paxByLoadsSheet('B', value);
                break;
            case 'iCabinC':
                paxByLoadsSheet('C', value);
                break;
            default:
                break;
        }

        loadPayloadToAcf();
    });

    $('#perfToAcf').on('click', function(){loadFromPerfForm(true)});

    //-------------------------------------------------------------------------------------------

    var firstLoad = function() {
        getFuelValueFromAirplane(function() {
            efbData.fuelCorrection = fuelCorrectionFromFuel(
                efbData.fuelCenterWeight,
                efbData.fuelWingLeftWeight,
                efbData.fuelWingRightWeight,
                efbData.fuelOuterLeftWeight,
                efbData.fuelOuterRightWeight
            );
            updateFuelBlock();
            updateFuelFromLS(efbData.fuel);
            loadFuelToAcf();
            dataStore.setValue('fuelCenterWeight', efbData.fuelCenterWeight);
            dataStore.setValue('fuelWingLeftWeight', efbData.fuelWingLeftWeight);
            dataStore.setValue('fuelWingRightWeight', efbData.fuelWingRightWeight);
            dataStore.setValue('fuelOuterLeftWeight', efbData.fuelOuterLeftWeight);
            dataStore.setValue('fuelOuterRightWeight', efbData.fuelOuterRightWeight);

            calculateCG();
        });
    };

    var preDistributePayload = function(payload) {

        var paxWeight = 0;
        var bagWeight = 0;
        var weightPaxA = 0;
        var weightPaxB = 0;
        var weightPaxC = 0;
        var weightBag1 = 0;
        var weightBag3 = 0;
        var weightBag4 = 0;
        var weightBag5 = 0;

        if (getStorePayload() && getStorePayload() == payload) {
            weightPaxA = dataStore.getValue('paxA');
            weightPaxB = dataStore.getValue('paxB');
            weightPaxC = dataStore.getValue('paxC');
            weightBag1 = dataStore.getValue('cargo1');
            weightBag3 = dataStore.getValue('cargo3');
            weightBag4 = dataStore.getValue('cargo4');
            weightBag5 = dataStore.getValue('cargo5');
        } else {
            if (payload >= 800) {
                paxWeight = Math.round(payload * 0.8 / efbData.middleAdultWeight);
                bagWeight = Math.round(payload - (paxWeight * efbData.middleAdultWeight));
            } else {
                paxWeight = Math.round(payload / efbData.middleAdultWeight);
                bagWeight = 0;
            }

            if (paxWeight > 136) {
                paxWeight = 136;
                bagWeight = Math.round(payload - (paxWeight * efbData.middleAdultWeight));
            }

            if (paxWeight > 76) {
                weightPaxA = 16;
                weightPaxB = 60;
                weightPaxC = paxWeight - (weightPaxA + weightPaxB);
            }
            if (paxWeight == 76) {
                weightPaxB = 60;
                weightPaxA = paxWeight - weightPaxB;
                weightPaxC = 0;
            }
            if (paxWeight <= 60) {
                weightPaxB = paxWeight;
                weightPaxA = 0;
                weightPaxC = 0;
            }

            if (paxWeight > 60 && paxWeight < 76) {
                weightPaxB = 60;
                weightPaxA = paxWeight - weightPaxB;
                weightPaxC = 0;
            }

            if (bagWeight > (efbData.cargo1Max + efbData.cargo3Max + efbData.cargo4Max + efbData.cargo5Max)) {
                weightBag1 = efbData.cargo1Max;
                weightBag3 = efbData.cargo3Max;
                weightBag4 = efbData.cargo4Max;
                weightBag5 = bagWeight - (efbData.cargo1Max + efbData.cargo3Max + efbData.cargo4Max);
            }
            //if (bagWeight <= (efbData.cargo1Max + efbData.cargo3Max + efbData.cargo4Max)) {
            //    weightBag1 = bagWeight - (efbData.cargo3Max + efbData.cargo4Max);
            //    weightBag3 = efbData.cargo3Max;
            //    weightBag4 = efbData.cargo4Max;
            //    weightBag5 = 0;
            //}
            if (bagWeight <= (efbData.cargo1Max + efbData.cargo3Max + efbData.cargo4Max)) {
                weightBag1 = efbData.cargo1Max;
                weightBag3 = efbData.cargo3Max;
                weightBag4 = bagWeight - (efbData.cargo1Max + efbData.cargo3Max);
                weightBag5 = 0;
            }
            //if (bagWeight <= (efbData.cargo3Max + efbData.cargo4Max)) {
            //    weightBag1 = 0;
            //    weightBag3 = efbData.cargo3Max;
            //    weightBag4 = bagWeight - efbData.cargo3Max;
            //    weightBag5 = 0;
            //}
            if (bagWeight <= (efbData.cargo1Max + efbData.cargo3Max)) {
                weightBag1 = efbData.cargo1Max;
                weightBag3 = bagWeight - efbData.cargo1Max;
                weightBag4 = 0;
                weightBag5 = 0;
            }
            //if (bagWeight <= efbData.cargo3Max) {
            //    weightBag1 = 0;
            //    weightBag3 = bagWeight;
            //    weightBag4 = 0;
            //    weightBag5 = 0;
            //}
            if (bagWeight <= efbData.cargo1Max) {
                weightBag1 = bagWeight;
                weightBag3 = 0;
                weightBag4 = 0;
                weightBag5 = 0;
            }

            dataStore.setValue('paxA', weightPaxA);
            dataStore.setValue('paxB', weightPaxB);
            dataStore.setValue('paxC', weightPaxC);
            dataStore.setValue('cargo1', weightBag1);
            dataStore.setValue('cargo3', weightBag3);
            dataStore.setValue('cargo4', weightBag4);
            dataStore.setValue('cargo5', weightBag5);
        }

        return {
            pax: {
                paxA: weightPaxA,
                paxB: weightPaxB,
                paxC: weightPaxC
            },
            bag: {
                bag1: weightBag1,
                bag3: weightBag3,
                bag4: weightBag4,
                bag5: weightBag5
            }
        };
    };

    var distributePayloadToCG = function() {
        //if (FMGS.cg == -1) {
        //    FMGS.cg = 25;
        //}
        //console.log("TakeoffWeightDry: FMGS.zfw = " + FMGS.zfw + " TakeoffBlockFuel: FMGS.block = " + FMGS.block + " TakeoffCenterDry: FMGS.cg = " + FMGS.cg);

        if (FMGS.zfw < efbData.dow) {
            FMGS.zfw = efbData.dow;
        }

        var doi = 50;
        var dow = efbData.dow;
        var payload = FMGS.zfw - dow;
        //var grossWeight = FMSG.zfw + FMSG.block;
        var dryIndex;
        var dryMacs;
        var tolerance = 0.0;

        var mass = preDistributePayload(payload);

        var weightPaxA = mass.pax.paxA;
        var weightPaxB = mass.pax.paxB;
        var weightPaxC = mass.pax.paxC;
        var weightBag1 = mass.bag.bag1;
        var weightBag3 = mass.bag.bag3;
        var weightBag4 = mass.bag.bag4;
        var weightBag5 = mass.bag.bag5;

        dryIndex = doi +
            weightPaxA * efbData.trimPaxA +
            weightPaxB * efbData.trimPaxB +
            weightPaxC * efbData.trimPaxC +
            weightBag1 * efbData.trimBag1 +
            weightBag3 * efbData.trimBag3 +
            weightBag4 * efbData.trimBag4 +
            weightBag5 * efbData.trimBag5;

        dryMacs = Math.round(((dryIndex - 50) * 1000 / (FMGS.zfw) / 4.193 * 100 + 25) * 100) / 100;

        var tryDone;
        var loadShift = 1;
        let fCGBackward = false;
        let fCGForward = false;

        var roundToleranceCGDec = Math.round((FMGS.cg - tolerance) * 100) / 100;
        var roundToleranceCGInc = Math.round((FMGS.cg + tolerance) * 100) / 100;

        while (((roundToleranceCGDec > dryMacs) || (dryMacs > roundToleranceCGInc)) && dryMacs < 100 && dryMacs > -10) {
            //console.log("(CG - t)>>" + roundToleranceCGDec + " > " + dryMacs + " > " + roundToleranceCGInc + "<<(CG + t) | CG:" + FMGS.cg + " | t:" + tolerance);
            tryDone = 0;
            if ((dryMacs < roundToleranceCGDec) && (tryDone == 0)) {
                fCGBackward = true;
                if (weightPaxA > 0 && (tryDone == 0) && weightPaxB < 60) {
                    weightPaxA--;
                    weightPaxB++;
                    tryDone = 1;
                }
                if (weightPaxB > 0 && tryDone == 0 && weightPaxC < 60) {
                    weightPaxB--;
                    weightPaxC++;
                    tryDone = 1;
                }
                if (weightBag1 >= loadShift && (tryDone == 0) && weightBag3 <= (efbData.cargo3Max - loadShift)) {
                    weightBag1 -= loadShift;
                    weightBag3 += loadShift;
                    tryDone = 1;
                }
                if (weightBag3 >= loadShift && tryDone == 0 && weightBag4 <= (efbData.cargo4Max - loadShift)) {
                    weightBag3 -= loadShift;
                    weightBag4 += loadShift;
                    tryDone = 1;
                }
                if (weightBag4 >= loadShift && tryDone == 0 && weightBag5 <= (efbData.cargo5Max - loadShift)) {
                    weightBag4 -= loadShift;
                    weightBag5 += loadShift;
                    tryDone = 1;
                }
                if (tryDone == 0 || fCGForward) {
                    //tolerance += 0.01;
                    tolerance = Math.round((tolerance + 0.01) * 100) / 100;
                }
            }
            if ((dryMacs > roundToleranceCGInc) && (tryDone == 0)) {
                fCGForward = true;
                if (weightPaxC > 0 && (tryDone == 0) && weightPaxB < 60) {
                    weightPaxC--;
                    weightPaxB++;
                    tryDone = 1;
                }
                if (weightPaxB > 0 && tryDone == 0 && weightPaxA < 16) {
                    weightPaxB--;
                    weightPaxA++;
                    tryDone = 1;
                }
                if (weightBag5 >= loadShift && (tryDone == 0) && weightBag4 <= (efbData.cargo4Max - loadShift)) {
                    weightBag5 -= loadShift;
                    weightBag4 += loadShift;
                    tryDone = 1;
                }
                if (weightBag4 >= loadShift && tryDone == 0 && weightBag3 <= (efbData.cargo3Max - loadShift)) {
                    weightBag4 -= loadShift;
                    weightBag3 += loadShift;
                    tryDone = 1;
                }
                if (weightBag3 >= loadShift && tryDone == 0 && weightBag1 <= (efbData.cargo1Max - loadShift)) {
                    weightBag3 -= loadShift;
                    weightBag1 += loadShift;
                    tryDone = 1;
                }
                if (tryDone == 0 || fCGBackward) {
                    //tolerance += 0.01;
                    tolerance = Math.round((tolerance + 0.01) * 100) / 100;
                }
            }

            roundToleranceCGDec = Math.round((FMGS.cg - tolerance) * 100) / 100;
            roundToleranceCGInc = Math.round((FMGS.cg + tolerance) * 100) / 100;

            dryIndex = doi +
                weightPaxA * efbData.trimPaxA +
                weightPaxB * efbData.trimPaxB +
                weightPaxC * efbData.trimPaxC +
                weightBag1 * efbData.trimBag1 +
                weightBag3 * efbData.trimBag3 +
                weightBag4 * efbData.trimBag4 +
                weightBag5 * efbData.trimBag5;

            dryMacs = Math.round(((dryIndex - 50) * 1000 / FMGS.zfw / 4.193 * 100 + 25) * 100) / 100;
        }

        if (tolerance > 0.5) {
            //console.log("It wasn't possible to get exact CG with this weight.");
        }

        efbData.paxA = Math.round(weightPaxA);
        efbData.paxB = Math.round(weightPaxB);
        efbData.paxC = Math.round(weightPaxC);

        setBagTo(1, weightBag1);
        setBagTo(3, weightBag3);
        setBagTo(4, weightBag4);
        setBagTo(5, weightBag5);

        dataStore.setValue('paxA', weightPaxA);
        dataStore.setValue('paxB', weightPaxB);
        dataStore.setValue('paxC', weightPaxC);
        dataStore.setValue('cargo1', weightBag1);
        dataStore.setValue('cargo3', weightBag3);
        dataStore.setValue('cargo4', weightBag4);
        dataStore.setValue('cargo5', weightBag5);

        efbData.pax = efbData.paxA + efbData.paxB + efbData.paxC;

        updateFuelFromLS(FMGS.block);
        perfDataFormUpdate();
        calculateCG();
        loadFromPerfForm(true);

        setTimeout(function(){
            ff.Set("Aircraft.TakeoffWeightBoarding", 0);
            //ff.Set("Aircraft.FMGS.MCDU1.DisplayLines14","CAN NOT SET EXACT WEIGHT");
            //ff.Set("Aircraft.FMGS.MCDU1.DisplayAttrs14","WWWWWWWWWWWWWWWWWWWWWWWW");
        }, 1000);
    };

    var debugValue = function() {
        console.log("zfw = " + efbData.zfw);
        console.log("fuelCenterWeight = " + efbData.fuelCenterWeight);
        console.log("fuelWingLeftWeight = " + efbData.fuelWingLeftWeight);
        console.log("fuelWingRightWeight = " + efbData.fuelWingRightWeight);
        console.log("fuelOuterLeftWeight = " + efbData.fuelOuterLeftWeight);
        console.log("fuelOuterRightWeight = " + efbData.fuelOuterRightWeight);
        console.log("fuel total = " + efbData.fuel);
        console.log("zfwMac = " + efbData.zfwMac);
        if (document.location.host == '') {
            console.log("Aircraft.TakeoffWeightDry = " + Aircraft.TakeoffWeightDry);
            console.log("Aircraft.FuelCenter = " + Aircraft.FuelCenter);
            console.log("Aircraft.FuelInnerL = " + Aircraft.FuelInnerL);
            console.log("Aircraft.FuelInnerR = " + Aircraft.FuelInnerR);
            console.log("Aircraft.FuelOuterL = " + Aircraft.FuelOuterL);
            console.log("Aircraft.FuelOuterR = " + Aircraft.FuelOuterR);
            console.log("Aircraft.TakeoffBlockFuel = " + Aircraft.TakeoffBlockFuel);
            console.log("Aircraft.TakeoffCenterDry = " + Aircraft.TakeoffCenterDry);
            console.log("GPU = " + Aircraft.ExtPowerConnected);
            console.log("ASU = " + Aircraft.ExtBleedConnected);
            console.log("Shocks = " + Aircraft.ShocksInstalled);
        }
    };

    var initTrigger = new Trigger(2, function() {
        firstLoad();
        perfDataInit();
    });

    var acfObserver = new AcfObserver();
    acfObserver.add(new AcfVariable({
        variableName: 'RefuelConnected',
        signer: fuelTruck
    }));
    acfObserver.add(new AcfVariable({
        variableName: 'CargoInstalledF',
        signer: baggageLoaderF
    }));
    acfObserver.add(new AcfVariable({
        variableName: 'CargoInstalledB',
        signer: baggageLoaderB
    }));
    acfObserver.add(new AcfVariable({
        variableName: 'AirStairsInstalledLF',
        signer: airStairsLF
    }));
    acfObserver.add(new AcfVariable({
        variableName: 'AirStairsInstalledRF',
        signer: airStairsRF
    }));
    acfObserver.add(new AcfVariable({
        variableName: 'AirStairsInstalledLB',
        signer: airStairsLB
    }));
    acfObserver.add(new AcfVariable({
        variableName: 'AirStairsInstalledRB',
        signer: airStairsRB
    }));

    var weightRequestBlockProcess = false;
    /*var mainLoop = */
    setInterval(function() {
        //dbg.text(dataStore.getValue('CaD'));
        if (loaded == 0) {
            ff.Get("Aircraft.Loaded", function(response) {
                if (response == 1) {
                    dataStore.ready();
                    dataStore.setValue('CaD', -1);

                    ff.Get("Aircraft.TakeoffWeightDry", function(value){
                        dataStore.setValue('CaD', value);
                    });

                    loaded = 1;
                    gpuSwitcher.init();
                    asuSwitcher.init();
                    chocksSwitcher.init();

                    // Init fuel tanks
                    //updateFuelFromLS(6000);
                    schemeTanks.init();
                    initTrigger.setTrigger(0);

                    // Init takeoff weight
                    ff.Get("Aircraft.PayloadWeight", function(payload) {
                        var mass = preDistributePayload(payload);
                        efbData.paxA = mass.pax.paxA;
                        efbData.paxB = mass.pax.paxB;
                        efbData.paxC = mass.pax.paxC;
                        pax.init();

                        //autoDistributeCargo(mass.bag.bag1 + mass.bag.bag3 + mass.bag.bag4 + mass.bag.bag5);
                        efbData.cargo1 = mass.bag.bag1;
                        efbData.cargo3 = mass.bag.bag3;
                        efbData.cargo4 = mass.bag.bag4;
                        efbData.cargo5 = mass.bag.bag5;
                        schemeCargo.init();

                        initTrigger.setTrigger(1);
                    });

                    ff.Get("Simulation.FailuresList", function (failures) {
                        if (! failures) {
                            console.log("Can't load failures list!!!");
                        } else {
                            initFailures(JSON.parse(failures));
                        }
                    });

                    fuelTruck.init();
                    airStairsLF.init();
                    airStairsRF.init();
                    airStairsLB.init();
                    airStairsRB.init();
                    stairsToggleLB.init();
                    stairsToggleLF.init();
                    stairsToggleRB.init();
                    stairsToggleRF.init();
                    baggageLoaderF.init();
                    baggageLoaderB.init();
                }
            });
        } else {
            acfObserver.update();
            dataStore.update();

            ff.Get("Aircraft.TakeoffWeightBoarding", function(response) {
                if (response == 1) {
                    var trigger = new Trigger(3, distributePayloadToCG);

                    ff.Get("Aircraft.TakeoffWeightDry", function(response) {
                        FMGS.zfw = response;
                        trigger.setTrigger(0);
                    });
                    ff.Get("Aircraft.TakeoffBlockFuel", function(response) {
                        FMGS.block = response;
                        trigger.setTrigger(1);
                    });
                    ff.Get("Aircraft.TakeoffCenterDry", function(response) {
                        FMGS.cg = response;
                        trigger.setTrigger(2);
                    });
                }
            });
            ff.Get("Aircraft.TakeoffWeightRequest", function(response) {
                if (response == 1 && !weightRequestBlockProcess) {
                    //dbg.text(efbData.zfwMac + ' bag1:' + dataStore.getValue('cargo1') + ' bag3:' + dataStore.getValue('cargo3') +
                    //' bag4:' + dataStore.getValue('cargo4') + ' bag5:' + dataStore.getValue('cargo5'));
                    //weightRequestBlockProcess = true;
                    //getFuelValueFromAirplane(function(){
                    //    ff.Set("Aircraft.TakeoffBlockFuel", efbData.fuel);
                    //    ff.Set("Aircraft.TakeoffWeightRequest", 0);
                    //    weightRequestBlockProcess = false;
                    //});
                    //
                    //ff.Get("Aircraft.PayloadWeight", function(payload) {
                    //    var mass = preDistributePayload(payload);
                    //    efbData.paxA = mass.pax.paxA;
                    //    efbData.paxB = mass.pax.paxB;
                    //    efbData.paxC = mass.pax.paxC;
                    //    pax.init();
                    //
                    //    //autoDistributeCargo(mass.bag.bag1 + mass.bag.bag3 + mass.bag.bag4 + mass.bag.bag5);
                    //    efbData.cargo1 = mass.bag.bag1;
                    //    efbData.cargo3 = mass.bag.bag3;
                    //    efbData.cargo4 = mass.bag.bag4;
                    //    efbData.cargo5 = mass.bag.bag5;
                    //    schemeCargo.init();
                    //
                    //    ff.Set("Aircraft.TakeoffWeightDry", efbData.allPaxWeight + efbData.ttlBagWeight + efbData.dow);
                    //});

                    //calcZfwMac();
                    calculateCG();
                    ff.Set("Aircraft.TakeoffBlockFuel", efbData.fuel);
                    ff.Set("Aircraft.TakeoffWeightDry", efbData.allPaxWeight + efbData.ttlBagWeight + efbData.dow);
                    ff.Set("Aircraft.TakeoffCenterDry", efbData.zfwMac);
                    ff.Set("Aircraft.TakeoffWeightRequest", 0);
                }
            });
            ff.Get("Aircraft.ExtPowerRequest", function(response) {
                gpuSwitcher.switchOutside(response);
            });
            ff.Get("Aircraft.ExtBleedRequest", function(response) { // Connected
                asuSwitcher.switchOutside(response);
            });
            ff.Get("Aircraft.ShocksInstalled", function(response) {
                chocksSwitcher.switchOutside(response);
            });
            ff.Get("Aircraft.RefuelAvail", function(response) {
                fuelButtonGroup.listen(response);
                fuelControllGroup.externalLock(response);
            });
            ff.Get("Aircraft.BoardAvail", function(response) {
                paxButtonGroup.listen(response);
                paxControllGroup.externalLock(response);

                cargoButtonGroup.listen(response);
                cargoControllGroupF.externalLock(response);
                cargoControllGroupB.externalLock(response);

                if (response == 1) {
                    $('#perfToAcf').removeClass('disabled');
                } else {
                    $('#perfToAcf').addClass('disabled');
                }
            });
            ff.Get("Aircraft.ServiceAvail", function(response) {
                if (response == 1) {
                    gpuSwitcher.enable();
                    asuSwitcher.enable();
                    chocksSwitcher.enable();
                } else {
                    gpuSwitcher.disable();
                    asuSwitcher.disable();
                    chocksSwitcher.disable();
                }
            });
            ff.Get("Simulation.ActiveFailures", function(response) {
                updateActiveFailures(response);
            });
        }
    }, 1000);

    $('.a320-tab-main .item').tab({
        onVisible: function(tabPath) {
            switch (tabPath) {
                case 'tab01':
                    transmitFuelValue();
                    transmitCargoValue();
                    transmitPaxValue();
                    break;
                case 'tab02':
                    calculateCG();
                    break;
                case 'tab03':
                    printCheckList();
                    moduleCheckList.updateScrollList();
                    break;
                case 'tab10':
                    //moduleSettings.init();
                    break;
                case 'tab12':
                    showMap();
                    break;
                case 'tab14':
                    moduleSettings.update();
                    break;
                default:
            }
        }
    });

    $('.a320-tab-control-panel .item').tab({
        onVisible: function(tabPath) {
            contentPanels.removeClass('active');
            contentPanels.siblings(".a320-content-panel[data-tab='" + tabPath + "']").addClass('active');

            if (loaded) {
                switch (tabPath) {
                    case 'tab01/01':
                        gpuSwitcher.init();
                        asuSwitcher.init();
                        chocksSwitcher.init();
                        break;
                    case 'tab01/02':
                        schemeTanks.init();
                        break;
                    case 'tab01/03':
                        pax.init();
                        break;
                    case 'tab01/04':
                        schemeCargo.init();
                        break;
                    default:
                }
            }
        },
        onLoad: function(tabPath) {}
    });

    $('.a320-toggle-panel').on('click', function() {
        $('.a320-control-panel').animate({
            width: 'toggle'
        }, 200);
    });

    $('.ui.dropdown').dropdown();

    $('#states_list').listbox({
        width: '100%',
        height: 200
    });

    $('#loaded_failures_list').listbox({
        width: '100%',
        height: 200
    });
    $('#available_failures_list').listbox({
        width: '100%',
        height: 200
    });
    $('#active_faults_list').listbox({
        width: '100%',
        height: 200
    });

    if (ff.IsBrowser()) {
        $('#browserTab').hide();
        $('#controlTab').show();
    } else {
        $('#controlTab').hide();
        $('#browserTab').show();
    }

    //(dbgBtn = $('#dbg_btn')).on('click', function(el) {
    //    ff.Get("Aircraft", function(response){
    //        console.log(response);
    //        dbg.text(
    //            ' GPU: ' + response.ExtPowerConnected +
    //            ' Refuel: ' + response.RefuelConnected  +
    //            ' LF: ' + response.AirStairsInstalledLF +
    //            ' RF: ' + response.AirStairsInstalledRF +
    //            ' LB: ' + response.AirStairsInstalledLB +
    //            ' RB: ' + response.AirStairsInstalledRB +
    //            ' CargoF: ' + response.CargoInstalledF +
    //            ' CargoB: ' + response.CargoInstalledB
    //        );
    //    });
    //});

});
