angular.module("proton.attachments", [
    "proton.authentication"
])
.service("attachments", function(
    $http,
    $log,
    $window,
    $q,
    $rootScope,
    authentication,
    notify,
    pmcw,
    errorReporter,
    CONSTANTS,
    OAUTH_KEY
) {
    return {
        // read the file locally, and encrypt it. return the encrypted file.
        load: function(file) {
            var q = $q.defer();
            var fileObject = {};
            var reader = new FileReader();

            if (!file) {
                q.reject(new TypeError("You did not provide a file"));
            }

            reader.onloadend = function(event) {
                // encryptFile(data, pubKeys, passwords, filename)
                var encAttachment = pmcw.encryptFile(new Uint8Array(reader.result), authentication.user.PublicKey, [], file.name);

                // console.log('encAttachment',encAttachment);

                return encAttachment.then(
                    function(packets) {
                        // console.log('packets', packets);
                        packets.Filename = file.name;
                        packets.MIMEType = file.type;
                        packets.FileSize = file.size;
                        q.resolve(packets);
                    }
                )
                .catch(function(err) {
                    q.reject('Failed to encrypt attachment. Please try again.');
                });
            };

            reader.readAsArrayBuffer(file);

            return q.promise;
        },
        upload: function(packets, MessageID) {
            var deferred = $q.defer();
            var data = new FormData();
            var xhr = new XMLHttpRequest();
            var sessionKeyPromise = this.getSessionKey(packets.keys);
            var attachmentData = {};

            data.append('Filename', packets.Filename);
            data.append('MessageID', MessageID);
            data.append('MIMEType', packets.MIMEType);
            data.append('KeyPackets', new Blob([packets.keys]));
            data.append('DataPacket', new Blob([packets.data]));

            attachmentData.filename = packets.Filename;
            attachmentData.fileSize = packets.fileSize;
            attachmentData.MIMEType = packets.MIMEType;

            xhr.onload = function() {
                var response;
                var validJSON;

                try {
                    response = JSON.parse(this.responseText);
                    validJSON = true;
                } catch (error) {
                    response = {
                        'Error': 'JSON parsing error: ' + this.responseText
                    };
                    validJSON = false;
                }

                var statusCode = this.status;

                if (statusCode !== 200) {
                    // Error with the request
                    notify('Unable to upload file. Please try again.');
                    deferred.reject();
                    return;
                } else if (response.Error !== undefined) {
                    if (validJSON) {
                        // Attachment disallowed by back-end size limit (no change in size)
                        notify(response.Error);
                    } else {
                        notify('Unable to upload.');
                    }
                } else {
                    attachmentData.AttachmentID = response.AttachmentID;
                    sessionKeyPromise.then(function(sessionKey) {
                        attachmentData.sessionKey = sessionKey;
                        deferred.resolve(attachmentData);
                    });
                }
            };

            xhr.open('post', authentication.baseURL +'/attachments/upload', true);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.setRequestHeader("Accept", "application/vnd.protonmail.v1+json");
            xhr.setRequestHeader("Authorization", "Bearer " + window.localStorage[OAUTH_KEY + ":AccessToken"]);
            xhr.setRequestHeader("x-pm-uid", window.localStorage[OAUTH_KEY + ":Uid"]);
            xhr.send(data);

            return deferred.promise;
        },
        removeAttachment: function(file) {

        },
        getSessionKey:function(keypacket) {
            return authentication.getPrivateKey().then(function (key) {
                return pmcw.decryptSessionKey(keypacket,key);
            });
        },
        get: function(id, filename) {
            return $http
                .get(authentication.baseURL + "/attachments/" + id, {
                    responseType: "arraybuffer"
                })
                .success(function(data, status, headers, other) {

                    return data;

                }).error(function(response) {
                    $log.debug(response);
                });
        }
    };
});
