/**
 * Created by cep.6ep on 28.02.2018.
 *
 * required jQuery Mousewheel https://github.com/jquery/jquery-mousewheel
 */

;(function ( $, window, document, undefined ) {
"use strict";

    $.fn.listbox = function(parameters) {
        var allInstances = $(this);
        var query = arguments[0];
        var methodInvoked = (typeof query == 'string');
        var queryArguments = [].slice.call(arguments, 1);

        allInstances.each(function(){
            var settings = ($.isPlainObject(parameters))
                ? $.extend(true, {}, $.fn.listbox.settings, parameters)
                : $.extend({}, $.fn.listbox.settings);

            var namespace = settings.namespace;
            var moduleNamespace = 'module-' + namespace;
            var jqModule = $(this);
            var instance = jqModule.data(moduleNamespace);
            var jqAllItems = null;
            var jqmHandle = null;
            var jqDisabledLayer = null;
            var itemHeight = 0;
            var itemCount = 0;
            var scrollWidth = 14;
            var handleLength = 40;
            var handleTopMin = 0;
            var handleTopMax = 0;
            var values = [];
            var disabled= false;

            var module = {
                initialize: function(){
                    module.instantiate();
                },
                instantiate: function() {
                    let framePaddingTopBottom = 4;
                    instance = module;
                    jqModule.data(moduleNamespace, module);
                    jqModule.data('settings', settings);
                    jqModule.data('values', values);

                    let width = settings.width + '';
                    if (width.indexOf('%') == -1) {
                        width += 'px';
                    }

                    jqModule.css({
                        'width':  width,
                        'height': settings.height + 'px'
                    });
                    let jqList = $("<div class='lb-all-items'></div>");
                    jqAllItems = jqList;
                    let jqFrame = $("<div class='lb-frame'></div>");
                    jqFrame.append(jqList);
                    jqFrame.css({
                        'height': (settings.height - framePaddingTopBottom * 2 - 2) + 'px',
                        'margin-top': (framePaddingTopBottom) + 'px'
                    });
                    jqModule.append(jqFrame);
                    let jqScroll = $("<div class='lb-scroll'></div>");
                    jqScroll.css({
                        'width': scrollWidth + 'px',
                        'height': (settings.height - 2) + 'px'
                    });
                    let jqArrowUp = $("<div class='ld-s-arrow-up'></div>");
                    jqArrowUp.css({
                        'width': (scrollWidth - 1) + 'px',
                        'height': scrollWidth + 'px'
                    });
                    jqScroll.append(jqArrowUp);
                    let jqHandle = $("<div class='lb-s-handle'></div>");
                    jqmHandle = jqHandle;
                    jqHandle.css({
                        'top': scrollWidth + 'px',
                        'width': (scrollWidth - 2) + 'px',
                        'height': handleLength + 'px'
                    });
                    jqScroll.append(jqHandle);
                    let jqArrowDn = $("<div class='ld-s-arrow-dn'></div>");
                    jqArrowDn.css({
                        'width': (scrollWidth - 1) + 'px',
                        'height': scrollWidth + 'px'
                    });
                    jqScroll.append(jqArrowDn);
                    jqModule.append(jqScroll);
                    jqDisabledLayer = $('<div class="lb-disabled-layer"></div>');
                    jqDisabledLayer.css({
                        'height': settings.height + 'px',
                        'display': settings.disabled ? 'block' : 'none'
                    });
                    jqModule.append(jqDisabledLayer);

                    handleTopMin = parseFloat(jqHandle.css('top'));
                    handleTopMax = parseFloat(jqScroll.height() - scrollWidth - handleLength);

                    jqModule.on('mousewheel', function(event){
                        event.preventDefault();
                        if (disabled) return;

                        var handleOffset = parseFloat(jqHandle.css('top'));
                        let top = handleOffset + 10 * -event.deltaY;
                        module.scroll(top);

                        //let top = parseFloat(jqList.css('top'));
                        //let step = (itemHeight * event.deltaY);
                        //step = top + step > 0 ? 0 : step;
                        //step = top + step < -((itemCount + 1) * itemHeight - settings.height) ? 0 : step;
                        //jqList.css({'top': '+=' + step});
                    });

                    jqArrowUp.on('click', function(event){
                        event.preventDefault();
                        if (disabled) return;

                        var handleOffset = parseFloat(jqHandle.css('top'));
                        let top = handleOffset + -10;
                        module.scroll(top);
                    });
                    jqArrowDn.on('click', function(event){
                        event.preventDefault();
                        if (disabled) return;

                        var handleOffset = parseFloat(jqHandle.css('top'));
                        let top = handleOffset + 10;
                        module.scroll(top);
                    });

                    jqHandle.on('mousedown', function(event, originalEvent){
                        event.preventDefault();
                        if (disabled) return;

                        jqHandle.toggleClass('drag');

                        var handleOffset = parseFloat(jqHandle.css('top'));
                        var pageY = (typeof event.pageY != 'undefined') ? event.pageY : originalEvent.pageY;
                        var pickOffset = pageY;

                        var moveEvent = function(event) {
                            event.preventDefault();
                            if (disabled) return;

                            pageY = (typeof event.pageY != 'undefined') ? event.pageY : originalEvent.pageY;
                            let top = pageY - pickOffset + handleOffset;
                            module.scroll(top);
                        };

                        var upEvent = function(event) {
                            event.preventDefault();
                            if (disabled) return;

                            jqHandle.toggleClass('drag');
                            $(document).off('mousemove', moveEvent);
                            $(document).off('mouseup', upEvent);
                        };

                        $(document).on('mousemove', moveEvent);
                        $(document).on('mouseup', upEvent);
                    });

                    jqModule.on('click', function(event){
                        event.preventDefault();
                        if (disabled) return;

                        jqModule.find('.lb-select').removeClass('lb-select');
                        if (!settings.multiSelect) {
                            values = [];
                        }

                        let jqTarget = $(event.target);
                        if (jqTarget.closest('div').hasClass('lb-item')) {
                            jqTarget.closest('div').addClass('lb-select');
                            values.push(jqTarget.text());
                        }

                        jqModule.data('values', values);
                    });
                },
                redraw: function() {
                    itemHeight = parseFloat(jqModule.find('.lb-item').css('height'));
                    itemHeight = isNaN(itemHeight) ? settings.height : itemHeight;
                    let framePercent = (settings.height * 100) / ((itemCount + 1) * itemHeight);
                    framePercent = framePercent > 100 ? 100 : framePercent;
                    handleLength = (settings.height - scrollWidth * 2 - 2) * framePercent / 100;
                    jqModule.find('.lb-s-handle').css({'height': handleLength + 'px'});
                    handleTopMax = parseFloat(jqModule.find('.lb-scroll').height() - scrollWidth - handleLength);
                },
                scroll: function(top) {
                    top = top < handleTopMin ? handleTopMin : top;
                    top = top > handleTopMax ? handleTopMax : top;
                    jqmHandle.css({'top': top});
                    let percent = Math.round(((top - scrollWidth) * 100) / (handleTopMax - handleTopMin) * 100) / 100;
                    let topRange = ((itemCount + 1) * itemHeight) - settings.height;
                    top = -(topRange * percent / 100);
                    jqAllItems.css({'top': top + 'px'});
                },
                addItemList: function(arg) {
                    jqModule.find('.lb-all-items').append("<div class='lb-item'><span>" + arg + "</span></div>");
                    itemCount++;
                },
                clear: function() {
                    values = [];
                    jqModule.data('values', values);
                    jqAllItems.children().remove();
                    itemCount = 0
                },
                setList: function(arg) {
                    module.clear();
                    $.each(arg, function(i, v){
                        module.addItemList(v);
                    });
                    module.redraw();
                    module.scroll(0);
                },
                add: function(arg) {
                    $.each(arg, function(i, v) {
                        module.addItemList(v);
                    });
                    module.redraw();
                },
                disabled: function() {
                    disabled = !disabled;
                    jqModule.data('disabled', disabled);
                    jqDisabledLayer.css({'display': disabled ? 'block' : 'none'});
                },

                invoke: function(query) {
                    switch (query) {
                        case 'setList':
                            if (queryArguments.length > 0) {
                                instance.setList(queryArguments[0]);
                            }
                            break;
                        case 'clear':
                            instance.clear();
                            break;
                        case 'add':
                            if (queryArguments.length > 0) {
                                instance.add(queryArguments);
                            }
                            break;
                        case 'disabled':
                            instance.disabled();
                            break;
                        default :
                            break;
                    }
                }
            };

            if (methodInvoked) {
                if (instance === undefined) {
                    module.initialize();
                }
                module.invoke(query);
            } else {
                module.initialize();
            }
        });

        switch (query) {
            case 'val':
                let data = this.data();
                if (data.values.length) {
                    return data.settings.multiSelect ? data.values : data.values[0];
                } else {
                    return null;
                }
                break;
            default :
                break;
        }

        return this;
    };

    $.fn.listbox.settings = {
        name: 'ListBox',
        namespace: 'listbox',
        width: 200,
        height: 300,
        disabled: false,
        multiSelect: false
    };

})(jQuery, window, document);