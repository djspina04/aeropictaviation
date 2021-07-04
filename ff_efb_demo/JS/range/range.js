/*!
 * # Range slider for Semantic UI.
 * 
 */
 
;(function ( $, window, document, undefined ) {

"use strict";

$.fn.range = function(parameters) {

    var
        $allModules    = $(this),
        offset         = 11,
        query          = arguments[0],
        methodInvoked  = (typeof query == 'string'),
        queryArguments = [].slice.call(arguments, 1)
    ;

    if (query == 'getValue') {
        return this.data('value');
    }

    if (query == 'getSettings') {
        return this.data('settings');
    }

  $allModules.each(function() {
            
            var
                settings          = ( $.isPlainObject(parameters) )
                    ? $.extend(true, {}, $.fn.range.settings, parameters)
                    : $.extend({}, $.fn.range.settings),

                namespace       = settings.namespace,
                min             = settings.min,
                max             = settings.max,
                step            = settings.step,
                start           = settings.start,
                input           = settings.input,

                eventNamespace  = '.' + namespace,
                moduleNamespace = 'module-' + namespace,

                $module         = $(this),

                element         = this,
                instance        = $module.data(moduleNamespace),
                
                inner,
                thumb,
                trackLeft,
                precision,
                
                module,
                changing = ''
            ;

            module = {

                initialize: function() {
                    module.instantiate();
                },
                
                instantiate: function() {
                    instance = module;
                    $module.data(moduleNamespace, module);
                    $module.data('settings', settings);

                    $(element).html("<div class='inner'><div class='track'></div><div class='track-fill'><div class='track-fill-sub'></div></div><div class='thumb'></div></div>");
                    inner = $(element).children('.inner')[0];
                    thumb = $(element).find('.thumb')[0];
                    trackLeft = $(element).find('.track-fill')[0];
                    // find precision of step, used in calculating the value
                    module.determinePrecision();
                    // set start location
                    $module.data('value', settings.start);
                    module.setValuePosition(settings.start);

                    if (settings.input) {
                        settings.input.on('change', function() {
                            var validVal = parseInt($(this).val());
                            validVal = isNaN(validVal) ? min : validVal;
                            validVal = validVal < min ? min : validVal;
                            validVal = validVal > max ? max : validVal;
                            changing = $module.attr('id');
                            module.setValuePosition(validVal);
                            changing = '';
                        });
                    }

                    // event listeners
                    $(element).find('.track, .thumb, .inner').on('mousedown', function(event) {
                        event.stopImmediatePropagation();
                        event.preventDefault();
                        $(this).closest(".range").trigger('mousedown', event);
                    });
                    $(element).find('.track, .thumb, .inner').on('touchstart', function(event) {
                        event.stopImmediatePropagation();
                        event.preventDefault();
                        $(this).closest(".range").trigger('touchstart', event);
                    });
                    $(element).on('mousedown', function(event, originalEvent) {
                        module.rangeMousedown(event, false, originalEvent);
                    });
                    $(element).on('touchstart', function(event, originalEvent) {
                        module.rangeMousedown(event, true, originalEvent);
                    });
                    //$(element).on('mousemove', function(event, originalEvent) {
                    //    module.rangeMouseMove(event, originalEvent);
                    //});
                },
                
                determinePrecision: function() {
                    var split = String(settings.step).split('.');
                    var decimalPlaces;
                    if(split.length == 2) {
                        decimalPlaces = split[1].length;
                    } else {
                        decimalPlaces = 0;
                    }
                    precision = Math.pow(10, decimalPlaces);
                },
                
                determineValue: function(startPos, endPos, currentPos) {
                    var ratio = (currentPos - startPos) / (endPos - startPos);
                    var range = max - min;
                    var difference = Math.round(ratio * range / step) * step;
                    // Use precision to avoid ugly Javascript floating point rounding issues
                    // (like 35 * .01 = 0.35000000000000003)
                    difference = Math.round(difference * precision) / precision;
                    return difference + min;
                },

                determinePosition: function(value) {
                    var ratio = (value - min) / (max - min);
                    return Math.round(ratio * ($(inner).width() - (offset * 2)) + $(trackLeft).position().left);
                },

                setChanging: function(changingName) {
                    changing = changingName;
                },

                releaseChanging: function() {
                    changing = '';
                },

                setValue: function(newValue) {
                    if(settings.input) {
                        $(settings.input).val(newValue);
                    }
                    if(settings.onChange) { // && $module.data('value') != newValue
                        $module.data('value', newValue);
                        if (changing == $(element).attr('id')) {
                            settings.onChange(element, newValue, settings);
                        }
                    }
                },

                setPosition: function(value) {
                    $(thumb).css({left: String(value) + 'px'});
                    $(trackLeft).css({width: String(value + offset) + 'px'});
                },

                rangeMousedown: function(mdEvent, isTouch, originalEvent) {
                    if( !$(element).hasClass('disabled') ) {
                        changing = $(element).attr('id');
                        mdEvent.preventDefault();
                        var left = $(inner).offset().left;
                        var right = left + $(inner).width() - (offset * 2);
                        var pageX;
                        if(isTouch) {
                            pageX = originalEvent.originalEvent.touches[0].pageX;
                        } else {
                            pageX = (typeof mdEvent.pageX != 'undefined') ? mdEvent.pageX : originalEvent.pageX;
                        }
                        pageX -= offset;
                        var value = module.determineValue(left, right, pageX);

                        if(pageX >= left && pageX <= right) {
                            module.setPosition(pageX - left);
                            module.setValue(value);
                        }
                        var rangeMousemove = function(mmEvent) {
                            mmEvent.preventDefault();
                            if(isTouch) {
                                pageX = mmEvent.originalEvent.touches[0].pageX;
                            } else {
                                pageX = mmEvent.pageX;
                            }
                            pageX -= offset;
                            value = module.determineValue(left, right, pageX);
                            if(pageX < left) {pageX = left;}
                            if(pageX > right) {pageX = right;}
                            if(pageX >= left && pageX <= right) {
                                if(value < min) {value = min;}
                                if(value > max) {value = max;}
                                if(value >= min && value <= max) {
                                    module.setPosition(pageX - left);
                                    module.setValue(value);
                                }
                            }
                        };
                        var rangeMouseup = function(muEvent) {
                            if(isTouch) {
                                $(document).off('touchmove', rangeMousemove);
                                $(document).off('touchend', rangeMouseup);
                            } else {
                                $(document).off('mousemove', rangeMousemove);
                                $(document).off('mouseup', rangeMouseup);
                            }

                            changing = '';
                        };
                        if(isTouch) {
                            $(document).on('touchmove', rangeMousemove);
                            $(document).on('touchend', rangeMouseup);
                        }
                        else {
                            $(document).on('mousemove', rangeMousemove);
                            $(document).on('mouseup', rangeMouseup);
                        }
                    }
                },

                setValuePosition: function(val) {
                    var position = module.determinePosition(val);
                    module.setPosition(position);
                    module.setValue(val);
                },

                setMinValue: function(val) {
                    min = val;
                },

                setMaxValue: function(val) {
                    max = val;
                },

                invoke: function(query) {
                    switch(query) {
                        case 'setValue':
                            if(queryArguments.length > 0) {
                                instance.setValuePosition(queryArguments[0]);
                            }
                            break;
                        case 'setChanging':
                            if(queryArguments.length > 0) {
                                instance.setChanging(queryArguments[0]);
                            }
                            break;
                        case 'releaseChanging':
                            instance.releaseChanging();
                            break;
                        case 'setMin':
                            if(queryArguments.length > 0) {
                                instance.setMinValue(queryArguments[0]);
                            }
                            break;
                        case 'setMax':
                            if(queryArguments.length > 0) {
                                instance.setMaxValue(queryArguments[0]);
                            }
                            break;
                        default :
                            break;
                    }
                }
            
            };
            
      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        module.initialize();
      }
            
    })
  ;

    return this;
};

$.fn.range.settings = {

  name         : 'Range',
  namespace    : 'range',

    min          : 0,
    max          : false,
    step         : 1,
    start        : 0,
    input        : false,
    
    onChange     : function(value){}

};


})( jQuery, window, document );