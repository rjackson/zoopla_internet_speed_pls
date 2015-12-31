'use strict';

class SpeedResolver {
    constructor(provider, cacheProvider) {
        this.provider = provider;
        this.cache = cacheProvider || localStorage;
        this.cache_key_prefix = 'Zoopla__SpeedResolver__';
    }

    /**
     * Resolve the given (partial) address into a postcode.
     *
     * Serves from cache if possible, otherwise looks up via an external provider.
     * 
     * @param  String address A full or partial address
     * @return Promise        The promise to provide a postcode! Or die trying.
     */
    getFromPostcode(postcode) {
        var cache_key = this.cache_key_prefix + postcode;

        var self = this;
        return new Promise(function(resolve, reject) {

            // Fetch cached respnose
            var cachedSpeed = JSON.parse(self.cache.getItem(cache_key))
            if (cachedSpeed !== null) {
                // If cached response was a failure, throw it up the chain
                if (cachedSpeed.success === false) {
                    return reject(cachedSpeed.error);
                }

                // Otherwise serve the cached postcode!
                return resolve(cachedSpeed.speed);
            }

            return self.provider.query(postcode)
                .then(function(speed){
                    self.cache.setItem(cache_key, JSON.stringify({
                        'success': true,
                        'speed': speed
                    }));
                    return resolve(speed);
                },
                function(reason){
                    if (reason.cache) {
                        self.cache.setItem(cache_key, JSON.stringify({
                            'success': false,
                            'error': reason.error
                        }));
                    }
                    return reject(reason.error);
                });
        });
    }
}