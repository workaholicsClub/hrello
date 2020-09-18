const shortid = require('shortid');
const moment = require('moment');

function getBoardTemplateStatusesAndFields(boardId) {
    return [
        {
            id: shortid.generate(),
            boardId: boardId,
            sort: 100,
            title: 'Входящие',
        },
        {
            id: shortid.generate(),
            boardId: boardId,
            sort: 200,
            title: 'Собеседование',
        },
        {
            id: shortid.generate(),
            boardId: boardId,
            sort: 300,
            title: 'Выход на работу',
        },
    ]
}
function getCardTemplates(statusIds, boardId) {
    return statusIds.map( (statusId, index) => {
        return {
            id: shortid.generate(),
            name: 'Кандидат ' + (index+1),
            statusId: statusId,
            boardId: boardId
        }
    });
}
function getStatusStats(statuses, cards) {
    return statuses.map( status => {
        let statusCards = cards.filter( card => card.statusId === status.id );
        return {
            statusId: status.id,
            statusTitle: status.title,
            cardsCount: statusCards.length || 0,
        }
    });
}
function getStatusTime(statuses, cards) {
    let baseStats = getStatusStats(statuses, cards);

    let stats = cards.reduce( (stats, card) => {
        if (!card.statusHistory) {
            return stats;
        }

        for (const currentStep of card.statusHistory) {
            let existingStats = stats.find( statusStats => statusStats.statusId === currentStep.statusId );

            if (existingStats) {
                let stepIndex = card.statusHistory.indexOf(currentStep);
                let nextStep = stepIndex < card.statusHistory.length
                    ? card.statusHistory[stepIndex+1]
                    : false;

                if (!existingStats.cardTime) {
                    existingStats.cardTime = [];
                }

                let fromDate = moment(currentStep.dateChanged);
                let toDate = nextStep
                    ? moment(nextStep.dateChanged)
                    : moment();

                let timeInStatus = moment.duration(toDate.diff(fromDate)).as('seconds');
                existingStats.cardTime.push({cardId: card.id, timeInStatus, fromDate, toDate});
            }
        }

        return stats;
    }, baseStats);

    return stats.map(statItem => {
        if (!statItem.cardTime) {
            statItem.cardTime = [];
        }

        statItem.totalTime = statItem.cardTime.reduce( (sum, cardStats) => sum + cardStats.timeInStatus, 0 );
        statItem.totalCardsWithTime = statItem.cardTime.length;
        statItem.avgTime = statItem.totalTime/statItem.totalCardsWithTime;
        statItem.variance = statItem.cardTime.reduce( (sum, cardStats) => {
            return sum + Math.pow(statItem.avgTime - cardStats.timeInStatus, 2)
        }, 0 )/(statItem.cardTime.length - 1);
        statItem.stdev = Math.sqrt(statItem.variance);

        let overTime = statItem.avgTime + statItem.stdev;
        let severeOverTime = statItem.avgTime + 2 * statItem.stdev;
        statItem.overdue = statItem.cardTime.reduce( (count, cardStats) => {
            if (statItem.stdev && cardStats.timeInStatus > overTime && cardStats.timeInStatus <= severeOverTime) {
                count++;
            }
            return count;
        }, 0);
        statItem.severeOverdue = statItem.cardTime.reduce( (count, cardStats) => {
            if (statItem.stdev && cardStats.timeInStatus > severeOverTime) {
                count++;
            }
            return count;
        }, 0);
        statItem.overTime = overTime;
        statItem.severeOverTime = severeOverTime;

        return statItem;
    });
}
async function getBoardStats(boardId, cards, statuses, cardsCollection, statusesCollection, boardsCollection) {

    if (!cards) {
        cards = await cardsCollection.find({
            boardId: boardId,
            deleted: {$in: [null, false]},
        }).toArray();
    }

    if (!statuses) {
        let board = await boardsCollection.findOne({id: boardId});
        if (board.statuses) {
            statuses = board.statuses;
        }
        else {
            statuses = await statusesCollection
                .find({
                    boardId: boardId,
                    archive: {$in: [null, false]},
                    deleted: {$in: [null, false]},
                })
                .sort({sort: 1})
                .toArray();
        }
    }

    return {
        count: getStatusStats(statuses, cards),
        time: getStatusTime(statuses, cards),
    }
}

