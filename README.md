# UI-Router-Hooks-Before-State
[![Build Status](https://travis-ci.org/interval-braining/angular-ui-router-hooks-before-state.png?branch=master)](https://travis-ci.org/interval-braining/angular-ui-router-hooks-before-state)

UI-Router-Before-State-Filter provides a convenient method of registering
filter logic for execution before a state is loaded. These filters can be
used to guard states with arbitrary logic.

**Note:** *This library is under active development and is most definitely
subject to change.*

## Getting Started

**(1)** Get UI-Router-Before-State-Filter by cloning and building this repository:
```bash
git clone git@github.com:interval-braining/angular-ui-router-hooks-before-state.git
cd angular-ui-router-hooks-before-state
npm install
bower install
```

**(2)** Include `angular-ui-router-hooks-before-state.js` (or
`angular-ui-router-hooks-before-state.min.js`) with your javascripts, after including
Angular itself.

**(3)** Add `'ui.router.hooks.beforeState'` to your main module's list of dependencies.

## Usage
beforeState filters can be registered by adding a beforeState attribute to the data object
of the state you want to perform filtering on. The value of the beforeState attribute can be
a function, an injectable array, or an array of functions and injectable arrays. For example:
```javascript
  ..
  data: function() { // Filtering logic },
  ..

  ..
  data: ['$state', function($state) { // Filtering logic requiring $state }],
  ..

  ..
  data: [
    function() { // Filtering logic },
    ['$state', function($state) { // Filtering logic requiring $state }]
  ]
  ..
```

It is important to keep in mind that child states prototypically inherit their
parent state's data attribute. This means that child states will inherit beforeState
filters from their ancestor states (though filters are only called once per state).
However, if a child state declares it's own beforeState data property, it will
override the parent state's beforeData property and only run the hooks declared
for the child. This makes it easy to create states that bypass ancestor logic,
but it also means that some care needs to be taken when the intention is to
append a filter.

A beforeState filter can be used to redirect to another state by returning an object
from the filter with a to property. The to property should identify the state to
transition to. Any value available for `to`, `params`, or `options` are passed to
[$state.go](http://angular-ui.github.io/ui-router/site/#/api/ui.router.state.$state)
allowing for full customization of the state transition. If only params are returned
from the filter function then those params are merged with the current $state.params.

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
