// structure of script in data store:
// storedFailures = {
//    scenarios = [
//       { name: "name1"; script = "text"; }, ...
//    ]
//    loaded = [ "name1", "name2", .. ];
// }


// empty list of failures
var storedFailures = { scenarios: [], loaded: [] };


function isDataChanged(oldData, newData) {
	if ((! oldData) || (! newData))
		return true;
	if ((oldData.scenarios.length !== newData.scenarios.length) || (oldData.loaded.length !== newData.loaded.length))
		return true;
	for (var i = 0; i != oldData.loaded.length; i++)
		if (oldData.loaded[i] !== newData.loaded[i])
			return true;
	for (i = 0; i != oldData.scenarios.length; i++)
		if ((oldData.scenarios[i].name !== newData.scenarios[i].name) || (oldData.scenarios[i].text !== newData.scenarios[i].text))
			return true;
	return false;
}

// called when failures received from simulator
function onFailuresUpdated(storedValue) {
    if (typeof storedValue !== 'object') {
        log("invalid failure data in data data storage");
        storedValue = { scenarios: [], loaded: [] };
    }
    if (! isDataChanged(storedFailures, storedValue))
    	return;
    storedFailures = storedValue;
	log('loaded failures total: ' + storedFailures.scenarios.length + ' loaded: ' + storedFailures.loaded.length);
    updateFailuresGui(storedFailures);
}


// save failures
var saveFailures;


function initFailuresStorage(key, dataStore) {
    saveFailures = function(failuresLoaded, failuresAvailable) {
    	storedFailures.scenarios = [];
    	storedFailures.loaded = [];
        $.each(failuresLoaded, function(key, value) {
        	value.text = value.toText();
        	storedFailures.scenarios.push({ name: value.name, text: value.text});
        	storedFailures.loaded.push(value.name);
		});
        $.each(failuresAvailable, function(key, value) {
        	value.text = value.toText();
        	storedFailures.scenarios.push({ name: value.name, text: value.text});
		});
    	log('save failures total: ' + storedFailures.scenarios.length + ' active: ' + storedFailures.loaded.length);
    	try {
            dataStore.setValue(key, storedFailures);
        } catch (e) {
			log("Can't save failure");
			log(e.stack);
        }
        if (document.location.host === '')
        	onLoadedScenariosUpdated(failuresLoaded);
    }
}
