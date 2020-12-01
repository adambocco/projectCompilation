$("#slider").roundSlider();                                             // Initialize slider component in slider div
let animationAngle = $("#slider").data("roundSlider");                  // Select element for retrieving value of slider
simplemaps_select.map=simplemaps_countymap                              // Tell simplemaps which map to use for selecting
let animationColor = {r:0,g:0,b:0};                                     // Default animation color white->black
Object.keys(simplemaps_countymap_mapinfo.names).forEach((v)=> {
    colorObj[v]="#88A4BC";                                              // Set default map colors (colorObj in mapdata.js:0)
})

//Create array of data in countyData.json object to work with sorting
let countyDataArray = Object.values(countyData);
countyDataArray.splice(3, 1); // Get rid of DC

// Holds statistics for create an expression function : tagName and keys
let numerators = [];
let denominators = [];
let descriptions = [];

// Select filter buttons
let weatherButton = document.querySelector('#weatherButton');
let populationButton = document.querySelector('#populationButton');
let covidButton = document.querySelector('#covidButton');
let politicsButton = document.querySelector('#politicsButton');
let crimeButton = document.querySelector('#crimeButton');
let housingButton = document.querySelector('#housingButton');

// Converts value of color chooser element to rgb
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

document.querySelector('#animationSave').addEventListener("click", (ev) => {
    let d = document.querySelector('#colorChooser');
    animationColor = hexToRgb(d.value);
})

// TODO! clear colors should color by animation color
document.querySelector('#clearColors').addEventListener("click", () => {
    describeCounties();
    Object.keys(simplemaps_countymap_mapdata.state_specific).forEach(v => {
        simplemaps_countymap_mapdata.state_specific[v].color = `rgb(${200},${200},${200})`;
    })
    simplemaps_countymap.load();
})

const describeCounties = function(oneTimeDescriptions) {
    let repeats = [];
    descriptions.forEach((v,i)=> {
        for (let i2=i;i2<Object.keys(descriptions).length;i2++) {
            if (descriptions[i2].tagName == v.tagName && (repeats.includes(v.tagName))) {
                descriptions.splice(i2, 1);
            }
            else {
                repeats.push(v.tagName);
            }
        }
    })
    countyDataArray.forEach(v=> {
        let formattedDescription = "";
        descriptions.forEach(v2=> {
            try {
                formattedDescription += (v2.tagName+v[v2.keys[0]][v2.keys[1]] + '<br>');
            }catch(err) {console.log(err)}
        })
        if (oneTimeDescriptions != null) {
            let repeats2 = [];
            oneTimeDescriptions.forEach(v2=> {
                try {
                    if (!repeats2.includes(v2.tagName) && !repeats.includes(v2.tagName)) {
                        formattedDescription += (v2.tagName+v[v2.keys[0]][v2.keys[1]]+'<br>');
                        repeats2.push(v2.tagName);
                    }
                } catch(err) {console.log(err)}
            })
        }
        simplemaps_countymap_mapdata.state_specific[v.fip].description = formattedDescription;
    })
}

// Called by Add Description dropdown elementcountyDataArray.sort((a, b) => ((a.covid == null || a.covid[stat] == "") ? 1 : (b.covid == null || b.covid[stat] == "") ? -1 : (a.covid[stat] == b.covid[stat]) ? 0 : (parseInt(a.covid[stat]) > parseInt(b.covid[stat])) ? 1 : -1));
const addDescription = function(tagName, keys) {                        
    let exists = false;
    descriptions.forEach((v)=> {
        if (v.tagName == tagName) {
            exists = true;
        }
    })
    if (!exists) {                                                      // Adds if description isn't already selected
        descriptions.push({'tagName':tagName, 'keys': keys});
        let descriptionButton = document.createElement('button');
        descriptionButton.setAttribute('type', 'button');
        descriptionButton.className = "btn btn-success m-1"
        descriptionButton.innerHTML = tagName+ " &times;";
        descriptionButton.onclick = (ev)=> {
            descriptions.forEach((v, index, object)=> {
                if (v.tagName == tagName) {
                    object.splice(index, 1);
                }
            })
            ev.currentTarget.remove()
        }
        document.querySelector('#selectedDescriptions').appendChild(descriptionButton);
    }
}

