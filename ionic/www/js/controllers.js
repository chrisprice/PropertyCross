angular.module('propertycross.controllers', ['ionic'])

.controller('HomeCtrl', function($scope,
                                 $rootScope,
                                 $state,
                                 $ionicLoading,
                                 Properties,
                                 Favourites,
                                 RecentSearches) {

    $scope.rightButtons = [ { type: 'button-clear',
                              content: 'Faves',
                              tap: function(event) {
                                  $state.go('favourites');
                              } } ];

    var loading;

    var searchErrorHandler = function(error) {
        loading.hide();
        if (error instanceof Array) {
            $scope.locations = error;
            $scope.showLocations = true;
            $scope.showRecentSearches = false;
        }
        else {
            $scope.errorMessage = error;
            $scope.showError = true;
        }
    };

    var doSearch = ionic.debounce(function(location) {
        $scope.errorMessage = '';
        $scope.showError = false;
        loading = $ionicLoading.show({ content: 'Searching...' });
        Properties.search(location).then(
            function(response) {
                loading.hide();
                $state.go('results');
            },
            searchErrorHandler);
    }, 200);

    var doSearchMyLocation = ionic.debounce(function() {
        $scope.errorMessage = '';
        $scope.showError = false;
        loading = $ionicLoading.show({ content: 'Searching...' });
        Properties.searchByCurrentLocation().then(
            function(response) {
                loading.hide();
                $state.go('results');
            },
            searchErrorHandler);
    }, 200);

    $scope.search = function(searchText) {
        doSearch(searchText);
    };

    $scope.searchMyLocation = function() {
        doSearchMyLocation();
    };

    $scope.recentSearches = [];
    $scope.showRecentSearches = false;
    RecentSearches.get().then(function(searches) {
        $scope.recentSearches = searches;
        $scope.showRecentSearches = searches.length;
    });

    $scope.locations = [];
    $scope.showLocations = false;

    $scope.errorMessage = '';
    $scope.showError = false;

    Favourites.load();
})

.controller('ResultsCtrl', function($scope, $ionicLoading, Properties) {

    function updateTitle() {
        $scope.title = Properties.count() + ' of ' + Properties.total() + ' matches';
    }

    var doLoadMore = ionic.debounce(function() {
        var loading = $ionicLoading.show({ content: 'Loading more...' });
        Properties.more().then(function(properties) {
            loading.hide();
            $scope.properties = properties;
            updateTitle();
        });
    }, 200);

    $scope.properties = Properties.current();
    $scope.loadMore = function() {
        doLoadMore();
    };

    updateTitle();
})

.controller('PropertyCtrl', function($scope, $stateParams, Properties, Favourites) {
    $scope.rightButtons = [ { type: 'button-clear',
                              content: '<i class="icon ion-star"></i>',
                              tap: function(event) {
                                  Favourites.isFavourite($scope.property)
                                      ? Favourites.remove($scope.property)
                                      : Favourites.add($scope.property);
                              } } ];

    // kind of yuck, but works
    $scope.property = Favourites.get($stateParams.id);
    if (!$scope.property) {
        $scope.property = Properties.get($stateParams.id);
    }
})

.controller('FavouritesCtrl', function($scope, Favourites) {
    Favourites.load().then(function(properties) {
        $scope.properties = properties;
    });
})

;
