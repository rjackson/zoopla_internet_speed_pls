# Overview

Quick Chrome extension to add estimated internet speeds for Zoopla property
listings.

Uses Google's APIs to try and resolve the partial addresses listed in Zoopla
into postcodes, that are then fed into Rightmove's broadband estimator API to
fetch an internet speed estimate.

You will need a "Server" Google API key to use this extension, with the "Google
Places Web Service" API enabled.  We are using two Google Places APIs in this
extension, the `place/queryautocomplete` API and the `place/textsearch` API. The
`place/textsearch` API has a 10x quota cost.  The extension is set up to use the
`place/textsearch` as a fallback if it's unable to resolve a postcode with the 
`place/queryautocomplete` API.

Free Google Developers accounts have a 1000 request/day quota for API hits.
Worst-case (the cheap API always misses, and thus we use the expensive API),
you will only be able to fetch estimates for 90 properties. You can give Google
your credit card details to increase the free quota to 150,000 request/day, but
do your own research before deciding whether to do that - you wouldn't want to
be unintentionally hit with fees for using Google's APIs, and I'm not sure the
exact conditions where fees will be charged.

The extension is built with caching to prevent duplicate hits to the various
external APIs. Any successful API hits (whether they resolved to a postcode or
not) will be cached, and never re-tried.  Any unsuccessful hits (HTTP errors,
exceeded Google API quota) will not be cached, and will be retried.

# License

Copyright (c) 2015-2016 Rob Jackson

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.