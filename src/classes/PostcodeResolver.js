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

        return new Promise((resolve, reject) => {
            var cachedPostcode = JSON.parse(this.cache.getItem(cache_key));
            if (cachedPostcode !== null) {
                // If cached response was a failure, throw it up the chain
                if (cachedPostcode.success === false) {
                    return reject(cachedPostcode.error);
                }

                // Otherwise serve the cached postcode!
                return resolve(cachedPostcode.postcode);
            }

            return this.provider.query(partialAddress)
                .then(
                    postcode => {
                        this.cache.setItem(cache_key, JSON.stringify({
                            'success': true,
                            'postcode': postcode
                        }));
                        resolve(postcode);
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