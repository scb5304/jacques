"use strict";

angular
    .module("upload")
    .component("upload", {
        templateUrl: "upload/upload.template.html",
        controller: ["$scope", "sharedProperties", "SoundsService", "JacquesToaster", "$q",
            function UploadController($scope, sharedProperties, SoundsService, JacquesToaster, $q) {
                $scope.files = [];
                $scope.sharedProperties = sharedProperties;
                $scope.SoundsService = SoundsService;
                $scope.formValid = false;

                $scope.lastUploadedGuildId = "";
                $scope.lastUploadedSoundName = "";

                $scope.$watch("soundUploadForm.$valid", function(isValidValue) {
                    $scope.formValid = isValidValue;
                });

                $scope.onSubmitClick = function() {
                    if(!$scope.formValid) {
                        return;
                    }

                    var firstFile = $scope.files[0].lfFile;
                    var fileName = firstFile.name.replace(".mp3", "").toLowerCase();

                    $scope.getBase64(firstFile).then(function (base64) {
                        var user = sharedProperties.getUser();
                        $scope.SoundsService.postSound(user.discord_last_guild_id, fileName, base64, user.birdfeed_token)
                            .then(function() {
                                $scope.files = [];
                                $scope.lastUploadedGuildId = user.discord_last_guild_id;
                                $scope.lastUploadedSoundName = fileName;
                                JacquesToaster.showToastWithText("Upload success for sound " + fileName + "!");
                            }).catch(function(err) {
                                if (err.data && err.data.error) {
                                    JacquesToaster.showToastWithText(err.data.error);
                                } else {
                                    JacquesToaster.showApiErrorToast();
                                }
                        });
                    }).catch(function(err) {
                        JacquesToaster.showToastWithText(err);
                    });
                };

                $scope.getBase64 = function(file) {
                    return $q(function(resolve, reject) {
                        var reader = new FileReader();
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