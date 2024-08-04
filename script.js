
// Helper functions
// Helper: Create element, add classes, add attributes, add content
function newElem(type, classes, attributes, content) {
    let element = document.createElement(type);
    
    element.className = classes;
    
    if (attributes) {
        attributes.forEach(function(attribute) {
            element.setAttribute(attribute.key.toLowerCase().replace(' ', '-'), attribute.val.toLowerCase().replace(' ', '-'));
        })
    }
    
    if (content) element.textContent = content;
    
    return element;
}

// Helper: Convert value to display price
function priceDisplay(price) {
    let formatter = new Intl.NumberFormat('en-uS', {
        style: 'currency',
        currency: 'USD',
        
        // These options are needed to round to whole numbers if that's what you want.
        //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
        //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
    });
    
    return(formatter.format(price));
}



// Initialization
let elemList = newElem('main', 'list');
document.querySelector('body').append(elemList);

// Define state object for the list
let state = {
    'environment': 'dev',
    'listMode': 'cards',
    'sort': 'Default',
    'filters': {
        'soundSig': {
            'u-shaped': true
            },
        'connector': {
            '2pin': true,
            'mmcx': true,
            'ipx': true
            },
        'drivers': {
            'dd': true,
            'ba': true,
            'est': true,
            'hybrid': true,
            'tribrid': true
            },
        'availability': {
            'discontinued': true,
            'crinTested': true,
            'crinApproved': true
            },
        'shop': {
            'demoable': true,
            'buyable': true,
            'priceMin': 0,
            'priceMax': 10000
            }
        },
        'jqueryLoaded': false
    };

// Set data variables
let json = 'data.json',
    freshData = getDataFresh(json),
    jqueryLoaded = false;



// Get data
function getDataFresh (json) {
    let dataArr = [],
        dataMock = [
            {
                'name': 'Espana',
                'color': 'red'
            },
            {
                'name': 'Srb',
                'color': 'blue'
            }
        ];
    
    if (!state.jqueryLoaded) {
        function loadJquery() {
            let body = document.querySelector('body'),
                scriptJquery = document.createElement('script'),
                hostedJquery = 'https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js';

            scriptJquery.setAttribute('type', 'text/javascript');
            scriptJquery.setAttribute('src', hostedJquery);
            scriptJquery.addEventListener('load', function() {
                try {
                    state.jqueryLoaded = true;
                    getDataFromJson(json);
                } catch {}
            });

            body.append(scriptJquery);
        }
        loadJquery();
    } else {
        getDataFromJson(json);
    }
       
    function getDataFromJson(json) {
        $.getJSON(json, function(data) {
        })
        .then(function(data) {
            data.forEach(function(item) {
                let itemObject = {
                    'approved': item['Crinacle Approved ✔️'] ? 'yes' : 'no',
                    'brand': item['Brand'],
                    'connection': item['Connection'],
                    'demoable': item['Physical demo unit available now?'],
                    'drivers': item['Driver Configuration'],
                    'linkStore': item['Hangout Store Link'],
                    'linkShowcase': item['Showcase Link (YouTube)'],
                    'linkMeasurement': item['Measurement Link'],
                    'linkStore': item['Hangout Store Link'],
                    'model': item['IEM Model'],
                    'price': item['Price (MSRP, USD)'],
                    'remarks': item['Remarks'],
                    'signature': item['Sound Signature'],
                    'status': item['Status'],
                    'tested': item['Crinacle-tested'].toLowerCase(),
                    '_end': ''
                };
                
                dataArr.push(itemObject);
            });
        })
        .then(function() {
            applyState(state);
        })
    }
    return dataArr;
}



// Apply the state to the app
function applyState(state) {
    // Filter data
    let filteredData = dataFilter(freshData, state.filters);
    
    // Sort data
    let sortedData = dataSort(filteredData, state.sort);
    
    // Build list items DOM
    buildListItems(sortedData, state.listMode);
}



// Filter functions
function dataFilter(data, filters) {
    return data;
}



// Sort functions
function dataSort(data, sort) {
    let sortFunction = 'sort' + sort;
    
    data.sort(window[sortFunction]);
    
    return data;
}

