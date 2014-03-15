'use strict';

describe('Hook: beforeState:', function() {

  var $rootScope, $stateProvider, $state;


  beforeEach(function() {
    module('ui.router', function(_$stateProvider_) {
      $stateProvider = _$stateProvider_;
    });
    module('ui.router.hooks.beforeState')
  });


  beforeEach(inject(function(_$rootScope_, _$state_) { $rootScope = _$rootScope_; $state = _$state_; }));

  function goToState(state, optionalParams) {
    $state.go(state);
    $rootScope.$apply();
  };


  describe('argument handling:', function() {

    it('handles a single function as an argument', function() {
      var hook = {
          fn: function() {}
        },
        spy = spyOn(hook, 'fn');

      $stateProvider.state('a', {
        data: {
          beforeState: hook.fn
        }
      });
      goToState('a');
      expect(spy).toHaveBeenCalled();
    });


    it('handles an array with a single function as an argument', function() {
      var hook = {
          fn: function() {}
        },
        spy = spyOn(hook, 'fn');

      $stateProvider.state('a', {
        data: {
          beforeState: [hook.fn]
        }
      });
      goToState('a');
      expect(spy).toHaveBeenCalled();
    });


    it('handles an injector array as an argument', function() {
      var hook = {
          fn: function() {}
        },
        spy = spyOn(hook, 'fn');

      $stateProvider.state('a', {
        data: {
          beforeState: ['$state', hook.fn]
        }
      });
      goToState('a');
      expect(spy).toHaveBeenCalledWith($state);
    });


    it('handles an array of functions and injector arrays as an argument', function() {
      var hook = {
          fnA: function() {},
          fnB: function() {}
        },
        spyA = spyOn(hook, 'fnA'),
        spyB = spyOn(hook, 'fnB');

      $stateProvider.state('a', {
        data: {
          beforeState: [
            ['$state', hook.fnA],
            hook.fnB
          ]
        }
      });
      goToState('a');
      expect(spyA).toHaveBeenCalledWith($state);
      expect(spyB).toHaveBeenCalled();
    });

  })


  describe('triggering:', function() {

    it('fires the hook for on state change', function() {
      var spy = jasmine.createSpy('beforeState');
      $stateProvider.state('a', {
        data: {
          beforeState: spy
        }
      });
      goToState('a');
      expect(spy).toHaveBeenCalled();
    });


    it('fires the hook for child states', function() {
      var spy = jasmine.createSpy('beforeState');
      $stateProvider.state('a', {
        data: {
          beforeState: spy
        }
      });
      $stateProvider.state('a.b', {});
      $stateProvider.state('a.b.c', {});
      goToState('a.b.c');
      expect(spy).toHaveBeenCalled();
    });

  });

  describe('chaining:', function() {

    it('halts the chain if a filter returns false', function() {
      var spyA = jasmine.createSpy('fnA').and.returnValue(false),
        spyB = jasmine.createSpy('fnB');

      $stateProvider.state('a', {
        data: { beforeState: [ spyA, spyB ] }
      });
      goToState('a');
      expect(spyA).toHaveBeenCalled();
      expect(spyB).not.toHaveBeenCalled();
    });


    it('does not halt the chain if a filter returns other falsy values', function() {
      var spyA, spyB, spyC, spyD, spyE, spyF, spyG, spies = [
        spyA = jasmine.createSpy('fnA').and.returnValue(null),
        spyB = jasmine.createSpy('fnB').and.returnValue(undefined),
        spyC = jasmine.createSpy('fnC').and.returnValue(0),
        spyD = jasmine.createSpy('fnD').and.returnValue(-0),
        spyE = jasmine.createSpy('fnE').and.returnValue(''),
        spyF = jasmine.createSpy('fnF').and.returnValue(NaN),
        spyG = jasmine.createSpy('fnG')
      ];

      $stateProvider.state('a', {
        data: { beforeState: spies }
      });
      goToState('a');
      for(var i = 0; i < spies.length; i++) {
        expect(spies[i]).toHaveBeenCalled();
      }
    });

  });


  describe('transition alteration:', function() {

    it('can modify parameters', function() {
      var spyA = jasmine.createSpy('fnA').and.returnValue({params: {foo: true }}),
        fnWrapper = {
          fn: function(state) {
            expect(state.params.foo).toBe(true);
            delete state.params.foo;
          }
        },
        spyB = spyOn(fnWrapper, 'fn').and.callThrough(),
        fnB = ['$state', fnWrapper.fn];


      $stateProvider.state('a', {
        data: { beforeState: [ spyA, fnB ] }
      });
      goToState('a');
      expect(spyA).toHaveBeenCalled();
      expect(spyB).toHaveBeenCalled();
      expect($state.params.foo).toBe(undefined);
    })


    it('can redirect', function() {
      var spyA = jasmine.createSpy('fnA').and.returnValue({to: 'b'}),
        spyB = jasmine.createSpy('fnB');

      $stateProvider.state('a', {
        data: { beforeState: spyA },
        url: '/a'
      });
      $stateProvider.state('b', {
        data: { beforeState: spyB },
        url: '/b'
      });

      goToState('a');
      expect(spyA).toHaveBeenCalled();
      expect(spyB).toHaveBeenCalled();
      expect($state.current.name).toBe('b');
    });


    it('can redirect with custom arguments to $state.go', function() {
      var to, params, options;
      var spyA = jasmine.createSpy('fnA').and.returnValue({
          params: (params = {foo: true }),
          options: (options = {}),
          to: (to = 'b')
        }),
        spyB = jasmine.createSpy('fnB'),
        spyC = spyOn($state, 'go').and.callThrough();

      $stateProvider.state('a', {
        data: { beforeState: spyA },
        url: '/a'
      });
      $stateProvider.state('b', {
        data: { beforeState: spyB },
        url: '/b'
      });

      goToState('a');
      expect(spyA).toHaveBeenCalled();
      expect(spyB).toHaveBeenCalled();
      expect(spyC).toHaveBeenCalledWith(to, params, options);
      expect($state.current.name).toBe('b');
    });


    it('halts the chain on redirect', function() {
      var spyA = jasmine.createSpy('fnA').and.returnValue({to: 'b'}),
        spyB = jasmine.createSpy('fnB'),
        spyC = jasmine.createSpy('fnC');


      $stateProvider.state('a', {
        data: { beforeState: [ spyA, spyB ] }
      });
      $stateProvider.state('b', {
        data: { beforeState: spyC }
      });
      goToState('a');
      expect(spyA).toHaveBeenCalled();
      expect(spyB).not.toHaveBeenCalled();
      expect(spyC).toHaveBeenCalled();
      expect($state.current.name).toBe('b');
    });

  });

});
