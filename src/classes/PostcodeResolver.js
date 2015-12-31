'use strict';

class PostcodeResolver {
    constructor(provider, cacheProvider) {
        this.provider = provider;
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

            // Fetch cached respnose
            var cachedPostcode = JSON.parse(self.cache.getItem(cache_key))
            if (cachedPostcode !== null) {
                // If cached response was a failure, throw it up the chain
                if (cachedPostcode.success === false) {
                    return reject(cachedPostcode.error);
                }

                // Otherwise serve the cached postcode!
                return resolve(cachedPostcode.postcode);
            }

            return self.provider.query(partialAddress)
                .then(function(postcode){
                    self.cache.setItem(cache_key, JSON.stringify({
                        'success': true,
                        'postcode': postcode
                    }));
                    return resolve(postcode);
                },
                function(reason){
                    if (reason.cache) {
                        self.cache.setItem(cache_key, JSON.stringify({
                            'success': false,
                            'error': reason.error
                        }));
                    }
                    return reject(error);
                });
        });
    }
}