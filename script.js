
//////////////////////////////////////////////////
// Helper functions

// Helper: Create element, add classes, add attributes, add content
function newElem(type, classes, attributes, content) {
    let element = document.createElement(type);
    
    element.className = classes;
    
    if (attributes) {
        attributes.forEach(function(attribute) {
            //element.setAttribute(attribute.key.toLowerCase().replace(' ', '-'), attribute.val.toLowerCase().replace(' ', '-'));
            element.setAttribute(attribute.key, attribute.val);
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



//////////////////////////////////////////////////
// Initialization
let elemList = newElem('main', 'list'),
    elemListContentsContainer = newElem('section', 'list-contents-container'),
    elemListContents = newElem('div', 'list-contents'),
    elemListFiltersContainer = newElem('section', 'list-filters-container'),
    elemListFilters = newElem('div', 'list-filters'),
    elemListManagerContainer = newElem('section', 'list-manager-container'),
    elemListManager = newElem('div', 'list-manager');
elemListFiltersContainer.append(elemListFilters);
elemList.append(elemListFiltersContainer);
elemListManagerContainer.append(elemListManager);
elemListContentsContainer.append(elemListManagerContainer);
elemListContentsContainer.append(elemListContents);
elemList.append(elemListContentsContainer);
document.querySelector('body').prepend(elemList);

// Define state object for the list
let state = {
    'environment': 'dev',
    'jqueryLoaded': false,
    'tableMode': false,
    'sort': 'priceLowHigh',
    'overlayFilters': false,
    'filters': {
        'featured': {
            'crinApprovedOnly': false,
            'crinTestedOnly': false,
            'userFavesOnly': false,
        },
        'availability': {
            'buyableOnly': false,
            'demoableOnly': false,
            'discontinued': false,
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
        'price': {
            'priceMin': '',
            'priceMax': '',
            },
        'searchString': '',
        'soundSig': {
            'u-shaped': true,
            },
        }
    },
    stateDefaults = structuredClone(state);

// Set proxy for state object
let proxyHandlerState = {
    get(target, name) {
        let v = target[name];
        return typeof v == 'object' ? new Proxy(v, proxyHandlerState) : v;
    },
    set(obj, prop, value) {
        obj[prop] = value;
        applyState(state);
    }
};
let stateP = new Proxy(state, proxyHandlerState);

let stateData = {
    'groupSize': 100,
    'readyData': '',
    'countItems': 0,
    'countGroups': 0,
    'countItemsLastGroup': 0,
    'groupLastSeen': 0,
    'groupContainers': []
};

// Object for available controls
let controls = [
    {
        'name': 'filtersOverlay',
        'displayName': 'Filters overlay',
        'type': 'toggle',
        'location': 'listManager',
        'toggles': [
            {
                'name': 'filtersOverlay',
                'displayName': 'Overlay filters',
                'values': [
                    true,
                    false
                ],
                'defaultValue': false,
                get stateLoc() { return stateP.overlayFilters },
                'stateSet': function(val) { stateP.overlayFilters = val }
            }
        ]
    },
    {
        'name': 'listMode',
        'displayName': 'List mode',
        'type': 'toggle',
        'location': 'listManager',
        'toggles': [
            {
                'name': 'tableView',
                'displayName': 'Table view',
                'values': [
                    true,
                    false
                ],
                'defaultValue': false,
                get stateLoc() { return stateP.tableMode },
                'stateSet': function(val) { stateP.tableMode = val; if (val) {stateP.sort = 'unsorted'} else {stateP.sort = 'priceLowHigh'}; }
            }
        ]
    },
    {
        'name': 'sortBy',
        'displayName': 'Sort by',
        'type': 'dropdown',
        'location': 'listManager',
        'values': [
            {
                'displayName': '(unsorted)',
                'value': 'unsorted',
            },
            {
                'displayName': 'Price: Highest first',
                'value': 'priceHighLow',
                
            },
            {
                'displayName': 'Price: Lowest first',
                'value': 'priceLowHigh',
            },
        ],
        'defaultValue': 'priceLowHigh',
        get stateLoc() { return stateP.sort },
        'stateSet': function(val) { stateP.sort = val }
    },
    {
        'label': 'Search',
        'name': 'search',
        'displayName': 'Search',
        'type': 'search',
        'location': 'listFilters',
        get stateLoc() { return stateP.filters.searchString },
        'stateSet': function(val) { stateP.filters.searchString = val }
    },
    {
        'name': 'priceRange',
        'displayName': 'Price range',
        'type': 'range',
        'location': 'listFilters',
        'values': [
            {
                'displayName': 'Min',
                'name': 'min',
                'value': '',
                get stateLoc() { return stateP.filters.price.priceMin },
                'stateSet': function(val) { stateP.filters.price.priceMin = val }
            },
            {
                'displayName': 'Max',
                'name': 'max',
                'value': '',
                get stateLoc() { return stateP.filters.price.priceMax },
                'stateSet': function(val) { stateP.filters.price.priceMax = val }
            },
        ],
    },
    {
        'name': 'featured',
        'displayName': '',
        'type': 'toggle',
        'location': 'listFilters',
        'toggles': [
            {
                'name': 'crinApprovedOnly',
                'displayName': 'Crin-approved only',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': false,
                get stateLoc() { return stateP.filters.featured.crinApprovedOnly },
                'stateSet': function(val) { stateP.filters.featured.crinApprovedOnly = val; if (val) {stateP.filters.featured.crinTestedOnly = val}; }
            },
            {
                'name': 'crinTestedOnly',
                'displayName': 'Crin-tested only',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': false,
                get stateLoc() { return stateP.filters.featured.crinTestedOnly },
                'stateSet': function(val) { stateP.filters.featured.crinTestedOnly = val; if (!val) {stateP.filters.featured.crinApprovedOnly = val} }
            },
            {
                'name': 'favoritesOnly',
                'displayName': 'My faves only',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': false,
                get stateLoc() { return stateP.filters.featured.userFavesOnly },
                'stateSet': function(val) { stateP.filters.featured.userFavesOnly = val; if (!val) {stateP.filters.featured.userFavesOnly = val} }
            },
        ],
    },
    {
        'name': 'availability',
        'displayName': 'Availability',
        'type': 'toggle',
        'location': 'listFilters',
        'toggles': [
            {
                'name': 'buyableOnly',
                'displayName': 'Buyable only',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': false,
                get stateLoc() { return stateP.filters.availability.buyableOnly },
                'stateSet': function(val) { stateP.filters.availability.buyableOnly = val }
            },
            {
                'name': 'demoableOnly',
                'displayName': 'Demoable only',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': false,
                get stateLoc() { return stateP.filters.availability.demoableOnly },
                'stateSet': function(val) { stateP.filters.availability.demoableOnly = val }
            },
            {
                'name': 'discontinued',
                'displayName': 'Hide discontinued',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': false,
                get stateLoc() { return stateP.filters.availability.discontinued },
                'stateSet': function(val) { stateP.filters.availability.discontinued = val }
            },
        ],
    },
    {
        'name': 'driver',
        'displayName': 'Driver configurations',
        'type': 'toggle',
        'location': 'listFilters',
        'toggles': [
            {
                'name': 'ba',
                'displayName': 'Balanced armature',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': true,
                get stateLoc() { return stateP.filters.drivers.ba },
                'stateSet': function(val) { stateP.filters.drivers.ba = val }
            },
            {
                'name': 'dd',
                'displayName': 'Dynamic driver',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': true,
                get stateLoc() { return stateP.filters.drivers.dd },
                'stateSet': function(val) { stateP.filters.drivers.dd = val }
            },
            {
                'name': 'est',
                'displayName': 'Electrostat',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': true,
                get stateLoc() { return stateP.filters.drivers.est },
                'stateSet': function(val) { stateP.filters.drivers.est = val }
            },
            {
                'name': 'planar',
                'displayName': 'Planar',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': true,
                get stateLoc() { return stateP.filters.drivers.planar },
                'stateSet': function(val) { stateP.filters.drivers.planar = val }
            },
        ],
    },
    {
        'name': 'connection',
        'displayName': 'Connection type',
        'type': 'toggle',
        'location': 'listFilters',
        'toggles': [
            {
                'name': 'twopin',
                'displayName': '2-pin',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': true,
                get stateLoc() { return stateP.filters.connection.twopin },
                'stateSet': function(val) { stateP.filters.connection.twopin = val }
            },
            {
                'name': 'mmcx',
                'displayName': 'MMCX',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': true,
                get stateLoc() { return stateP.filters.connection.mmcx },
                'stateSet': function(val) { stateP.filters.connection.mmcx = val }
            },
            {
                'name': 'ipx',
                'displayName': 'IPX',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': true,
                get stateLoc() { return stateP.filters.connection.ipx },
                'stateSet': function(val) { stateP.filters.connection.ipx = val }
            },
        ],
    }
];



//////////////////////////////////////////////////
// State application

// Apply the state to the app
function applyState(state, saveScroll) {
    // Filter data
    let filteredData = dataFilter(freshData, state.filters);
    
    // Sort data
    let sortedData = dataSort(filteredData, state.sort);
    
    // Build list items DOM
    buildListItems(sortedData, state.tableMode, saveScroll);
    
    // Filters overlay
    document.querySelector('body').setAttribute('filters-overlay', state.overlayFilters);
    
    applyStateControls();
    applyStateUrl();
}

// Apply state to the controls
function applyStateControls() {
    controls.forEach(function(control) {
        if (control.type === 'toggle') {
            control.toggles.forEach(function(toggle) {
                let uiState = toggle.uiElem.checked,
                    statesMatch = uiState === toggle.stateLoc ? true : false;
                
                if (!statesMatch) toggle.uiElem.checked = toggle.stateLoc;
            });
        }
        
        if (control.type === 'dropdown') {
            let uiState = control.uiElem.value,
                statesMatch = uiState === control.stateLoc ? true : false;

            if (!statesMatch) control.uiElem.value = control.stateLoc;
        }
        
        if (control.type === 'search') {
            let uiState = control.uiElem.value,
                statesMatch = uiState === control.stateLoc ? true : false;

            if (!statesMatch) control.uiElem.value = control.stateLoc;
        }
        
        if (control.type === 'range') {
            control.values.forEach(function(value) {
                let uiState = value.uiElem.value,
                    statesMatch = uiState === value.stateLoc ? true : false;
                
                if (!statesMatch) value.uiElem.value = value.stateLoc;
            });
        }
    });
}

// Apply state to the URL
function applyStateUrl() {
    let url = new URL(window.location.href);
    
    // Core filters
    stateP.tableMode === stateDefaults.tableMode ? url.searchParams.delete('tableMode') : url.searchParams.set('tableMode', stateP.tableMode);
    stateP.sort === stateDefaults.sort ? url.searchParams.delete('sort') : url.searchParams.set('sort', stateP.sort);
    stateP.filters.searchString === stateDefaults.filters.searchString ? url.searchParams.delete('searchString') : url.searchParams.set('searchString', stateP.filters.searchString);
    
    // Featured filters
    stateP.filters.featured.crinApprovedOnly === stateDefaults.filters.featured.crinApprovedOnly ? url.searchParams.delete('crinApprovedOnly') : url.searchParams.set('crinApprovedOnly', stateP.filters.featured.crinApprovedOnly);
    stateP.filters.featured.crinTestedOnly === stateDefaults.filters.featured.crinTestedOnly ? url.searchParams.delete('crinTestedOnly') : url.searchParams.set('crinTestedOnly', stateP.filters.featured.crinTestedOnly);
    stateP.filters.featured.userFavesOnly === stateDefaults.filters.featured.userFavesOnly ? url.searchParams.delete('userFavesOnly') : url.searchParams.set('userFavesOnly', stateP.filters.featured.userFavesOnly);
    
    // Availability filters
    stateP.filters.availability.buyableOnly === stateDefaults.filters.availability.buyableOnly ? url.searchParams.delete('buyableOnly') : url.searchParams.set('buyableOnly', stateP.filters.availability.buyableOnly);
    stateP.filters.availability.demoableOnly === stateDefaults.filters.availability.demoableOnly ? url.searchParams.delete('demoableOnly') : url.searchParams.set('demoableOnly', stateP.filters.availability.demoableOnly);
    stateP.filters.availability.discontinued === stateDefaults.filters.availability.discontinued ? url.searchParams.delete('discontinued') : url.searchParams.set('discontinued', stateP.filters.availability.discontinued);
    
    // Connection filters
    stateP.filters.connection.ipx === stateDefaults.filters.connection.ipx ? url.searchParams.delete('ipx') : url.searchParams.set('ipx', stateP.filters.connection.ipx);
    stateP.filters.connection.mmcx === stateDefaults.filters.connection.mmcx ? url.searchParams.delete('mmcx') : url.searchParams.set('mmcx', stateP.filters.connection.mmcx);
    stateP.filters.connection.twopin === stateDefaults.filters.connection.twopin ? url.searchParams.delete('twopin') : url.searchParams.set('twopin', stateP.filters.connection.twopin);
    
    // Driver filters
    stateP.filters.drivers.ba === stateDefaults.filters.drivers.ba ? url.searchParams.delete('ba') : url.searchParams.set('ba', stateP.filters.drivers.ba);
    stateP.filters.drivers.dd === stateDefaults.filters.drivers.dd ? url.searchParams.delete('dd') : url.searchParams.set('dd', stateP.filters.drivers.dd);
    stateP.filters.drivers.est === stateDefaults.filters.drivers.est ? url.searchParams.delete('est') : url.searchParams.set('est', stateP.filters.drivers.est);
    stateP.filters.drivers.planar === stateDefaults.filters.drivers.planar ? url.searchParams.delete('planar') : url.searchParams.set('planar', stateP.filters.drivers.planar);
    stateP.filters.drivers.hybrid === stateDefaults.filters.drivers.hybrid ? url.searchParams.delete('hybrid') : url.searchParams.set('hybrid', stateP.filters.drivers.hybrid);
    stateP.filters.drivers.tribrid === stateDefaults.filters.drivers.tribrid ? url.searchParams.delete('tribrid') : url.searchParams.set('tribrid', stateP.filters.drivers.tribrid);
    
    // Price filters
    stateP.filters.price.priceMin === stateDefaults.filters.price.priceMin ? url.searchParams.delete('priceMin') : url.searchParams.set('priceMin', stateP.filters.price.priceMin);
    stateP.filters.price.priceMax === stateDefaults.filters.price.priceMax ? url.searchParams.delete('priceMax') : url.searchParams.set('priceMax', stateP.filters.price.priceMax);
    
    history.pushState(null, '', url);
}

// Apply the URL to the state
function applyUrlToState() {
    let urlQueryString = window.location.search,
        urlQueryParams = new URLSearchParams(urlQueryString),
        
        tableMode = urlQueryParams.get('tableMode'),
        sort = urlQueryParams.get('sort'),
        searchString = urlQueryParams.get('searchString'),
        
        crinApprovedOnly = urlQueryParams.get('crinApprovedOnly') === 'true' ? true : urlQueryParams.get('crinApprovedOnly') === 'false' ? false : null,
        crinTestedOnly = urlQueryParams.get('crinTestedOnly') === 'true' ? true : urlQueryParams.get('crinTestedOnly') === 'false' ? false : null,
        userFavesOnly = urlQueryParams.get('userFavesOnly') === 'true' ? true : urlQueryParams.get('userFavesOnly') === 'false' ? false : null,
        
        buyableOnly = urlQueryParams.get('buyableOnly') === 'true' ? true : urlQueryParams.get('buyableOnly') === 'false' ? false : null,
        demoableOnly = urlQueryParams.get('demoableOnly') === 'true' ? true : urlQueryParams.get('demoableOnly') === 'false' ? false : null,
        discontinued = urlQueryParams.get('discontinued') === 'true' ? true : urlQueryParams.get('discontinued') === 'false' ? false : null,
        
        ipx = urlQueryParams.get('ipx') === 'true' ? true : urlQueryParams.get('ipx') === 'false' ? false : null,
        mmcx = urlQueryParams.get('mmcx') === 'true' ? true : urlQueryParams.get('mmcx') === 'false' ? false : null,
        twopin = urlQueryParams.get('twopin') === 'true' ? true : urlQueryParams.get('twopin') === 'false' ? false : null,
        
        ba = urlQueryParams.get('ba') === 'true' ? true : urlQueryParams.get('ba') === 'false' ? false : null,
        dd = urlQueryParams.get('dd') === 'true' ? true : urlQueryParams.get('dd') === 'false' ? false : null,
        est = urlQueryParams.get('est') === 'true' ? true : urlQueryParams.get('dd') === 'false' ? false : null,
        planar = urlQueryParams.get('planar') === 'true' ? true : urlQueryParams.get('dd') === 'false' ? false : null,
        hybrid = urlQueryParams.get('hybrid') === 'true' ? true : urlQueryParams.get('dd') === 'false' ? false : null,
        tribrid = urlQueryParams.get('tribrid') === 'true' ? true : urlQueryParams.get('dd') === 'false' ? false : null,

        priceMin = urlQueryParams.get('priceMin'),
        priceMax = urlQueryParams.get('priceMax');
    
    // Core filters
    tableMode != null ? stateP.tableMode = tableMode : '';
    sort != null ? stateP.sort = sort : '';
    searchString != null ? stateP.filters.searchString = searchString : '';

    // Featured filters
    crinApprovedOnly != null ? stateP.filters.featured.crinApprovedOnly = crinApprovedOnly : '';
    crinTestedOnly != null ? stateP.filters.featured.crinTestedOnly = crinTestedOnly : '';
    userFavesOnly != null ? stateP.filters.featured.userFavesOnly = userFavesOnly : '';
    
    // Availability filters
    buyableOnly != null ? stateP.filters.availability.buyableOnly = buyableOnly : '';
    demoableOnly != null ? stateP.filters.availability.demoableOnly = demoableOnly : '';
    discontinued != null ? stateP.filters.availability.discontinued = discontinued : '';
    
    // Connection filters
    ipx != null ? stateP.filters.connection.ipx = ipx : '';
    mmcx != null ? stateP.filters.connection.mmcx = mmcx : '';
    twopin != null ? stateP.filters.connection.twopin = twopin : '';
    
    // Driver filters
    ba != null ? stateP.filters.drivers.ba = ba : '';
    dd != null ? stateP.filters.drivers.dd = dd : '';
    est != null ? stateP.filters.drivers.est = est : '';
    planar != null ? stateP.filters.drivers.planar = planar : '';
    hybrid != null ? stateP.filters.drivers.hybrid = hybrid : '';
    tribrid != null ? stateP.filters.drivers.tribrid = tribrid : '';
    
    // Price filters
    priceMin != null ? stateP.filters.price.priceMin = priceMin : '';
    priceMax != null ? stateP.filters.price.priceMax = priceMax : '';
}



//////////////////////////////////////////////////
// Data handlng

// Set data variables
let json = 'data.json',
    freshData = getDataFresh(json),
    jqueryLoaded = false;



// Get data
function getDataFresh (json) {
    let dataArr = [];
    
    if (!state.jqueryLoaded) {
        function loadJquery() {
            let scriptJquery = document.createElement('script'),
                hostedJquery = 'https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js';

            scriptJquery.setAttribute('type', 'text/javascript');
            scriptJquery.setAttribute('src', hostedJquery);
            scriptJquery.addEventListener('load', function() {
                try {
                    state.jqueryLoaded = true;
                    getDataFromJson(json);
                } catch {}
            });

            document.querySelector('footer').append(scriptJquery);
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
                    'itemId': item['Brand'].toString().toLowerCase().replaceAll(' ', '') + item['IEM Model'].toString().toLowerCase().replaceAll(' ', ''),
                    'approved': item['Crinacle Approved ✔️'] ? 'yes' : 'no',
                    'brand': item['Brand'],
                    'connection': item['Connection'],
                    'demoable': item['Available at Hangout for Demo'] === 'Yes' ? true : false,
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
                    'userFave': false,
                    '_end': ''
                };
                
                dataArr.push(itemObject);
            });
        })
        .then(function() {
            readUserFaves(freshData);
            applyUrlToState();
            applyState(state);
        })
    }
    
    return dataArr;
}

// User favorites functions
function toggleUserFave(item) {
    let startingFaveState = item.userFave,
        newFaveState = startingFaveState ? false : true,
        saveScroll = true;
    
    item.userFave = newFaveState;
    applyState(state, saveScroll);
    
    saveUserFaves(item, newFaveState);
}

function saveUserFaves(item, newFaveState) {
    let faveObj = localStorage.getItem('userFaves') ? JSON.parse(localStorage.getItem('userFaves')) : [],
        indexOfitem = faveObj.indexOf(item.itemId);
    
    if (newFaveState) {
        indexOfitem > -1 ? '' : faveObj.push(item.itemId);
    } else {
        indexOfitem > -1 ? faveObj.splice(indexOfitem, 1) : '';
    }
        
    localStorage.setItem('userFaves', JSON.stringify(faveObj));
}

function readUserFaves(data) {
    let faveObj = localStorage.getItem('userFaves') ? JSON.parse(localStorage.getItem('userFaves')) : [];
    
    faveObj.forEach(function(favorite) {
        let faveInData = data.find(item => item.itemId === favorite);
        
        faveInData ? faveInData.userFave = true : '';
    });
    
}



// Filter functions
function dataFilter(data, filters) {
    var filteredData = data.filter(function (item) {
        let fullName = item.brand + ' ' + item.model,
            meetsDemoFilter = filters.availability.demoableOnly ? item.demoable : 1,
            
            // Price range filters
            meetsMinPrice =  filters.price.priceMin > 0 ? item.price >= filters.price.priceMin : true,
            meetsMaxPrice =  filters.price.priceMax > 0 ? item.price <= filters.price.priceMax : true,
            
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
            meetsDiscontinuedFilter = filters.availability.discontinued ? item.status.toLowerCase().indexOf('discontinued') < 0 : true,
        
            // Featured filters
            meetsTestedFilter = filters.featured.crinTestedOnly ? item.tested === 'yes' : true,
            meetsApprovedFilter = filters.featured.crinApprovedOnly ? item.approved === 'yes' : true,
            meetsUserFaveFilter = filters.featured.userFavesOnly ? item.userFave : true;
        
        // Search filter
        return fullName.toLowerCase().includes(filters.searchString.toLowerCase())
        
        // Price filters
        && meetsMinPrice
        && meetsMaxPrice
        
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
        && meetsDiscontinuedFilter
        
        // Featured filters
        && meetsTestedFilter
        && meetsApprovedFilter
        && meetsUserFaveFilter
    });
    
    return filteredData;
}



// Sort functions
function dataSort(data, sort) {
    data.sort(function(a, b) {
        let testedA = a.tested === 'yes' ? 1 : 0,
            testedB = b.tested === 'yes' ? 1 : 0,
            approvedA = a.approved === 'yes'  ? 5 : 0,
            approvedB = b.approved === 'yes' ? 5 : 0,
            buyableA = a.linkStore ? 10 : 0,
            buyableB = b.linkStore ? 10 : 0,
            discontinuedA = a.status.toLowerCase() === 'discontinued' ? -3 : 0,
            discontinuedB = b.status.toLowerCase() === 'discontinued' ? -3 : 0,
            sumA = testedA + approvedA + buyableA + discontinuedA,
            sumB = testedB + approvedB + buyableB + discontinuedB;
        
        // Sort: Price low to high
        if (sort === 'priceLowHigh') {
            if (sumA > sumB) {
                return -1
            } else if (sumA === sumB && a.price > 0 && a.price < b.price) {
                return -1
            } else {
                return 0
            }
        // Sort: Price high to low
        } else if (sort === 'priceHighLow') {
            if (sumA > sumB) {
                return -1
            } else if (sumA === sumB && a.price > b.price) {
                return -1
            } else {
                return 0
            }
        } else if (sort === 'unsorted') {
            return 0;
        }
    });
    
    return data;
}



//////////////////////////////////////////////////
// Build DOM: Functions

// Build DOM: Controls
function constructFiltersUi(controls) {
    // elemListFilters
    controls.forEach(function(control) {
        // Create toggles
        if (control.type === 'toggle') {
            // Create section container for control
            let controlContainer = newElem('section', 'control-toggle', [{'key': 'control-id', 'val': control.name}]),
                controlHeading = newElem('h3', 'control-heading', null, control.displayName),
                parentContainer = control.location === 'listManager' ? elemListManager : elemListFilters;
            controlContainer.append(controlHeading);
            parentContainer.append(controlContainer);
            
            // Create toggle UIs
            control.toggles.forEach(function(toggle) {
                let toggleContainer = newElem('article', 'toggle-container'),
                    toggleHeading = newElem('h4', 'toggle-heading', null, toggle.displayName),
                    toggleLabel = newElem('label', 'toggle-label'),
                    toggleInput = newElem('input', 'toggle-input', [{'key': 'type', 'val': 'checkbox'}]),
                    toggleSlider = newElem('span', 'toggle-slider');
                toggleContainer.append(toggleHeading);
                if (toggle.defaultValue) toggleInput.checked = true;
                toggleLabel.append(toggleInput);
                toggleLabel.append(toggleSlider);
                toggleContainer.append(toggleLabel);
                controlContainer.append(toggleContainer);
                
                toggleInput.addEventListener('change', function(e) {
                    toggle.stateSet(e.target.checked);
                });
                
                toggle.uiElem = toggleInput;
                toggle.uiElemMethod = 'checked';
            });
        }
        
        // Create dropdowns
        if (control.type === 'dropdown') {
            let controlContainer = newElem('section', 'control-dropdown'),
                controlHeading = newElem('h3', 'control-heading', null, control.displayName),
                dropdownContainer = newElem('select', 'controls-dropdown', [{'key': 'name', 'val': control.name}]),
                parentContainer = control.location === 'listManager' ? elemListManager : elemListFilters;
            controlContainer.append(controlHeading);
            controlContainer.append(dropdownContainer);
            parentContainer.append(controlContainer);
            
            // Create dropdown UIs
            control.values.forEach(function(value) {
                let option = newElem('option', null, [{'key': 'value', 'val': value.value}], value.displayName);
                dropdownContainer.append(option);
            });
            dropdownContainer.value = control.defaultValue;
            
            dropdownContainer.addEventListener('change', function(e){
                control.stateSet(e.target.value);
            });
            
            control.uiElem = dropdownContainer;
            control.uiElemMethod = 'value';
        }
        
        // Create search
        if (control.type === 'search') {
            let controlContainer = newElem('section', 'control-search'),
                searchHeading = newElem('h3', 'search-heading', null, control.displayName),
                searchInput = newElem('input', 'search-input', [{'key': 'placeholder', 'val': 'Search'}]),
                parentContainer = control.location === 'listManager' ? elemListManager : elemListFilters;
            controlContainer.append(searchHeading);
            controlContainer.append(searchInput);
            parentContainer.append(controlContainer);
            
            searchInput.addEventListener('focus', () => searchInput.select());
            searchInput.addEventListener('input', function(e) {
                try { clearTimeout(searchDelay); } catch {}
                searchDelay = setTimeout(function() {
                    control.stateSet(searchInput.value);
                }, 500);
            });
            
            control.uiElem = searchInput;
            control.uiElemMethod = 'value';
        }
        
        // Create range
        if (control.type === 'range') {
            let controlContainer = newElem('section', 'control-price'),
                pricehHeading = newElem('h3', 'price-heading', null, control.displayName),
                priceForm = newElem('form', 'price'),
                parentContainer = control.location === 'listManager' ? elemListManager : elemListFilters;
            controlContainer.append(pricehHeading);
            controlContainer.append(priceForm);
            parentContainer.append(controlContainer);
            
            control.values.forEach(function(value) {
                let valueInput = newElem('input', value.name, [{'key': 'placeholder', 'val': value.displayName}, {'key': 'type', 'val': 'number'}]);
                priceForm.append(valueInput);
                
                valueInput.addEventListener('focus', () => valueInput.select());
                valueInput.addEventListener('input', function(e) {
                    try { clearTimeout(searchDelay); } catch {}
                    searchDelay = setTimeout(function() {
                        value.stateSet(valueInput.value);
                    }, 500);
                });
                
                value.uiElem = valueInput;
                value.uiElemMethod = 'value';
            });
        }
    });
    
    let filtersResultContainer = newElem('section', 'filter-result-container', [{'key': 'phones-hiddem', 'val': "false"}]),
        filtersResult = newElem('span', 'filter-result', [{'key': 'id', 'val': 'filter-result'}]);
    filtersResultContainer.append(filtersResult);
    elemListFilters.prepend(filtersResultContainer);
}
constructFiltersUi(controls);



// Build DOM: Content initialization
function buildListItems(data, tableMode, saveScroll) {
    saveScroll ? '' : elemListContentsContainer.scrollTop = 0;
    elemListContents.innerHTML = '';
    
    // Set stateData values
    let dataGroupSize = 100,
        countDataItems = data.length;
    
    // Set data state values
    stateData.readyData = data;
    stateData.countItems = data.length;
    stateData.countGroups = Math.ceil(stateData.countItems / dataGroupSize);
    stateData.countItemsLastGroup = stateData.countItems - ((stateData.countGroups -1 ) * dataGroupSize);
    
    buildGroup(data, 0);
    
    // Add count of hidden items
    let countDataItemsTotal = freshData.length,
        countDataItemsMissing = countDataItemsTotal - countDataItems,
        displayItems = numDisplay(countDataItems, 'decimal', false),
        displayItemsMissing = countDataItemsMissing != countDataItemsTotal ? numDisplay(countDataItemsMissing, 'decimal', false) : 'All',
        missingWarningContainer = newElem('article', 'phones-missing-container'),
        missingWarningCopy = newElem('div', 'phones-missing', null, displayItems + ' models match filters (' + displayItemsMissing + ' hidden)'),
        resultCopy = countDataItemsMissing === 0 ? 'All ' + displayItems + ' models displayed' : displayItems + ' displayed (' + displayItemsMissing + ' hidden by filters)';
    
    document.querySelector('#filter-result').textContent = resultCopy;
}

// For paginating data
function buildGroup(data, groupIndex) {
    let groupA = groupIndex > 1 ? groupIndex - 1 : 0,
        groupB = groupIndex === 0 ? 1 : groupIndex,
        groupC = groupB < stateData.countGroups ? groupB + 1 : 0,
        groupsActive = [];
    
    if (groupA) groupsActive.push(groupA);
    if (groupB) groupsActive.push(groupB);
    if (groupC) groupsActive.push(groupC);
    
    // Clear group containers
    function clearInactive() {
        let allGroupContainers = document.querySelectorAll('div.group-container');
        
        allGroupContainers.forEach(function(groupContainer) {
            let groupId = parseInt(groupContainer.getAttribute('group-index')),
                groupValid = groupId <= stateData.countGroups ? true : false,
                groupActive = groupsActive.includes(groupId);
            
            if (!groupValid) {
                groupContainer.remove();
            } else if (!groupActive) {
                groupContainer.setAttribute('style', 'height: ' + groupContainer.offsetHeight + 'px;');
                groupContainer.innerHTML = '';
            }
        });
    }
    clearInactive()
    
    // Populate group containers
    if (groupA) next(groupA);
    if (groupB) next(groupB);
    if (groupC) next(groupC);
    
    function next(groupIndex) {
        let indexStart = groupIndex * stateData.groupSize - stateData.groupSize,
            indexEnd = groupIndex < stateData.countGroups ? groupIndex * stateData.groupSize : indexStart + stateData.countItemsLastGroup,
            groupData = data.slice(indexStart, indexEnd);
        
        let groupContainerExists = document.querySelector('div[group-index="' + groupIndex + '"'),
            groupContainer = groupContainerExists ? document.querySelector('div[group-index="' + groupIndex + '"') : createGroupContainer(groupIndex, data);
        
        if (!groupContainerExists) elemListContents.append(groupContainer);
        groupContainer.innerHTML = '';
        
        if (state.tableMode) {
            buildTableHeader(groupData, groupContainer);
        } else {
            buildCards(groupData, groupContainer);
        }
    }
    
}

// Paginating data cont.
function createGroupContainer(groupIndex, data) {
    let groupContainer = newElem('div', 'group-container', [{'key': 'group-index', 'val': groupIndex}]);
    
    let observerOptions = {
            root: document.querySelector('body'),
            //root: elemListContentsContainer,
            //rootMargin: "-200px",
            rootMargin: "0px",
            threshold: 0.000001
    };
    let observerCallback = (entries, observerOptions) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                buildGroup(data, groupIndex);
            }
        })
    };
    let observer = new IntersectionObserver(observerCallback, observerOptions)
    observer.observe(groupContainer);
    
    return groupContainer;
}



