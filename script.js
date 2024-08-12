
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
//function priceDisplay(price) {
function numDisplay(num, style, currencyVar) {
    if (currencyVar) {
        let formatter = new Intl.NumberFormat('en-uS', {
            style: style,
            currency: currencyVar,
        });

        return(formatter.format(num));
    } else {
        let formatter = new Intl.NumberFormat('en-uS', {
            style: style,
        });

        return(formatter.format(num));
    }
}



// Initialization
let elemList = newElem('main', 'list'),
    elemListContents = newElem('section', 'list-contents'),
    elemListFilters = newElem('section', 'list-filters');
elemList.append(elemListFilters);
elemList.append(elemListContents);
document.querySelector('body').append(elemList);

// Define state object for the list
let state = {
    'environment': 'dev',
    'jqueryLoaded': false,
    'listMode': 'cards',
    'sort': 'Default',
    'filters': {
        'availability': {
            'buyableOnly': false,
            'crinApprovedOnly': false,
            'crinTestedOnly': true,
            'demoableOnly': false,
            'discontinued': true,
            },
        'connection': {
            'twopin': true,
            'ipx': true,
            'mmcx': true,
            },
        'drivers': {
            'ba': true,
            'dd': true,
            'est': true,
            'planar': true,
            'hybrid': true,
            'tribrid': true,
            },
        'searchString': '',
        'shop': {
            'priceMin': 0,
            'priceMax': 20000,
            },
        'soundSig': {
            'u-shaped': true,
            },
        }
    };

// Set proxy for state object
let proxyHandler = {
    get(target, name) {
        let v = target[name];
        return typeof v == 'object' ? new Proxy(v, proxyHandler) : v;
    },
    set(obj, prop, value) {
        obj[prop] = value;
        applyState(state);
    }
};
let stateP = new Proxy(state, proxyHandler);


// Object for available controls
let controls = {
    'displayMode': {
        'type': 'onlyOne',
        'location': 'controlsPanel',
        'options': [
            {
                'name': 'cards',
                'label': 'Cards',
                'default': true,
                //'onState': stateP.listMode = 'cards',
            },
            {
                'name': 'table',
                'label': 'Table view',
                'default': false,
                //'onState': stateP.listMode = 'table',
            }
        ]
    },
    'sorting': {
        'type': 'sorting',
        'location': 'controlsPanel',
        'options': [
            {
                'name': 'default',
                'label': 'Default',
                'default': true,
                //'onState': stateP.sort = 'Default',
            },
            {
                'name': 'priceHighLow',
                'label': 'Price: High to low',
                'default': false,
                //'onState': stateP.sort = 'PriceHighLow',
            },
            {
                'name': 'priceLowHigh',
                'label': 'Price: Low to high',
                'default': false,
                //'onState': stateP.sort = 'PriceLowHigh',
            },
        ]
    },
    'filtersAvailability': {
        'type': 'filter',
        'location': 'controlsPanel',
        'options': [
            {
                'name': 'buyableOnly',
                'label': 'Price: High to low',
                'default': false,
                //'onState': stateP.sort = 'PriceHighLow',
            }
        ]
    }
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
    console.log('Applying state');
    console.log(state);
    // Filter data
    let filteredData = dataFilter(freshData, state.filters);
    
    // Sort data
    let sortedData = dataSort(filteredData, state.sort);
    
    // Build list items DOM
    buildListItems(sortedData, state.listMode);
}



