// JSON file for the evironment
var environmentJSONFile = "honeycomb_manually_modified.json";

// Render control
// Rerender on the page only after this many steps.
var rerenderInterval = 1; 

// Global Variables
var boundaryThickness;
var spreadRadius;
var curePeriod;
var killProbability;
var transmissionProbability;

// Lockdown related
var regionsUnderLockDown = new Set();
var lockdownStartThreshold;
var lockdownEndThreshold;
var lockdownMobilityMultiplier;

// Vaccine related
var vaccineDistributionStartTime;
var vaccineDistributionFrequency;
var vaccineDistributionQuantity;
var vaccineDistributionMechanism;

// Medicine related
var medicineDistributionStartTime;
var medicineDistributionFrequency;
var medicineDistributionQuantity;
var medicineDistributionMechanism;

// Statistics
var regionStats = {};
regionStats["allRegions"] = {
    "numSickPeople": 0,
    "numCuredPeople": 0,
    "numDeadPeople": 0,
    "numUninfectedPeople": 0
};

var map = document.getElementById("map");
var ctx = map.getContext("2d");
var imgd = ctx.getImageData(0, 0, 1000, 1000);
var allRegions = [];

document.body.scrollTo(
    (map.width - document.body.offsetWidth)/2,
    (map.height - document.body.offsetHeight)/2
);

var mousePointerData = document.getElementById("mousePointerData");
map.addEventListener('mousemove', function(evt) {
    mousePointerData.innerText = (evt.clientX + document.body.scrollLeft) + ',' + (evt.clientY + document.body.scrollTop) + ' - Mouse position';
});

var statsViewer = document.getElementById("statsViewer");
var statsRegionID = "";
map.addEventListener('mousedown', function (evt) {
    var x = evt.clientX + document.body.scrollLeft
    var y = evt.clientY + document.body.scrollTop;
    statsRegionID = findRegion(x,y);
    updateStatsViewer();
});
function updateStatsViewer () {
    if (statsRegionID !== "") {
        var html = "Region: " + statsRegionID + "<br>";
        html += "Num Cured: " + regionStats[statsRegionID].numCuredPeople + "<br>";
        html += "Num Dead: " + regionStats[statsRegionID].numDeadPeople + "<br>";
        html += "Num Sick: " + regionStats[statsRegionID].numSickPeople + "<br>";
        html += "Num Uninfected: " + regionStats[statsRegionID].numUninfectedPeople + "<br>";
        statsViewer.innerHTML = html;
    }
}

function addRegion (region) {
    // Initializing statistics for the region
    regionStats["allRegions"].numUninfectedPeople += region.population;
    regionStats[region.id] = {
        "numSickPeople": 0,
        "numCuredPeople": 0,
        "numDeadPeople": 0,
        "numUninfectedPeople": region.population
    };

    // Adding a people holder to region
    region.people = [];

    // Adding people into the region
    for(var i = 0; i < region.population - region.infected; i++){
        region.people.push(new Person(region.id, region.center, region.radius, region.mobilityFactor));
    }
    for(var i = 0; i < region.infected; i++){
        region.people.push(new Person(region.id, region.center, region.radius, region.mobilityFactor, true));
    }
}

function addBoundary(boundary) {
    ctx.beginPath();
    ctx.moveTo(boundary[0], boundary[1]);
    ctx.lineTo(boundary[2], boundary[3]);
    ctx.strokeStyle = getBoundaryColor(boundary);
    ctx.lineWidth = boundaryThickness;
    ctx.stroke();
}

function getBoundaryColor(boundary) {
    // R: Permeability
    // G: Angular orientation of the border
    // B: 255
    // Mapping permeability the values to be between 0 and 100
    // Mapping direction the values to be between 0 and 180

    // Permeability
    var adjustedVal = boundary[4] * 100;
    var hexaCode = "#" + adjustedVal.toString(16);

    // Direction
    var dx = boundary[0] - boundary[2];
    var dy = boundary[1] - boundary[3];
    var encodedAngle = 90 + Math.round(Math.atan(dy/dx) * 180 / Math.PI);
    if (encodedAngle < 16) {
        hexaCode += "0" + encodedAngle.toString(16);
    } else {
        hexaCode += encodedAngle.toString(16);
    }
    hexaCode += "ff";
    return hexaCode;
}

