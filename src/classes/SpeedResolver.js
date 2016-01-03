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

        return new Promise((resolve, reject) => {
            // Fetch cached respnose
            var cachedSpeed = JSON.parse(this.cache.getItem(cache_key));
            if (cachedSpeed !== null) {
                // If cached response was a failure, throw it up the chain
                if (cachedSpeed.success === false) {
                    return reject(cachedSpeed.error);
                }

                // Otherwise serve the cached postcode!
                return resolve(cachedSpeed.speed);
            }

            return this.provider.query(postcode)
                .then(
                    speed => {
                        this.cache.setItem(cache_key, JSON.stringify({
                            'success': true,
                            'speed': speed
                        }));
                        resolve(speed);
                    },
                    reason => {
                        if (reason.cache) {
                            this.cache.setItem(cache_key, JSON.stringify({
                                'success': false,
                                'error': reason.error
                            }));
                        }
                        reject(reason.error);
                    }
                );
        });
    }
}