/**
 * Created by USER on 23.08.2017.
 */
function Item(_name, _params) {
    var name = _name;
    var params = _params;

    this.print = function() {
        var itemStr = '';
        if (params.type == 'header') {
            itemStr = '<div class="header">' + name + '</div>'
        } else if (params.type == 'item') {
            itemStr = '<div class="item">' +
                '<div class="item-name">' + name + '</div>' +
                '<div class="item-dotted">.........................................................................</div>' +
                '<div class="item-value">' + params.requiredVal + '</div>' +
                '</div>';
        }

        return itemStr;
    }
}

function List(_name, _items, _params) {
    var name = _name;
    var items = _items;
    var params = _params;

    var printItems = function() {
        var html = '';
        var idxItem = 0;
        while (items.length != idxItem) {
            html += items[idxItem].print();
            idxItem++;
        }

        return html;
    };

    this.createItem = function(name, params) {
        var item = new Item(name, params);
        items.push(item);
    };

    this.print = function() {
        var subHeaderStr = '';
        if (params.subHeader != '') {
            subHeaderStr = '<h5>' + params.subHeader + '</h5>';
        }

        return '<h4>' + name + '</h4>' + subHeaderStr +
            '<div class="divider"></div>' +
            '<div class="items-overflow">' +
            '<div class="items-scroll">' + printItems() + '</div>' +
            '</div>';
    }
}

