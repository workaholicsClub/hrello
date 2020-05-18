const moment = require('moment');
const shortid = require('shortid');

async function addEvent(db, collectionName, eventData) {
    let eventsCollection = db.collection(collectionName);

    eventData.id = shortid.generate();

    let result = await eventsCollection.insertOne(eventData);
    let insertedEventRecord = result.ops[0];

    let eventsQuery = {};
    let events = false;
    let fetchEvents = eventData.boardId || eventData.userId;

    if (eventData.boardId) {
        eventsQuery['boardId'] = eventData.boardId;
    }

    if (eventData.userId) {
        eventsQuery['userId'] = eventData.userId;
    }

    if (fetchEvents) {
        events = await eventsCollection.find(eventsQuery).toArray();
    }

    return{
        event: insertedEventRecord,
        events: events
    };
}


module.exports = {
    listTimetable: (db) => {
        return async (request, response) => {
            let cardsCollection = db.collection('cards');
            let cardlessEventsCollection = db.collection('cardlessEvents');

            let boardIds = request.query.boardIds || false;
            let userId = request.query.userId || false;
            let showOutdated = Boolean(request.query.showOutdated) || false;
            let cards = [];

            if (boardIds) {
                cards = await cardsCollection.find({
                    $or: [
                        { boardId: { $in: boardIds } },
                        { guestIds: { $elemMatch: {$eq: userId} } },
                    ],
                    archive: {$in: [null, false]},
                    whitelist: {$in: [null, false]},
                    blacklist: {$in: [null, false]},
                    finishedlist: {$in: [null, false]},
                    deleted: {$in: [null, false]}
                }).toArray();
            }

            let timetable = await cardlessEventsCollection.find({
                $or: [
                    { userId: userId },
                    { 'task.users.id': userId },
                ],
                deleted: {$in: [null, false]}
            }).toArray();

            cards.forEach(card => {
                let allContent = [];

                if (card.content) {
                    allContent = allContent.concat(card.content);
                }

                if (card.globalValues) {
                    allContent = allContent.concat(card.globalValues);
                }

                allContent.forEach( content => {
                    let isValidEvent = content.type === 'event' && Boolean(content.value);
                    let isValidTask = content.type === 'field' && content.fieldType === 'task';

                    let cardData = {
                        id: card.id,
                        boardId: card.boardId,
                        statusId: card.statusId,
                        name: card.name,
                        position: card.position
                    }

                    if (isValidEvent) {
                        let event = content;
                        let isOutdated = moment(event.value).isBefore( moment.now() );

                        event.card = cardData;

                        let showEvent = !isOutdated || (isOutdated && showOutdated);

                        if (showEvent) {
                            timetable.push(event);
                        }
                    }

                    if (isValidTask) {
                        let task = content;
                        let isCompleted = Boolean(task.value);

                        task.card = cardData;

                        let showTask = !isCompleted;
                        if (showTask) {
                            timetable.push(task);
                        }
                    }
                });
            });

            let sortedTimetable  = timetable.sort((a,b) => {
                return moment(a.value).diff(moment(b.value) );
            });

            response.send({
                timetable: sortedTimetable
            });
        }
    },
    listGlobal: (db) => {
        return async (request, response) => {
            let globalEventsCollection = db.collection('globalEvents');

            let boardIds = request.query.boardIds || false;
            let userId = request.query.userId || false;
            let fetchGlobalEvents = boardIds || userId;

            let events = [];

            if (fetchGlobalEvents) {
                let globalQuery = {};
                if (boardIds) {
                    globalQuery['boardId'] = { $in: boardIds };
                }

                if (userId) {
                    globalQuery['userId'] = userId;
                }

                events = await globalEventsCollection.find(globalQuery).toArray();
            }

            response.send({
                events: events
            });
        }
    },
    addGlobal: (db) => {
        return async (request, response) => {
            let responseData = await addEvent(db, 'globalEvents', request.body);
            response.send(responseData);
        }
    },
    addCardless: (db) => {
        return async (request, response) => {
            let responseData = await addEvent(db, 'cardlessEvents', request.body);
            response.send(responseData);
        }
    },
    updateCardless: (db) => {
        return async (request, response) => {
            let cardlessItems = db.collection('cardlessEvents');
            let fieldId = request.body.id;
            let changedData = request.body.changedData;

            let item = await cardlessItems.findOne({id: fieldId});
            let updatedItem = Object.assign(item, changedData);

            let docId = updatedItem._id;
            delete updatedItem._id;

            let updateResult = await cardlessItems.findOneAndReplace({_id: docId}, updatedItem, {new: true});
            let updatedItemRecord = updateResult.value || false;

            response.send({
                item: updatedItemRecord,
            });
        }
    },
    deleteCardless: (db) => {
        return async (request, response) => {
            let eventId = request.query.eventId || false;
            let events = db.collection('cardlessEvents');

            if (!eventId) {
                response.send({
                    event: false
                });

                return false;
            }

            let updateResult = await events.findOneAndUpdate({id: eventId}, {$set: {deleted: true}});
            let updatedEventRecord = updateResult.value || false;
            response.send({
                event: updatedEventRecord
            });
        }
    }
};