
const fips = require('./countyFips');
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
let stateByCounty = {};
let housingDataByCounty = {};
let mapFips = Object.keys(fips.countyNameFromFips);

let stateNames = {
    AK: "Alaska",
    AL: "Alabama",
    AR: "Arkansas",
    AZ: "Arizona",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DE: "Delaware",
    FL: "Florida",
    GA: "Georgia",
    HI: "Hawaii",
    IA: "Iowa",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    MA: "Massachusetts",
    MD: "Maryland",
    ME: "Maine",
    MI: "Michigan",
    MN: "Minnesota",
    MO: "Missouri",
    MS: "Mississippi",
    MT: "Montana",
    NC: "North Carolina",
    ND: "North Dakota",
    NE: "Nebraska",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NV: "Nevada",
    NY: "New York",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PA: "Pennsylvania",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennessee",
    TX: "Texas",
    UT: "Utah",
    VA: "Virginia",
    VT: "Vermont",
    WA: "Washington",
    WI: "Wisconsin",
    WV: "West Virginia",
    WY: "Wyoming"
};
let stateFipsCodes = {
    '01': "ALABAMA",
    '02': "ALASKA",
    '04': "ARIZONA",
    '05': "ARKANSAS",
    '06': "CALIFORNIA",
    '08': "COLORADO",
    '09': "CONNECTICUT",
    '10': "DELAWARE",
    '12': "FLORIDA",
    '13': "GEORGIA",
    '15': "HAWAII",
    '16': "IDAHO",
    '17': "ILLINOIS",
    '18': "INDIANA",
    '19': "IOWA",
    '20': "KANSAS",
    '21': "KENTUCKY",
    '22': "LOUISIANA",
    '23': "MAINE",
    '24': "MARYLAND",
    '25': "MASSACHUSETTS",
    '26': "MICHIGAN",
    '27': "MINNESOTA",
    '28': "MISSISSIPPI",
    '29': "MISSOURI",
    '30': "MONTANA",
    '31': "NEBRASKA",
    '32': "NEVADA",
    '33': "NEW HAMPSHIRE",
    '34': "NEW JERSEY",
    '35': "NEW MEXICO",
    '36': "NEW YORK",
    '37': "NORTH CAROLINA",
    '38': "NORTH DAKOTA",
    '39': "OHIO",
    '40': "OKLAHOMA",
    '41': "OREGON",
    '42': "PENNSYLVANIA",
    '44': "RHODE ISLAND",
    '45': "SOUTH CAROLINA",
    '46': "SOUTH DAKOTA",
    '47': "TENNESSEE",
    '48': "TEXAS",
    '49': "UTAH",
    '50': "VERMONT",
    '51': "VIRGINIA",
    '53': "WASHINGTON",
    '54': "WEST VIRGINIA",
    '55': "WISCONSIN",
    '56': "WYOMING"
}
function swap(json) {
    let r = {};
    for (let key in json) {
        r[json[key]] = key;
    }
    return r;
}
let stateNamesRev = swap(stateNames);

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
        if (Object.keys(stateNames).includes(value.state)) {
            senateDataByState[value.state] = (senateDataByState[value.state] == null ? [value] : senateDataByState[value.state].concat(value));
        }
    })
    houseResults.forEach((value) => {
        if (Object.keys(stateNames).includes(value.state)) {
            houseDataByState[value.state] = (houseDataByState[value.state] == null ? [value] : houseDataByState[value.state].concat(value));
        }
    })
};
const loadStateCovid = async function () {
    try {
        let covidResults = await axios.get("https://api.covidtracking.com/v1/states/current.json");
        covidResults.data.forEach((value) => {
            if (Object.keys(stateNames).includes(value.state)) {
                covidDataByState[value.state] = value;
            }
        })
    } catch (err) { console.log(err) }
};

const loadCountyCovid = async function () {
    try {
        let covidResults = await axios.get("https://api.covidactnow.org/v2/counties.csv?apiKey="+cankey);
        covidResults = Papa.parse(covidResults.data);
        for (let l = 0; l < covidResults.data.length; l++) {
            let value = covidResults.data[l.toString()];
            if (Object.values(mapFips).includes(value['0'])) {
                covidDataByCounty[value['0']] = {
                    "cases":value['23'],
                    "deaths":value['24'],
                    "positiveTests":value['25'],
                    "negativeTests":value['26'],
                    "newCases": value['36'],
                    "lastUpdatedDate":value['37']
                };
            }
        }
    } catch (err) {console.log(err)};
};

