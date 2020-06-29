const shortid = require('shortid');

module.exports = {
    upload: (db) => {
        return async (request, response) => {

            const uploadedFile = request.files.file;
            const fileId = request.body.fileId || shortid.generate();
            const fileName = fileId + '_' + uploadedFile.name;
            const saveToPath = __dirname + '/../uploads/' + fileName;

            uploadedFile.mv(saveToPath, error => {
                if (error) {
                    response
                        .status(500)
                        .send({
                            status: 'error',
                            message: error
                        });

                    return;
                }

                response.send({
                    fileId: fileId,
                    fileName: fileName,
                    relativeUrl: '/uploads/'+fileName,
                });
            });
        }
    },
};