//Simplemap hooks
simplemaps_countymap.hooks.click_state = function(id) {
    if (document.querySelector('#selectedCounty'+id) == null && !simplemaps_select.selected.includes(id)) {
        let countyElement = document.createElement('div');              //Create box for selected county in Selected Counties
        countyElement.id = "selectedCounty"+id;
        countyElement.innerHTML = `
            <h3>${countyData[id].name}</h3>
            <button class="btn btn-danger w-100 btn-small" type="button" onclick="deleteCounty(${id});">Delete</button>
        `;
        descriptions.forEach((v)=> {                                    // Add descriptions selected for each county
            countyElement.innerHTML += `
                <p>
                    <span class="font-weight-bold">${v.tagName}</span>
                    <span>${countyData[id][v.keys[0]][v.keys[1]]}</span>
                </p>
            `;
        })
        document.querySelector('#selectedCounties').appendChild(countyElement);
    } else {                                                            // Remove element when county deselected
        document.querySelector('#selectedCounty'+id).remove()
    }
}

const deleteCounty = function(id) {                             // Deletes county element and deselects from map ^See SimplemapHooks
    document.querySelector('#selectedCounty'+id).remove();
    let strId = id.toString();
    simplemaps_select.deselect(strId);
}

// Opens an area to create an expression to filter the map with
document.querySelector('#createExpression').addEventListener("click", () => {
    let exprArea = document.querySelector('#expressionArea');
    if (document.querySelector('#expressionCreate') == null) {
        let expr = document.createElement('div');
        expr.className = "row m-1"
        expr.id = "expressionCreate";
        let toolsDisplay = `
            <div class="col text-center m-1 p-1">
                <div class="dropdown">
                    <button class="btn btn-info btn-outline-dark dropdown-toggle m-1" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Numerator
                    </button>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator('County Population: ',['population', 'countyPopulation'],'numerators');">County Population</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator('County Population Density: ',['population', 'countyPopulationDensity'],'numerators');">County Population Density</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator('State Population: ',['population', 'statePopulation'],'numerators');">State Population</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator('State Population Density: ',['population', 'statePopulationDensity'],'numerators');">State Population Density</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator('COVID-19 Cases: ',['covid', 'cases'],'numerators');">COVID-19 Cases</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator('COVID-19 Deaths: ',['covid', 'deaths'],'numerators');">COVID-19 Deaths</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator(['covid', 'something']);">COVID-19 Something</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator(['covid', 'something']);">COVID-19 Something</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator('COVID-19 New Cases: ',['covid', 'newCases'],'numerators');">COVID-19 New Cases</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator([]);">Something</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator([]);">Something</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator([]);">Something</a>
                    </div>
                </div>
                <div class="dropdown">
                    <button class="btn btn-info btn-outline-dark dropdown-toggle m-1" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Denominator
                    </button>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator('County Population: ',['population', 'countyPopulation'], 'denominators');">County Population</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator('County Population Density: ',['population', 'countyPopulationDensity'], 'denominators');">County Population Density</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator('State Population: ',['population', 'statePopulation'], 'denominators');">State Population</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator('State Population Density: ',['population', 'statePopulationDensity'], 'denominators');">State Population Density</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator('COVID-19 Cases: ',['covid', 'cases'], 'denominators');">COVID-19 Cases</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator('COVID-19 Deaths: ',['covid', 'deaths'], 'denominators');">COVID-19 Deaths</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator(['covid', 'something'], 'denominators');">COVID-19 Something</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator(['covid', 'something'], 'denominators');">COVID-19 Something</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator('COVID-19 New Cases: ',['covid', 'newCases'], 'denominators');">COVID-19 New Cases</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator([]);">Something</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator([]);">Something</a>
                        <a class="dropdown-item" onclick="addNumeratorOrDenominator([]);">Something</a>
                    </div>
                </div>
                <button id="executeExpression" onclick="executeExpression();" type="button" class="btn btn-success btn-outline-primary m-1">Execute</button>
                <button id="clearExpression" onclick="clearExpression();" type="button" class="btn btn-warning btn-outline-danger m-1">Clear</buttons>
            </div>
        `;
        let exprDisplay = `
            <div class="col text-center">
                <h5>Numerator</h5>
                <div id="numerators" class="border"></div>
                <h5>Denominators</h5>
                <div id="denominators" class="border"></div>
            </div>
        `;
        expr.innerHTML = toolsDisplay + exprDisplay;
        exprArea.appendChild(expr);
    } else {
        document.querySelector('#expressionCreate').remove()
        numerators = [];
        denominators = [];
    }
})

