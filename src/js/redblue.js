
const loadPolitics = document.getElementById("loadPolitics");
let stateNames = simplemaps_usmap.mapinfo.names;
let stateNamesRev = swap(stateNames);
let stateKeys = Object.keys(simplemaps_usmap.mapinfo.names);
let stateGets = [];
let stateParties = []
let covidData = {};
let populationData = {};


function setSelectStateHook() {
    simplemaps_usmap.hooks.click_state = function(id) {
        console.log(id);
        let stateInfo = document.createElement("div");
        stateInfo.className = "row d-flex";
        stateInfo.innerHTML = `   
        
        <div class="col">
        <h3>
            ${covidData.data}
        </h3>
        <p>
            <h5>Population: </h5>
            <span>Deaths:${covidStates.death}</span>
            <span>Positive Cases:${covidData.positive}</span>
        </p>
        </div>
        
        `
        let x = document.createElement("button");
        x.className = "btn btn-info";
        x.innerHTML = id;
        x.id = id;
        x.addEventListener("click", ()=> {
            simplemaps_select.deselect(id);
            document.getElementById(id).remove();
        })
        stateInfo.appendChild(x);
        document.getElementById('selectedStates').appendChild(stateInfo);
    }
}

var colorArray = {};
stateKeys.forEach((value, index) => {
    axios.get('https://civicinfo.googleapis.com/civicinfo/v2/representatives/ocd-division%2Fcountry%3Aus%2Fstate%3A'+value.toLowerCase()+'?roles=legislatorUpperBody&roles=headOfGovernment&key=AIzaSyDx5SFXzfuixOLSl33c4wPPruvxDAkEvEo')
        .then((res) => {
            if (res.data.officials.length > 0) {
                let senator1 = res.data.officials[0]
                let senator2 = res.data.officials[1];
                let govna = res.data.officials[2];
                let partyScore = (senator1.party[0]=='D'? 0.25 : -0.25) + (senator2.party[0] == 'D' ? 0.25 : -0.25) + (govna.party[0] == 'D'? 0.5 : -0.5);
                stateParties[value] = partyScore;
                simplemaps_usmap.mapdata.state_specific[value].color= 
                (stateParties[value] ==
                    -1 ? 'red'  
                :stateParties[value] == -0.75 ? 'rgb(255,64,64)'
                :stateParties[value] == -0.5 ? 'rgb(255,128,128)'
                :stateParties[value] == -0.25 ? 'rgb(255,192,192)'
                :stateParties[value] == 0 ? 'rgb(255,100,255)'
                :stateParties[value] == 0.25 ? 'rgb(192,192,255)'
                :stateParties[value] == 0.5 ? 'rgb(128,128,255)'
                :stateParties[value] == 0.75 ? 'rgb(64,64,255)'
                :stateParties[value] == 1 ? 'blue'
                : 'green');
                colorArray[value] = 
                (stateParties[value] ==
                    -1 ? 'red'  
                :stateParties[value] == -0.75 ? 'rgb(255,64,64)'
                :stateParties[value] == -0.5 ? 'rgb(255,128,128)'
                :stateParties[value] == -0.25 ? 'rgb(255,192,192)'
                :stateParties[value] == 0 ? 'rgb(255,100,255)'
                :stateParties[value] == 0.25 ? 'rgb(192,192,255)'
                :stateParties[value] == 0.5 ? 'rgb(128,128,255)'
                :stateParties[value] == 0.75 ? 'rgb(64,64,255)'
                :stateParties[value] == 1 ? 'blue'
                : 'green');
            }
        }).catch((err) => {
            console.log(err);
        })
})
let covidStates, covidUS, deathAverage;
axios.get("https://api.covidtracking.com/v1/states/current.json")
    .then((res)=> {
        console.log("COVID ALL STATES",res)
        covidStates = res;
        axios.get("https://api.covidtracking.com/v1/us/current.json")
    .then((res)=> {
        console.log("COVID UNITED STATES",res)
        covidUS = res;
        deathAverage = parseInt(covidUS.data[0].death)/(50);
    })})
    .then(()=> {
        axios.get('https://api.census.gov/data/2019/pep/population?get=DATE_DESC,DENSITY,POP,NAME,STATE&for=state')
        .then((res)=> {
            console.log("CENSUS INFO",res);
            covidStates.data.forEach((value, index) => {
                covidData[value.state] = value;
                res.data.forEach((value2, index2)=> {
                    if (index == 0) {
                        populationData[stateNamesRev[value2[3]]] = value2;
                    }
                    if (value.state == stateNamesRev[value2[3]]) {
                        console.log("Population: " + value2[2] + "Deaths: "+ value.death)
                        simplemaps_usmap.mapdata.state_specific[stateNamesRev[value2[3]]].description = "Population: " + value2[2] + "Death/Population-%: "+ ((value.death/value2[1])*100);
                    }
                })
            })
        }).then(()=> {
            simplemaps_usmap.load()
        })
    })

function swap(json){
    let doodle = {};
    for(let key in json){
        doodle[json[key]] = key;
    }
    return doodle;
}