function getBoundaryValueAt(x, y) {
    // Reversing what is done in 'getBoundaryColor' function
    // (kind of)
    var pixel = ctx.getImageData(x, y, 1, 1).data;

    if (pixel[3] > 0) {
        // Making sure that we extract the right pixel
        // (sometimes alpha is observed in line strokes and that alters the result)
        for(var i = -1; i <= 1; i++) {
            for (var j = -1; j <=1; j++) {
                pixelDash = ctx.getImageData(x + i, y + j, 1, 1).data
                if(pixel[0] < pixelDash[0]) {
                    pixel = pixelDash;
                }
            }
        }

        // returning permeability of the boundary
        var permeability = Math.round(pixel[0]/10)/10;
        var angle = (pixel[1] - 90);
        return [permeability, angle];
    }
    return false;
}

function distance(p1, p2) {
    return Math.sqrt(Math.pow((p1[0] - p2[0]), 2) + Math.pow((p1[1] - p2[1]), 2) );
}

function findRegion (x, y) {
    var min = distance([x, y], allRegions[0].center);
    var minRegion = 0;
    for (var i = 1; i < allRegions.length; i++) {
        var dist = distance([x, y], allRegions[i].center);
        if (dist < min) {
            min = dist;
            minRegion = i;
        }
    }
    return allRegions[minRegion].id;
}

