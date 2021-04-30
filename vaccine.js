
// Since the following function doesn't get called very frequently, and the number of regions are
// not overwhelming in number, the algorithms were not be optimized for performance.
function distributeVaccine (vaccineQuantity, mechanism) {
    switch (mechanism) {
        // Find the area with maximum infection. Provide that region with the vaccine first.
        // If some vaccine is left, then find the next area with maximum infection. Provide vaccine there.
        // So on and so forth.
        case 'maximumInfection':
            var regionDataInOrder = [];
            var regionNamesInOrder = [];

            var stat = statsStorage[statsStorage.length-1].regionStats;
            for (var regionName in stat) {
                if (regionDataInOrder.length === 0) {
                    regionDataInOrder.push(stat[regionName]);
                    regionNamesInOrder.push(regionName);
                } else {
                    var flag = true;
                    for (var i = 0; i < regionDataInOrder.length; i++) {
                        if(stat[regionName].numSickPeople > regionDataInOrder[i].numSickPeople) {
                            regionDataInOrder.splice(i, 0, stat[regionName]);
                            regionNamesInOrder.splice(i, 0, regionName);
                            flag = false;
                            break;
                        }
                    }
                    if (flag) {
                        regionDataInOrder.push(stat[regionName]);
                        regionNamesInOrder.push(regionName);
                    }
                }
            }

            vaccinateRegionsInOrder(regionDataInOrder, regionNamesInOrder, vaccineQuantity);
            break;

        // Distribute vaccine in the region havign maximum number of uninfected people.
        case 'maximumUninfected':
            var regionDataInOrder = [];
            var regionNamesInOrder = [];

            var stat = statsStorage[statsStorage.length-1].regionStats;
            for (var regionName in stat) {
                if (regionDataInOrder.length === 0) {
                    regionDataInOrder.push(stat[regionName]);
                    regionNamesInOrder.push(regionName);
                } else {
                    var flag = true;
                    for (var i = 0; i < regionDataInOrder.length; i++) {
                        if(stat[regionName].numUninfectedPeople > regionDataInOrder[i].numUninfectedPeople) {
                            regionDataInOrder.splice(i, 0, stat[regionName]);
                            regionNamesInOrder.splice(i, 0, regionName);
                            flag = false;
                            break;
                        }
                    }
                    if (flag) {
                        regionDataInOrder.push(stat[regionName]);
                        regionNamesInOrder.push(regionName);
                    }
                }
            }

            vaccinateRegionsInOrder(regionDataInOrder, regionNamesInOrder, vaccineQuantity);
            break;
        
        // In accordance with the sum of infected and uninfected people
        case 'infectedAndUninfected':
            var regionDataInOrder = [];
            var regionNamesInOrder = [];

            var stat = statsStorage[statsStorage.length-1].regionStats;
            for (var regionName in stat) {
                if (regionDataInOrder.length === 0) {
                    regionDataInOrder.push(stat[regionName]);
                    regionNamesInOrder.push(regionName);
                } else {
                    var flag = true;
                    for (var i = 0; i < regionDataInOrder.length; i++) {
                        if(stat[regionName].numUninfectedPeople + stat[regionName].numSickPeople > regionDataInOrder[i].numUninfectedPeople + regionDataInOrder[i].numSickPeople) {
                            regionDataInOrder.splice(i, 0, stat[regionName]);
                            regionNamesInOrder.splice(i, 0, regionName);
                            flag = false;
                            break;
                        }
                    }
                    if (flag) {
                        regionDataInOrder.push(stat[regionName]);
                        regionNamesInOrder.push(regionName);
                    }
                }
            }

            vaccinateRegionsInOrder(regionDataInOrder, regionNamesInOrder, vaccineQuantity);
            break;

        // As a percentage of the number of uninfected people in the region. Shall be distributed proportionally.
        case 'equitable':
            vaccinateEquitably(vaccineQuantity);
            break;
        default:
            console.log('other cases to be added...');
            
    }
}

// Vaccinate in the order of the region specified
function vaccinateRegionsInOrder (regionDataInOrder, regionNamesInOrder, vaccineQuantity) {
    var regionVSVaccineQuanitityMap = [];
    for (var i = 0; i < regionDataInOrder.length; i++) {
        if (vaccineQuantity > regionDataInOrder[i].numUninfectedPeople) {
            vaccineQuantity -= regionDataInOrder[i].numUninfectedPeople;
            regionVSVaccineQuanitityMap[regionNamesInOrder[i]] = regionDataInOrder[i].numUninfectedPeople;
        } else {
            regionVSVaccineQuanitityMap[regionNamesInOrder[i]] = vaccineQuantity;
            // vaccineQuantity = 0;
            break;
        }
    }

    for (var i = 0; i < Person.allPersons.length; i++) {
        if (typeof(regionVSVaccineQuanitityMap[Person.allPersons[i].currentRegion]) !== 'undefined'
            && regionVSVaccineQuanitityMap[Person.allPersons[i].currentRegion] > 0) {
            if (!Person.allPersons[i].isInfected && !Person.allPersons[i].isImmune) {
                Person.allPersons[i].getVaccinated();
                regionVSVaccineQuanitityMap[Person.allPersons[i].currentRegion]--;
            }
        }
    }
}

// Vaccinate equitably, according to the number of uninfected people
function vaccinateEquitably (vaccineQuantity) {
    var regionVSVaccineQuanitityMap = [];
    var stat = statsStorage[statsStorage.length-1].regionStats;

    for(var name in stat) {
        regionVSVaccineQuanitityMap[name] =
            Math.round(vaccineQuantity * stat[name].numUninfectedPeople / numUninfectedPeople);
    } 

    for (var i = 0; i < Person.allPersons.length; i++) {
        if (typeof(regionVSVaccineQuanitityMap[Person.allPersons[i].currentRegion]) !== 'undefined'
            && regionVSVaccineQuanitityMap[Person.allPersons[i].currentRegion] > 0) {
            if (!Person.allPersons[i].isInfected && !Person.allPersons[i].isImmune) {
                Person.allPersons[i].getVaccinated();
                regionVSVaccineQuanitityMap[Person.allPersons[i].currentRegion]--;
            }
        }
    }
}