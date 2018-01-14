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
        //Configure doughnut charts
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
            name: "soundDetail",
            url: "/sounds/{guildId}/{soundName}",
            component: "soundDetail",
            resolve: {
                guild: function($transition$, GuildsService) {
                    var guildId = $transition$.params().guildId;
                    return GuildsService.getGuild(guildId);
                },
                sound: function($transition$, SoundsService) {
                    var guildId = $transition$.params().guildId;
                    var soundName = $transition$.params().soundName;
                    return SoundsService.getSoundByName(guildId, soundName);
                }
            },
            data: {
                pageTitle: "Details"
            }
        };

        $stateProvider.state(soundDetailState);
    }]);