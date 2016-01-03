 'use strict';
 
 class GooglePlacesTextSearch {
    constructor() {}

    /**
     * Resolve the given (partial) address into a postcode, via The Google.
     * https://developers.google.com/places/web-service/search?hl=en#TextSearchRequests
     * 
     * @param  String address A full or partial address
     * @return Promise        The promise to provide a postcode! Or die trying.
     */
    query(query_text) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get('google_places_api_key', config => {
                axios.get(
                    'https://maps.googleapis.com/maps/api/place/textsearch/json',
                    {
                        params: {
                            'key': config.google_places_api_key,
                            'query': query_text
                        }
                    }
                )
                    .then(this.handleErrors, reject)
                    .then(this.extractPostcode, reject)
                    .then(resolve);
            });
        });
    }

    handleErrors(response) {
        return new Promise((resolve, reject) => {
            if (response.statusText !== 'OK') {
                return reject({
                    'cache': false, // Whether to cache this failure (so we don't try to fetch again)
                    'error': "Could not resolve postcode due to HTTP error: "+ response.statusText
                })
            }

            if (['OVER_QUERY_LIMIT', 'REQUEST_DENIED', 'INVALID_REQUEST'].indexOf(response.data.status) !== -1) {
                return reject({
                    'cache': false, // Whether to cache this failure (so we don't try to fetch again)
                    'error': "Could not resolve postcode due to API error: " + response.data.status
                });
            }

            if (response.data.status === 'ZERO_RESULTS') {
                return reject({
                    'cache': true, // Whether to cache this failure (so we don't try to fetch again)
                    'error': 'Could not resolve postcode: No results found.'
                });
            }

            return resolve(response);
        });
    }

    extractPostcode(response) {
        return new Promise((resolve, reject) => {
            // Extract the postcode from all of the responses to the search
            var postcodes = response.data.results
                .map(item => {
                    // Postcode matching regex from http://stackoverflow.com/a/7259020
                    var match = item.formatted_address.match(
                        /(([gG][iI][rR] {0,}0[aA]{2})|((([a-pr-uwyzA-PR-UWYZ][a-hk-yA-HK-Y]?[0-9][0-9]?)|(([a-pr-uwyzA-PR-UWYZ][0-9][a-hjkstuwA-HJKSTUW])|([a-pr-uwyzA-PR-UWYZ][a-hk-yA-HK-Y][0-9][abehmnprv-yABEHMNPRV-Y]))) {0,}[0-9][abd-hjlnp-uw-zABD-HJLNP-UW-Z]{2}))/
                    )

                    if (match === null) {
                        return;
                    }

                    return match[0];
                })
                .filter(item => {
                    // Filter out items where we couldn't extract a psotcode.
                    return item !== undefined;
                });

            if (postcodes.length === 0) {
                return reject({
                    'cache': true, // Whether to cache this failure (so we don't try to fetch again)
                    'error': 'Could not resolve postcode: No postcodes found in matches.'
                });
            }

            // Return the first postcode found
            resolve(postcodes[0]);
        });
    }
}