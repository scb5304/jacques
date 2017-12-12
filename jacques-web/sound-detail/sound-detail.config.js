angular
    .module("soundDetail")
    .config(["ChartJsProvider", "$stateProvider", function(ChartJsProvider, $stateProvider) {
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
                        userCallback: function(label) {
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

        var soundDetailState = {
            name: 'soundDetail',
            url: '/sounds/{guildId}/{soundName}',
            component: 'soundDetail',
            resolve: {
                guild: function($transition$, jacquesEndpointInterface) {
                    var guildId = $transition$.params().guildId;
                    return jacquesEndpointInterface.getGuild(guildId);
                },
                sound: function($transition$, jacquesEndpointInterface) {
                    var guildId = $transition$.params().guildId;
                    var soundName = $transition$.params().soundName;
                    return jacquesEndpointInterface.getSoundByName(guildId, soundName);
                }
            }
        };

        $stateProvider.state(soundDetailState);
    }]);