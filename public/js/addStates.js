
console.log("ADDSTATE LOADED")
simplemaps_usmap.hooks.click_state = function(id) {
    if (document.getElementById(id) !== null) {
        document.getElementById(id).remove();
    }
    else {
        console.log(id);
        let stateInfo = document.createElement("div");
        stateInfo.className = "row m-3 border text-left";
        stateInfo.innerHTML = `   
        
        <div class="col">
        <h3 class="text-center">
            ${stateJSON[id].longName}
        </h3>
        <p>
            <h5>Population: ${toCommas(stateJSON[id].population)}</h5>
            <h5>Deaths: ${toCommas(stateJSON[id].death)}</h5>
            <h5>Positive Cases: ${toCommas(stateJSON[id].positive)}</h5>
            <h5>Deaths/Population: ${((stateJSON[id].death/stateJSON[id].population)*100).toFixed(4)} %</h5>
            <h5>Population Density: ${stateJSON[id].populationDensity.toFixed(2)}</h5>
            <h5>Deaths/Population Density: ${parseFloat(stateJSON[id].death/stateJSON[id].populationDensity).toFixed(2)}</h5>
        </p>
        </div>
        
        `
        let x = document.createElement("button");
        x.className = "btn btn-danger font-weight-bold";
        x.innerHTML = 'X';
        stateInfo.id = id;
        x.addEventListener("click", ()=> {
            simplemaps_select.deselect(id);
            document.getElementById(id).remove();
        })
        stateInfo.appendChild(x);
        if (simplemaps_select.selected.length % 2 == 1) {
            document.getElementById('selectedStates2').appendChild(stateInfo);
        }
        else {
            document.getElementById('selectedStates1').appendChild(stateInfo);
        }
    }
}

function toCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

