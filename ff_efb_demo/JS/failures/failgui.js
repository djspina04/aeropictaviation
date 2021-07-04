// add items to failure combo
function populateFailureCombo(id, skipFirst) {
    var first = true;
    $.each(failures, function(key, value) {
        if (skipFirst && first) {
            first = false;
        } else
            $('#' + id).append($("<option></option>")
                .attr("value", key)
                .text(value.shortName));
    });
}

// add parts to falures combo box
function initFailuresCombo()
{
    populateFailureCombo('failure-type', false);
    $('#failure-type').on('change', function() {
        $('#failure-descr').val(failures[this.value].descr);
    });
}

function populateEventCombo(id) {
    $.each(events, function(key, value) {
        $('#' + id).append($("<option></option>")
            .attr("value", key)
            .text(value.name));
    });
}

function updateConditionArguments(condition)
{
    var argsPanel = $('#fail_arguments');
    argsPanel.empty();
    var len = condition.guiArgs.length;
    for (var i = 0; i < len; i++) {
        var arg = condition.guiArgs[i];
        switch (arg.type) {
            case "number":
                argsPanel.append($('<div style="display: inline;">' +
                    '<input class="input" type=\"number\" id="failure-arg-' + i + '" value="0" min="0" max="100000"> '
                    + arg.label + ' </div>'));
                break;
            case "failure":
                argsPanel.append($('<div style="display: inline;"><label>' + arg.label + '</label>' +
                    '<select id="failure-arg-' + i + '"></select></div>'));
                populateFailureCombo('failure-arg-' + i, true);
                break;
            case "event":
                argsPanel.append($('<div style="display: inline;"><label>' + arg.label + '</label>' +
                    '<select id="failure-arg-' + i + '"></select></div>'));
                populateEventCombo('failure-arg-' + i);
                break;
        }
    }
}


function setConditionArguments(node) {
    updateConditionArguments(node.condition);
    var len = node.args.length;
    for (var i = 0; i < len; i++) {
        var control = $('#failure-arg-' + i);
        switch (node.condition.guiArgs[i].type) {
            case "failure":
                for (var j = 0; j < failures.length; j++)
                    if (failures[j].shortName === node.args[i])
                        control.val(j);
                break;
            case "event":
                for (var j = 0; j < events.length; j++)
                    if (events[j].name === node.args[i])
                        control.val(j);
                break;
            default:
                control.val(node.args[i]);
        }
    }
}

// extract condition arguments from user input
function buildConditionArgsList(condition) {
    var len = condition.guiArgs.length;
    var res = [ ];
    for (var i = 0; i < len; i++) {
        var arg = condition.guiArgs[i];
        var argValue = $('#failure-arg-' + i).val();
        switch (arg.type) {
            case "number": res.push(argValue); break;
            case "failure": res.push(failures[argValue].shortName); break;
            case "event": res.push(events[argValue].name); break;
        }
    }
    return res;
}


// add all parts to parts combo box
function initConditionsCombo()
{
    $.each(conditions, function(key, value) {
        $('#failure-cond-type').append($("<option></option>")
            .attr("value", key)
            .text(value.name));
    });
    $('#failure-cond-type').on('change', function() {
        updateConditionArguments(conditions[this.value]);
    });
}


function removeListBoxItem(listBoxId, items, idx) {
    items.splice(idx, 1);
    var list = [];
    items.forEach(function (value) { list.push(value.name) });
    $('#' + listBoxId).listbox("setList", list);
}

// called when data arrived from simulator
var updateFailuresGui;

// called when active failures list arrived from simulator
var updateActiveFailures;

