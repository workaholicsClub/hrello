const shortid = require('shortid');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const mime = require('mime-types');
const sharp = require('sharp');
const CandidateCard = require('../models/CandidateCard');
const Board = require('../models/Board');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const {parseFile, extractImagesFromFile} = require('../parser');

async function uploadFile(uploadedFile, fileId) {
    if (!fileId) {
        fileId = shortid.generate();
    }

    const fileName = fileId + '_' + uploadedFile.name;
    const saveToPath = path.normalize(__dirname + '/../uploads/' + fileName);

    return new Promise( (resolve, reject) => {
        uploadedFile.mv(saveToPath, error => {
            if (error) {
                reject(error);
            }

            resolve({fileName, path: saveToPath});
        })
    });
}

function makeSquareJpegImage(buffer) {
    return sharp(buffer)
        .metadata()
        .then(({width, height}) => {
                let targetSize = Math.min(width, height);
                return sharp(buffer)
                    .resize({
                        width: targetSize,
                        height: targetSize,
                        fit: 'cover',
                        position: 'top'
                    })
                    .toFormat('jpeg')
                    .toBuffer();
            });
}

module.exports = {
    upload: (db) => {
        return async (request, response) => {

            const uploadedFile = request.files.file;
            const fileId = request.body.fileId;

            try {
                let {fileName} = await uploadFile(uploadedFile, fileId);

                response.send({
                    fileId: fileId,
                    fileName: fileName,
                    relativeUrl: '/uploads/'+fileName,
                });
            }
            catch (error) {
                response
                    .status(500)
                    .send({
                        status: 'error',
                        message: error
                    });
            }
        }
    },
    addResume: (db) => {
        return async (request, response) => {
            const uploadedFile = request.files.file;
            const fileId = request.body.fileId;
            const boardId = request.body.boardId;
            const userId = request.body.userId;

            try {
                let user = userId ? await User.makeFromId(db, userId) : false;
                let board = await Board.makeFromId(db, boardId);
                let card = await CandidateCard.makeNewForBoard(db, board, user);

                let {fileName, path} = await uploadFile(uploadedFile, fileId);
                let {docText, candidate} = await parseFile(path, board);
                let candidateFields = candidate;

                if (candidateFields) {
                    candidate = new Candidate(candidateFields);
                    board.addMissingCandidatePinnedFields(candidate);
                    await board.save();
                    card.addCandidateFieldValues(candidate);
                }

                card.addFileField(fileName, path, uploadedFile.type, fileId, {docText, candidate: candidateFields});
                await card.save();

                let boardFields = await board.asDTO();

                response.send({
                    fileId: fileId,
                    fileName: fileName,
                    relativeUrl: '/uploads/'+fileName,
                    card: card.asDTO(),
                    board: boardFields
                });
            }
            catch (error) {
                response
                    .status(500)
                    .send({
                        status: 'error',
                        message: error.toString(),
                        stack: error.stack || []
                    });
            }
        }
    },
    resumeAvatar: (db) => {
        return async (request, response) => {
            let cardId = request.query.cardId || false;
            let cacheDir = __dirname+'/../avatars/';
            let cacheFiles = await glob.sync(cacheDir+cardId+'.jpeg', {});
            if (cacheFiles && cacheFiles.length > 0) {
                let fileName = cacheFiles[0].replace(/^.*\//, '');
                return response.redirect(301, '/avatars/'+fileName);
            }

            let card = await CandidateCard.makeFromId(db, cardId);
            let attachedFiles = card.getFiles();
            for (const file of attachedFiles) {
                let path = __dirname+'/../uploads/'+file.fileName;
                let images = await extractImagesFromFile(path);
                if (images) {
                    let noLogoImages = images.filter( image => image.width > 90 || image.height > 90 );
                    if (noLogoImages && noLogoImages.length > 0) {
                        let avatar = noLogoImages[0];
                        let avatarBuffer = Buffer.from(avatar.base64, 'base64');
                        let resizedAvatar = await makeSquareJpegImage(avatarBuffer);

                        let cacheFilePath = cacheDir+cardId+'.jpeg';
                        fs.writeFileSync(cacheFilePath, resizedAvatar);

                        response.write(resizedAvatar, 'binary');
                        return response.end(null, 'binary');
                    }
                }

            }

            return response.redirect(301, '/assets/profile.png');
        }
    }
};