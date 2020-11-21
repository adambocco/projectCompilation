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


const states = []
const stateData = {};
const createStateFunctions = {};


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
let stateNamesRev = swap(stateNames);
let stateKeys = Object.keys(stateNames);
let stateParties = {}
let covidData = {};
let populationData = {};
var colorArray = {};
let governorParties = {};


let covidStates, covidUS, deathAverage;
axios.get("https://api.covidtracking.com/v1/states/current.json")
    .then((res) => {
        covidStates = res;
        axios.get("https://api.covidtracking.com/v1/us/current.json")
            .then((res) => {
                covidUS = res;
                deathAverage = parseInt(covidUS.data[0].death) / (50);
            })
    })
    .then(() => {
        axios.get('https://api.census.gov/data/2019/pep/population?get=DATE_DESC,DENSITY,POP,NAME,STATE&for=state')
            .then((res) => {
                covidStates.data.forEach((value, index) => {
                    covidData[value.state] = value;
                    res.data.forEach((value2, index2) => {
                        if (index == 0) {
                            populationData[stateNamesRev[value2[3]]] = value2;
                        }
                        if (value.state == stateNamesRev[value2[3]]) {
                        }
                    })
                })

                function stateCreate(shortName, longName, covidDeath, governor, governorParty, cb) {
                    stateDetail = {
                        shortName: shortName,
                        longName: longName,
                        covidDeath: covidDeath,
                        governor: governor,
                        governorParty: governorParty
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

                function createStatesArray() {
                    Object.keys(stateNames).forEach((value, index) => {
                        stateData[value] = [value, stateNames[value], covidData[value].positive, "Placeholder", governorParties[value]];
                        createStateFunctions[value] = callback => {
                            stateCreate(value, stateData[value][1], stateData[value][2], stateData[value][3], stateData[value][4], callback)
                        };
                    })
                }
                function createStates(cb) {
                    createStatesArray();
                    async.series([...Object.values(createStateFunctions)], cb);
                }
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
            })
            .then(() => {
                stateKeys.forEach((value, index) => {
                    axios.get('https://civicinfo.googleapis.com/civicinfo/v2/representatives/ocd-division%2Fcountry%3Aus%2Fstate%3A' + value.toLowerCase() + '?roles=legislatorUpperBody&roles=headOfGovernment&key=AIzaSyDx5SFXzfuixOLSl33c4wPPruvxDAkEvEo')
                        .then((res) => {
                            console.log("GOOGLE CIVICS SUCCESS")
                            if (res.data.officials.length > 0) {
                                let senator1 = res.data.officials[0]
                                let senator2 = res.data.officials[1];
                                let govna = res.data.officials[2];
                                governorParties[value] = govna.party[0];
                                let partyScore = (senator1.party[0] == 'D' ? 0.25 : -0.25) + (senator2.party[0] == 'D' ? 0.25 : -0.25) + (govna.party[0] == 'D' ? 0.5 : -0.5);
                                stateParties[value] = partyScore;
                                colorArray[value] =
                                    (stateParties[value] ==
                                        -1 ? 'red'
                                        : stateParties[value] == -0.75 ? 'rgb(255,64,64)'
                                            : stateParties[value] == -0.5 ? 'rgb(255,128,128)'
                                                : stateParties[value] == -0.25 ? 'rgb(255,192,192)'
                                                    : stateParties[value] == 0 ? 'rgb(255,100,255)'
                                                        : stateParties[value] == 0.25 ? 'rgb(192,192,255)'
                                                            : stateParties[value] == 0.5 ? 'rgb(128,128,255)'
                                                                : stateParties[value] == 0.75 ? 'rgb(64,64,255)'
                                                                    : stateParties[value] == 1 ? 'blue'
                                                                        : 'green');
                            }
                        })
                })
            })
    })
