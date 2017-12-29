"use strict";

angular
    .module("upload")
    .component("upload", {
        templateUrl: "upload/upload.template.html",
        controller: ["$scope", "sharedProperties", "jacquesEndpointInterface", "jacquesToaster",
            function UploadController($scope, sharedProperties, jacquesEndpointInterface, jacquesToaster) {
                $scope.files = [];
                $scope.sharedProperties = sharedProperties;
                $scope.jacquesEndpointInterface = jacquesEndpointInterface;
                $scope.formValid = false;

                $scope.$watch('soundUploadForm.$valid', function(isValidValue) {
                    $scope.formValid = isValidValue;
                });

                $scope.onSubmitClick = function() {
                    if(!$scope.formValid) {
                        return;
                    }
                    console.log("Submit clicked.");
                    console.log($scope.files);

                    var firstFile = $scope.files[0].lfFile;
                    var fileName = firstFile.name.replace(".mp3", "");

                    $scope.getBase64(firstFile).then(function (base64) {
                        console.log(firstFile);
                        var user = sharedProperties.getUser();
                        $scope.jacquesEndpointInterface.postSound(user.discord_last_guild_id, fileName, base64, user.birdfeed_token)
                            .then(function() {
                                $scope.files = [];
                                jacquesToaster.showToastWithText("Upload success!");
                            }).catch(function(err) {
                                console.error(err);
                        })
                    })

                };

                $scope.getBase64 = function(file) {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = function() {
                            resolve(reader.result);
                        };
                        reader.onerror = function(err) {
                            reject(err);
                        };
                    });
                }
            }
        ]
    });