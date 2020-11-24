

let stateData;
let stateJSON={};
let colorArray = {};

const loadStates = async function() {
    try {
        console.log("Trying to send get request to : " + 'http://' + window.location.hostname + '/loadStates');
        stateData = await axios.get('http://' + window.location.hostname + ':3000/loadStates');
        console.log(stateData);
    } catch(err) {console.log(err)}
    stateData.data.forEach((value)=> {
        stateJSON[value.shortName] = value;
        colorArray[value.shortName] = 
        (value.partyScore ==
            -1 ? 'red'  
        :value.partyScore == -0.75 ? 'rgb(255,64,64)'
        :value.partyScore == -0.5 ? 'rgb(255,128,128)'
        :value.partyScore == -0.25 ? 'rgb(255,192,192)'
        :value.partyScore == 0 ? 'rgb(255,100,255)'
        :value.partyScore == 0.25 ? 'rgb(192,192,255)'
        :value.partyScore == 0.5 ? 'rgb(128,128,255)'
        :value.partyScore == 0.75 ? 'rgb(64,64,255)'
        :value.partyScore == 1 ? 'blue'
        : 'green');
    });
};


