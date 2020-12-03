
const { fipsToCountyName } = require('./fipsToCountyName');
const { fipsToStateName } = require('./fipsToStateName');
const { stateCodeToFips } = require('./stateCodeToFips')
const { stateNameToFips } = require('./stateNameToFips');
const { stateCodeToName } = require('./stateCodeToName')
const { stateNameToCode } = require('./stateNameToCode');

const axios = require('axios');
const fs = require('fs');
const Papa = require('papaparse');

let noaakey = process.env.NOAAKEY;
let ppkey = process.env.PPKEY;
let gckey = process.env.GCKEY;
let cankey = process.env.CANKEY;

let houseDataByState = {};
let senateDataByState = {};
let governorDataByState = {};
let covidDataByState = {};
let covidDataByCounty = {};
let censusDataByState = {};
let popDataByCounty = {};
let stateFipsByCountyFips = {};
let housingDataByCounty = {};


function swap(json) {
    let r = {};
    for (let key in json) {
        r[json[key]] = key;
    }
    return r;
}

const loadCongress = async function () {
    let houseResults, senateResults;
    try {
        senateResults = await axios.get('https://api.propublica.org/congress/v1/116/senate/members.json', {
            headers: { 'X-API-Key': ppkey }
        });
    } catch (err) { console.log(err); }
    try {
        houseResults = await axios.get('https://api.propublica.org/congress/v1/116/house/members.json', {
            headers: { 'X-API-Key': ppkey }
        });
    } catch (err) { console.log(err); 0 }
    senateResults = senateResults.data.results[0].members;
    houseResults = houseResults.data.results[0].members;
    senateResults.forEach((value) => {
        if (Object.keys(stateCodeToName).includes(value.state)) {
            senateDataByState[stateCodeToFips[value.state]] = (senateDataByState[stateCodeToFips[value.state]] == null ? [value] : senateDataByState[stateCodeToFips[value.state]].concat(value));
        }
    })
    houseResults.forEach((value) => {
        if (Object.keys(stateCodeToName).includes(value.state)) {
            houseDataByState[stateCodeToFips[value.state]] = (houseDataByState[stateCodeToFips[value.state]] == null ? [value] : houseDataByState[stateCodeToFips[value.state]].concat(value));
        }
    })
};
const loadStateCovid = async function () {
    try {
        let covidResults = await axios.get("https://api.covidtracking.com/v1/states/current.json");
        covidResults.data.forEach((value) => {
            if (Object.keys(stateCodeToName).includes(value.state)) {
                covidDataByState[stateCodeToFips[value.state]] = value;
            }
        })
    } catch (err) { console.log(err) }
};

const loadCountyCovid = async function () {
    try {
        let covidResults = await axios.get("https://api.covidactnow.org/v2/counties.csv?apiKey="+cankey);
        covidResults = Papa.parse(covidResults.data);
        for (let l = 1; l < covidResults.data.length; l++) {
            let value = covidResults.data[l];
            if (Object.keys(fipsToCountyName).includes(value[0])) {
                covidDataByCounty[value[0]] = {
                    "cases":value[23],
                    "deaths":value[24],
                    "testPositivityRatio":value[9],
                    "caseDensity":value[11],
                    "infectionRate": value[13],
                    "newCases": value[36],
                    "lastUpdatedDate":value[37]
                };
            }
        }
    } catch (err) {console.log(err)};
};

const loadStatePop = async function () {
    try {
        let censusResults = await axios.get('https://api.census.gov/data/2019/pep/population?get=DATE_DESC,DENSITY,POP,NAME,STATE&for=state');
        censusResults.data.forEach((value) => {
            Object.keys(fipsToStateName).includes(value[4]) && (censusDataByState[value[4]] = value);
        })
    } catch (err) { console.log(err); }
};

const loadCivics = async function () {
    try {
        await (async () => {
            for (let i = 0; i < Object.keys(stateCodeToName).length; i++) {
                let stateCode = Object.keys(stateCodeToName)[i];
                let civicsResults = await axios.get('https://civicinfo.googleapis.com/civicinfo/v2/representatives/ocd-division%2Fcountry%3Aus%2Fstate%3A' + stateCode.toLowerCase() + '?roles=legislatorUpperBody&roles=headOfGovernment&key=' + gckey);
                let governor = civicsResults.data.officials[2];
                governorDataByState[stateCodeToFips[stateCode]] = governor;
            }
        })()
    } catch (err) { console.log(err); }
};

