
console.log("ADDSTATE LOADED")
simplemaps_usmap.hooks.click_state = function(id) {
    if (document.getElementById(id) !== null) {
        document.getElementById(id).remove();
    }
    else {
        console.log(id);
        let stateInfo = document.createElement("div");
        stateInfo.className = "row d-flex";
        stateInfo.innerHTML = `   
        
        <div class="col">
        <h3>
            ${stateNames[id]}
        </h3>
        <p>
            <h5>Population: ${toCommas(populationData[id][2])}</h5>
            <span>Deaths: ${toCommas(covidData[id].death)}</span>
            <br><span>Positive Cases: ${toCommas(covidData[id].positive)}</span>
        </p>
        </div>
        
        `
        let x = document.createElement("button");
        x.className = "btn btn-danger";
        x.innerHTML = '<i class="fas fa-backspace"></i>';
        stateInfo.id = id;
        x.addEventListener("click", ()=> {
            simplemaps_select.deselect(id);
            document.getElementById(id).remove();
        })
        stateInfo.appendChild(x);
        document.getElementById('selectedStates').appendChild(stateInfo);
    }
}

function toCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