// Build DOM: Table
function buildTableHeader(data, container) {
    let tableHeaderExists = document.querySelectorAll('section.list-table').length ? true : false;
    
    if (!tableHeaderExists) {
        // Clear DOM & set mode
        elemListContents.setAttribute('list-mode', 'table');
        elemList.setAttribute('list-mode', 'table');

        // Create header row
        let tableBody = newElem('section', 'list-table table-header'),
            tableHead = newElem('article', 'table-head'),
            headName = newElem('div', 'table-head-name', null, 'Name'),
            headTested = newElem('div', 'table-head-tested', null, 'Tested / Approved?'),
            headFave = newElem('div', 'table-head-fave', null, 'My fave'),
            headBuy = newElem('div', 'table-head-buy', null, 'Price'),
            headDemoable = newElem('div', 'table-head-demoable', null, 'Demo @ The Hangout?'),
            headShowcase = newElem('div', 'table-head-showcase', null, 'Showcase'),
            headMeasurement = newElem('div', 'table-head-measurement', null, 'Graph'),
            headSignature = newElem('div', 'table-head-signature', null, 'Sound signature'),
            headDrivers = newElem('div', 'table-head-drivers', null, 'Driver config'),
            headConnection = newElem('div', 'table-head-connection', null, 'Connection');
        tableHead.append(headName);
        tableHead.append(headTested);
        tableHead.append(headFave);
        tableHead.append(headBuy);
        tableHead.append(headDemoable);
        tableHead.append(headShowcase);
        tableHead.append(headMeasurement);
        tableHead.append(headSignature);
        tableHead.append(headDrivers);
        tableHead.append(headConnection);
        tableBody.append(tableHead);
        elemListContents.prepend(tableBody);
    }
    
    buildTable(data, container);
}

