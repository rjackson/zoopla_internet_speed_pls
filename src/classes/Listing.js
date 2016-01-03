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
        return new Promise((resolve, reject) => {
            // Resolve partial address into postcode.
            this.postcode_resolver.getFromPartialAddress(this.address)
                .then(
                    this.speed_resolver.getFromPostcode.bind(this.speed_resolver),
                    (reason) => {
                        debugger;
                        reject('Can\'t retrieve a speed estimate: No postcode resolved.')
                    }
                )
                .then(resolve, reject);
        });
    }

    render() {
        this.getSpeed()
            .then(this.createDomForSpeed)
            .then(speedDom => this.address_elem.appendChild(speedDom) );
    }

    createDomForSpeed(speed) {
        return new Promise((resolve, reject) => {
            // Construct speed DOM to show on page
            var domForSpeed = document.createElement('ul')
            domForSpeed.style.margin = '0';
            domForSpeed.style.padding = '0';
            domForSpeed.className = 'ZooplaInternetEstimate';

            var averageSpeedElement = document.createElement('li');
            averageSpeedElement.style.margin = '0';
            averageSpeedElement.style.padding = '0';
            averageSpeedElement.appendChild(
                document.createTextNode(
                    'Avg speed: ' + speed.broadbandAverageSpeed + 'Mb/s'
                )
            )

            var superfastSpeedElement = document.createElement('li');
            superfastSpeedElement.style.margin = '0';
            superfastSpeedElement.style.padding = '0';
            superfastSpeedElement.appendChild(
                document.createTextNode(
                    'Superfast max: ' + speed.superFastMaxSpeedRange + 'Mb/s'
                )
            );

            domForSpeed.appendChild(averageSpeedElement);
            domForSpeed.appendChild(superfastSpeedElement);

            // Add to actual page DOM
            resolve(domForSpeed);
        });
    }
}