// Person
class Person {
    static allPersons = [];
    constructor(regionID, center, radius, mobilityFactor, isInfected = false) {
        this.div = document.createElement("div");
        this.div.style.width = "4px";
        this.div.style.height = "4px";
        this.div.style.borderRadius = "50%";
        this.div.style.background = "#000000";
        this.div.style.position = "absolute";

        // Region specification
        this.originalRegion = regionID;
        this.currentRegion = regionID;
     
        // Init position
        this.x = center[0] + radius * Math.random() * (Math.random()>0.5?1:-1);
        this.y = center[1] + radius * Math.random() * (Math.random()>0.5?1:-1);
        this.div.style.left = this.x;
        this.div.style.top = this.y;
     
        // Init velocity
        this.velX = Math.random() * mobilityFactor * (Math.random()>0.5?1:-1);
        this.velY = Math.random() * mobilityFactor * (Math.random()>0.5?1:-1);

        // Setting other parameters
        this.isInfected = isInfected;
        this.isImmune = false;

        if(this.isInfected){
            this.getInfected();
        }
        this.infectedDuration = 0;

        // The value of Healthiness Coefficient is between 0 and 1.
        // 0 means, instant death when is infected.
        // 1 means, highly healthy and will recover from the disease sooner or later
        this.healthinessCoefficient = 0.5;

        document.body.appendChild(this.div);
        Person.allPersons.push(this);
     
        this.update(false);
    }
    updatePosition (rerender, sign = 1) {
        // Checking for lockdown condition and adjusting the mobility
        if (regionsUnderLockDown.has(this.currentRegion)) {
            this.x = this.x + sign * this.velX * lockdownMobilityMultiplier;
            this.y = this.y + sign * this.velY * lockdownMobilityMultiplier;
        } else {
            this.x = this.x + sign * this.velX;
            this.y = this.y + sign * this.velY;
        }

        // Update it on the canvas
        if (rerender) {
            this.div.style.left = this.x;
            this.div.style.top = this.y;
        }
    }
    updateRegion () {
        // Finding the region to which the point belongs to
        var newRegion = findRegion(this.x, this.y);

        // Update stats from previous region and current region
        if (this.isInfected) {
            regionStats[this.currentRegion].numSickPeople--;
            regionStats[newRegion].numSickPeople++;
        } else if (this.isImmune) {
            regionStats[this.currentRegion].numCuredPeople--;
            regionStats[newRegion].numCuredPeople++;
        } else {
            regionStats[this.currentRegion].numUninfectedPeople--;
            regionStats[newRegion].numUninfectedPeople++;
        }

        // Update region
        this.currentRegion = newRegion;
    }
    update(rerender) {
        // Update position
        this.updatePosition(rerender);

        // Update velocity upon hitting boundaries
        var boundaryValue = getBoundaryValueAt(this.x, this.y);
        if (boundaryValue) { // Hitting a boundary
            var permeability = boundaryValue[0];
            var boundaryAngle = boundaryValue[1];

            // Preventing people from being stuck inside boundary
            // and updating the velocity

            // In accordance with permeability probability
            if (Math.random() > (1 - permeability)){ // reflecting
                var velMag = Math.sqrt(this.velX * this.velX + this.velY * this.velY);
                var velAng = Math.round(Math.atan(this.velY/this.velX) * 180 / Math.PI);
                if (this.velX < 0) {
                    velAng += 180;
                }
                var newVelAngInRadian = (2 * boundaryAngle - velAng) * Math.PI / 180;

                this.updatePosition(false, -1); // We know that this is temporary
                this.velX = velMag * Math.cos(newVelAngInRadian);
                this.velY = velMag * Math.sin(newVelAngInRadian);
                this.updatePosition(rerender);
            } else { // crossing the boundary
                do {
                    this.updatePosition(rerender);
                    var newBoundaryValue = getBoundaryValueAt(this.x, this.y);
                } while (newBoundaryValue);
                this.updateRegion();
            }
        }

        // Update disease catching: if there are sick people nearby
        if (!(this.isImmune || this.isInfected)) {
            for (var i = 0; i < Person.allPersons.length; i++){
                var person2 = Person.allPersons[i];
                // if person is nearby
                if (person2.isInfected) {
                    var dist = distance([this.x, this.y], [person2.x, person2.y]);
                    // Transmit with probability
                    if(dist < spreadRadius && Math.random() < transmissionProbability){
                        this.getInfected();
                        break;
                    }
                }
            }
        }

        // Sickness
        if(this.isInfected){
            this.infectedDuration++;
            if(this.infectedDuration > curePeriod){
                this.getCuredWithoutMedicine();
            } else {
                // Kill with probability:
                if(Math.random() < killProbability){
                    this.kill();
                    //clearInterval(updateVar);
                }
            }
        }
    }

    getCuredWithoutMedicine () {
        this.isInfected = false;
        this.isImmune = true;
        this.div.style.background = "#00ff00";
        regionStats["allRegions"].numCuredPeople++;
        regionStats["allRegions"].numSickPeople--;
        regionStats[this.currentRegion].numCuredPeople++;
        regionStats[this.currentRegion].numSickPeople--;
    }

    getCuredWithMedicine () {
        if (!this.isInfected) { // failsafe
            throw "Only infected people may be provided with the medicine.";
        }
        this.isInfected = false;
        this.isImmune = false;
        this.div.style.background = "#000000";
        regionStats["allRegions"].numUninfectedPeople++;
        regionStats["allRegions"].numSickPeople--;
        regionStats[this.currentRegion].numUninfectedPeople++;
        regionStats[this.currentRegion].numSickPeople--;
    }
 
    getInfected () {
        this.isInfected = true;
        this.div.style.background = "#ff0000";
        regionStats["allRegions"].numSickPeople++;
        regionStats["allRegions"].numUninfectedPeople--;
        regionStats[this.currentRegion].numSickPeople++;
        regionStats[this.currentRegion].numUninfectedPeople--;
    }

    getVaccinated () {
        if (this.isInfected || this.isImmune) { // failsafe
            throw "Only uninfected person may get vaccinated.";
        }
        this.isImmune = true;
        regionStats["allRegions"].numCuredPeople++;
        regionStats["allRegions"].numUninfectedPeople--;
        regionStats[this.currentRegion].numCuredPeople++;
        regionStats[this.currentRegion].numUninfectedPeople--;
    }
 
