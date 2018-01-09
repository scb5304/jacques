"use strict";

angular.module("birdfeeder")
    .component("birdfeeder", {
        templateUrl: "birdfeeder/birdfeeder.template.html",
        controller: ["$scope", "sharedProperties", "UsersService", "jacquesToaster", "$mdDialog",
            function BirdfeedController($scope, sharedProperties, UsersService, jacquesToaster, $mdDialog) {
                $scope.makingRequest = false;
                $scope.sharedProperties = sharedProperties;

                $scope.showBirdfeeder = function showBirdfeeder() {
                    $mdDialog.show({
                        templateUrl: "birdfeeder/birdfeed-dialog.html",
                        clickOutsideToClose: false,
                        controller: $scope.birdfeedDialogController,
                        controllerAs: "$ctrl"
                    });
                };

                $scope.birdfeedDialogController = function birdfeedDialogController() {
                    this.birdfeed = "";
                    this.closeDialog = $scope.closeDialog;
                    this.submitBirdfeed = function() {
                        $scope.submitBirdfeed(this.birdfeed);
                    };
                };

                $scope.closeDialog = function() {
                    $mdDialog.hide();
                };

                $scope.submitBirdfeed = function(birdfeed) {
                    $scope.makingRequest = true;
                    UsersService.getUser(birdfeed)
                        .then($scope.onSuccessfulGetUserResponse)
                        .catch($scope.onFailureGetUserResponse);
                };

                $scope.onSuccessfulGetUserResponse = function (user) {
                    localStorage.setItem("jacques_user", JSON.stringify(user));
                    sharedProperties.setUser(user);

                    $scope.makingRequest = false;
                    $mdDialog.hide();
                };

                $scope.onFailureGetUserResponse = function (response) {
                    localStorage.removeItem("jacques_user");
                    sharedProperties.setUser({});

                    $scope.makingRequest = false;

                    var toastMessage = null;
                    if (response.data && response.data.error) {
                        toastMessage = response.data.error;
                    }

                    if (toastMessage) {
                        jacquesToaster.showToastWithText(toastMessage);
                    } else {
                        jacquesToaster.showApiErrorToast();
                    }
                }
            }
        ]
    });