function sortDefault(a, b) {
    let testedA = a.tested === 'yes' ? 1 : 0,
        testedB = b.tested === 'yes' ? 1 : 0,
        approvedA = a.approved === 'yes'  ? 5 : 0,
        approvedB = b.approved === 'yes' ? 5 : 0,
        sumA = testedA + approvedA,
        sumB = testedB + approvedB;
    
    if (sumA > sumB) {
        return -1
    } else {
        return 1
    }
    return 0;
}

function sortPriceHighLow(a, b) {
    if (a.price > b.price) {
        return -1
    }
    else {
        return 1
    }
    return 0
}

function sortPriceLowHigh(a, b) {
    if (a.price > b.price) {
        return 1
    }
    else {
        return -1
    }
    return 0
}



// Build DOM functions
function buildListItems(data, listMode) {
    if (listMode === 'table') {
        
    } else if (listMode === 'cards') {
        buildCards(data);
    }
}

function buildCards(data) {
    elemList.innerHTML = '';
    elemList.setAttribute('list-mode', 'cards');
    
    console.log(data[0]);
    
    data.forEach(function(item) {
        // Core card structure
        let elemCardContainer = newElem('article', 'card-container'),
            elemCardHeader = newElem('section', 'card-header'),
            elemCardBody = newElem('section', 'card-body'),
            elemCardFooter = newElem('section', 'card-footer');
        
        elemCardContainer.append(elemCardHeader);
        elemCardContainer.append(elemCardBody);
        elemCardContainer.append(elemCardFooter);
        
        // Card header
        let headerPhoneId = newElem('div', 'phone-id'),
            headerPhoneBrand = newElem('div', 'phone-brand', null, item.brand),
            headerPhoneModel = newElem('div', 'phone-model', null, item.model),
            headerPhoneTested = newElem('div', 'phone-tested', [{'key': 'crin-tested', 'val': item.tested}, {'key': 'crin-approved', 'val': item.approved}]);
        
        elemCardHeader.append(headerPhoneId);
        headerPhoneId.append(headerPhoneBrand);
        headerPhoneId.append(headerPhoneModel);
        elemCardHeader.append(headerPhoneTested);
        
        // Card body: Details
        let bodyDetails = newElem('div', 'phone-details'),
            detailsSignature = item.signature
                                ? newElem('div', 'phone-detail-item phone-signature', null, item.signature)
                                : '',
            detailsDrivers = item.drivers
                                ? newElem('div', 'phone-detail-item phone-drivers', null, item.drivers)
                                : '',
            detailsConnection = item.connection
                                ? newElem('div', 'phone-detail-item phone-connection', null, item.connection)
                                : '',
            detailsDemoable = item.demoable
                                ? newElem('div', 'phone-detail-item phone-demo', null, 'Demo @ The Hangout')
                                : '';
        
        elemCardBody.append(bodyDetails);
        bodyDetails.append(detailsSignature);
        bodyDetails.append(detailsDrivers);
        bodyDetails.append(detailsConnection);
        bodyDetails.append(detailsDemoable);
        
        // Card body: Links
        let bodyLinks = newElem('div', 'phone-links'),
            linkShowcase = item.linkShowcase
                            ? newElem('a', 'phone-link phone-link-showcase', [{'key': 'href', 'val': item.linkShowcase}], 'Showcase')
                            : '',
            linkMeasurement = item.linkMeasurement ?
                                newElem('a', 'phone-link phone-link-measurement', [{'key': 'href', 'val': item.linkMeasurement}], 'Graph')
                                : '',
            linkStore = item.linkStore
                            ? newElem('a', 'phone-link phone-link-store', [{'key': 'href', 'val': item.linkStore}], 'Buy')
                            : newElem('a', 'phone-link phone-link-store', null, 'Buy'),
            storePrice = newElem('span', 'phone-store-price', null, priceDisplay(item.price));
        
        elemCardBody.append(bodyLinks);
        bodyLinks.append(linkShowcase);
        bodyLinks.append(linkMeasurement);
        bodyLinks.append(linkStore);
        linkStore.append(storePrice);
        
        // Card footer
        let footerStatus = newElem('div', 'phone-status', [{'key': 'status', 'val': item.status}], item.status);
        
        elemCardFooter.append(footerStatus);
        
        // Add finished card DOM
        elemList.append(elemCardContainer);
    });
}