// Create an expression helper functions
const addNumeratorOrDenominator = function (statName, keys, numOrDenom) {
    let product = numOrDenom == "numerators" ? numerators : denominators;
    product.push({ 'tagName': statName, 'keys': keys });
    let productArea = document.querySelector('#'+numOrDenom)
    if (productArea.innerHTML == "") {
        productArea.innerHTML = statName;
    } else {
        productArea.innerHTML += (" * " + statName);
    }
}

const clearExpression = function () {
    document.querySelector("#numerators").innerHTML = "";
    document.querySelector("#denominators").innerHTML = "";
    numerators = [];
    denominators = [];
}

const executeExpression = function () {
    let oneTimeDescriptions = [];
    denominators.forEach(v=> {
        oneTimeDescriptions.push({'keys':v.keys, 'tagName':v.tagName})
    })
    numerators.forEach(v=> {
        oneTimeDescriptions.push({'keys':v.keys, 'tagName':v.tagName})
    })
    countyDataArray.forEach((value) => {
        try {
            let mulNum = 1;
            let mulDenom = 1;
            simplemaps_countymap_mapdata.state_specific[value.fip].description = "";
            numerators.forEach((value2) => {
                try {
                    let statValue = parseFloat(value[value2.keys[0]][value2.keys[1]]);
                    mulNum *= statValue;
                } catch (err) { console.log(err) }
            })
            denominators.forEach((value2) => {
                try {
                    let statValue = parseFloat(value[value2.keys[0]][value2.keys[1]]);
                    mulDenom *= statValue;
                } catch (err) { console.log(err) }
            })

            let exprValue;
            if (parseInt(mulDenom) == 0) {
                exprValue = mulNum;
            } else { exprValue = mulNum / mulDenom; }
            value['expression'] = {'expressionValue':exprValue};
        } catch (err) { console.log(err) }
    })
    oneTimeDescriptions.push({'tagName': "Expression Value: ",'keys':['expression', 'expressionValue']})
    countyDataArray.sort((a, b) => ((a.expression == null || isNaN(a.expression.expressionValue)) ? 1 : (b.expression == null || isNaN(a.expression.expressionValue)) ? -1 : (a.expression.expressionValue == b.expression.expressionValue) ? 0 : (a.expression.expressionValue > b.expression.expressionValue) ? 1 : -1));
    describeCounties(oneTimeDescriptions);
    setColorsByRank();
    rankSortedArray();
    colorMap();
}

const addStatisticButtonsEL = function (elements, callbacks) {
    elements.forEach((value, index) => {
        value.addEventListener("click", () => {
            callbacks[index]();
        })
    })
}

