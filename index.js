'use strict';

angular.module('wipster.aftereffects', ['codemill.adobe'])
  .service('wAfterEffectsService', ['$q', '$log', '$timeout', 'cmAdobeService',
    function ($q, $log, $timeout, adobeService) {

        var jobs = {};

        function registerJob(jobID, deferred) {
            jobs[jobID] = deferred;
        };

        function unregisterJob(jobID) {
            delete jobs[jobID];
        };

        function renderItem(outputPath, outputTemplate, renderTemplate) {
            return { method: 'renderItem', args: [outputPath, outputTemplate, renderTemplate] };
        };

        function getActiveItem() {
            return { method: 'getActiveItem', returnsObject: true };
        };

        function clearSequenceMarkers() {
            return { method: 'clearSequenceMarkers' };
        };

        function createSequenceMarkers(markers) {
            return { method: 'createSequenceMarkers', args: [markers] };
        };

        function setNullLayerMarkers(data) {
            return { method: 'setNullLayerMarkers', args: [data] };
        };

        function setCurrentTimeIndicator(time) {
            return { method: 'setCurrentTimeIndicator', args: [time] }
        };

        function getOutputTemplates(presetPath) {
            return { method: 'getOutputTemplates', args: [presetPath] };
        };
        function getRenderTemplates() {
            return { method: 'getRenderTemplates'}
        };
        function runWithActiveSequenceCheck(callOpts) {
            if (adobeService.isHostAvailable()) {
                var deferred = $q.defer();
                adobeService.callCS(getActiveItem())
                  .then(function (sequence) {
                      if (typeof sequence === 'undefined' || sequence === null || sequence.id === "" || sequence.name === "name") {
                          deferred.reject(new Error('No active sequence : 11'));
                      } else {
                          adobeService.callCS(callOpts)
                            .then(function (data) {
                                deferred.resolve(data);
                            })
                            .catch(function (error) {
                                deferred.reject(error);
                            });
                      }
                  })
                  .catch(function (error) {
                      deferred.reject(error);
                  });
                return deferred.promise;
            } else {
                return $q.when();
            }
        };

        var getOutputTemplate = function (presetQuality) {
            if (typeof presetQuality === "undefined" || presetQuality === null) {
                return "AVI DV NTSC 48kHz";
            }
            if (presetQuality.indexOf("NTSC") > -1) {
                return "AVI DV NTSC 48kHz";
            }
            return "AVI DV PAL 48kHz";
        };

        var getRenderTemplate = function(presetQuality) {
            return typeof presetQuality === "undefined" || presetQuality === null || presetQuality.indexOf("High") === -1
                ? "Draft Settings"
                : "Best Settings";
        };

        this.renderActiveSequence = function (config, presetQuality) {
            var deferred = $q.defer();
            var outputPath = adobeService.getFilePath(config.output);
           // $log.debug("config.preset: ", config.preset);
            runWithActiveSequenceCheck(renderItem(outputPath, presetQuality, getRenderTemplate(presetQuality)))
                  .then(function (path) {
                      //We get a funny path from AE so we need to correct it.
                      var pathOfRender = outputPath + (outputPath.endsWith("/") ? "" : "/") + path.split('/').pop();                       
                      deferred.resolve(decodeURIComponent(pathOfRender));  
                  })
                  .catch(function (error) {
                      deferred.reject(error);
                  });
            return deferred.promise;
        };

        this.clearSequenceMarkers = function () {
            return runWithActiveSequenceCheck(clearSequenceMarkers());
        };

        this.createSequenceMarkers = function (data) {
            $log.debug('markers: ', data);
            return adobeService.callCS(setNullLayerMarkers(data));
            //return runWithActiveSequenceCheck(createSequenceMarkers(markers));
        };

        var guid = function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                  .toString(16)
                  .substring(1);
            }

            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
              s4() + '-' + s4() + s4() + s4();
        };

        this.getActiveItem = function () {
            if (adobeService.isHostAvailable()) {
                return adobeService.callCS(getActiveItem());
            } else {
                return $q.when({
                    'id': guid(),
                    'name': 'Sequence name'
                });
            }
        };
        this.getRenderTemplates = function() {
            return adobeService.callCS(getRenderTemplates());
        };
        this.getOutputTemplates = function(presetPath) {
            return adobeService.callCS(getOutputTemplates(presetPath));
        };
        this.setCurrentTimeIndicator = function(time) {
            if (adobeService.isHostAvailable()) {
                return adobeService.callCS(setCurrentTimeIndicator(time));
            }
        };

    }]);