const loadCensus = async function () {
    try {
        let censusResults = await axios.get('https://api.census.gov/data/2019/pep/population?get=DATE_DESC,DENSITY,POP,NAME,STATE&for=state');
        censusResults.data.forEach((value) => {
            Object.keys(stateNames).includes(stateNamesRev[value[3]]) && (censusDataByState[stateNamesRev[value[3]]] = value);
        })
    } catch (err) { console.log(err); }
};

const loadCivics = async function () {
    try {
        await (async () => {
            for (let i = 0; i < Object.keys(stateNames).length; i++) {
                let stateKey = Object.keys(stateNames)[i];
                let civicsResults = await axios.get('https://civicinfo.googleapis.com/civicinfo/v2/representatives/ocd-division%2Fcountry%3Aus%2Fstate%3A' + stateKey.toLowerCase() + '?roles=legislatorUpperBody&roles=headOfGovernment&key=' + gckey);
                let governor = civicsResults.data.officials[2];
                governorDataByState[stateKey] = governor;
            }
        })()
    } catch (err) { console.log(err); }
};

const loadCountyPop = async function () {
    try {
        let countyPopResults = await axios.get('https://api.census.gov/data/2019/pep/population?get=NAME,GEO_ID,POP,DENSITY&for=county:*');
        countyPopResults.data.forEach((value) => {
            let fips = value[1].substr(value[1].length - 5);
            mapFips.includes(fips) && (popDataByCounty[fips] = value) && (stateByCounty[fips] = stateNamesRev[popDataByCounty[fips][0].split(', ')[1]]);
        })
    } catch (err) { console.log(err); }
};

const loadCountyHousing = async function () {
    try {
        let countyPopResults = await axios.get('https://api.census.gov/data/2019/pep/housing?get=DATE_CODE,NAME,HUEST&for=county:*');
        countyPopResults.data.forEach((value) => {
            let fips = value[3]+value[4];
            mapFips.includes(fips) && (housingDataByCounty[fips] = value);
        })
    } catch (err) { console.log(err); }
};


(async () => {
    await loadCongress();
    await loadCountyCovid();
    await loadStateCovid();
    await loadCensus();
    await loadCivics();
    await loadCountyPop();
    await loadCountyHousing();

    let countyData = {};
    let stateData = {};

    mapFips.forEach(countyFip => {
        try {
            countyData[countyFip] = {};
            countyData[countyFip]["name"] = fips.countyNameFromFips[countyFip].name;
            countyData[countyFip]["fip"] = countyFip;
            countyData[countyFip]["stateShort"] = stateByCounty[countyFip];
            countyData[countyFip]["stateLong"] = stateNames[stateByCounty[countyFip]];
            countyData[countyFip]["house"] = [];
            // console.log("statetag:::", stateByCounty[countyFip]);
            // console.log('housedata:::',houseDataByState[stateByCounty[countyFip]]);
            // console.log('countyfip:::: ', countyFip);
            houseDataByState[stateByCounty[countyFip]].forEach(value=> {
                let rep = {
                    "name":(value.first_name+value.last_name),
                    "party":value.party
                };
                countyData[countyFip]["house"].push(rep);
            })
            countyData[countyFip]["senate"] = [];
            senateDataByState[stateByCounty[countyFip]].forEach(value=> {
                let sen = {
                    "name": (value.first_name+value.last_name),
                    "party": value.party
                };
                countyData[countyFip]["senate"].push(sen);
            })
            let governorData = governorDataByState[stateByCounty[countyFip]]
            countyData[countyFip]["governor"] = {
                "name":governorData.name,
                "party": governorData.party[0]
            };
            countyData[countyFip]["population"] = {
                "countyPopulation": popDataByCounty[countyFip][2],
                 "countyPopulationDensity": popDataByCounty[countyFip][3],
                  "statePopulation": censusDataByState[stateByCounty[countyFip]][2],
                   "statePopulationDensity": censusDataByState[stateByCounty[countyFip]][1]
            };
            countyData[countyFip]["covid"] = covidDataByCounty[countyFip];
            countyData[countyFip]["housing"] = {
                "housingUnitEstimate": housingDataByCounty[countyFip][2]
            };
        } catch (err) {console.log(err)}
    })
    fs.writeFile('countyData.json', JSON.stringify(countyData), function (err) {
        if (err) throw err;
        console.log('Replaced!');
      });
})();