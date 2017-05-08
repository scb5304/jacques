angular
    .module('soundDetail')
    .config(['ChartJsProvider', function(ChartJsProvider) {
        // Configure all charts
        ChartJsProvider.setOptions({
            chartColors: ['#FF5722', '#A5D6A7'],
            responsive: false,
        });
        //Configure line charts
        ChartJsProvider.setOptions('line', {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        userCallback: function(label, index, labels) {
                            if (Math.floor(label) === label) {
                                return label;
                            }
                        }
                    }
                }]
            }
        });
        //Configure horizontal bar charts
        ChartJsProvider.setOptions('horizontalBar', {
            scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero: true,
                        userCallback: function(label, index, labels) {
                            if (Math.floor(label) == label) {
                                return label;
                            }
                        }
                    },

                }],
                yAxes: [{
                    categoryPercentage: 0.4
                }]
            }
        });
    }])