// Filter functions
function dataFilter(data, filters) {
    var filteredData = data.filter(function (item) {
        let fullName = item.brand + ' ' + item.model,
            meetsDemoFilter = filters.availability.demoableOnly ? item.demoable.toLowerCase() === 'yes' ? 1 : 0 : 1,
            
            // Driver filters
            isBa = item.drivers.toLowerCase().indexOf('ba') > -1 ? 1 : 0,
            isDd = item.drivers.toLowerCase().indexOf('dd') > -1 ? 1 : 0,
            isEst = item.drivers.toLowerCase().indexOf('est') > -1 ? 1 : 0,
            isPlanar = item.drivers.toLowerCase().indexOf('planar') > -1 ? 1 : 0,
            isHybrid = isBa + isDd + isEst + isPlanar >= 2 ? true : false,
            isTribrid = isBa + isDd + isEst + isPlanar >= 3 ? true : false,
            meetsDriverBaFilter = filters.drivers.ba ? true : !isBa,
            meetsDriverDdFilter = filters.drivers.dd ? true : !isDd,
            meetsDriverEstFilter = filters.drivers.est ? true : !isEst,
            meetsDriverPlanarFilter = filters.drivers.planar ? true : !isPlanar,
            
            // Connection filters
            meetsConnectionTwopinFilter = filters.connection.twopin ? true : item.connection.toLowerCase().indexOf('2-pin') === -1,
            meetsConnectionMmcxFilter = filters.connection.mmcx ? true : item.connection.toLowerCase().indexOf('mmcx') === -1,
            meetsConnectionIpxFilter = filters.connection.ipx ? true : item.connection.toLowerCase().indexOf('ipx') === -1,
            
            // Availability filters
            meetsBuyableFilter = filters.availability.buyableOnly ? item.linkStore.length > 0 : true,
            meetsTestedFilter = filters.availability.crinTestedOnly ? item.tested === 'yes' : true,
            meetsApprovedFilter = filters.availability.crinApprovedOnly ? item.approved === 'yes' : true,
            meetsDiscontinuedFilter = filters.availability.discontinued ? true : item.status.toLowerCase().indexOf('discontinued') < 0;
        
        // if (fullName.toLowerCase().indexOf('thie') > -1) console.log(fullName, isHybrid, isTribrid);

        // Search filter
        return fullName.toLowerCase().includes(filters.searchString.toLowerCase())
        
        // Price filters
        && item.price >= filters.shop.priceMin
        && item.price <= filters.shop.priceMax
        
        // Demo filter
        && meetsDemoFilter
        
        // Driver filters
        && meetsDriverBaFilter
        && meetsDriverDdFilter
        && meetsDriverEstFilter
        && meetsDriverPlanarFilter
        
        // Connection filters
        && meetsConnectionTwopinFilter
        && meetsConnectionMmcxFilter
        && meetsConnectionIpxFilter
        
        // Availability filters
        && meetsBuyableFilter
        && meetsTestedFilter
        && meetsApprovedFilter
        && meetsDiscontinuedFilter
    });
    
    return filteredData;
}



// Sort functions
function dataSort(data, sort) {
    let sortFunction = 'sort' + sort;
    
    data.sort(window[sortFunction]);
    
    return data;
}

function sortRaw(a, b) {
    return 0;
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
    } else if (sumA === sumB && a.price < b.price) {
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
    // Clear DOM & set mode
    elemListContents.innerHTML = '';
    elemListContents.setAttribute('list-mode', 'cards');
    
    // console.log(data[0]);
    
    data.forEach(function(item) {
        // Core card structure
        let elemCardContainer = newElem('article', 'card-container'),
            elemCardHeader = newElem('section', 'card-header'),
            elemCardBody = newElem('section', 'card-body'),
            elemCardFooter = newElem('section', 'card-footer');
        
        elemCardContainer.append(elemCardHeader);
        elemCardContainer.append(elemCardBody);
        elemCardContainer.append(elemCardFooter);
        
        if (item.approved.toLowerCase() === 'yes') elemCardContainer.setAttribute('data-approved', 'true');
        if (item.tested.toLowerCase() === 'yes') elemCardContainer.setAttribute('data-tested', 'true');
        if (item.status.toLowerCase() === 'discontinued') elemCardContainer.setAttribute('data-discontinued', 'true');
        
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
            storePrice = newElem('span', 'phone-store-price', null, numDisplay(item.price, 'currency', 'usd'));
        
        elemCardBody.append(bodyLinks);
        bodyLinks.append(linkShowcase);
        bodyLinks.append(linkMeasurement);
        bodyLinks.append(linkStore);
        linkStore.append(storePrice);
        
        // Card footer
        let footerStatus = newElem('div', 'phone-status', [{'key': 'status', 'val': item.status}], item.status);
        
        elemCardFooter.append(footerStatus);
        
        // Add finished card DOM
        elemListContents.append(elemCardContainer);
    });
    
    let countDataItems = data.length,
        countDataItemsTotal = freshData.length,
        countDataItemsMissing = countDataItemsTotal - countDataItems,
        dipslayItemsMissing = numDisplay(countDataItemsMissing, 'decimal', false),
        missingWarningContainer = newElem('article', 'phones-missing-container'),
        missingWarningCopy = newElem('div', 'phones-missing', null, dipslayItemsMissing + ' models hidden by current filters');
    
    if (countDataItemsMissing) {
        missingWarningContainer.append(missingWarningCopy);
        elemListContents.append(missingWarningContainer);
    }
}
