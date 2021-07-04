// update scripts status once per second


// called when scenarios received from server
var onLoadedScenariosUpdated;

$(document).ready(function() {

    // list of loaded scenarios
    var loadedScenarios = [];

    // list of active failures
    var activeFailures = [];

    // fill failures listbox with list of active failures
    var updateFailuresList = function() {
        var names = [];
        $.each(activeFailures, function (key, value) {
            names.push(value.descr);
        });
        $('#active_faults_list').listbox("setList", names);
    };

    // convert failures list to set
    var listToSet = function(activeFailures) {
        var res = new Set();
        $.each(activeFailures, function (key, value) {
            res.add(value.shortName);
        });
        return res;
    };

    // test which failures are active now
    var updateActiveFailuresList = function() {
        var changed = false;
        for (var i = 0; i < activeFailures.length; i++) {
            if (! activeFailures[i].isActive()) {
                activeFailures.splice(i, 1);
                i--;
                changed = true;
            }
        }
        var set = listToSet(activeFailures);
        for (i = 1; i < failures.length; i++) {
            if (failures[i].isActive() && (! set.has(failures[i].shortName))) {
                activeFailures.push(failures[i]);
                changed = true;
            }
        }
        if (changed)
            updateFailuresList();
    };

    // run all loaded scenarios
    var executeScenarios = function () {
        /*if (document.location.host === '') {
            $.each(loadedScenarios, function (key, value) {
                value.update();
            });
        }*/
        updateActiveFailuresList();
    };

    // test if scenario with specified name present in list
    var isScenarioPresent = function(scenarios, name) {
        for (var i = 0; i < scenarios.length; i++) {
            if (scenarios[i].name() === name)
                return true;
        }
        return false;
    };

    // conver list of scenarios to map
    var listToMap = function(list) {
        var res = new Map();
        $.each(conditions, function(key, value) {
            res.set(value.name, value);
        });
        return res;
    };

    // update loaded scenarios.
    // updates only scenarios really needed
    onLoadedScenariosUpdated = function(scenarios) {
        // remove scenarios no longer available
        var newMap = listToMap(scenarios);
        for (var i = 0; i < loadedScenarios.length; i++) {
            if (! newMap.has(loadedScenarios[i].name)) {
                loadedScenarios.splice(i, 1);
                i--;
            }
        }
        // replace updated scenarios
        for (i = 0; i < loadedScenarios.length; i++) {
            var s = loadedScenarios[i];
            var news = newMap.get(s.name);
            if (news && (news.text !== s.text)) {
                loadedScenarios[i] = news;
//                loadedScenarios[i].start();
            }
        }
        // add missing scenarios
        var oldMap = listToMap(loadedScenarios);
        for (i = 0; i < scenarios.length; i++) {
            s = scenarios[i];
            if (! oldMap.has(s.name)) {
                loadedScenarios.push(s);
//                s.start();
            }
        }
    };

    // deactivate failures
/*    $('#failure_reset').click(function() {
        $.each(activeFailures, function (key, value) {
            value.deactivate();
        });
        activeFailures = [];
        updateActiveFailuresList();
    });

    setInterval(executeScenarios, 1000);*/

});
