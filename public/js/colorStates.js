let currentColorArray = {};
const sortObj = (obj) => {
    return Object.entries(obj)
        .sort(([, a], [, b]) => a - b)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
}
(async () => {
    await loadStates().then(() => {
        let covidDeathOverPopulation = {}

        let stateKeys = Object.keys(stateJSON);
        stateKeys.forEach((value) => {
            currentColorArray[value] = "#88A4BC";
        })

        let minMaxKey = stateJSON[Object.keys(stateJSON)[0]].shortName
        let covidDeathOverPopulationMax = [minMaxKey, (stateJSON[Object.keys(stateJSON)[0]].death / stateJSON[Object.keys(stateJSON)[0]].population) * 100]
        let covidDeathOverPopulationMin = [minMaxKey, (stateJSON[Object.keys(stateJSON)[0]].death / stateJSON[Object.keys(stateJSON)[0]].population) * 100]
        console.log(covidDeathOverPopulationMax)
        for (const [key, value] of Object.entries(stateJSON)) {
            let shortName = value.shortName;
            covidDeathOverPopulation[value.shortName] = (value.death / value.population) * 100
            if (((value.death / value.population) * 100) > covidDeathOverPopulationMax[1]) {
                covidDeathOverPopulationMax = [shortName, (value.death / value.population) * 100]
            }
            if (((value.death / value.population) * 100) < covidDeathOverPopulationMin[1]) {
                covidDeathOverPopulationMin = [shortName, (value.death / value.population) * 100]
            }
        }

        for (const [key, value] of Object.entries(covidDeathOverPopulation)) {
            covidDeathOverPopulation[key] = value - covidDeathOverPopulationMin[1]
        }


        let colorMultiplier = 254 / (covidDeathOverPopulationMax[1] - covidDeathOverPopulationMin[1]);
        let covidDeathOverPopulationColors = {};
        let covidDeathOverPopulationColorsNormalized = {};



        for (const [key, value] of Object.entries(covidDeathOverPopulation)) {
            let shadeOfRed = 255 - (value * colorMultiplier);
            covidDeathOverPopulationColors[key] = `rgb(255,${shadeOfRed},${shadeOfRed})`;
        }
        let i = 0
        for (const [key, value] of Object.entries(sortObj(covidDeathOverPopulation))) {
            covidDeathOverPopulationColorsNormalized[key] = `rgb(255, ${255 - (i * (255 / 50))}, ${255 - (i * (255 / 50))})`;
            i++;
        }

        document.querySelector('#colorPolitics').addEventListener("click", () => { colorStates(colorArray) })
        document.querySelector('#colorDeathPop').addEventListener("click", () => { colorStates(covidDeathOverPopulationColors) })
        document.querySelector('#colorDeathPopNormalized').addEventListener("click", () => { colorStates(covidDeathOverPopulationColorsNormalized) })

        // simplemaps_usmap.mapdata.state_specific[key].color = `rgb(255,${shadeOfRed},${shadeOfRed})`
    })
})();

const colorStates = function (colorObj) {
    for (const [key, value] of Object.entries(colorObj)) {
        simplemaps_usmap.mapdata.state_specific[key].color = value;
    }
    currentColorArray = colorObj;
    simplemaps_usmap.load();
}

const customColorStates = function (param, top, bottom) {
    let colorObj = {};
    let min = 1;
    let max = 1;
    if (top === null) {
        let min = stateJSON[Object.keys(stateJSON)[0]][param];
        let max = stateJSON[Object.keys(stateJSON)[0]][param];
    }
    else if (param === null && bottom === null) {
        top.forEach((value, index) => {
            min *= stateJSON[Object.keys(stateJSON)[0]][top[index]];
            max *= stateJSON[Object.keys(stateJSON)[0]][top[index]];
        })
    } else {
        top.forEach((value, index) => {
            min *= stateJSON[Object.keys(stateJSON)[0]][top[index]];
            max *= stateJSON[Object.keys(stateJSON)[0]][top[index]];
        })
        let bottomFactor = 1;
        bottom.forEach((value, index) => {
            bottomFactor *= stateJSON[Object.keys(stateJSON)[0]][bottom[index]]
        })
        min /= bottomFactor;
        max /= bottomFactor;
    }

    for (const [key, value] of Object.entries(stateJSON)) {
        if (top === null) {
            colorObj[key] = stateJSON[key][param]
            if (colorObj[key] < min) {
                min = colorObj[key];
            }
            if (colorObj[key] > max) {
                max = colorObj[key];
            }
        }
        else if (param === null) {
            let topFactor = 1;
            top.forEach((value) => {
                topFactor *= stateJSON[key][value]
            })
            console.log("TOP: ", topFactor)
            colorObj[key] = topFactor;
            if (topFactor < min) {
                min = topFactor;
            }
            if (topFactor > max) {
                max = topFactor;
            }
        }
        if (bottom !== null && param === null) {
            let bottomFactor = 1;
            bottom.forEach((value) => {
                bottomFactor *= stateJSON[key][value]
            })
            colorObj[key] /= bottomFactor;
            if (colorObj[key] < min) {
                min = colorObj[key];
            }
            if (colorObj[key] > max) {
                max = colorObj[key];
            }
        }
    }
    for (const [key, value] of Object.entries(colorObj)) {
        colorObj[key] = value - min;
    }
    colorObj = sortObj(colorObj);
    console.log(colorObj)
    let totalElements = Object.keys(colorObj).length;
    let i = 0;
    for (const [key, value] of Object.entries(colorObj)) {
        console.log(`rgb(255, ${255 - (255 * (i / totalElements))}, ${255 - (255 * (i / totalElements))})`)
        simplemaps_usmap.mapdata.state_specific[key].color = `rgb(255, ${255 - (255 * (i / totalElements))}, ${255 - (255 * (i / totalElements))})`;
        colorObj[key] = `rgb(255, ${255 - (255 * (i / totalElements))}, ${255 - (255 * (i / totalElements))})`;
        i++;
    }
    currentColorArray = colorObj;
    simplemaps_usmap.load();
};