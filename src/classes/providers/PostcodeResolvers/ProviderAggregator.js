 'use strict';
 
 class ProviderAggregator {
    constructor(providers) {
        this.providers = providers;
    }

    /**
     * Resolve the given (partial) address into a postcode, utilising the
     * various providers given. The providers are iterated through recursively 
     * upon failure to resolve a postcode (i.e. if provider A fails to resolve a
     * postcode, we then try provider B).
     * 
     * @param  String address A full or partial address
     * @return Promise        The promise to provide a postcode! Or die trying.
     */
    query(query_text, provider_index) {
        var provider_index = provider_index || 0;

        return new Promise((resolve, reject) => {
            if (provider_index > this.providers.length - 1) {
                return reject({
                    'cache': true, 
                    'error': 'No providers could resolve a postcode. :('
                });
            }

            return this.providers[provider_index].query(query_text)
                .then(
                    resolve,
                    () => {
                        this.query(query_text, provider_index + 1)
                            .then(resolve, reject);
                    }
                );
        });
    }
}