'use strict';

angular.module('soundDetail', [
  'core.sound',
  'chart.js',
]).config(['ChartJsProvider', function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
      chartColors: ['#FF5722', '#A5D6A7'],
      responsive: false
    });
  }]);
