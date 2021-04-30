// Simulation Results
var statsStorage = []; // Updated at function named 'play' in 'script.js'

function downloadSimulationResults () {
    var filename = "simResults.csv";
    var text = convertDataObjectToCSV(statsStorage);

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);  
}

function convertDataObjectToCSV (statsStorage) {
    // Initializing the output storage map
    var map = [];
    for(region in statsStorage[0]) {
        map[region + "_Uninfected"] = [];
        map[region + "_Sick"] = [];
        map[region + "_CuredOrImmune"] = [];
        map[region + "_Dead"] = [];
    }

    // Populating the map
    for (var i = 0; i < statsStorage.length; i++) {
        for(region in statsStorage[i]) {
            map[region + "_Uninfected"].push(statsStorage[i][region].numUninfectedPeople);
            map[region + "_Sick"].push(statsStorage[i][region].numSickPeople);
            map[region + "_CuredOrImmune"].push(statsStorage[i][region].numCuredPeople);
            map[region + "_Dead"].push(statsStorage[i][region].numDeadPeople);
        }
    }

    // Convert the map to CSV
    var csvText = "";
    for(region in statsStorage[0]) {
        csvText += region + "_Uninfected," + JSON.stringify(map[region + "_Uninfected"]).slice(1, -1) + "\n";
        csvText += region + "_Sick," + JSON.stringify(map[region + "_Sick"]).slice(1, -1) + "\n";
        csvText += region + "_CuredOrImmune," + JSON.stringify(map[region + "_CuredOrImmune"]).slice(1, -1) + "\n";
        csvText += region + "_Dead," + JSON.stringify(map[region + "_Dead"]).slice(1, -1) + "\n";
    }

    return csvText;
}