const colorMap = function () {
    sortByDirection();
    countyDataArray.forEach((value, index) => {
        setTimeout(() => {
            simplemaps_countymap_mapdata.state_specific[value.fip].color = value.color;
            simplemaps_countymap.refresh_state(value.fip);
        }, index)
    })
}

populationButton.addEventListener("click", (ev) => {
    if (document.querySelector("#filterDiv") !== null) {
        document.querySelector("#filterDiv").remove();
    }
    let filterDiv = document.createElement("div");
    filterDiv.id = "filterDiv";
    filterDiv.innerHTML = `
            <h2>
                Population
            </h2>
            <div class="text-center" id="populationArea">
                <button class="btn btn-info m-1" type="button" id="selectPopulation">
                    Population
                </button>
                <button class="btn btn-info m-1" type="button" id="selectPopulationDensity">
                    Population Density
                </button>
            </div>
        `;
    document.querySelector('#filterArea').appendChild(filterDiv);
    let popSelect = document.querySelector("#selectPopulation");
    let popDensitySelect = document.querySelector("#selectPopulationDensity");
    let cb1 = () => {
        countyDataArray.sort((a, b) => ((a.population == null || b.population == null) ? -1 : parseInt(a.population.countyPopulation) > parseInt(b.population.countyPopulation)) ? 1 : -1);
        describeCounties([{'tagName':"County Population: ", 'keys':['population', 'countyPopulation']}]);
        setColorsByRank();
        rankSortedArray();
        colorMap();
    }
    let cb2 = () => {
        countyDataArray.sort((a, b) => ((a.population == null || b.population == null) ? -1 : parseInt(a.population.countyPopulationDensity) > parseInt(b.population.countyPopulationDensity)) ? 1 : -1);
        describeCounties([{'tagName':"County Population Density: ", 'keys':['population', 'countyPopulationDensity']}]);
        setColorsByRank();
        rankSortedArray();
        colorMap();
    }
    addStatisticButtonsEL([popSelect, popDensitySelect], [cb1, cb2]);
})

const rankSortedArray = function () {
    countyDataArray.forEach((value, index) => {
        value["rank"] = index;
    })
}

const sortByDirection = function () {
    Object.keys(countyData).forEach((value, index) => {
        countyData[value]["x"] = simplemaps_countymap_mapinfo.state_bbox_array[value].x;
        countyData[value]["y"] = simplemaps_countymap_mapinfo.state_bbox_array[value].y;
    })
    let angleInput = animationAngle.getValue();
    let xMul, yMul;
    if (parseInt(angleInput) < 25) {
        yMul = angleInput / 25;
        xMul = (25 - angleInput) / 25;
    } else if (parseInt(angleInput) < 50) {
        yMul = (25 - (angleInput - 25)) / 25;
        xMul = -(angleInput - 25) / 25;
    } else if (parseInt(angleInput) < 75) {
        yMul = -(angleInput - 50) / 25;
        xMul = -(25 - (angleInput - 50)) / 25;
    } else {
        yMul = -(25 - (angleInput - 75)) / 25;
        xMul = (angleInput - 75) / 25;
    }
    countyDataArray.sort((a, b) => (a.x == null) ? 1 : (b.x == null) ? -1 : (a.x == b.x) ? 0 : ((parseInt(xMul * a.x) + parseInt(yMul * a.y)) > (parseInt(xMul * b.x) + parseInt(yMul * b.y))) ? 1 : -1);
}

const setColorsByRank = function () {
    for (let h = 0; h < countyDataArray.length; h++) {
        try {
            let len = countyDataArray.length;
            let r = 255 - ((h/len)*(255 - animationColor.r));
            let g = 255 - ((h/len)*(255 - animationColor.g));
            let b = 255 - ((h/len)*(255 - animationColor.b));
            countyDataArray[h]["color"] = `rgb(${r},${g},${b})`;
        } catch (err) { console.log(err) }
    }
}