function buildTable(data, container) {
    // Handle each item in filtered + sorted list
    data.forEach(function(item) {
        let phoneContainer = newElem('article', 'table-phone-container', [{'key': 'status', 'val': item.status.toLowerCase().replace(' ', '-')}]),
            phoneName = newElem('div', 'table-phone-name', null, item.brand + ' ' + item.model),
            phoneTested = newElem('div', 'table-phone-tested', [{'key': 'crin-tested', 'val': item.tested}, {'key': 'crin-approved', 'val': item.approved}]),
            phoneFave = newElem('div', 'table-phone-fave', [{'key': 'is-user-fave', 'val': item.userFave}]);
        phoneContainer.append(phoneName);
        phoneContainer.append(phoneTested);
        phoneContainer.append(phoneFave);
        phoneFave.addEventListener('click', () => toggleUserFave(item));
        
        let phoneBuy = newElem('div', 'table-phone-buy'),
            phoneBuyLink = item.linkStore
                ? newElem('a', 'table-phone-buy-link', [{'key': 'href', 'val': item.linkStore}])
                : newElem('a', 'table-phone-buy-link'),
            displayPrice = item.status.toLowerCase().indexOf('discontinued') < 0 ? item.price > 0 ? numDisplay(item.price, 'currency', 'usd') : 'unknown' : 'discontinued',
            phonePrice = newElem('span', 'table-phone-price', null, displayPrice),
            phoneDemoable = newElem('div', 'table-phone-demoable', [{'key': 'data-demoable', 'val': item.demoable}]);
        phoneBuyLink.append(phonePrice);
        phoneBuy.append(phoneBuyLink);
        phoneContainer.append(phoneBuy);
        phoneContainer.append(phoneDemoable);
        
        let phoneShowcase = newElem('div', 'table-phone-showcase'),
            phoneShowcasehLink = item.linkShowcase
                ? newElem('a', 'table-phone-showcase-link', [{'key': 'href', 'val': item.linkShowcase}])
                : '';
        phoneShowcase.append(phoneShowcasehLink);
        phoneContainer.append(phoneShowcase);
        
        let phoneGraph = newElem('div', 'table-phone-graph'),
            phoneGraphLink = item.linkMeasurement
                ? newElem('a', 'table-phone-graph-link', [{'key': 'href', 'val': item.linkMeasurement}])
                : '';
        phoneGraph.append(phoneGraphLink);
        phoneContainer.append(phoneGraph);
        
        let phoneSignature = newElem('div', 'table-phone-signature', null, item.signature),
            phoneDrivers = newElem('div', 'table-phone-drivers', null, item.drivers),
            phoneConnection = newElem('div', 'table-phone-connection', null, item.connection);
        phoneContainer.append(phoneSignature);
        phoneContainer.append(phoneDrivers);
        phoneContainer.append(phoneConnection);
        
        container.append(phoneContainer);
    });
}



