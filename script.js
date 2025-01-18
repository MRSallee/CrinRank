
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
function numDisplay(num, style, currencyVar, fractionDigits) {
    if (currencyVar) {
        let formatter = new Intl.NumberFormat('en-uS', {
            style: style,
            currency: currencyVar,
            maximumFractionDigits: fractionDigits,
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
function initSiteHeader() {
    let siteHeaderContainer = newElem('header', 'site-header'),
        siteHeaderLogo = newElem('div', 'site-header-logo'),
        siteHeaderLinks = newElem('ul', 'site-header-links'),
        siteHeaderLinksSocial = newElem('li', 'site-header-link-container site-header-links-social'),
        siteHeaderToggle = newElem('button', 'site-header-toggle'),
        siteHeaderData = {
            'logo': {
                'imageUrl': 'https://graph.hangout.audio/hangout-logo-white-text.svg',
                'linkUrl': 'https://hangout.audio/',
            },
            'links': [
                {
                    'label': 'Hangout.Audio Store',
                    'linkUrl': ''
                },
                {
                    'label': 'Graph Comparison Tools',
                    'linkUrl': ''
                },
                {
                    'label': 'The List',
                    'linkUrl': ''
                },
            ],
            'linksSocial': [
                {
                    'label': '&#xf167;',
                    'linkUrl': 'https://www.youtube.com/@HangoutAudio',
                },
                {
                    'label': '&#xf392;',
                    'linkUrl': 'https://www.Discord.com',
                },
                {
                    'label': '&#xf16d;',
                    'linkUrl': 'https://www.instagram.com',
                },
//                {
//                    'label': '&#xe61b;',
//                    'linkUrl': 'https://x.com/',
//                },
//                {
//                    'label': '&#xf09a;',
//                    'linkUrl': 'https://www.facebook.com/',
//                },
//                {
//                    'label': '&#xe07b;',
//                    'linkUrl': 'https://www.tiktoke.com/',
//                },
            ],
        };
    siteHeaderContainer.append(siteHeaderToggle);
    siteHeaderContainer.append(siteHeaderLogo);
    siteHeaderContainer.append(siteHeaderLinks);
    
    siteHeaderToggle.addEventListener('click', function() {
        let docBody = document.querySelector('body'),
            siteHeaderLinksState = docBody.getAttribute('data-site-header-links'),
            siteHeaderLinksExpanded = siteHeaderLinksState ? siteHeaderLinksState.includes('expanded') ? 1 : 0 : 0;
        
        if (siteHeaderLinksExpanded) {
            docBody.setAttribute('data-site-header-links', 'collapsed');
        } else {
            docBody.setAttribute('data-site-header-links', 'expanded');
        }
    });
    
    // Create site header logo
    let logoLink = newElem('a', 'site-header-logo-link', [{'key': 'href', 'val': siteHeaderData.logo.linkUrl}]),
        logoImage = newElem('img', 'site-header-logo-image', [{'key': 'src', 'val': siteHeaderData.logo.imageUrl}]);
    
    logoLink.append(logoImage);
    siteHeaderLogo.append(logoLink);
    
    // Create site header links
    siteHeaderData.linksSocial.forEach(function(link) {
        let linkLink = newElem('a', 'site-header-link social', [{'key': 'href', 'val': link.linkUrl}]);
        
        linkLink.innerHTML = link.label;
        siteHeaderLinksSocial.append(linkLink);
    })
    siteHeaderLinks.append(siteHeaderLinksSocial);
    
    siteHeaderData.links.forEach(function(link) {
        let linkContainer = newElem('li', 'site-header-link-container'),
            linkLink = newElem('a', 'site-header-link', [{'key': 'href', 'val': link.linkUrl}], link.label);
        
        linkContainer.append(linkLink);
        siteHeaderLinks.append(linkContainer);
    })
    
    document.querySelector('body').prepend(siteHeaderContainer);
}
initSiteHeader();

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
document.querySelector('body').append(elemList);

// Define state object for the list
let state = {
    'environment': 'dev',
    'jqueryLoaded': false,
    'tableMode': true,
    'sort': 'alpha',
    'overlayFilters': false,
    'filters': {
        'featured': {
            'crinApprovedOnly': true,
            'crinTestedOnly': true,
            'userFavesOnly': false,
        },
        'availability': {
            'buyableOnly': false,
            'demoableOnly': false,
            'discontinued': false,
            },
        'connection': {
            'mmcx': false,
            'twopin': false,
            'twopinExtruded': false,
            'ipx': false,
            'pentaconn': false,
            'proprietary': false,
            'fixedCable': false,
            'wirelessTws': false,
            'wirelessCabled': false,
            },
        'drivers': {
            'ba': false,
            'dd': false,
            'est': false,
            'planar': false,
            'pzt': false,
            'hybrid': false,
            'notHybrid': false,
            },
        'price': {
            'priceBracket': '',
            'priceMin': '',
            'priceMax': '',
            },
        'searchString': '',
        'soundSig': {
            'u-shaped': true,
            },
        },
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
        'name': 'filtersOverlayClose',
        'displayName': 'Filters overlay',
        'type': 'toggle',
        'location': 'resultContainer',
        'toggles': [
            {
                'name': 'filtersOverlayClose',
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
                'defaultValue': true,
                get stateLoc() { return stateP.tableMode },
                'stateSet': function(val) { stateP.tableMode = val; if (val) {stateP.sort = 'alpha'} else {stateP.sort = 'priceLowHigh'}; }
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
                'displayName': 'Alphabetical: A - Z',
                'value': 'alpha',
            },
            {
                'displayName': 'Alphabetical: Z - A',
                'value': 'alpha-reverse',
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
        'defaultValue': 'alpha',
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
        'name': 'featured',
        'displayName': '',
        'type': 'toggle',
        'location': 'listFilters',
        'toggles': [
            {
                'name': 'crinApprovedOnly',
                'displayName': 'Crin-approved',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': true,
                get stateLoc() { return stateP.filters.featured.crinApprovedOnly },
                'stateSet': function(val) { stateP.filters.featured.crinApprovedOnly = val; if (val) {stateP.filters.featured.crinTestedOnly = val}; }
            },
            {
                'name': 'crinTestedOnly',
                'displayName': 'Crin-tested',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': true,
                get stateLoc() { return stateP.filters.featured.crinTestedOnly },
                'stateSet': function(val) { stateP.filters.featured.crinTestedOnly = val; if (!val) {stateP.filters.featured.crinApprovedOnly = val} }
            },
            {
                'name': 'favoritesOnly',
                'displayName': 'My faves',
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
        'name': 'priceBrackets',
        'displayName': 'Price bracket',
        'type': 'dropdown-range',
        'location': 'listFilters',
        'values': [
            {
                'displayName': 'All prices',
                'value': '',
            },
            {
                'displayName': '$25',
                'value': '25',
                
            },
            {
                'displayName': '$50',
                'value': '50',
                
            },
            {
                'displayName': '$100',
                'value': '100',
                
            },
            {
                'displayName': '$150',
                'value': '150',
                
            },
            {
                'displayName': '$200',
                'value': '200',
                
            },
            {
                'displayName': '$300',
                'value': '300',
                
            },
            {
                'displayName': '$500',
                'value': '500',
                
            },
            {
                'displayName': '$1,000',
                'value': '1000',
                
            },
            {
                'displayName': '$2,000',
                'value': '2000',
                
            },
            {
                'displayName': '$2,000+',
                'value': '1000000',
                
            },
            {
                'displayName': 'Custom',
                'value': 'custom',
                
            },
        ],
        'defaultValue': '',
        get stateLoc() { return stateP.filters.price.priceBracket },
        'stateSet': function(valA, valB, valC) { stateP.filters.price.priceBracket = valA; stateP.filters.price.priceMin = valB; stateP.filters.price.priceMax = valC }
    },
    {
        'name': 'priceRange',
        'displayName': '',
        'type': 'range',
        'location': 'listFilters',
        'values': [
            {
                'displayName': 'Min price',
                'name': 'min',
                'value': '',
                get stateLoc() { return stateP.filters.price.priceMin },
                'stateSet': function(val) { stateP.filters.price.priceMin = val }
            },
            {
                'displayName': 'Max price',
                'name': 'max',
                'value': '',
                get stateLoc() { return stateP.filters.price.priceMax },
                'stateSet': function(val) { stateP.filters.price.priceMax = val }
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
                'displayName': 'Buyable',
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
                'displayName': 'Demoable',
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
        'displayName': 'Driver configuration',
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
                'defaultValue': false,
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
                'defaultValue': false,
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
                'defaultValue': false,
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
                'defaultValue': false,
                get stateLoc() { return stateP.filters.drivers.planar },
                'stateSet': function(val) { stateP.filters.drivers.planar = val }
            },
            {
                'name': 'pzt',
                'displayName': 'Piezoelectric',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': false,
                get stateLoc() { return stateP.filters.drivers.pzt },
                'stateSet': function(val) { stateP.filters.drivers.pzt = val }
            },
            {
                'name': 'hybrid',
                'displayName': 'Hybrid, tribrid, etc.',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': false,
                get stateLoc() { return stateP.filters.drivers.hybrid },
                'stateSet': function(val) { stateP.filters.drivers.hybrid = val; if (val) stateP.filters.drivers.notHybrid = false }
            },
            {
                'name': 'notHybrid',
                'displayName': 'Not hybrid',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': false,
                get stateLoc() { return stateP.filters.drivers.notHybrid },
                'stateSet': function(val) { stateP.filters.drivers.notHybrid = val; if (val) stateP.filters.drivers.hybrid = false }
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
                'name': 'mmcx',
                'displayName': 'MMCX',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': false,
                get stateLoc() { return stateP.filters.connection.mmcx },
                'stateSet': function(val) { stateP.filters.connection.mmcx = val }
            },
            {
                'name': 'twopin',
                'displayName': '2-pin',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': false,
                get stateLoc() { return stateP.filters.connection.twopin },
                'stateSet': function(val) { stateP.filters.connection.twopin = val }
            },
            {
                'name': 'twopinExtruded',
                'displayName': '2-pin: Extruded',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': false,
                get stateLoc() { return stateP.filters.connection.twopinExtruded },
                'stateSet': function(val) { stateP.filters.connection.twopinExtruded = val }
            },
            {
                'name': 'ipx',
                'displayName': 'IPX',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': false,
                get stateLoc() { return stateP.filters.connection.ipx },
                'stateSet': function(val) { stateP.filters.connection.ipx = val }
            },
            {
                'name': 'pentaconn',
                'displayName': 'Pentaconn',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': false,
                get stateLoc() { return stateP.filters.connection.pentaconn },
                'stateSet': function(val) { stateP.filters.connection.pentaconn = val }
            },
            {
                'name': 'proprietary',
                'displayName': 'Proprietary',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': false,
                get stateLoc() { return stateP.filters.connection.proprietary },
                'stateSet': function(val) { stateP.filters.connection.proprietary = val }
            },
            {
                'name': 'fixedCable',
                'displayName': 'Fixed cable',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': false,
                get stateLoc() { return stateP.filters.connection.fixedCable },
                'stateSet': function(val) { stateP.filters.connection.fixedCable = val }
            },
            {
                'name': 'wirelessTws',
                'displayName': 'Wireless: TWS',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': false,
                get stateLoc() { return stateP.filters.connection.wirelessTws },
                'stateSet': function(val) { stateP.filters.connection.wirelessTws = val }
            },
            {
                'name': 'wirelessCabled',
                'displayName': 'Wireless: Cabled',
                'values': [
                    true,
                    false,
                ],
                'defaultValue': false,
                get stateLoc() { return stateP.filters.connection.wirelessCabled },
                'stateSet': function(val) { stateP.filters.connection.wirelessCabled = val }
            },
        ],
    }
];

// Establish price brackets
let priceBrackets = [];
function establishPriceBrackets() {
    let priceValues = controls.find(control => control.name === 'priceBrackets').values,
        previousMax = -1;

    priceValues.forEach(function(value) {
        let priceInt = parseInt(value.value),
            priceBracket = {
            'max': priceInt,
            'min': previousMax + 1
        }

        if (priceInt > previousMax) previousMax = priceInt;
        if (priceInt) priceBrackets.push(priceBracket);
    });
}
establishPriceBrackets();



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
        
        if (control.type === 'dropdown-range') {
            let uiState = control.uiElem.value,
                statesMatch = uiState === control.stateLoc ? true : false;

            if (!statesMatch) {
                control.uiElem.value = control.stateLoc;
                control.uiContainer.setAttribute('active-bracket', control.stateLoc);
            }
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
    stateP.filters.connection.mmcx === stateDefaults.filters.connection.mmcx ? url.searchParams.delete('mmcx') : url.searchParams.set('mmcx', stateP.filters.connection.mmcx);
    stateP.filters.connection.twopin === stateDefaults.filters.connection.twopin ? url.searchParams.delete('twopin') : url.searchParams.set('twopin', stateP.filters.connection.twopin);
    stateP.filters.connection.twopinExtruded === stateDefaults.filters.connection.twopinExtruded ? url.searchParams.delete('twopinExtruded') : url.searchParams.set('twopinExtruded', stateP.filters.connection.twopinExtruded);
    stateP.filters.connection.ipx === stateDefaults.filters.connection.ipx ? url.searchParams.delete('ipx') : url.searchParams.set('ipx', stateP.filters.connection.ipx);
    stateP.filters.connection.pentaconn === stateDefaults.filters.connection.pentaconn ? url.searchParams.delete('pentaconn') : url.searchParams.set('pentaconn', stateP.filters.connection.pentaconn);
    stateP.filters.connection.proprietary === stateDefaults.filters.connection.proprietary ? url.searchParams.delete('proprietary') : url.searchParams.set('proprietary', stateP.filters.connection.proprietary);
    stateP.filters.connection.fixedCable === stateDefaults.filters.connection.fixedCable ? url.searchParams.delete('fixedCable') : url.searchParams.set('fixedCable', stateP.filters.connection.fixedCable);
    stateP.filters.connection.wirelessTws === stateDefaults.filters.connection.wirelessTws ? url.searchParams.delete('wirelessTws') : url.searchParams.set('wirelessTws', stateP.filters.connection.wirelessTws);
    stateP.filters.connection.wirelessCabled === stateDefaults.filters.connection.wirelessCabled ? url.searchParams.delete('wirelessCabled') : url.searchParams.set('wirelessCabled', stateP.filters.connection.wirelessCabled);
    
    // Driver filters
    stateP.filters.drivers.ba === stateDefaults.filters.drivers.ba ? url.searchParams.delete('ba') : url.searchParams.set('ba', stateP.filters.drivers.ba);
    stateP.filters.drivers.dd === stateDefaults.filters.drivers.dd ? url.searchParams.delete('dd') : url.searchParams.set('dd', stateP.filters.drivers.dd);
    stateP.filters.drivers.est === stateDefaults.filters.drivers.est ? url.searchParams.delete('est') : url.searchParams.set('est', stateP.filters.drivers.est);
    stateP.filters.drivers.planar === stateDefaults.filters.drivers.planar ? url.searchParams.delete('planar') : url.searchParams.set('planar', stateP.filters.drivers.planar);
    stateP.filters.drivers.pzt === stateDefaults.filters.drivers.pzt ? url.searchParams.delete('pzt') : url.searchParams.set('pzt', stateP.filters.drivers.pzt);
    stateP.filters.drivers.hybrid === stateDefaults.filters.drivers.hybrid ? url.searchParams.delete('hybrid') : url.searchParams.set('hybrid', stateP.filters.drivers.hybrid);
    stateP.filters.drivers.notHybrid === stateDefaults.filters.drivers.notHybrid ? url.searchParams.delete('notHybrid') : url.searchParams.set('notHybrid', stateP.filters.drivers.notHybrid);
    
    // Price filters
    stateP.filters.price.priceBracket === stateDefaults.filters.price.priceBracket ? url.searchParams.delete('priceBracket') : url.searchParams.set('priceBracket', stateP.filters.price.priceBracket);
    stateP.filters.price.priceMin === stateDefaults.filters.price.priceMin ? url.searchParams.delete('priceMin') : url.searchParams.set('priceMin', stateP.filters.price.priceMin);
    stateP.filters.price.priceMax === stateDefaults.filters.price.priceMax ? url.searchParams.delete('priceMax') : url.searchParams.set('priceMax', stateP.filters.price.priceMax);
    
    history.pushState(null, '', url);
}

// Apply the URL to the state
function applyUrlToState() {
    let urlQueryString = window.location.search,
        urlQueryParams = new URLSearchParams(urlQueryString),
        
        tableMode = urlQueryParams.get('tableMode') === 'false' ? false : true,
        sort = urlQueryParams.get('sort'),
        searchString = urlQueryParams.get('searchString'),
        
        crinApprovedOnly = urlQueryParams.get('crinApprovedOnly') === 'true' ? true : urlQueryParams.get('crinApprovedOnly') === 'false' ? false : null,
        crinTestedOnly = urlQueryParams.get('crinTestedOnly') === 'true' ? true : urlQueryParams.get('crinTestedOnly') === 'false' ? false : null,
        userFavesOnly = urlQueryParams.get('userFavesOnly') === 'true' ? true : urlQueryParams.get('userFavesOnly') === 'false' ? false : null,
        
        buyableOnly = urlQueryParams.get('buyableOnly') === 'true' ? true : urlQueryParams.get('buyableOnly') === 'false' ? false : null,
        demoableOnly = urlQueryParams.get('demoableOnly') === 'true' ? true : urlQueryParams.get('demoableOnly') === 'false' ? false : null,
        discontinued = urlQueryParams.get('discontinued') === 'true' ? true : urlQueryParams.get('discontinued') === 'false' ? false : null,
        
        mmcx = urlQueryParams.get('mmcx') === 'true' ? true : urlQueryParams.get('mmcx') === 'false' ? false : null,
        twopin = urlQueryParams.get('twopin') === 'true' ? true : urlQueryParams.get('twopin') === 'false' ? false : null,
        twopinExtruded = urlQueryParams.get('twopinExtruded') === 'true' ? true : urlQueryParams.get('twopinExtruded') === 'false' ? false : null,
        ipx = urlQueryParams.get('ipx') === 'true' ? true : urlQueryParams.get('ipx') === 'false' ? false : null,
        pentaconn = urlQueryParams.get('pentaconn') === 'true' ? true : urlQueryParams.get('pentaconn') === 'false' ? false : null,
        proprietary = urlQueryParams.get('proprietary') === 'true' ? true : urlQueryParams.get('proprietary') === 'false' ? false : null,
        fixedCable = urlQueryParams.get('fixedCable') === 'true' ? true : urlQueryParams.get('fixedCable') === 'false' ? false : null,
        wirelessTws = urlQueryParams.get('wirelessTws') === 'true' ? true : urlQueryParams.get('wirelessTws') === 'false' ? false : null,
        wirelessCabled = urlQueryParams.get('wirelessCabled') === 'true' ? true : urlQueryParams.get('wirelessCabled') === 'false' ? false : null,
        
        ba = urlQueryParams.get('ba') === 'true' ? true : urlQueryParams.get('ba') === 'false' ? false : null,
        dd = urlQueryParams.get('dd') === 'true' ? true : urlQueryParams.get('dd') === 'false' ? false : null,
        est = urlQueryParams.get('est') === 'true' ? true : urlQueryParams.get('dd') === 'false' ? false : null,
        planar = urlQueryParams.get('planar') === 'true' ? true : urlQueryParams.get('planar') === 'false' ? false : null,
        pzt = urlQueryParams.get('pzt') === 'true' ? true : urlQueryParams.get('pzt') === 'false' ? false : null,
        hybrid = urlQueryParams.get('hybrid') === 'true' ? true : urlQueryParams.get('hybrid') === 'false' ? false : null,
        notHybrid = urlQueryParams.get('notHybrid') === 'true' ? true : urlQueryParams.get('notHybrid') === 'false' ? false : null,

        priceBracket = urlQueryParams.get('priceBracket'),
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
    mmcx != null ? stateP.filters.connection.mmcx = mmcx : '';
    twopin != null ? stateP.filters.connection.twopin = twopin : '';
    twopinExtruded != null ? stateP.filters.connection.twopinExtruded = twopinExtruded : '';
    ipx != null ? stateP.filters.connection.ipx = ipx : '';
    pentaconn != null ? stateP.filters.connection.pentaconn = pentaconn : '';
    proprietary != null ? stateP.filters.connection.proprietary = proprietary : '';
    fixedCable != null ? stateP.filters.connection.fixedCable = fixedCable : '';
    wirelessTws != null ? stateP.filters.connection.wirelessTws = wirelessTws : '';
    wirelessCabled != null ? stateP.filters.connection.wirelessCabled = wirelessCabled : '';
    
    // Driver filters
    ba != null ? stateP.filters.drivers.ba = ba : '';
    dd != null ? stateP.filters.drivers.dd = dd : '';
    est != null ? stateP.filters.drivers.est = est : '';
    planar != null ? stateP.filters.drivers.planar = planar : '';
    pzt != null ? stateP.filters.drivers.pzt = pzt : '';
    hybrid != null ? stateP.filters.drivers.hybrid = hybrid : '';
    notHybrid != null ? stateP.filters.drivers.notHybrid = notHybrid : '';
    
    // Price filters
    priceBracket != null ? stateP.filters.price.priceBracket = priceBracket : '';
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
    
    function getPriceBracket(price) {
        let itemPrice = parseInt(price),
            noPrice = isNaN(itemPrice),
            itemPriceBracket = '';

        priceBrackets.forEach(function(bracket) {
            if (!noPrice && itemPrice >= bracket.min && itemPrice <= bracket.max) {
                itemPriceBracket = bracket.max;
            } else if (noPrice) {
                itemPriceBracket = 0;
            }

        });
        
        return itemPriceBracket;
    }
        
    function getDataFromJson(json) {
        $.getJSON(json, function(data) {
        })
        .then(function(data) {
            data.forEach(function(item) {
                try {
                    if (item['Brand'] && item['IEM Model']) {
                        let itemObject = {
                            'itemId': item['Brand'] ? item['Brand'].toString().toLowerCase().replaceAll(' ', '') + item['IEM Model'].toString().toLowerCase().replaceAll(' ', '') : item['IEM Model'] ? item['IEM Model'].toString().toLowerCase().replaceAll(' ', '') : 'unknown',
                            'approved': item['Crinacle Approved ✔️'] ? 'yes' : 'no',
                            'brand': item['Brand'] ? item['Brand'] : '',
                            'connection': item['Connection'] ? item['Connection'] : '',
                            'demoable': item['Available at Hangout for Demo'] === 'Yes' ? true : false,
                            'drivers': item['Driver Configuration'] ? item['Driver Configuration'] : '',
                            'linkStore': item['Hangout Store Link'] ? item['Hangout Store Link'] : '',
                            'linkShowcase': item['Showcase Link (YouTube)'] ? item['Showcase Link (YouTube)'] : '',
                            'linkMeasurement': item['Measurement Link'] ? item['Measurement Link'] : '',
                            'linkStore': item['Hangout Store Link'] ? item['Hangout Store Link'] : '',
                            'model': item['IEM Model'] ? item['IEM Model'] : '',
                            'price': item['Price (MSRP, USD)'] ? parseInt(item['Price (MSRP, USD)']) : 0,
                            'priceBracket': getPriceBracket(item['Price (MSRP, USD)'] ? parseInt(item['Price (MSRP, USD)']) : ''),
                            'remarks': item['Remarks'] ? item['Remarks'] : '',
                            'signature': item['Sound Signature'] ? item['Sound Signature'] : '',
                            'status': item['Status'] ? item['Status'] : '',
                            'tested': item['Crinacle-tested'] ? item['Crinacle-tested'].toLowerCase() : '',
                            'userFave': false,
                            '_end': ''
                        };

                        dataArr.push(itemObject);
                    }
                } catch {
                    console.log(item);
                }
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
            isPzt = item.drivers.toLowerCase().indexOf('pzt') > -1 ? 1 : 0,
            isHybrid = isBa + isDd + isEst + isPlanar + isPzt >= 2 ? true : false,
            isNotHybrid = isBa + isDd + isEst + isPlanar + isPzt < 2 ? true : false,
            driverTypeFilterActive = filters.drivers.ba ? true : filters.drivers.dd ? true : filters.drivers.est ? true : filters.drivers.planar ? true : filters.drivers.pzt ? true : false,
            driverComboFilterActive = filters.drivers.hybrid ? true : filters.drivers.notHybrid ? true : false,
            meetsDriverBaFilter = filters.drivers.ba ? isBa : true,
            meetsDriverDdFilter = filters.drivers.dd ? isDd : true,
            meetsDriverEstFilter = filters.drivers.est ? isEst : true,
            meetsDriverPlanarFilter = filters.drivers.planar ? isPlanar : true,
            meetsDriverPztFilter = filters.drivers.pzt ? isPzt : true,
            meetsDriverHybridFilter = filters.drivers.hybrid ? isHybrid : false,
            meetsDriverNotHybridFilter = filters.drivers.notHybrid ? isNotHybrid : false,
            meetsDriverTypeFilter = driverTypeFilterActive ? (meetsDriverBaFilter && meetsDriverDdFilter && meetsDriverEstFilter && meetsDriverPlanarFilter && meetsDriverPztFilter) ? 1 : 0 : 1,
            meetsDriverComboFilter = driverComboFilterActive ? (meetsDriverHybridFilter | meetsDriverNotHybridFilter) ? 1 : 0 : 1,
            
            // Connection filters
            connectionFilterActive = filters.connection.mmcx ? true : filters.connection.twopin ? true : filters.connection.twopinExtruded ? true : filters.connection.ipx ? true : filters.connection.pentaconn ? true : filters.connection.proprietary ? true : filters.connection.fixedCable ? true : filters.connection.wirelessTws ? true :  filters.connection.wirelessCabled ? true : 0,
            meetsConnectionMmcxFilter = filters.connection.mmcx ? item.connection.toLowerCase().indexOf('mmcx') > -1 : false,
            meetsConnectionTwopinFilter = filters.connection.twopin ? (item.connection.toLowerCase().indexOf('2-pin') > -1 && item.connection.toLowerCase().indexOf('extruded 2-pin') === -1) : false,
            meetsConnectionTwopinExtrudedFilter = filters.connection.twopinExtruded ? item.connection.toLowerCase().indexOf('extruded 2-pin') > -1 : false,
            meetsConnectionIpxFilter = filters.connection.ipx ? item.connection.toLowerCase().indexOf('ipx') > -1 : false,
            meetsConnectionPentaconnFilter = filters.connection.pentaconn ? item.connection.toLowerCase().indexOf('pentaconn') > -1 : false,
            meetsConnectionProprietaryFilter = filters.connection.proprietary ? item.connection.toLowerCase().indexOf('proprietary') > -1 : false,
            meetsConnectionFixedCableFilter = filters.connection.fixedCable ? item.connection.toLowerCase().indexOf('fixed cable') > -1 : false,
            meetsConnectionWirelessTwsFilter = filters.connection.wirelessTws ? item.connection.toLowerCase().indexOf('true wireless') > -1 : false,
            meetsConnectionWirelessCabledFilter = filters.connection.wirelessCabled ? item.connection.toLowerCase().indexOf('cabled wireless') > -1 : false,
            meetsConnectionFilter =  connectionFilterActive ? (meetsConnectionMmcxFilter | meetsConnectionTwopinFilter | meetsConnectionTwopinExtrudedFilter | meetsConnectionIpxFilter | meetsConnectionPentaconnFilter | meetsConnectionProprietaryFilter | meetsConnectionFixedCableFilter | meetsConnectionWirelessTwsFilter | meetsConnectionWirelessCabledFilter) : 1,
            
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
        && meetsDriverTypeFilter
        && meetsDriverComboFilter
        
        // Connection filters
//        && meetsConnectionMmcxFilter
//        && meetsConnectionTwopinFilter
//        && meetsConnectionTwopinExtrudedFilter
//        && meetsConnectionIpxFilter
//        && meetsConnectionPentaconnFilter
//        && meetsConnectionProprietaryFilter
//        && meetsConnectionFixedCableFilter
//        && meetsConnectionWirelessTwsFilter
//        && meetsConnectionWirelessCabledFilter
        && meetsConnectionFilter
        
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
        let brandA = a.brand.toLowerCase(),
            brandB = b.brand.toLowerCase(),
            modelA = a.model.toLowerCase(),
            modelB = b.model.toLowerCase(),
            brandComparison = brandA > brandB ? 1 : brandB > brandA ? -1 : 0,
            modelComparison = modelA > modelB ? 1:  modelB > modelA ? -1 : 0,
            alphaSort = brandComparison != 0 ? brandComparison : modelComparison != 0 ? modelComparison : 0,
            priceA = parseInt(a.price),
            priceB = parseInt(b.price),
            priceSortable = priceA > 0 && priceB > 0 ? true : false;
        
        if (sort === 'priceLowHigh' | sort === 'priceHighLow') {
            if (priceSortable) {
                // Sort: Price low to high
                if (sort === 'priceLowHigh') {
                    if (priceA > priceB) {
                        return 1;
                    } else if (priceA < priceB) {
                        return -1;
                    } else {
                        return 0;
                    }
                } else if (sort === 'priceHighLow') {
                    if (priceA > priceB) {
                        return -1;
                    } else if (priceA < priceB) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (priceA > 0) {
                    return -1;
                } else if (priceB) {
                    return 1;
                } else {
                    return 0;
                }
            }
        } else if (sort === 'alpha') {
            return alphaSort;
        } else if (sort === 'alpha-reverse') {
            return -(alphaSort);
        } else {
            return 0;
        }
    });
    
    return data;
}



//////////////////////////////////////////////////
// Build DOM: Functions

// Build DOM: Controls
function constructFiltersUi(controls) {
    let filtersResultContainer = newElem('section', 'filter-result-container', [{'key': 'phones-hiddem', 'val': "false"}]),
        filtersResult = newElem('span', 'filter-result', [{'key': 'id', 'val': 'filter-result'}]);
    
    filtersResultContainer.append(filtersResult);
    elemListFilters.prepend(filtersResultContainer);
    
    controls.forEach(function(control) {
        // Create toggles
        if (control.type === 'toggle') {
            // Create section container for control
            let controlContainer = newElem('section', 'control-toggle', [{'key': 'control-id', 'val': control.name}]),
                controlHeading = newElem('h3', 'control-heading', null, control.displayName),
                parentContainer = control.location === 'listManager' ? elemListManager : control.location === 'resultContainer' ? filtersResultContainer : elemListFilters;
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
        
        // Create dropdown range
        if (control.type === 'dropdown-range') {
            let controlContainer = newElem('section', 'control-dropdown'),
                controlHeading = newElem('h3', 'control-heading', null, control.displayName),
                dropdownContainer = newElem('select', 'controls-dropdown', [{'key': 'name', 'val': control.name}]),
                parentContainer = control.location === 'listManager' ? elemListManager : elemListFilters,
                previousVal = '';
            controlContainer.append(controlHeading);
            controlContainer.append(dropdownContainer);
            parentContainer.append(controlContainer);
            
            controlContainer.setAttribute('active-bracket', control.defaultValue);
            
            // Create dropdown UIs
            control.values.forEach(function(value) {
                let minVal = value.value === 'custom' ? '' : previousVal,
                    maxVal = value.value === 'custom' ? '' : value.value,
                    option = newElem('option', null, [{'key': 'value', 'val': value.value}], value.displayName);
                
                option.setAttribute('min-value', minVal);
                option.setAttribute('max-value', maxVal);
                dropdownContainer.append(option);
                
                previousVal = parseInt(maxVal) ? parseInt(maxVal) + 1 : '';
            });
            dropdownContainer.value = control.defaultValue;
            
            dropdownContainer.addEventListener('change', function(e){
                let selectedOption = e.target.querySelectorAll('option')[e.target.selectedIndex],
                    minVal = selectedOption.getAttribute('min-value'),
                    maxVal = selectedOption.getAttribute('max-value');
                control.stateSet(e.target.value, minVal, maxVal);
                
                controlContainer.setAttribute('active-bracket', e.target.value);
            });
            
            control.uiContainer = controlContainer;
            control.uiElem = dropdownContainer;
            control.uiElemMethod = 'value';
        }
        
        // Create search
        if (control.type === 'search') {
            let controlContainer = newElem('section', 'control-search'),
                searchHeading = newElem('h3', 'search-heading', null, control.displayName),
                searchInput = newElem('input', 'search-input', [{'key': 'placeholder', 'val': 'Search'}, {'key': 'enterkeyhint', 'val': 'search'}]),
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
            
            // Handle return key
            searchInput.addEventListener('keyup', function(e) {
                if (e.keyCode === 13) {
                    searchInput.blur();
                    stateP.overlayFilters = false;
                }
            });
            searchInput.addEventListener('blur', function() {
                try { clearTimeout(searchDelay); } catch {}
                control.stateSet(searchInput.value);
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
                let valueInput = newElem('input', value.name, [{'key': 'placeholder', 'val': value.displayName}, {'key': 'type', 'val': 'number'}, {'key': 'inputmode', 'val': 'numeric'}, {'key': 'enterkeyhint', 'val': 'go'}]);
                priceForm.append(valueInput);
                
                valueInput.addEventListener('focus', () => valueInput.select());
                valueInput.addEventListener('input', function(e) {
                    try { clearTimeout(searchDelay); } catch {}
                    searchDelay = setTimeout(function() {
                        value.stateSet(valueInput.value);
                    }, 500);
                });
                
                // Handle return key
                valueInput.addEventListener('keyup', function(e) {
                    if (e.keyCode === 13) valueInput.blur();
                });
                valueInput.addEventListener('blur', function() {
                    try { clearTimeout(searchDelay); } catch {}
                    value.stateSet(valueInput.value);
                });
                
                value.uiElem = valueInput;
                value.uiElemMethod = 'value';
            });
        }
    });
}
constructFiltersUi(controls);



// Build DOM: Content initialization
function buildListItems(data, tableMode, saveScroll) {
    console.log(data, tableMode);
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
    clearInactive();
    
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
        root: null,
        //root: document.querySelector('body'),
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
//        elemListContents.prepend(tableBody);
        elemListContents.insertAdjacentElement('beforebegin', tableBody)
    }
    
    buildTable(data, container);
    scrollTable();
}

function buildTable(data, container) {
    // Handle each item in filtered + sorted list
    data.forEach(function(item) {
        let phoneContainer = newElem('article', 'table-phone-container', [{'key': 'status', 'val': item.status.toLowerCase().replace(' ', '-')}]),
            phoneDisplayName = item.model.indexOf(item.brand) === -1 ? item.brand + ' ' + item.model : item.model,
            phoneName = newElem('div', 'table-phone-name', null, phoneDisplayName),
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
            displayPrice = item.price > 0 ? numDisplay(item.price, 'currency', 'usd') : '$ unknown',
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
// Scroll table header with table
let scrollSyncActive = 0;

function scrollTableHeader() {
    elemListContents.addEventListener('scroll', function() {
        try { clearTimeout(scrollDelay); } catch {}
        scrollDelay = setTimeout(function() {
            let tableHeaderExists = document.querySelectorAll('section.list-table.table-header').length ? true : false,
                scrollPosListContents = elemListContents.scrollLeft;
            
            if (tableHeaderExists) {
                scrollSyncActive = 1;
                document.querySelector('section.table-header').scrollLeft = scrollPosListContents;
                scrollSyncActive = 0;
            }
        }, 10);
    });
}
scrollTableHeader();

function scrollTable() {
    let tableHeader = document.querySelectorAll('section.list-table.table-header').length ? document.querySelector('section.list-table.table-header') : false;
    
    if (tableHeader && !scrollSyncActive) {
        tableHeader.addEventListener('scroll', function() {
            try { clearTimeout(scrollDelay); } catch {}
            scrollDelay = setTimeout(function() {
                scrollSyncActive = 1;
                let scrollPosTableHeader = tableHeader.scrollLeft;

                elemListContents.scrollLeft = scrollPosTableHeader;
                scrollSyncActive = 0;
            }, 10);
        });
    }
}



// Build DOM: Cards
function buildCards(data, container) {
    // Clear DOM & set mode
    let tableHeaderExists = document.querySelectorAll('section.list-table.table-header').length ? true : false;
    
    if (tableHeaderExists) document.querySelector('section.list-table.table-header').remove();
    
    elemListContents.setAttribute('list-mode', 'cards');
    elemList.setAttribute('list-mode', 'cards');
    let lastPriceBracket = '-1';
    
    // Handle each item in filtered + sorted list
    data.forEach(function(item) {
        // Price bracket divider
        let addPriceBracketDividers = stateP.sort.includes('price') ? true : false;
        
        if (addPriceBracketDividers) {
            let newPriceBracket = parseInt(item.priceBracket) === parseInt(lastPriceBracket) ? false : true;
            
            if (newPriceBracket) {
                let priceBracketHeadingText = item.priceBracket === 0 ? 'Price unknown' : item.priceBracket < 1000000 ? 'Up to ' + numDisplay(item.priceBracket, 'currency', 'usd', 0) : 'Price no limit',
                    priceBracketHeading = newElem('h2', 'price-bracket-heading', null, priceBracketHeadingText);
                container.append(priceBracketHeading);
                lastPriceBracket = item.priceBracket;
            }
        }
        
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
//            displayPrice = item.status.toLowerCase().indexOf('discontinued') < 0 ? item.price > 0 ? numDisplay(item.price, 'currency', 'usd') : 'unknown' : 'discontinued',
            displayPrice = item.price > 0 ? numDisplay(item.price, 'currency', 'usd') : '$ unknown',
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
