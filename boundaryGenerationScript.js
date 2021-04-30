// This file may be run using NodeJS to generate a hexagonal mesh (honeycomb)
// of regions and boundaries
'use strict';
const fs = require('fs');

var maxLevel = 2;

var canvasSize = 10000;
var hexSideLength = 500;
var center = canvasSize / 2;

// Boundaries of a hexagon scaled to unit values
var unitBoundaries = [
    [0.5,-0.866,-0.5,-0.866],
    [-0.5,-0.866,-1,0],
    [-1,0,-0.5,0.866],
    [-0.5,0.866,0.5,0.866],
    [0.5,0.866,1,0],
    [1,0,0.5,-0.866]
];

// In a honeycomb of aforementioned hexagons,
// the centers of the next hexagons would be as follows
var unitDistBetweenCenters = 1.732; // Math.sqrt(3);
var nextUnitPoints = []; // 6 points at next level
for (var i = 0; i < 6; i++) {
    var theta = i * 60 * Math.PI / 180 + 30 * Math.PI / 180;
    nextUnitPoints.push([
        (unitDistBetweenCenters * Math.cos(theta)).toFixed(3),
        (unitDistBetweenCenters * Math.sin(theta)).toFixed(3)
    ]);
}
// The radius of the center from which random coordinates of people are generated.
var unitRadius = 0.5;

// All the generated boundaries for the honeycomb shall be stored here
var generatedBoundaries = [];
var generatedHexCenters = []; var generatedHexCentersWithLevel = [];
var generatedRegions = [];

function addBoundaryIfInexistent (boundary) {
    var allStr = JSON.stringify(generatedBoundaries);
    var boundaryStr = JSON.stringify(boundary);

    var alternateBoundaryStr = JSON.stringify([
        boundary[2], boundary[3], boundary[0], boundary[1], boundary[4]
    ]);
    if(allStr.indexOf(boundaryStr) === -1
        && allStr.indexOf(alternateBoundaryStr) === -1) {
        generatedBoundaries.push(boundary);
    }
}

function addCenterIfInexistent (center) {
    var allStr = JSON.stringify(generatedHexCenters);
    var centerStr = JSON.stringify(center);
    if(allStr.indexOf(centerStr) === -1) {
        generatedHexCenters.push(center);
        return true;
    }
    return false;
}

function generateHexagons (xCenter, yCenter) {
    // Adding the center to the list
    addCenterIfInexistent([xCenter, yCenter]); // pushes to 'generatedHexCenters'

    var prevCount = 0;

    for (var j = 0; j < maxLevel; j++) {
        var currentCount = generatedHexCenters.length;
        for (var k = prevCount; k < currentCount; k++) {
            for (var i = 0; i < 6; i++) {
                addCenterIfInexistent([
                    generatedHexCenters[k][0] + nextUnitPoints[i][0] * hexSideLength,
                    generatedHexCenters[k][1] + nextUnitPoints[i][1] * hexSideLength
                ]);
            }
        }
        prevCount = currentCount;
    }

    // Generate hexagon at this level
    for (var k = 0; k < generatedHexCenters.length; k++) {
        for (var i = 0; i < unitBoundaries.length; i++) {
            var boundary = [];
            for (var j = 0; j < unitBoundaries[i].length; j+=2) {
                boundary.push(unitBoundaries[i][j] * hexSideLength + generatedHexCenters[k][0]);
                boundary.push(unitBoundaries[i][j + 1] * hexSideLength + generatedHexCenters[k][1]);
            }
            boundary.push(1); // Permeability
            addBoundaryIfInexistent(boundary);
        }
    }
}

function generateRegionObject(id, center) {
    var region = {};
    region.id = "region" + id;
    region.center = center;

    // Perhaps the following could be automatically generated according to some logic in the future
    region.population = 100;
    region.infected = 10;
    region.radius = unitRadius * hexSideLength;
    region.mobilityFactor = 5;

    return region;
}

function generateRegions(centers) {
    for (var i = 0; i < centers.length; i++) {
        generatedRegions.push(generateRegionObject(i.toString(), centers[i]));
    }
}

generateHexagons(center, center);
generateRegions(generatedHexCenters);

// Constructing the output JSON through JavaScript object stringification
var outdata = {};
outdata.boundaryThickness = 10;
outdata.spreadRadius = 5;
outdata.curePeriod = 500;
outdata.killProbability = 0.001;
outdata.transmissionProbability = 0.7;

outdata.lockdownStartThreshold = 0.2; // when 20% are infected, lockdown starts
outdata.lockdownEndThreshold = 0.05; // when 5% are infected, lockdown ends
outdata.lockdownMobilityMultiplier = 0.1; // velocity will be multiplied by this value

outdata.vaccineDistributionStartTime = 50;
outdata.vaccineDistributionFrequency = 200;
outdata.vaccineDistributionQuantity = 200;
// Options: 'maximumInfection', 'maximumUninfected', 'infectedAndUninfected', equitable'
outdata.vaccineDistributionMechanism = 'equitable';


outdata.medicineDistributionStartTime = 50;
outdata.medicineDistributionFrequency = 200;
outdata.medicineDistributionQuantity = 200;
// Options: 'maximumInfection', 'maximumUninfected', 'infectedAndUninfected', equitable'
outdata.medicineDistributionMechanism = 'equitable';

outdata.boundaries = generatedBoundaries;
outdata.regions = generatedRegions;

var output = JSON.stringify(outdata, null, 2);
fs.writeFileSync('honeycomb.json', output);