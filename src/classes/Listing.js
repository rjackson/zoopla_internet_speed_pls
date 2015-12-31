'use strict';

/**
 * Zoopla property listing.
 *
 * `srcElem` theoretically follows schema.org/Residence,
 * but this is gonna require specific hacks for Zoopla's markup ofc.
 * Would be too easy if they kept their machine-readable DOM clean.
 */
class Listing {
    constructor(srcElem, postcodeResolver, cacheProvider) {
        this.elem = srcElem;

        this.address_elem = this.elem.querySelector('*[itemprop="address"] > *:first-of-type');
        this.address = this.address_elem.innerText;

        this.postcode_resolver = postcodeResolver;
        this.cache = cacheProvider || localStorage;
        this.cache_key = this.generateCacheKey();
    }

    /**
     * Generate a listing-specific cache key for this property.
     * @return string
     */
    generateCacheKey(property) {
        // Only need to look up per address, for this usage.
        return 'Zoopla__Speed_For__' + this.address;
    }

    /**
     * The estimated internet speed for this Zoopla listing.
     * @return Promise A promise that will be fulfilled with a string representation of the available internet speed.
     */
    getSpeed() {
        var self = this;
        return new Promise(function(resolve, reject) {
            // No need to lookup if we a result cached for this listing
            var cachedItem = self.cache.getItem(self.cache_key);
            if (cachedItem !== null && cachedItem !== "false") {
                return resolve(JSON.parse(cachedItem));
            }

            if (cachedItem === "false") {
                return reject('No speed estimate found');
            }

            return self.fetchSpeed()
                .then(function(speed){
                    self.cache.setItem(self.cache_key, JSON.stringify(speed));
                    return resolve(speed);
                },
                function(){
                    self.cache.setItem(self.cache_key, "false");
                    return reject('No speed estimate found');
                });
        });
    }

    /**
     * Look up the internet speed from an external provider.
     * 
     * @return Promise A promise that will be fulfilled with a string representation of the available internet speed.
     */
    fetchSpeed() {
        var self = this;
        return new Promise(function(resolve, reject) {
            // Resolve partial address into postcode.
            self.postcode_resolver.getFromPartialAddress(self.address).then(
                function(postcode) {
                    console.count("Postcode resolved");
                    // Poke Rightmove's API. Have to be x-www-form-urlencoded or it
                    // falls over.
                    axios.post(
                        'http://www.rightmove.co.uk/ajax/broadband-speed-result.html',
                        {
                            searchLocation: postcode
                        },
                        {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            transformRequest: [function (data, headers) {
                                // url-encoded stuff cause we gotta send it
                                // x-www-form-urlencoded. cause rightmove reasons
                                var str = [];
                                for(var p in data)
                                  if (data.hasOwnProperty(p) && data[p]) {
                                    str.push(
                                        encodeURIComponent(p) + "=" +
                                        encodeURIComponent(data[p])
                                    );
                                  }
                                return str.join("&");
                            }]
                        }
                    ).then(function(response){
                        if (response.data.errorMessage !== undefined) {
                            return reject('No internet speed data found :((((');
                        }

                        return resolve(response.data);
                    },
                    function(){
                        return reject('No internet speed data found :((((');
                    });   
                },
                function(error) {
                    console.count("Postcode missed");
                }
            );  
        });
    }
}