// Build DOM: Cards
function buildCards(data, container) {
    // Clear DOM & set mode
    elemListContents.setAttribute('list-mode', 'cards');
    elemList.setAttribute('list-mode', 'cards');
    
    // Handle each item in filtered + sorted list
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
            linkFave = newElem('a', 'phone-link phone-link-fave', [{'key': 'is-user-fave', 'val': item.userFave}], 'My fave'),
            linkShowcase = item.linkShowcase
                            ? newElem('a', 'phone-link phone-link-showcase', [{'key': 'href', 'val': item.linkShowcase}], 'Showcase')
                            : '',
            linkMeasurement = item.linkMeasurement ?
                                newElem('a', 'phone-link phone-link-measurement', [{'key': 'href', 'val': item.linkMeasurement}], 'Graph')
                                : '',
            linkStore = item.linkStore
                            ? newElem('a', 'phone-link phone-link-store', [{'key': 'href', 'val': item.linkStore}], 'Buy')
                            : newElem('a', 'phone-link phone-link-store', null, ''),
            displayPrice = item.status.toLowerCase().indexOf('discontinued') < 0 ? item.price > 0 ? numDisplay(item.price, 'currency', 'usd') : 'unknown' : 'discontinued',
            storePrice = newElem('span', 'phone-store-price', null, displayPrice);
        
        linkFave.addEventListener('click', () => toggleUserFave(item));
        
        elemCardBody.append(bodyLinks);
        bodyLinks.append(linkFave);
        bodyLinks.append(linkShowcase);
        bodyLinks.append(linkMeasurement);
        bodyLinks.append(linkStore);
        linkStore.append(storePrice);
        
        // Card footer
        let footerStatus = newElem('div', 'phone-status', [{'key': 'status', 'val': item.status.toLowerCase().replace(' ', '-')}], item.status);
        
        elemCardFooter.append(footerStatus);
        
        // Add finished card DOM
        container.append(elemCardContainer);
    });
}
