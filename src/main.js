'use strict';

function IMUSTADDINTERNETSPEEDSTOZOOPLALISTINGS () {

    // Gotta have something to turn partial addresses into postcodes.
    // We gon do this through a FANCY PostcodeResolver class and
    // SUPER FANCY dependency injection.
    // I'm a professional code writer person.
    var postcodeResolver = new PostcodeResolver(
        // new GooglePlacesQueryAutocomplete()
        // new GooglePlacesTextSearch()
        new ProviderAggregator([
            new GooglePlacesQueryAutocomplete(),
            new GooglePlacesTextSearch()
        ])
    );

    var speedResolver = new SpeedResolver(
        new Rightmove()
    );

     // Get all listings in DOM
     var listingElems = document.querySelectorAll(
          '*[itemtype="http://schema.org/Residence"]'
     );

    // No listings? No need to sacrifice any more beautiful CPU cycles
     if (listingElems.length === 0) {
        return;
     }

     // Cast NodeArray to regular array of Listing objects, because that class
     // has all my fancy logic in it.
     var listings = Array.prototype.slice.call(listingElems).map(function(elem) {
          return new Listing(elem, postcodeResolver, speedResolver);
     });

    // Expose the estimated
    // Speeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeed
    // Using filter as a oor man's "for each", to avoiding any beefs with
    // listing being redefined before the 'then' function uses it.
    listings.filter(function(listing){
        listing.getSpeed().then(function(speed){
            // Construct speed DOM to show on page
            var speedElement = document.createElement('ul')
            speedElement.style.margin = '0';
            speedElement.style.padding = '0';
            speedElement.className = 'ZooplaInternetEstimate';

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

            speedElement.appendChild(averageSpeedElement);
            speedElement.appendChild(superfastSpeedElement);

            // Add to actual page DOM
            listing.address_elem.appendChild(speedElement);
        });

        return true;
     });

}

// Verify we have a Google Places API key set
chrome.storage.sync.get('google_places_api_key', function(config){
    if (!config.google_places_api_key) {
        console.error("No google places API key set. Boooo");
        return;
    }

    IMUSTADDINTERNETSPEEDSTOZOOPLALISTINGS();
});