'use strict';

/**
 * Zoopla property listing.
 *
 * `srcElem` theoretically follows schema.org/Residence,
 * but this is gonna require specific hacks for Zoopla's markup ofc.
 * Would be too easy if they kept their machine-readable DOM clean.
 */
class Listing {
    constructor(srcElem, postcodeResolver, speedResolver) {
        this.elem = srcElem;

        this.address_elem = this.elem.querySelector('*[itemprop="address"] > *:first-of-type');
        this.address      = this.address_elem.innerText;

        this.postcode_resolver = postcodeResolver;
        this.speed_resolver    = speedResolver;
    }

    /**
     * The estimated internet speed for this Zoopla listing.
     * @return Promise A promise that will be fulfilled with a string representation of the available internet speed.
     */
    getSpeed() {
        var self = this;
        return new Promise(function(resolve, reject) {
            // Resolve partial address into postcode.
            self.postcode_resolver.getFromPartialAddress(self.address).then(
                function(postcode) {
                    self.speed_resolver.getFromPostcode(postcode).then(
                        function(speed){
                            return resolve(speed);
                        },
                        function(reason){
                            return reject(reason);
                        }
                    );
                },
                function(reason) {
                    return reject('Can\'t retrieve a speed estimate: No postcode resolved.');
                }
            );  
        });
    }
}