angular
    .module("soundDetail")
    .config(["ChartJsProvider", function(ChartJsProvider) {
        // Configure all charts
        ChartJsProvider.setOptions({
            chartColors: ["#FF5722", "#A5D6A7"],
            responsive: true,
            maintainAspectRatio: false
        });
        //Configure line charts
        ChartJsProvider.setOptions("line", {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        userCallback: function(label, index) {
                            if (Math.floor(label) === label) {
                                return label;
                            }
                        }
                    }
                }]
            }
        });
        //Configre doughnut charts
        ChartJsProvider.setOptions("doughnut", {
            responsive: true,
            legend: {
                display: true,
                position: "bottom"
            }
        });
        //Configure horizontal bar charts
        ChartJsProvider.setOptions("horizontalBar", {
            scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero: true,
                        userCallback: function(label) {
                            if (Math.floor(label) === label) {
                                return label;
                            }
                        }
                    },

                }],
                yAxes: [{
                    
                }]
            }
        });
    }]);