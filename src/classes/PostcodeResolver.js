'use strict';

class PostcodeResolver {
    constructor(autocompleteService, cacheProvider) {
        this.cache = cacheProvider || localStorage;
        this.cache_key_prefix = 'Zoopla__PostcodeResolver__';
    }

    /**
     * Resolve the given (partial) address into a postcode.
     *
     * Serves from cache if possible, otherwise looks up via an external provider.
     * 
     * @param  String address A full or partial address
     * @return Promise        The promise to provide a postcode! Or die trying.
     */
    getFromPartialAddress(partialAddress) {
        var cache_key = this.cache_key_prefix + partialAddress;

        var self = this;
        return new Promise(function(resolve, reject) {

            var cachedPostcode = self.cache.getItem(cache_key)
            if (cachedPostcode !== null && cachedPostcode !== "false") {
                return resolve(cachedPostcode);
            }

            if (cachedPostcode === "false") {
                return reject('No postcode found');
            }

            return self.fetchFromPartialAddress(partialAddress)
                .then(function(postcode){
                    self.cache.setItem(cache_key, postcode);
                    return resolve(postcode);
                },
                function(){
                    self.cache.setItem(cache_key, "false"); // Cache the nothing we found.
                    return reject('No postcode found');
                });
        });
    }

    /**
     * Resolve the given (partial) address into a postcode, via The Google.
     * https://developers.google.com/places/web-service/search?hl=en#TextSearchRequests
     * 
     * @param  String address A full or partial address
     * @return Promise        The promise to provide a postcode! Or die trying.
     */
    fetchFromPartialAddress(partialAddress) {
        var self = this;
        return new Promise(function(resolve, reject) {
            chrome.storage.sync.get('google_places_api_key', function(config){
                var response = axios.get(
                    'https://maps.googleapis.com/maps/api/place/textsearch/json',
                    {
                        params: {
                            'key': config.google_places_api_key,
                            'query': partialAddress
                        }
                    }
                ).then(function(response){
                    if (response.statusText !== 'OK') {
                        return reject(
                            "Could not resolve postcode: "+ response.statusText
                        )
                    }

                    // Extract the postcode from all of the responses to the search
                    var postcodes = response.data.results
                        .map(function(item){
                            // Postcode matching regex from http://stackoverflow.com/a/7259020
                            var match = item.formatted_address.match(
                                /(([gG][iI][rR] {0,}0[aA]{2})|((([a-pr-uwyzA-PR-UWYZ][a-hk-yA-HK-Y]?[0-9][0-9]?)|(([a-pr-uwyzA-PR-UWYZ][0-9][a-hjkstuwA-HJKSTUW])|([a-pr-uwyzA-PR-UWYZ][a-hk-yA-HK-Y][0-9][abehmnprv-yABEHMNPRV-Y]))) {0,}[0-9][abd-hjlnp-uw-zABD-HJLNP-UW-Z]{2}))/
                            )

                            if (match === null) {
                                return;
                            }

                            return match[0];
                        })
                        .filter(function(item) {
                            // Filter out items where we couldn't extract a psotcode.
                            return item !== undefined;
                        });

                    if (postcodes.length === 0) {
                        return reject('Aint got no darned postcodes.');
                    }

                    // Return the first postcode found
                    return resolve(postcodes[0]);
                }); 
            });
        });
    }
}