    kill () {
        this.div.parentElement.removeChild(this.div);
        regionStats["allRegions"].numDeadPeople++;
        regionStats["allRegions"].numSickPeople--;
        regionStats[this.currentRegion].numDeadPeople++;
        regionStats[this.currentRegion].numSickPeople--;

        // Deleting the dead person from the simulation
        var index = Person.allPersons.findIndex((p) => p === this);
        delete(Person.allPersons[index]);
        Person.allPersons.splice(index, 1);
    }
}

// Controlling the simulation
var loopHandle = [];
var iterCount = 0;

function update (rerender) {
    Person.allPersons.forEach((person) => person.update(rerender));
    console.log(iterCount++);
}

function play () {
    console.log('play');
    loopHandle = setInterval(function () {
        // Updating position at every timestep.
        // Re-rendering only at a particular interval.
        update(iterCount % rerenderInterval === 0);
        updateStatsViewer();
        statsStorage.push(JSON.parse(JSON.stringify(regionStats)));
        checkIterationkAndDistributeVaccine();
        checkIterationkAndDistributeMedicine();
        checkLockDownCondition();
        if (regionStats["allRegions"].numSickPeople === 0) {
            pause();
            alert('No more sick people');
        }
    }, 50);
}

function pause () {
    console.log('pause');
    clearInterval(loopHandle);
}

function checkIterationkAndDistributeVaccine () {
    if (
        iterCount >= vaccineDistributionStartTime &&
        (iterCount - vaccineDistributionStartTime) % vaccineDistributionFrequency === 0
    ) {
        distributeVaccine(vaccineDistributionQuantity, vaccineDistributionMechanism);
    }
}

function checkIterationkAndDistributeMedicine () {
    if (
        iterCount >= medicineDistributionStartTime &&
        (iterCount - medicineDistributionStartTime) % medicineDistributionFrequency === 0
    ) {
        distributeMedicine(medicineDistributionQuantity, medicineDistributionMechanism);
    }
}

function checkLockDownCondition () {
    for (region in regionStats) {
        var s = regionStats[region];
        var ratio = s.numSickPeople / (s.numCuredPeople + s.numUninfectedPeople + s.numSickPeople);

        if (ratio > lockdownStartThreshold) {
            // Implement lockdown
            regionsUnderLockDown.add(region);
        } else if (ratio < lockdownEndThreshold) {
            // End lockdown
            regionsUnderLockDown.delete(region);
        }
    }
}

// Getting the data from from the JSON file associated and getting started with it.
function main(data) {
    // Setting Global Variables
    boundaryThickness = data.boundaryThickness;
    spreadRadius = data.spreadRadius;
    curePeriod = data.curePeriod;
    killProbability = data.killProbability;
    transmissionProbability = data.transmissionProbability;

    lockdownStartThreshold = data.lockdownStartThreshold;
    lockdownEndThreshold = data.lockdownEndThreshold;
    lockdownMobilityMultiplier = data.lockdownMobilityMultiplier;

    vaccineDistributionStartTime = data.vaccineDistributionStartTime;
    vaccineDistributionFrequency = data.vaccineDistributionFrequency;
    vaccineDistributionQuantity = data.vaccineDistributionQuantity;
    vaccineDistributionMechanism = data.vaccineDistributionMechanism;

    medicineDistributionStartTime = data.medicineDistributionStartTime;
    medicineDistributionFrequency = data.medicineDistributionFrequency;
    medicineDistributionQuantity = data.medicineDistributionQuantity;
    medicineDistributionMechanism = data.medicineDistributionMechanism;

    // Adding boundaries and generating people in accordance with region data
    data.boundaries.forEach((boundary) => addBoundary(boundary));
    data.regions.forEach((region) => addRegion(region));

    // Storing region information
    allRegions = data.regions;

    play();
}
fetch(environmentJSONFile)
  .then(response => response.json())
  .then(data => main(data));
