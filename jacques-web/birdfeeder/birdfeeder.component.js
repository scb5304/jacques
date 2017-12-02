"use strict";

angular.module("birdfeeder")
    .component("birdfeeder", {
        templateUrl: "birdfeeder/birdfeeder.template.html",
        controller: ["$scope", "sharedProperties", "$http", "$mdDialog", "$mdToast",
            function BirdfeedController($scope, sharedProperties, $http, $mdDialog, $mdToast) {
                $scope.birdfeed = "";
                $scope.makingRequest = false;
                $scope.sharedProperties = sharedProperties;

                $scope.showBirdfeeder = function showBirdfeeder() {
                    $mdDialog.show({
                        templateUrl: "birdfeeder/birdfeed-dialog.html",
                        clickOutsideToClose: false,
                        controller: $scope.birdfeedDialogController,
                        controllerAs: "$ctrl"
                    })
                };

                $scope.birdfeedDialogController = function birdfeedDialogController() {
                    var self = this;

                    self.closeDialog = function () {
                        $mdDialog.hide();
                    };

                    self.submitBirdfeed = function () {
                        this.makingRequest = true;
                        $http.get("http://localhost:8081/api/users/" + this.birdfeed).then(
                            self.onSuccessfulGetUserResponse,
                            self.onFailureGetUserResponse);
                    };

                    self.onSuccessfulGetUserResponse = function (response) {
                        self.makingRequest = false;
                        sharedProperties.setUser(response.data);
                        $mdDialog.hide();
                    };

                    self.onFailureGetUserResponse = function (response) {
                        self.makingRequest = false;
                        var toastMessage = "Oops, that didn't work.";
                        if (response.data) {
                            if (response.data.error) {
                                toastMessage = response.data.error;
                            }
                        }

                        $mdToast.show(
                            $mdToast.simple()
                                .textContent(toastMessage)
                                .position("bottom center")
                                .hideDelay(3150)
                        );
                    }
                };
            }
        ]
    });
