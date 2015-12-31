 'use strict';

 class Rightmove {
    constructor() {}

    /**
     * Fetch an estimated internet speed for the given postcode
     * 
     * @param  String postcode A full postcode
     * @return Promise        The promise to provide a speed estimate! Or die trying.
     */
    query(postcode) {
        var self = this;
        return new Promise(function(resolve, reject) {
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
                    return reject({
                        'cache': true,
                        'error': 'No internet speed data found :(((('
                    });
                }
                
                // TODO: Map to common API. Tho we only have Rightmove as a provider atm so not important
                return resolve(response.data);
            },
            function(){
                return reject({
                    'cache': true,
                    'error': 'No internet speed data found :(((('
                });
            });   
        });
    }
}