covidButton.addEventListener("click", () => {
    if (document.querySelector("#filterDiv") !== null) {
        document.querySelector("#filterDiv").remove();
    }
    let filterDiv = document.createElement("div");
    filterDiv.id = "filterDiv";
    filterDiv.innerHTML = `
            <h2>
                COVID-19 
            </h2>
            <div class="text-center" id="populationArea">
                <button class="btn btn-info m-1" type="button" id="selectCases">
                    Cases
                </button>
                <button class="btn btn-info m-1" type="button" id="selectDeath">
                    Deaths
                </button>
                <button class="btn btn-info m-1" type="button" id="selectPositive">
                    Positive Tests
                </button>
                <button class="btn btn-info m-1" type="button" id="selectNegative">
                    Negative Tests
                </button>
                <button class="btn btn-info m-1" type="button" id="selectNewCases">
                    New Cases
                </button>
            </div>
        `;
    document.querySelector('#filterArea').appendChild(filterDiv);
    let covidButtons = [
        document.querySelector("#selectCases"),
        document.querySelector("#selectDeath"),
        document.querySelector("#selectPositive"),
        document.querySelector("#selectNegative"),
        document.querySelector("#selectNewCases")
    ]

    let cb = function (stat) {
        countyDataArray.sort((a, b) => ((a.covid == null || a.covid[stat] == "") ? 1 : (b.covid == null || b.covid[stat] == "") ? -1 : (a.covid[stat] == b.covid[stat]) ? 0 : (parseInt(a.covid[stat]) > parseInt(b.covid[stat])) ? 1 : -1));
        let tn = (stat == "cases" ? "COVID-19 Cases: " : stat == "deaths" ? "COVID-19 Deaths: " : stat == "positiveTests" ? "Total Tested Positive: " : stat == "negativeTests" ? "Total Tested Negative: " : "COVID-19 New Cases: ");
        describeCounties([{'tagName':tn, 'keys':['covid', stat]}])
        setColorsByRank();
        rankSortedArray();
        colorMap();
    }
    let covidCallbacks = [
        () => cb("cases"),
        () => cb("deaths"),
        () => cb("positiveTests"),
        () => cb("negativeTests"),
        () => cb("newCases")
    ]
    addStatisticButtonsEL(covidButtons, covidCallbacks);
})

const setColorsByPolitics = function (gov, sen, house) {
    let total = gov + sen + house;
    countyDataArray.forEach((value, index) => {
        let houseReps = value.house.length;
        let houseParty = 0;
        value.house.forEach((rep) => {
            if (rep.party == 'D') {
                houseParty++;
            } else if (rep.party == 'R') {
                houseParty--;
            }
        })
        let senParty = 0;
        value.senate.forEach((rep) => {
            if (rep.party == 'D') {
                senParty++;
            } else if (rep.party == 'R') {
                senParty--;
            }
        })
        let govWeight;
        if (value.governor.party == "D") {
            govWeight = gov / total;
        }
        else {
            govWeight = -gov / total;
        }
        let houseWeight = (houseParty / houseReps) * (house / total);
        let senWeight = (senParty / 2) * (sen / total);
        let totalWeight = govWeight + senWeight + houseWeight;
        if (totalWeight > 0) {
            value.color = `rgb(${230 - (totalWeight * 230)},${230 - (totalWeight * 230)},${255})`;
        } else {
            value.color = `rgb(${255},${230 + (totalWeight * 230)},${230 + (totalWeight * 230)})`;
        }
    })
    sortByDirection();
    colorMap();
}


