'use strict';

angular.module('wipster.aftereffects', ['codemill.adobe'])
  .service('wAfterEffectsService', ['$q', '$log', '$timeout', 'cmAdobeService',
    function ($q, $log, $timeout, adobeService) {

        var jobs = {};

        function registerJob(jobID, deferred) {
            jobs[jobID] = deferred;
        }

        function unregisterJob(jobID) {
            delete jobs[jobID];
        }

        function renderItem(outputPath) {
            return { method: 'renderItem', args: [outputPath] };
        }

        function getActiveItem() {
            return { method: 'getActiveItem', returnsObject: true };
        }

        function clearSequenceMarkers() {
            return { method: 'clearSequenceMarkers' };
        }

        function createSequenceMarkers(markers) {
            return { method: 'createSequenceMarkers', args: [markers] };
        }

        function setNullLayerMarkers(data) {
            return { method: 'setNullLayerMarkers', args: [data] };
        }

        function setCurrentTimeIndicator(time) {
            return { method: 'setCurrentTimeIndicator', args: [time] }
        }

        function handleRenderEvent(event) {
            var jobID = event.data.jobID;
            if (jobID in jobs) {
                var deferred = jobs[jobID];
                switch (event.data.type) {
                    case 'error':
                        $log.error('Failed rendering sequence', event.data.error);
                        deferred.reject('Failed rendering sequence');
                        unregisterJob(jobID);
                        break;
                    case 'progress':
                        deferred.notify(event.data.progress * 100);
                        break;
                    case 'complete':
                        $log.info('File from host: ', event.data.outputFilePath);
                        deferred.resolve(event.data.outputFilePath);
                        unregisterJob(jobID);
                        break;
                }
            }
        }

        if (adobeService.isHostAvailable()) {
            adobeService.registerEventListener('se.codemill.ppro.RenderEvent', handleRenderEvent);
        }

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
        }

        this.renderActiveSequence = function (config) {
            var deferred = $q.defer();
            var outputPath = adobeService.getFilePath(config.output);

            runWithActiveSequenceCheck(renderItem(outputPath))
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
            $log.debug('markers: ', data)
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

        this.setCurrentTimeIndicator = function(time) {
            if (adobeService.isHostAvailable()) {
                return adobeService.callCS(setCurrentTimeIndicator(time));
            }
        }

    }]);