function CheckList() {
    var lists = [];

    var addList = function(list) {
        lists.push(list);
    };

    var init = function() {
        var list1 = new List('COCKPIT PREPARATION FLOWS', [], {
            subHeader: ''
        });
        list1.createItem('PFD LT', {
            type: 'item',
            requiredVal: 'BRT'
        });
        list1.createItem('ND LT', {
            type: 'item',
            requiredVal: 'BRT'
        });
        list1.createItem('ECAM UPPER DISPLAY', {
            type: 'item',
            requiredVal: 'BRT'
        });
        list1.createItem('ECAM LOWER DISPLAY', {
            type: 'item',
            requiredVal: 'BRT'
        });
        list1.createItem('FLOOD LT', {
            type: 'item',
            requiredVal: 'AS RQRD'
        });
        list1.createItem('INTEG LT', {
            type: 'item',
            requiredVal: 'AS RQRD'
        });
        list1.createItem('OVERHEAD PANEL', {
            type: 'header'
        });
        list1.createItem('BATTERY', {
            type: 'item',
            requiredVal: 'ON - CHECK VOLTAGE'
        });
        list1.createItem('EXTERNAL POWER', {
            type: 'item',
            requiredVal: 'ON'
        });
        list1.createItem('IRS/ADIRS', {
            type: 'item',
            requiredVal: 'ON'
        });
        list1.createItem('ELEC HYDR PUMP', {
            type: 'item',
            requiredVal: 'ON'
        });
        list1.createItem('FUEL PUMPS', {
            type: 'item',
            requiredVal: 'ON'
        });
        list1.createItem('ENG GEN', {
            type: 'item',
            requiredVal: 'ON/FAULT'
        });
        list1.createItem('PACK 1+2', {
            type: 'item',
            requiredVal: 'ON'
        });
        list1.createItem('ENG BLEED 1+2', {
            type: 'item',
            requiredVal: 'ON'
        });
        list1.createItem('HOT AIR', {
            type: 'item',
            requiredVal: 'ON'
        });
        list1.createItem('ENG ANTI ICE/PROBE', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list1.createItem('EMERGENCY LIGHTS', {
            type: 'item',
            requiredVal: 'ARMED'
        });
        list1.createItem('CABIN SIGNS', {
            type: 'item',
            requiredVal: 'ON'
        });
        list1.createItem('NAV & LOGO LIGHTS', {
            type: 'item',
            requiredVal: 'ON'
        });
        list1.createItem('EFC 1+2', {
            type: 'item',
            requiredVal: 'ON'
        });
        list1.createItem('GPWS', {
            type: 'item',
            requiredVal: 'ON'
        });
        list1.createItem('PEDESTAL', {
            type: 'header'
        });
        list1.createItem('PARK BRAKE', {
            type: 'item',
            requiredVal: 'SET'
        });
        list1.createItem('FLAPS', {
            type: 'item',
            requiredVal: 'VERIFY 0'
        });
        list1.createItem('SPEEDBRAKE', {
            type: 'item',
            requiredVal: 'RETRACTED/DISARMED'
        });
        list1.createItem('ENG MASTER 1+2', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list1.createItem('ENG MODE SEL', {
            type: 'item',
            requiredVal: 'NORM'
        });
        list1.createItem('THRUST LEVERS', {
            type: 'item',
            requiredVal: 'IDLE'
        });
        list1.createItem('TRANSPONDER', {
            type: 'item',
            requiredVal: 'STANDBY'
        });
        list1.createItem('RADIO CONTROL PANEL', {
            type: 'item',
            requiredVal: 'ON'
        });
        list1.createItem('FREQUENCIES', {
            type: 'item',
            requiredVal: 'SET'
        });
        list1.createItem('ECAM & MAIN PANEL', {
            type: 'header'
        });
        list1.createItem('ECAM RECALL BUTTON', {
            type: 'item',
            requiredVal: 'SELECT'
        });
        list1.createItem('LANDING GEAR', {
            type: 'item',
            requiredVal: 'VERIFY DOWN'
        });
        list1.createItem('MCDU2 > DOORS', {
            type: 'item',
            requiredVal: 'VERIFY OPEN'
        });
        list1.createItem('ANTISKID/NWS', {
            type: 'item',
            requiredVal: 'ON'
        });
        list1.createItem('FD', {
            type: 'item',
            requiredVal: 'ON'
        });
        addList(list1);

        var list2 = new List('FMGS SETUP', [], {
            subHeader: ''
        });
        list2.createItem('ATIS/ATC CLEARANCE', {
            type: 'item',
            requiredVal: 'OBTAIN'
        });
        list2.createItem('TRANSPONDER CODE', {
            type: 'item',
            requiredVal: 'SET'
        });
        list2.createItem('MCDU', {
            type: 'item',
            requiredVal: 'SET'
        });
        list2.createItem('QNH MODE', {
            type: 'item',
            requiredVal: 'VERIFY'
        });
        list2.createItem('QNH', {
            type: 'item',
            requiredVal: 'SET'
        });
        list2.createItem('ND MODE/RANGE', {
            type: 'item',
            requiredVal: 'SET'
        });
        list2.createItem('VOR/ADF', {
            type: 'item',
            requiredVal: 'SELECT'
        });
        list2.createItem('SPEED MANAGED/SELECTED', {
            type: 'item',
            requiredVal: 'AS RQRD'
        });
        list2.createItem('HDG MANAGED/SELECTED', {
            type: 'item',
            requiredVal: 'AS RQRD'
        });
        list2.createItem('INITIAL ALTITUDE SET/MANAGED/SELECTED', {
            type: 'item',
            requiredVal: 'AS RQRD'
        });
        list2.createItem('IRS', {
            type: 'item',
            requiredVal: 'CONFIRM ALIGNED'
        });
        list2.createItem('FD', {
            type: 'item',
            requiredVal: 'CYCLE OFF THEN ON'
        });
        list2.createItem('LS', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list2.createItem('FCU', {
            type: 'item',
            requiredVal: 'VERIFY CORRECT&COMPLETE'
        });
        addList(list2);

        var list3 = new List('BEFORE START', [], {
            subHeader: ''
        });
        list3.createItem('FUELING', {
            type: 'item',
            requiredVal: 'VERIFY DISCONNECTED,KG,BALANCED,& SUFFICIENT'
        });
        list3.createItem('CHOCKS', {
            type: 'item',
            requiredVal: 'REMOVED'
        });
        list3.createItem('TRAFFIC CONES', {
            type: 'item',
            requiredVal: 'REMOVED'
        });
        list3.createItem('OVERHEAD PANEL', {
            type: 'header'
        });
        list3.createItem('APU', {
            type: 'item',
            requiredVal: 'START'
        });
        list3.createItem('APU BLEED', {
            type: 'item',
            requiredVal: 'ON'
        });
        list3.createItem('EXT POWER', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list3.createItem('DOORS', {
            type: 'item',
            requiredVal: 'CLOSED'
        });
        list3.createItem('BEACON', {
            type: 'item',
            requiredVal: 'ON'
        });
        addList(list3);

        var list4 = new List('PUSHBACK & ENGINE START', [], {
            subHeader: ''
        });
        list4.createItem('PUSH & START CLEARANCE', {
            type: 'item',
            requiredVal: 'OBTAIN'
        });
        list4.createItem('GROUND COMMUNICATION', {
            type: 'item',
            requiredVal: 'INITIATE/FOLLOW COMMANDS'
        });
        list4.createItem('RIGHT SIDE', {
            type: 'item',
            requiredVal: 'VERIFY CLEAR'
        });
        list4.createItem('PEDESTAL', {
            type: 'header'
        });
        list4.createItem('ENG MODE SELECTOR', {
            type: 'item',
            requiredVal: 'IGN/START'
        });
        list4.createItem('ENG MASTER 2', {
            type: 'item',
            requiredVal: 'ON'
        });
        list4.createItem('ECAM', {
            type: 'header'
        });
        list4.createItem('ECAM', {
            type: 'item',
            requiredVal: 'MONITOR'
        });
        list4.createItem('ENGINE', {
            type: 'item',
            requiredVal: 'CONFIRM STABILIZED'
        });
        list4.createItem('STEP 3,5-7', {
            type: 'item',
            requiredVal: 'REPEAT FOR ENG 1'
        });
        addList(list4);

        var list5 = new List('AFTER START', [], {
            subHeader: ''
        });
        list5.createItem('OVERHEAD PANEL', {
            type: 'header'
        });
        list5.createItem('ENG & WING ANTI ICE', {
            type: 'item',
            requiredVal: 'AS RQRD'
        });
        list5.createItem('APU BLEED', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list5.createItem('APU MASTER', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list5.createItem('PEDESTAL', {
            type: 'header'
        });
        list5.createItem('PITCH TRIM', {
            type: 'item',
            requiredVal: 'SET'
        });
        list5.createItem('ENG MODE SELECTOR', {
            type: 'item',
            requiredVal: 'AS RQRD'
        });
        list5.createItem('SPOILERS', {
            type: 'item',
            requiredVal: 'ARMED'
        });
        list5.createItem('FLAPS', {
            type: 'item',
            requiredVal: 'SET'
        });
        list5.createItem('RUD TRIM', {
            type: 'item',
            requiredVal: '0'
        });
        list5.createItem('ECAM', {
            type: 'header'
        });
        list5.createItem('FLIGHT CONTROLS', {
            type: 'item',
            requiredVal: 'CHECK'
        });
        list5.createItem('ECAM DOOR PAGE', {
            type: 'item',
            requiredVal: 'CHECKED'
        });
        list5.createItem('ECAM STATUS', {
            type: 'item',
            requiredVal: 'CHECKED'
        });
        list5.createItem('OTHER', {
            type: 'header'
        });
        list5.createItem('HAND SIGNALS', {
            type: 'item',
            requiredVal: 'RECEIVED'
        });
        addList(list5);

        var list6 = new List('TAXI', [], {
            subHeader: ''
        });
        list6.createItem('TAXI CLEARANCE', {
            type: 'item',
            requiredVal: 'OBTAIN'
        });
        list6.createItem('PARK BRAKE', {
            type: 'item',
            requiredVal: 'RELEASED'
        });
        list6.createItem('AUTO BRAKE', {
            type: 'item',
            requiredVal: 'MAX'
        });
        list6.createItem('TO CONFIG', {
            type: 'item',
            requiredVal: 'PRESS'
        });
        list6.createItem('TAXI LIGHT', {
            type: 'item',
            requiredVal: 'ON'
        });
        addList(list6);

        var list7 = new List('BEFORE TAKE OFF', [], {
            subHeader: ''
        });
        list7.createItem('PEDESTAL', {
            type: 'header'
        });
        list7.createItem('TCAS', {
            type: 'item',
            requiredVal: 'TA/RA - TILT ABOVE'
        });
        list7.createItem('ENG MODE SELECTOR', {
            type: 'item',
            requiredVal: 'AS RQRD'
        });
        list7.createItem('ECAM', {
            type: 'header'
        });
        list7.createItem('BRAKE TEMP', {
            type: 'item',
            requiredVal: 'CHECK > 150'
        });
        list7.createItem('MAIN PANEL', {
            type: 'header'
        });
        list7.createItem('BRAKE FANS', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list7.createItem('SLIDING TABLE', {
            type: 'item',
            requiredVal: 'STOWED'
        });
        list7.createItem('ATC', {
            type: 'header'
        });
        list7.createItem('TAKE OFF/LINE UP CLEARANCE', {
            type: 'item',
            requiredVal: 'OBTAIN'
        });
        list7.createItem('OVERHEAD PANEL', {
            type: 'header'
        });
        list7.createItem('EXT LIGHTS', {
            type: 'item',
            requiredVal: 'ON'
        });
        addList(list7);

        var list8 = new List('AFTER TAKE OFF', [], {
            subHeader: '@ACCEL HEIGHT'
        });
        list8.createItem('SPOILER', {
            type: 'item',
            requiredVal: 'DISARM'
        });
        list8.createItem('ENGINE MODE SELECTOR', {
            type: 'item',
            requiredVal: 'AS RQRD'
        });
        list8.createItem('TAXI LIGHT', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list8.createItem('ENG & WING ANTI ICE', {
            type: 'item',
            requiredVal: 'AS RQRD'
        });
        list8.createItem('PACK 1+2', {
            type: 'item',
            requiredVal: 'ON'
        });
        addList(list8);

        var list9 = new List('10,000FT', [], {
            subHeader: ''
        });
        list9.createItem('EXT LIGHTS', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list9.createItem('SEAT BELT SIGN', {
            type: 'item',
            requiredVal: 'AS RQRD'
        });
        list9.createItem('PRESSURIZATION', {
            type: 'item',
            requiredVal: 'CHECKED'
        });
        addList(list9);

        var list10 = new List('PREDESCENT', [], {
            subHeader: ''
        });
        list10.createItem('ATIS', {
            type: 'item',
            requiredVal: 'OBTAIN'
        });
        list10.createItem('MCDU', {
            type: 'item',
            requiredVal: 'FPLN,PERF,NAV/RAD SET'
        });
        list10.createItem('NAV ACCURACY', {
            type: 'item',
            requiredVal: 'CHECK'
        });
        list10.createItem('AUTO BRAKE', {
            type: 'item',
            requiredVal: 'SET'
        });
        list10.createItem('SEAT BELT SIGN', {
            type: 'item',
            requiredVal: 'ON'
        });
        list10.createItem('ANTI ICE', {
            type: 'item',
            requiredVal: 'AS RQRD'
        });
        addList(list10);

        var list11 = new List('APPROACH CHECKLIST', [], {
            subHeader: ''
        });
        list11.createItem('SLIDING TABLES', {
            type: 'item',
            requiredVal: 'STOWED'
        });
        list11.createItem('EXT LIGHTS', {
            type: 'item',
            requiredVal: 'ON'
        });
        list11.createItem('SEAT BELT SIGN', {
            type: 'item',
            requiredVal: 'VERIFY ON'
        });
        list11.createItem('LS', {
            type: 'item',
            requiredVal: 'PUSH'
        });
        list11.createItem('PRESSURIZATION', {
            type: 'item',
            requiredVal: 'CHECKED'
        });
        list11.createItem('ECAM STATUS', {
            type: 'item',
            requiredVal: 'CHECK'
        });
        addList(list11);

        var list12 = new List('LANDING', [], {
            subHeader: 'WHEN FULLY CONFIGURED AND ESTABLISHED ON APPROACH'
        });
        list12.createItem('TAXI LIGHT', {
            type: 'item',
            requiredVal: 'SET T/O'
        });
        list12.createItem('MISSED APPROACH ALTITUDE', {
            type: 'item',
            requiredVal: 'SET'
        });
        list12.createItem('SPOILERS', {
            type: 'item',
            requiredVal: 'ARMED'
        });
        list12.createItem('LANDING MEMO', {
            type: 'item',
            requiredVal: 'NO BLUE'
        });
        addList(list12);

        var list13 = new List('AFTER LANDING', [], {
            subHeader: ''
        });
        list13.createItem('SPOILERS', {
            type: 'item',
            requiredVal: 'RETRACT'
        });
        list13.createItem('ENG MODE SELECTOR', {
            type: 'item',
            requiredVal: 'NORM'
        });
        list13.createItem('FLAPS', {
            type: 'item',
            requiredVal: 'RETRACT'
        });
        list13.createItem('TRANSPONDER', {
            type: 'item',
            requiredVal: 'STBY'
        });
        list13.createItem('BRAKE TEMP', {
            type: 'item',
            requiredVal: 'CHECK > 300'
        });
        list13.createItem('EXT LIGHTS', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list13.createItem('APU', {
            type: 'item',
            requiredVal: 'START'
        });
        list13.createItem('ENGINE & WING ANTI ICE', {
            type: 'item',
            requiredVal: 'OFF'
        });
        addList(list13);

        var list14 = new List('PARKING', [], {
            subHeader: ''
        });
        list14.createItem('PARK BRAKE', {
            type: 'item',
            requiredVal: 'SET'
        });
        list14.createItem('ENG MASTER 1+2', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list14.createItem('SEAT BELT SIGN', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list14.createItem('BEACON', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list14.createItem('EXT POWER', {
            type: 'item',
            requiredVal: 'ON'
        });
        list14.createItem('FUEL PUMPS', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list14.createItem('APU', {
            type: 'item',
            requiredVal: 'AS RQRD'
        });
        addList(list14);

        var list15 = new List('SECURING', [], {
            subHeader: ''
        });
        list15.createItem('PFD LT', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list15.createItem('ND LT', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list15.createItem('ECAM UPPER LT', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list15.createItem('ECAM LOWER LT', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list15.createItem('ADIRS', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list15.createItem('EXT POWER', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list15.createItem('GEN', {
            type: 'item',
            requiredVal: 'ON'
        });
        list15.createItem('APU', {
            type: 'item',
            requiredVal: 'SHUTDOWN'
        });
        list15.createItem('CABIN SIGNS & EMERGENCY LIGHTS', {
            type: 'item',
            requiredVal: 'OFF'
        });
        list15.createItem('BAT 1+2', {
            type: 'item',
            requiredVal: 'OFF'
        });
        addList(list15);
    };

    init();

    this.print = function() {
        var idxList = 0;
        var frame = $('#frame');
        while (lists.length != idxList) {
            frame.append(
                '<div id="list' + idxList + '" class="list">' +
                '<div class="arrow-up"></div>' +
                lists[idxList].print() +
                '<div class="arrow-down"></div>' +
                '</div>');
            idxList++;
        }
    }
}

var isPrintingCheckList = false;

function printCheckList() {
    if (!isPrintingCheckList) {
        var checkList = new CheckList();
        checkList.print();
        isPrintingCheckList = true;
    }
}

var checkListCall = function() {
    var self = this;

    var currentIdxList = 0;
    var jqCurrentList;
    var jqPreviousList;
    var jqNextList;

    this.updateScrollList = function() {
        jqScroll = jqCurrentList.find('.items-scroll');
        jqOverflow = jqCurrentList.find('.items-overflow');
        heightScroll = jqScroll.outerHeight();
        heightOverflow = jqOverflow.outerHeight();
        heightDelta = heightScroll - heightOverflow;

        var top = parseInt(jqScroll.position().top);
        if (top >= 0) {
            jqCurrentList.find('.arrow-up').hide();
        } else {
            jqCurrentList.find('.arrow-up').show();
        }

        if (top != -heightDelta && heightDelta > 0) {
            jqCurrentList.find('.arrow-down').show();
        } else {
            jqCurrentList.find('.arrow-down').hide();
        }
    };

    var stepScroll = 40;
    var jqScroll;
    var jqOverflow;
    var heightScroll;
    var heightOverflow;
    var heightDelta;

    self.ready = function() {
        printCheckList();

        jqCurrentList = $('#list' + currentIdxList);
        jqPreviousList = $('#list' + (currentIdxList - 1));
        jqNextList = $('#list' + (currentIdxList + 1));
        jqCurrentList.addClass('slide-to-show');

        self.updateScrollList();

        $('.a320-right-knob').on('click', function() {
            if (currentIdxList >= 14) {
                return;
            }
            jqCurrentList.removeClass('slide-to-show');
            jqCurrentList.addClass('slide-to-hide-from-right');
            jqNextList.removeClass('slide-to-hide-from-left');
            jqNextList.addClass('slide-to-show');

            currentIdxList = (currentIdxList < 14) ? ++currentIdxList : 14;

            jqCurrentList = $('#list' + currentIdxList);
            jqPreviousList = $('#list' + (currentIdxList - 1));
            jqNextList = $('#list' + (currentIdxList + 1));

            self.updateScrollList();
        });

        $('.a320-left-knob').on('click', function() {
            if (currentIdxList <= 0) {
                return;
            }
            jqCurrentList.removeClass('slide-to-show');
            jqCurrentList.addClass('slide-to-hide-from-left');
            jqPreviousList.removeClass('slide-to-hide-from-right');
            jqPreviousList.addClass('slide-to-show');

            currentIdxList = (currentIdxList > 0) ? --currentIdxList : 0;

            jqCurrentList = $('#list' + currentIdxList);
            jqPreviousList = $('#list' + (currentIdxList - 1));
            jqNextList = $('#list' + (currentIdxList + 1));

            self.updateScrollList();
        });

        $('.items-overflow').on('mousewheel', function(e) {
            if (heightDelta < 0) {
                return;
            }

            var top = jqScroll.position().top;
            var deltaStep = stepScroll;

            if (e.originalEvent.wheelDelta < 0 || e.deltaY < 0) {
                if ((heightDelta + top) < 0) {
                    return;
                }

                if (top - deltaStep < (-heightDelta)) {
                    deltaStep = Math.abs(-heightDelta - top);
                }

                // up
                jqScroll.animate({
                        top: "-=" + deltaStep + "px"
                    }, 0,
                    function() {
                        var top = parseInt(jqScroll.position().top);
                        if (top < 0 && heightDelta > 0) {
                            jqCurrentList.find('.arrow-up').show();
                        }
                        if (top == -heightDelta && heightDelta > 0) {
                            jqCurrentList.find('.arrow-down').hide();
                        }
                    });
            } else {
                if (top >= 0) {
                    return;
                }

                if (top + deltaStep > 0) {
                    deltaStep -= (top + deltaStep);
                    deltaStep = Math.abs(deltaStep);
                }

                // down
                jqScroll.animate({
                        top: "+=" + deltaStep + "px"
                    }, 0,
                    function() {
                        var top = parseInt(jqScroll.position().top);
                        if (top >= 0 && heightDelta > 0) {
                            jqCurrentList.find('.arrow-up').hide();
                        }
                        if (top != -heightDelta && heightDelta > 0) {
                            jqCurrentList.find('.arrow-down').show();
                        }
                    }
                );
            }
        });
    };
};

var moduleCheckList = new checkListCall();
$(document).ready(moduleCheckList.ready);