politicsButton.addEventListener("click", () => {
    if (document.querySelector("#filterDiv") !== null) {
        document.querySelector("#filterDiv").remove();
    }
    let filterDiv = document.createElement("div");
    filterDiv.id = "filterDiv";
    filterDiv.innerHTML = `
            <h2>
                Politics
            </h2>
            <div class="text-center">
                <div class="border p-1 m-1">
                    <h3>Choose weights for elected officials</h5>
                    <div class="slidecontainer">
                    <h5>Governor: </h5><span id="govValueDisplay">50</span>%
                        <input type="range" min="0" max="100" value="50" class="slider" id="govRange">
                    </div>
                    <div class="slidecontainer">
                    <h5>Senators: </h5><span id="senValueDisplay">25</span>%
                        <input type="range" min="0" max="100" value="25" class="slider" id="senRange">
                    </div>
                    <div class="slidecontainer">
                    <h5>House Representatives: </h5><span id="houseValueDisplay">25</span>%
                        <input type="range" min="0" max="100" value="25" class="slider" id="houseRange">
                    </div>
                    <p style="display:none;" id="percentWarning">Enter cumulative percent < 100%</p>
                    <br><button type="button" class="btn btn-info w-100 m-auto" id="politicsExecute">Execute</button>
                </div>
            </div>
        `;
    document.querySelector('#filterArea').appendChild(filterDiv);

    let govSlider = document.querySelector('#govRange');
    let govValueDisplay = document.querySelector('#govValueDisplay')
    govSlider.oninput = function () {
        govValueDisplay.innerHTML = this.value;
    }
    let senSlider = document.querySelector('#senRange');
    let senValueDisplay = document.querySelector('#senValueDisplay')
    senSlider.oninput = function () {
        senValueDisplay.innerHTML = this.value;
    }
    let houseSlider = document.querySelector('#houseRange');
    let houseValueDisplay = document.querySelector('#houseValueDisplay')
    houseSlider.oninput = function () {
        houseValueDisplay.innerHTML = this.value;
    }
    document.querySelector('#politicsExecute').addEventListener("click", () => {
        let percentWarning = document.querySelector('#percentWarning');
        let govPercent = parseInt(document.querySelector('#govValueDisplay').innerHTML);
        let senPercent = parseInt(document.querySelector('#senValueDisplay').innerHTML);
        let housePercent = parseInt(document.querySelector('#houseValueDisplay').innerHTML);
        if (percentWarning.style.display == "block") {
            percentWarning.style.display = "none";
        }
        if ((govPercent + senPercent + housePercent) > 100) {
            percentWarning.style.display == "block";
        } else {
            setColorsByPolitics(govPercent, senPercent, housePercent)
        }
    })
})


housingButton.addEventListener("click", (ev) => {
    if (document.querySelector("#filterDiv") !== null) {
        document.querySelector("#filterDiv").remove();
    }
    let filterDiv = document.createElement("div");
    filterDiv.id = "filterDiv";
    filterDiv.innerHTML = `
            <h2>
                Housing
            </h2>
            <div class="text-center" id="populationArea">
                <button class="btn btn-info m-1" type="button" id="selectHousingUnits">
                    Housing Units Estimate
                </button>
            </div>
        `;
    document.querySelector('#filterArea').appendChild(filterDiv);
    let housingSelect = document.querySelector("#selectHousingUnits");
    let cb1 = () => {
        countyDataArray.sort((a, b) => ((a.housing == null || a.housing['housingUnitEstimate'] == "") ? 1 : (b.housing == null || b.housing['housingUnitEstimate'] == "") ? -1 : (a.housing['housingUnitEstimate'] == b.housing['housingUnitEstimate']) ? 0 : (parseInt(a.housing['housingUnitEstimate']) > parseInt(b.housing['housingUnitEstimate'])) ? 1 : -1));
        countyDataArray.forEach((v)=> {
            simplemaps_countymap_mapdata.state_specific[v.fip].description += ("Housing Units: "+v.housing.housingUnitEstimate+"<br>");
        })
        describeCounties([{'tagName':'Housing Units: ','keys':['housing','housingUnitEstime']}])
        setColorsByRank();
        rankSortedArray();
        colorMap();
    }
    addStatisticButtonsEL([housingSelect], [cb1]);
})