const loadCountyPop = async function () {
    try {
        let countyPopResults = await axios.get('https://api.census.gov/data/2019/pep/population?get=NAME,GEO_ID,POP,DENSITY&for=county:*');
        countyPopResults.data.forEach((value) => {
            let fips = value[1].substr(value[1].length - 5);
            Object.keys(fipsToCountyName).includes(fips) && (popDataByCounty[fips] = value) && (stateFipsByCountyFips[fips] = popDataByCounty[fips][4]);
        })
    } catch (err) { 
        console.log(err);
     }
};

const loadCountyHousing = async function () {
    try {
        let countyPopResults = await axios.get('https://api.census.gov/data/2019/pep/housing?get=DATE_CODE,NAME,HUEST&for=county:*');
        countyPopResults.data.forEach((value) => {
            let fips = value[3]+value[4];
            Object.keys(fipsToCountyName).includes(fips) && (housingDataByCounty[fips] = value);
        })
    } catch (err) { console.log(err); }
};


(async () => {
    await loadCongress();
    await loadCountyCovid();
    await loadStateCovid();
    await loadStatePop();
    await loadCivics();
    await loadCountyPop();
    await loadCountyHousing();

    let countyData = {};
    let stateData = {};

    Object.keys(fipsToCountyName).forEach(countyFip => {
        try {
            countyData[countyFip] = {};
            countyData[countyFip]["name"] = fipsToCountyName[countyFip].name;
            countyData[countyFip]["fip"] = countyFip;
            countyData[countyFip]["stateFip"] = stateFipsByCountyFips[countyFip];
            countyData[countyFip]["population"] = {
                "countyPopulation": popDataByCounty[countyFip][2],
                "countyPopulationDensity": popDataByCounty[countyFip][3],
            };
            console.log(covidDataByCounty[countyFip])
            countyData[countyFip]["covid"] = covidDataByCounty[countyFip];
            countyData[countyFip]["housing"] = {
                "housingUnitEstimate": housingDataByCounty[countyFip][2]
            };
        } catch (err) {console.log(err)}
    })

    Object.keys(fipsToStateName).forEach(stateFip=> {
        try{
            stateData[stateFip] = {};
            stateData[stateFip]["longName"] = fipsToStateName[stateFip];
            stateData[stateFip]["shortName"] = stateNameToCode[stateData[stateFip]["longName"]];
            stateData[stateFip]["population"] = {                  
                "statePopulation": censusDataByState[stateFip][2],
                "statePopulationDensity": censusDataByState[stateFip][1]
            };
            stateData[stateFip]["house"] = [];
            houseDataByState[stateFip].forEach(value=> {
                let rep = {
                    "name":(value.first_name+" "+value.last_name),
                    "party":value.party
                };
                stateData[stateFip]["house"].push(rep);
            })
            stateData[stateFip]["senate"] = [];
            senateDataByState[stateFip].forEach(value=> {
                let rep = {
                    "name": (value.first_name+" "+value.last_name),
                    "party": value.party
                };
                stateData[stateFip]["senate"].push(rep);
            })
            let governorData = governorDataByState[stateFip]
            stateData[stateFip]["governor"] = {
                "name":governorData.name,
                "party": governorData.party[0]
            };
        }catch(err) {console.log(err)}
    })


    fs.writeFile('countyData.json', JSON.stringify(countyData), function (err) {
        if (err) throw err;
        console.log('Replaced Counties!');
      });
    fs.writeFile('stateData.json', JSON.stringify(stateData), function (err) {
    if (err) throw err;
        console.log('Replaced States!');
    });
})();


// CURRENT FORMAT 
//      -COUNTY
// {
//     name: 'New Haven',
//     fip: '09009',
//     stateFip: '09',
//     population: {
//       countyPopulation: '854757',
//       countyPopulationDensity: '1413.95822970000000'
//     },
//     covid: {
//       cases: '30089',
//       deaths: '1259',
//       testPositivityRatio: '0.111',
//       caseDensity: '58.49615738742122',
//       infectionRate: '1.0696144268',
//       newCases: '688',
//       lastUpdatedDate: '2020-12-02'
//     },
//     housing: { housingUnitEstimate: '368670' }
//   }
//      -STATE

// {
//     longName: 'Connecticut',
//     shortName: 'CT',
//     population: {
//       statePopulation: '3565287',
//       statePopulationDensity: '736.22104642000000'
//     },
//     house: [
//       { name: 'Joe Courtney', party: 'D' },
//       { name: 'Rosa DeLauro', party: 'D' },
//       { name: 'Jahana Hayes', party: 'D' },
//       { name: 'Jim Himes', party: 'D' },
//       { name: 'John Larson', party: 'D' }
//     ],
//     senate: [
//       { name: 'Richard Blumenthal', party: 'D' },
//       { name: 'Christopher Murphy', party: 'D' }
//     ],
//     governor: { name: 'Ned Lamont', party: 'D' }
//   }