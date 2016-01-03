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
     var listings = Array.prototype.slice.call(listingElems).map(elem => {
          return new Listing(elem, postcodeResolver, speedResolver);
     });

    // Expose the estimated
    // Speeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeed
    // Using filter as a oor man's "for each", to avoiding any beefs with
    // listing being redefined before the 'then' function uses it.
    listings.forEach(listing => {
        listing.render();
    });
};

// Verify we have a Google Places API key set
chrome.storage.sync.get('google_places_api_key', config => {
    if (!config.google_places_api_key) {
        console.error("No google places API key set. Boooo");
        return;
    }

    IMUSTADDINTERNETSPEEDSTOZOOPLALISTINGS();
});