#! /usr/bin/env node
const async = require('async')
const axios = require('axios');
const State = require('./models/state')
const mongoose = require('mongoose');
const mongoDB = 'mongodb+srv://adambocco:csc443@cluster0.mbyvv.mongodb.net/apimashup?retryWrites=true&w=majority'
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


function swap(json) {
    let doodle = {};
    for (let key in json) {
        doodle[json[key]] = key;
    }
    return doodle;
}


let stateNames = {
    AK: "Alaska",
    AL: "Alabama",
    AR: "Arkansas",
    AZ: "Arizona",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DC: "District Of Columbia",
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
}
const states = []
const stateData = {};
const createStateFunctions = {};
let stateNamesRev = swap(stateNames);
let stateKeys = Object.keys(stateNames);
let stateParties = {}
let covidData = {};
let populationData = {};
let governors = {};
let senators1 = {};
let senators2 = {};
let governorParties = {};
let senator1Parties = {};
let senator2Parties = {};



const run = async function() {
    try {
        let covid1 = await axios.get("https://api.covidtracking.com/v1/states/current.json");
        covid1.data.forEach((value)=> {
            covidData[value.state] = value;
        })
    } catch(err) {
        console.log(err)
    }
    try {
        let covid2 = await axios.get("https://api.covidtracking.com/v1/us/current.json");
    } catch(err) {console.log(err)}
    try {
        let census = await axios.get('https://api.census.gov/data/2019/pep/population?get=DATE_DESC,DENSITY,POP,NAME,STATE&for=state');
        census.data.forEach((value, index) => {
            populationData[stateNamesRev[value[3]]] = value;
        })
    } catch(err) {console.log(err)}
    try {
        await forLoop()
    }catch(err) {console.log(err)}

    async.series([createStates],
        // Optional callback
        function (err, results) {
            if (err) {
                console.log('FINAL ERR: ' + err);
            }
            else {
                console.log('State Entries: ' + states);
            }
            // All done, disconnect from database
            mongoose.connection.close();

        });



}
run()

const forLoop = async () => {
    for (let i = 0; i < stateKeys.length; i++) {
        let value = stateKeys[i];
        try {
            let res = await axios.get('https://civicinfo.googleapis.com/civicinfo/v2/representatives/ocd-division%2Fcountry%3Aus%2Fstate%3A' + value.toLowerCase() + '?roles=legislatorUpperBody&roles=headOfGovernment&key=AIzaSyDx5SFXzfuixOLSl33c4wPPruvxDAkEvEo')
            if (res.data.officials.length > 0) {
                let senator1 = res.data.officials[0]
                let senator2 = res.data.officials[1];
                let govna = res.data.officials[2];
                senators1[value] = senator1.name;
                senators2[value] = senator2.name;
                governors[value] = govna.name;
                governorParties[value] = govna.party[0];
                senator1Parties[value] = senator1.party[0];
                senator2Parties[value] = senator2.party[0];
                let partyScore = (senator1.party[0] == 'D' ? 0.25 : -0.25) + (senator2.party[0] == 'D' ? 0.25 : -0.25) + (govna.party[0] == 'D' ? 0.5 : -0.5);
                stateParties[value] = partyScore;


                stateData[value] = [value, stateNames[value], populationData[value][2], populationData[value][1], covidData[value].death,
                covidData[value].positive, governors[value], senators1[value], senators2[value], governorParties[value], senator1Parties[value], senator2Parties[value], stateParties[value]];
                createStateFunctions[value] = callback => {
                    stateCreate(...stateData[value], callback)
                };
            }
        } catch(err) {console.log(err)}
    }
    console.log(stateData)
}


function stateCreate(shortName, longName, population, populationDensity, death, positive, governor, senator1, senator2, governorParty, senator1Party, senator2Party, partyScore, cb) {
    console.log(populationDensity)
    let stateDetail = {
        shortName: shortName,
        longName: longName,
        population: population,
        populationDensity: populationDensity,
        death: death,
        positive: positive,
        governor: governor,
        senator1: senator1,
        senator2: senator2,
        governorParty: governorParty,
        senator1Party: senator1Party,
        senator2Party: senator2Party,
        partyScore: partyScore
    };
    let newState = new State(stateDetail);
    newState.save((err) => {
        if (err) {
            console.log(err);
            cb(err, null);
            return;
        }
        states.push(newState)
        cb(null, newState)
    })
}

function createStates(cb) {
    async.series([...Object.values(createStateFunctions)], cb);
}