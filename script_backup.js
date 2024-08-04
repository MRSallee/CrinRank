function loadJquery() {
    let body = document.querySelector('body'),
        scriptJquery = document.createElement('script'),
        hostedJquery = 'https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js';
    
    scriptJquery.setAttribute('type', 'text/javascript');
    scriptJquery.setAttribute('src', hostedJquery);
    scriptJquery.addEventListener('load', function() {
        try {
            init();
        } catch {}
    });
    
    body.append(scriptJquery);
}
loadJquery();

function init() {
    let rawData = 'data.json',
        sortMethod = 'default',
        rankContainer = document.createElement('main'),
        rankHeader = document.createElement('section'),
        rankSort = document.createElement('section');
    
    document.querySelector('body').append(rankContainer);
    
    constructDataObj(rawData, sortMethod);
}

function constructDataObj(rawData, sortMethod) {
    let dataArr = [];
    
    $.getJSON(rawData, function(data) {
        data.forEach(function(item) {
            // set data vars
            let itemObject = {
                'brand': item['Brand'],
                'model': item['IEM Model'],
                'connection': item['Connection'],
                'approved': item['Crinacle Approved ✔️'],
                'tested': item['Crinacle-tested'],
                'drivers': item['Driver Configuration'],
                'linkStore': item['Hangout Store Link'],
                'linkMeasurement': item['Measurement Link'],
                'price': item['Price (MSRP, USD)'],
                'remarks': item['Remarks'],
                'status': item['Status']
            };
            
            dataArr.push(itemObject);
        });
        
        sortData(dataArr, sortMethod);
    });
}

function sortData(dataArr, sortMethod) {
    console.log(dataArr);
    
    dataArr.sort((a, b) => a.price > b.price ? 1 : -1);
    
    hydrateData(dataArr);
};

function hydrateData(dataArr) {
    let rankContainer = document.querySelector('main');
    
    rankContainer.innerHTML = '';
    
    dataArr.forEach(function(dataItem) {
        // create element vars
        let itemContainer = document.createElement('article');
        rankContainer.append(itemContainer);

        for (var [key, value] of Object.entries(dataItem)) {
            let elem = document.createElement('div');

            elem.className = key;
            elem.textContent = value;

            itemContainer.append(elem);

            //console.log(`${key}: ${value}`);
        }

        //console.log(itemObject);
    });
}