$(function() {
    var availableScenarios = [];
    var loadedScenarios = [];

    // editable scenario
    var scenario;

    // equals true if scenario is new
    var newScenario;

    // index of edited scenario
    var oldScenarioIdx;

    // function which finishes editing
    var commitFunc;

    // equals true if must edit scenario name
    var editHeader;

    // list of parts with hidden failures
    var hiddenFailures;

    // list of currently active failures
    var activeFailuresList;

    // currently loaded unparsed active failures
    var currentActiveFailures;

    // add parts to list
    initFailuresCombo();
    initConditionsCombo();

    var getScenarioIdx = function(scenarios, name) {
        for (var i = 0; i < scenarios.length; i++) {
            if (scenarios[i].name === name)
                return i;
        }
        return -1;
    };

    // returns index of selected available scenario
    var getSelectedScenario = function() {
        return getScenarioIdx(availableScenarios, $('#available_failures_list').listbox("val"));
    };

    // show remove failure confirmation
    $("#failure_delete").click(function(){
        var idx = getSelectedScenario();
        if (-1 !== idx)
            $(".failure_confirm_deletion").modal('show');
        saveFailures(loadedScenarios, availableScenarios);
    });

    // actually remove failure
    $("#fail_confirm_delete").click(function(){
        var idx = getSelectedScenario();
        if (-1 === idx)
            return;
        removeListBoxItem('available_failures_list', availableScenarios, idx);
        saveFailures(loadedScenarios, availableScenarios);
    });

    // move scenario to loaded list
    $("#failure_load").click(function() {
        var idx = getSelectedScenario();
        if (-1 === idx)
            return;
        loadedScenarios.push(availableScenarios[idx]);
        $('#loaded_failures_list').listbox("add", availableScenarios[idx].name);
        removeListBoxItem('available_failures_list', availableScenarios, idx);
        saveFailures(loadedScenarios, availableScenarios);
    });

    // returns index of selected loaded scenario
    var getLoadedScenario = function() {
        return getScenarioIdx(loadedScenarios, $('#loaded_failures_list').listbox("val"));
    };

    // remove scenario from loaded list
    $("#failure_unload").click(function(){
        var idx = getLoadedScenario();
        if (-1 === idx)
            return;
        newScenario = false;
        availableScenarios.push(loadedScenarios[idx]);
        $('#available_failures_list').listbox("add", loadedScenarios[idx].name);
        removeListBoxItem('loaded_failures_list', loadedScenarios, idx);
        saveFailures(loadedScenarios, availableScenarios);
    });

    // unload all loaded scenarios
    $("#failure_clear_all").click(function(){
        loadedScenarios.forEach(function (scenario) {
            availableScenarios.push(scenario);
            $('#available_failures_list').listbox("add", scenario.name);
        });
        loadedScenarios = [];
        $('#loaded_failures_list').listbox("setList", []);
        saveFailures(loadedScenarios, availableScenarios);
    });

    $("#failure_edit").click(function(){
        oldScenarioIdx = getSelectedScenario();
        if (-1 === oldScenarioIdx)
            return;
        newScenario = false;
        scenario = availableScenarios[oldScenarioIdx];
        editHeader = false;
        hiddenFailures = [];
        $.tab('change tab', "failure-script-view");
        generateScriptView();
        $(".scenario_editor_modal").modal('show');
    });

    $("#fail-save-button").click(function(){
        var idx = getSelectedScenario();
        if (-1 === idx)
            return;
        try {
            var scenario = parseScenario($('#fail_script_text_editor').val());
            removeListBoxItem('available_failures_list', availableScenarios, idx);
            availableScenarios.push(scenario);
            $('#available_failures_list').listbox("add", scenario.name);
            $(".edit_scenario_modal").modal('hide');
        } catch (e) {
            alert(e.toString());
            console.log(e.stack);
        }
    });

    // show new script dialog
    var dialog = $(".scenario_editor_modal");
    dialog.modal({
        closable: true,
        autofocus: false,
        centered: true,
        onShow: function () {
            dialog.modal('refresh'); // does NOT help
            setTimeout(function () {
                dialog.modal('refresh');
            }, 10); // does help 1s is probably overkill
        }
    });

    $("#failure_new").click(function() {
        scenario = new Scenario();
        newScenario = true;
        editHeader = true;
        oldScenarioIdx = -1;
        hiddenFailures = [];
        $(".scenario_editor_modal").modal('show');

        if (scenario.name === "") {
            scenario.name = "scenario name";
        }
        $.tab('change tab', "failure-script-view");
        generateScriptView();
        editScenarioNameStart();
    });

    // find index of failure in combo box
    var findFailureIdx = function(failure) {
        var idx = failures.indexOf(failure);
        if (-1 === idx)
            idx = 0;
        return idx;
    };

    var findConditionIdx = function(condition) {
        var idx = conditions.indexOf(condition);
        if (-1 === idx)
            idx = 0;
        return idx;
    };

    // save changes in current editor
    var commitChanges = function() {
        if (! commitFunc)
            return;
        commitFunc();
        commitFunc = null;
    };

    var addDropDown = function(container, id, text, items) {
        var code = '<div id="' + id + '-container" style="display: inline;"><div id="' + id + '" class="ui dropdown">'
            + '<span id="' + id + '-value">' + text + '</span> <i class="dropdown icon"></i><div class="menu">';
        var idx = 0;
        items.forEach(function(item) {
            code += '<div class="item" data-value="' + (idx++) + '">' + item.title + '</div>';
        });
        code += '</div></div></div>';
        container.append(code);
        var element = $("#" + id);
        element.dropdown('refresh');
        element.dropdown({ onChange: function(val) {
                commitChanges();
                var item = items[val];
                if (item && item.handler)
                    item.handler(item);
            }});
    };

    // check if name unique
    var isNameUnique = function(name) {
        loadedScenarios.forEach(function (scenario) {
            if (scenario.name === name)
                return false;
        });
        for (var i = 0; i < availableScenarios.length; i++) {
            if ((oldScenarioIdx !== i) && (availableScenarios[i].name === name))
                return false;
        }
        return true;
    };

    // remove number from end of name
    var removeEndNumber = function(name) {
        for (var last = name.length - 1; 0 <= last; last--) {
            var ch = name.charAt(last);
            if (! (('0' <= ch) && ('9' >= ch))) {
                if (last === name.length - 1)
                    return name;
                return name.substr(0, last + 1);
            }
        }
        return "";
    };

    // add number to name.
    // if name already contains number replace it
    var getNumberedName = function(name, no) {
        var withoutNumber = removeEndNumber(name);
        if ((0 !== withoutNumber.length) && (withoutNumber.charAt(withoutNumber.length - 1) !== ' '))
            withoutNumber += ' ';
        return withoutNumber + no;
    };

    // returns unique name based on user-suggested name
    var getUniqueName = function(name) {
        if ((! name) || (0 === name.length))
            name = "scenario";
        var idx = 1;
        while (! isNameUnique(name)) {
            name = getNumberedName(name, idx);
            idx++;
        }
        return name;
    };

    var editScenarioNameStart = function() {
        var id = 'fail-name-dropdown';
        $('#' + id).hide();
        var container = $('#' + id + '-container');
        var s = '<div style="display: inline;" id="' + id +'-editor">scenario <input id="' + id + '-edit" value="' +
            scenario.name + '" type="text"></div>';
        container.append(s);
        commitFunc = function() {
            scenario.name = getUniqueName($('#' + id + '-edit').val());
            $('#' + id + '-value').text('scenario "' + scenario.name + '"');
            $('#' + id + '-editor').remove();
            $('#' + id).show();
        };
    };

    // append scenario editor to script view
    var addNameEditorMenu = function(container) {
        addDropDown(container, "fail-name-dropdown", 'scenario "' + scenario.name + '"',
            [{value: "edit", title: "Edit", handler: function () { editScenarioNameStart() }}]);
    };

    // add failure at specified index
    var onAddFailureAt = function(idx) {
        var newPart = {conditions: [ new ExprNode(new ConditionNode(conditions[0], [])) ],
            action: { failure: failures[0], descr: failures[0].descr }};
        if (idx >= scenario.parts.length)
            scenario.parts.push(newPart);
        else
            scenario.parts.splice(idx, 0, newPart);
        hiddenFailures.push(newPart);
        generateScriptView();
        var newCond = newPart.conditions[0].children[0];
        onEditConditionStart('fail-condition-editor-' + newCond.guiId, newCond);
    };

    var editFailureStart = function(idx) {
        var id = "fail-action-dropdown-" + idx;
        $('#' + id).hide();
        var container = $('#' + id + '-container');
        var action = scenario.parts[idx].action;
        var s = '<div style="display: inline;" id="' + id +'-editor">Initiate failure: <select id="' + id + '-combo" value="' +
            findFailureIdx(action.failure) + '"></select> : <input type="text" id="' + id + '-edit" value="' + action.descr + '"></div>';
        container.append(s);
        populateFailureCombo(id + '-combo', false);
        var combo = $('#' + id + '-combo');
        combo.val(findFailureIdx(action.failure));
        combo.on('change', function() {
            $('#' + id + '-edit').val(failures[this.value].descr);
        });
        commitFunc = function() {
            action.failure = failures[combo.val()];
            action.descr = $('#' + id + '-edit').val();
            $('#' + id + '-value').text(getFailureText(action));
            $('#' + id + '-editor').remove();
            $('#' + id).show();
        };
    };

    var getFailureText = function(action) {
        return 'Initiate failure "' + action.failure.shortName + '": "' + action.descr + '"';
    };

    // create menu for failure.  do not allow to remove it if failure is last
    var addFailureActionEditor = function(container, idx) {
        var id = "fail-action-dropdown-" + idx;
        var onRemoveFailure = function () {
            scenario.parts.splice(idx, 1);
            generateScriptView();
        };
        var action = scenario.parts[idx].action;
        var menuItems = [
            {value: "edit", title: "Edit", handler: function() { editFailureStart(idx)} },
            {value: "addBefore", title: "Add failure before", handler: function() { onAddFailureAt(idx)} },
            {value: "addAfter", title: "Add failure after", handler: function() { onAddFailureAt(idx + 1)} },
        ];
        if (scenario.parts.length > 1)
            menuItems.push({value: "remove", title: "Remove", handler: onRemoveFailure});
        addDropDown(container, id, getFailureText(action), menuItems);
    };

    // insert new condition at specified position and show condition editor dialog
    var onAddConditionAt = function(partNo, lineNo) {
        var conds = scenario.parts[partNo].conditions;
        var expr = new ExprNode(new ConditionNode(conditions[0], []));
        if (lineNo < conds.length)
            conds.splice(lineNo, 0, expr);
        else
            conds.push(expr);
        generateScriptView();
        onEditConditionStart('fail-condition-editor-' + expr.children[0].guiId, expr.children[0]);
    };

    var findRightNode = function(node) {
        if (! node.children.length)
            return node;
        var child = node.children[node.children.length - 1];
        return findRightNode(child);
    };

    var getNodeIndex = function(node) {
        for (var i = 0; i < node.parent.children.length; i++)
            if (node.parent.children[i] === node)
                return i;
        return -1;
    };

    // add AND or OR operator to end of line
    var onAddOperator = function (type, partNo, lineNo) {
        var node = findRightNode(scenario.parts[partNo].conditions[lineNo]);
        var parent = node.parent;
        var newCond = new ConditionNode(conditions[0], []);
        var op = new OperatorNode(type);
        op.parent = parent;
        op.addChildren(node);
        op.addChildren(newCond);
        parent.children[getNodeIndex(node)] = op;
        generateScriptView();
        onEditConditionStart('fail-condition-editor-' + newCond.guiId, newCond);
    };

    var onRemoveCondition = function(node, partNo, lineNo) {
        var conditions = scenario.parts[partNo].conditions;
        if (conditions[lineNo].children[0] === node) {
            conditions.splice(lineNo, 1);
        } else {
            var idx = getNodeIndex(node);
            node.parent.children.splice(idx, 1);
            if ((node.parent.name === "AND") || (node.parent.name === "OR")) {
                var other = node.parent.children[0];
                var parentIdx = getNodeIndex(node.parent);
                node.parent.parent.children[parentIdx] = other;
                other.parent = node.parent.parent;
            }
        }
        generateScriptView();
    };

    var onEditConditionStart = function(id, node) {
        $('#' + id).hide();
        var container = $('#' + id + '-container');
        var s = '<div style="display: inline;" id="' + id + '-editor"><select id="' + id +
            '-combo"></select> <div style="display: inline;" id="fail_arguments"></div></div>';
        container.append(s);
        var combo = $('#' + id + '-combo');
        $.each(conditions, function (key, value) {
            combo.append($("<option></option>").attr("value", key).text(value.name));
        });
        combo.val(findConditionIdx(node.condition));
        setConditionArguments(node);
        combo.on('change', function () {
            updateConditionArguments(conditions[this.value]);
        });
        commitFunc = function () {
            var condition = conditions[combo.val()];
            node.condition = condition;
            node.args = buildConditionArgsList(condition);
            $('#' + id + '-value').text(node.toText());
            $('#' + id + '-editor').remove();
            $('#' + id).show();
        };
    };

    // create menu for condition node
    var addConditionEditor = function(container, node, noDelete, id, partNo, lineNo) {
        node.guiId = id.value++;
        var editorId = 'fail-condition-editor-' + node.guiId;
        var menu = [
            { value: "edit", title: "Edit", handler: function() { onEditConditionStart(editorId, node) } },
            { value: "addOr", title: "Append OR condition", handler: function () { onAddOperator('OR', partNo, lineNo); } },
            { value: "addAnd", title: "Append AND condition" , handler: function () { onAddOperator('AND', partNo, lineNo); } },
            { value: "insertAbove", title: "Insert line above", handler: function() { onAddConditionAt(partNo, lineNo) } },
            { value: "insertBelow", title: "Insert line below", handler: function() { onAddConditionAt(partNo, lineNo + 1) } }
        ];
        if (! noDelete)
            menu.push({ value: "remove", title: "Remove", handler: function() { onRemoveCondition(node, partNo, lineNo) } });
        addDropDown(container, editorId, node.toText(), menu);
    };

    var addAndOrEditor = function(container, node, id, partNo, lineNo) {
        addNodeEditor(container, node.children[0], id, partNo, lineNo);
        container.append(' &nbsp; ' + node.name + ' &nbsp; ');
        addNodeEditor(container, node.children[1], id, partNo, lineNo);
    };

    // process node in expression
    var addNodeEditor = function(container, node, id, partNo, lineNo) {
        switch (node.name) {
            case 'expr':
                node.children.forEach(function (value) { addNodeEditor(container, value, id, partNo, lineNo) });
                break;
            case 'AND':
            case 'OR':
                addAndOrEditor(container, node, id, partNo, lineNo);
                break;
            default:
                var part = scenario.parts[partNo];
                var lonelyNode = (part.conditions.length === 1) && (part.conditions[0].children.length === 1) &&
                    part.conditions[0].children[0] === node;
                addConditionEditor(container, node, lonelyNode, id, partNo, lineNo);
        }
    };

    // create screnario part editor (both conditions and failure action)
    var addPartEditor = function(container, idx, id) {
        var part = scenario.parts[idx];
        var lineNo = 0;
        part.conditions.forEach(function (expr) {
            addNodeEditor(container, expr, id, idx, lineNo++);
            container.append('<br>');
        });
        if (-1 === hiddenFailures.indexOf(part))
            addFailureActionEditor(container, idx);
    };

    var generateScriptView = function() {
        var container = $('#failure-script-view');
        container.empty();
        addNameEditorMenu(container, scenario);

        var id = { value: 1};
        var len = scenario.parts.length;
        for (var i = 0; i < len; i++) {
            container.append('<p>');
            addPartEditor(container, i, id);
            container.append('</p>');
        }
    };


    $("#fail-editor-ok-button").click(function() {
        var noHide = false;
        if (commitFunc) {
            commitChanges();
            noHide = true;
        }
        if (0 < hiddenFailures.length) {
            var part = hiddenFailures[0];
            hiddenFailures.shift();
            generateScriptView();
            editFailureStart(scenario.parts.indexOf(part));
            noHide = true;
        }
        if (editHeader) {
            editHeader = false;
            noHide = true;
            onAddFailureAt(0);
        }

        if (noHide)
            return;

        if (! newScenario)
            removeListBoxItem('available_failures_list', availableScenarios, oldScenarioIdx);
        availableScenarios.push(scenario);
        $('#available_failures_list').listbox("add", scenario.name);
        saveFailures(loadedScenarios, availableScenarios);
        $(".scenario_editor_modal").modal('hide');
    });

    // called when data arrived from simulator
    updateFailuresGui = function(storedFailures) {
        var scenarios = new Map();
        var availableNames = [];
        availableScenarios = [];
        $.each(storedFailures.scenarios, function (key, value) {
            try {
                var scenario = parseScenario(value.text);
                scenarios.set(scenario.name, scenario);
                availableScenarios.push(scenario);
                availableNames.push(scenario.name);
            } catch (e) {
                console.log('error parsing script ' + e.message)
                console.log(e.stack);
            }
        });
        var loadedNames = [];
        loadedScenarios = [];
        $.each(storedFailures.loaded, function (key, value) {
            var s = scenarios.get(value);
            if (s) {
                loadedScenarios.push(s);
                loadedNames.push(s.name);
                var idx = getScenarioIdx(availableScenarios, s.name);
                availableScenarios.splice(idx, 1);
                availableNames.splice(idx, 1);
            }
        });
        $('#available_failures_list').listbox("setList", availableNames);
        $('#loaded_failures_list').listbox("setList", loadedNames);
        if (document.location.host === '')
            onLoadedScenariosUpdated(loadedScenarios);
    };

    updateActiveFailures = function(activeFailures) {
        if (activeFailures === currentActiveFailures)
            return;
        currentActiveFailures = activeFailures;
        activeFailuresList = activeFailures.split(",");
        $('#active_faults_list').listbox("setList", activeFailuresList);
    };

    $("#failure_reset").click(function() {
        var listBox = $('#active_faults_list');
        var failureProp = listBox.listbox("val");
        if (failureProp) {
            ff.Set(failureProp, 0);
            activeFailuresList.splice(activeFailuresList.indexOf(failureProp), 1);
            listBox.listbox("setList", activeFailuresList);
        }
    });


});

