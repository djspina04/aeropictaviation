/**
 * Created by cep.6ep on 07.12.2018.
 */

var Keyboard = function() {
    var jqKeyboardCall;
    var jqKeyboard;
    var jqKeyboardNum;
    var jqFocusInput;
    var isNum;

    var setPosition = function() {
        let jqBody = $('body');
        jqKeyboard.position({
            my: "right top+40",
            at: "left+99% top",
            of: jqBody,
            collision: 'fit'
        });
        jqKeyboardNum.position({
            my: "right top+40",
            at: "left+99% top",
            of: jqBody,
            collision: 'fit'
        });
    };

    var keyPressHandler = function(event) {
        if (event.target.nodeName === 'DIV') {
            let jqTarget = $(event.target);
            if (jqTarget.hasClass('button')) {
                let lowercase = $('#lowercase');
                let uppercase = $('#uppercase');
                let symbol = $('#symbol');
                let page1_2 = $('#page1_2');
                let page2_2 = $('#page2_2');
                switch (jqTarget.text()) {
                    case '▲':
                        lowercase.toggleClass('hide');
                        uppercase.toggleClass('hide');
                        break;
                    case '1/2':
                    case '2/2':
                        page1_2.toggleClass('hide');
                        page2_2.toggleClass('hide');
                        break;
                    case '@#$':
                    case 'ABC':
                        $('#chars').toggleClass('hide');
                        symbol.toggleClass('hide');
                        if (symbol.hasClass('hide')) {
                            lowercase.removeClass('hide');
                            uppercase.addClass('hide');
                        } else {
                            page1_2.removeClass('hide');
                            page2_2.addClass('hide');
                        }
                        break;
                    case 'Enter':
                        let e = $.Event('keypress');
                        e.which = 13;
                        e.keyCode = 13;
                        jqFocusInput.focus();
                        jqFocusInput.trigger(e);
                        jqFocusInput.trigger('change');
                        break;
                    case 'CLR':
                        jqFocusInput.val('');
                        break;
                    case 'Del':
                        jqFocusInput.val(jqFocusInput.val().slice(0, -1));
                        break;
                    default:
                        jqFocusInput.val(jqFocusInput.val() + '' + jqTarget.text());
                }
            }
        }
    };

    this.ready = function() {
        jqKeyboardCall = $('#vKeyboardCall');
        jqKeyboard = $('#vKeyboard');
        jqKeyboardNum = $('#vKeyboardNum');
        isNum = 0;

        jqKeyboard.draggable();
        jqKeyboardNum.draggable();

        $('body').on('mousedown', function(event) {
            if (event.target.nodeName === 'INPUT') {
                jqFocusInput = $(event.target);
                isNum = (jqFocusInput.hasClass('kNum')) ? 1 : 0;
                if (isNum && jqKeyboard.hasClass('show')) {
                    jqKeyboard.removeClass('show');
                    jqKeyboardNum.addClass('show');
                    setPosition();
                }
                if (!isNum && jqKeyboardNum.hasClass('show')) {
                    jqKeyboardNum.removeClass('show');
                    jqKeyboard.addClass('show');
                    setPosition();
                }
                if (jqFocusInput.attr('type') === 'text' || jqFocusInput.attr('type') === 'password') {
                    jqKeyboardCall.removeClass('disabled');
                }
            } else {
                if ($(event.target).attr('id') !== 'vKeyboardCall' &&
                    $(event.target).attr('id') !== 'vKeyboard' &&
                    $(event.target).attr('id') !== 'vKeyboardNum' &&
                    $(event.target).attr('id') !== 'svgKeyboardCall' &&
                    $(event.target).attr('id') !== 'pathKeyboardCall' &&
                    !$(event.target).hasClass('keyboard-key') &&
                    !$(event.target).hasClass('keyboard-row') &&
                    !$(event.target).hasClass('keyboard-group')
                ) {
                    jqKeyboard.removeClass('show');
                    jqKeyboardNum.removeClass('show');
                    jqKeyboardCall.addClass('disabled');
                }
            }
        });

        jqKeyboardCall.on('click', function() {
            if (isNum) {
                jqKeyboardNum.toggleClass('show');
            } else {
                jqKeyboard.toggleClass('show');
            }
            setPosition();
        });

        jqKeyboard.on('mousedown', keyPressHandler);
        jqKeyboardNum.on('mousedown', keyPressHandler);
    };
};

var moduleKeyboard = new Keyboard();
$(document).ready(moduleKeyboard.ready);