module.exports = {
    add: (db) => {
        return async (request, response) => {
            let boardsCollection = db.collection('boards');
            let boardData = request.body;
            let newBoardId = shortid.generate();
            boardData.id = newBoardId;
            boardData.statuses = getBoardTemplateStatusesAndFields(newBoardId);

            let result = await boardsCollection.insertOne(boardData);
            let insertedBoardRecord = result.ops[0];

            response.send({
                board: insertedBoardRecord,
                status: insertedBoardRecord.statuses,
            });
        }
    },
    copy: (db) => {
        return async (request, response) => {
            let boardsCollection = db.collection('boards');

            let srcBoardData = request.body;
            let srcBoardId = srcBoardData.id;
            let newBoardData = srcBoardData;
            let newBoardId = shortid.generate();

            newBoardData.id = newBoardId;
            newBoardData.title += ' (копия)';
            delete newBoardData._id;
            delete newBoardData.filterValues;
            delete newBoardData.guestIds;
            delete newBoardData.vacancyText;

            let statuses = newBoardData.statuses || false;

            if (!statuses) {
                let statusesCollection = db.collection('statuses');
                let statuses = await statusesCollection
                    .find({
                        boardId: srcBoardId,
                        archive: {$in: [null, false]},
                        deleted: {$in: [null, false]},
                    })
                    .sort({sort: 1})
                    .toArray();

                let newStatuses = statuses.map((status) => {
                    let newStatus = status;
                    newStatus.boardId = newBoardId;
                    delete newStatus._id;
                    return newStatus;
                });

                let statusesResult = await statusesCollection.insertMany(newStatuses);
                statuses = statusesResult.ops;
                newBoardData.statuses = statuses;
            }

            let result = await boardsCollection.insertOne(newBoardData);
            let insertedBoardRecord = result.ops[0];

            response.send({
                board: insertedBoardRecord,
                status: statuses
            });
        }
    },

    update: (db) => {
        return async (request, response) => {
            let boards = db.collection('boards');
            let newBoardData = request.body;
            let boardId = newBoardData.id;

            if (!boardId) {
                response.send({
                    board: false
                });
            }

            if (newBoardData._id) {
                delete newBoardData._id;
            }

            if (newBoardData.stats) {
                delete newBoardData.stats;
            }

            let query =  {id: boardId};
            let updateResult = await boards.findOneAndReplace(query, newBoardData, {returnNewDocument: true});
            let updatedBoardRecord = updateResult.value || false;

            response.send({
                board: updatedBoardRecord,
            });
        }
    },
    list: (db) => {
        return async (request, response) => {
            let boardsCollection = db.collection('boards');
            let statusesCollection = db.collection('statuses');
            let cardsCollection = db.collection('cards');

            let userId = request.query.userId || false;
            let useStats = Boolean(request.query.stats) || false;

            let boards = [];
            if (userId) {
                boards = await boardsCollection.find({
                    $or: [
                        {userId: userId},
                        {guestIds: { $elemMatch: {$eq: userId} }}
                    ],
                    archive: {$in: [null, false]},
                    deleted: {$in: [null, false]},
                }).toArray();

                let statusPromises = boards.map(board => {
                    if (!board.statuses) {
                        return new Promise(resolve => {
                            statusesCollection
                                .find({
                                    boardId: board.id,
                                    archive: {$in: [null, false]},
                                    deleted: {$in: [null, false]},
                                })
                                .sort({sort: 1})
                                .toArray((err, statuses) => {
                                    board.statuses = statuses;

                                    if (useStats) {
                                        getBoardStats(board.id, null, statuses, cardsCollection)
                                            .then(boardStats => {
                                                board.stats = boardStats;
                                                resolve(board);
                                            })
                                    } else {
                                        resolve(board);
                                    }
                                });
                        });
                    }
                    else {
                        if (useStats) {
                            return getBoardStats(board.id, null, board.statuses, cardsCollection)
                                .then(boardStats => {
                                    board.stats = boardStats;
                                    return board;
                                });
                        } else {
                            return board;
                        }
                    }
                });

                boards = await Promise.all(statusPromises);
            }

            response.send({
                board: boards
            });
        }
    },
    archive: (db) => {
        return async (request, response) => {
            let boards = db.collection('boards');
            let boardId = request.query.boardId || false;

            if (!boardId) {
                response.send({
                    board: false
                });
            }

            let query =  {id: boardId};
            let updateResult = await boards.findOneAndUpdate(query, {$set: {archive: true}});
            let updatedBoardRecord = updateResult.value || false;

            response.send({
                board: updatedBoardRecord,
            });
        }
    },
    delete: (db) => {
        return async (request, response) => {
            let boards = db.collection('boards');
            let boardId = request.query.boardId || false;

            if (!boardId) {
                response.send({
                    board: false
                });
            }

            let query =  {id: boardId};
            let updateResult = await boards.findOneAndUpdate(query, {$set: {deleted: true}});
            let updatedBoardRecord = updateResult.value || false;

            response.send({
                board: updatedBoardRecord,
            });
        }
    },

    stats: (db) => {
        return async (request, response) => {
            let cardsCollection = db.collection('cards');
            let statusesCollection = db.collection('statuses');
            let boardsCollection = db.collection('boards');

            let boardId = request.query.boardId || false;

            if (boardId) {
                let stats = await getBoardStats(boardId, null, null, cardsCollection, statusesCollection, boardsCollection);

                response.send({
                    stats: stats,
                });
            }
            else {
                response.send({
                    stats: false,
                });
            }
        }
    }
};