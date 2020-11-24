let expressionSpace = document.querySelector('#expressionSpace');
let numerators = [];
let denominators = [];

function addNumDenom(statistic, numOrDenom) {
    let targetId = (numOrDenom ? "#numDenomNums" : "#numDenomDenoms")
    if (document.querySelector(targetId).innerHTML != "") {
        document.querySelector(targetId).innerHTML += (' * ' + statistic);
    }
    else {
        document.querySelector(targetId).innerHTML += statistic;
    }
    (numOrDenom ? numerators : denominators).push(statistic);
}


document.querySelector('#numDenom').addEventListener("click", () => {
    if (document.querySelector('#numSpace') !== null || document.querySelector('#numDenomSpace') !== null || document.querySelector('#singleSpace') !== null) {
        try { document.querySelector('#numDenomSpace').remove() } catch (err) { console.log(err) }
    } else {
        let x = document.createElement('div')
        x.id = "numDenomSpace";
        x.innerHTML = `
        <div class="row">
        <div class="col">
        <div class="dropdown d-inline">
            <button class="btn btn-info dropdown-toggle m-2" type="button" id="addNumDenomNum" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Numerator
            </button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <a class="dropdown-item numerator" statistic="positive" id="numDenomPositive" href="#">Positive Cases</a>
            <a class="dropdown-item numerator" statistic="population" id="numDenomPopulation" href="#">Population</a>
            <a class="dropdown-item numerator" statistic="death" id="numDenomDeaths" href="#">Total Deaths</a>
            <a class="dropdown-item numerator" statistic="totalTests" id="numDenomTotalTests" href="#">Total Tests</a>
            </div>
        </div>
        <div class="dropdown d-inline">
        <button class="btn btn-info dropdown-toggle m-2" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Denominator
        </button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <a class="dropdown-item denominator" statistic="positive" id="numDenomPositive" href="#">Positive Cases</a>
            <a class="dropdown-item denominator" statistic="population" id="numDenomPopulation" href="#">Population</a>
            <a class="dropdown-item denominator" statistic="death" id="numDenomDeaths" href="#">Total Deaths</a>
            <a class="dropdown-item denominator" statistic="totalTests" id="numDenomTotalTests" href="#">Total Tests</a>
        </div>
    </div>
        <button type="click" id="clearNumDenom" class="btn btn-danger m-2">Clear</button>
        <button type="click" id="executeNumDenom" class="btn btn-success m-2">Execute</button>
        </div>
        <div class="col">
        <div class="font-weight-bold m-2" id='numDenomNumsTag'>Numerator Multipliers: </div>
        <div id='numDenomNums'></div>
        <div class="font-weight-bold m-2" id='numDenomDenomsTag'>Denominator Multipliers: </div>
        <div id='numDenomDenoms'></div>
        </div></div>
        `
        expressionSpace.appendChild(x);

        document.querySelector('#clearNumDenom').addEventListener("click",()=> {
            document.querySelector('#numDenomNums').innerHTML = ""
            document.querySelector('#numDenomDenoms').innerHTML = ""
            numerators = [];
            denominators = [];
        })
        document.querySelector('#executeNumDenom').addEventListener("click", ()=> {
            customColorStates(null,numerators,denominators);
        })

        Array.from(document.getElementsByClassName("numerator")).forEach((value) => {
            value.addEventListener("click", (e) => {
                let statistic = e.currentTarget.getAttribute("statistic");
                addNumDenom(statistic, true)
            })
        })
        Array.from(document.getElementsByClassName("denominator")).forEach((value) => {
            value.addEventListener("click", (e) => {
                let statistic = e.currentTarget.getAttribute("statistic");
                addNumDenom(statistic, false)
            })
        })
    }
})
