import Vue from 'vue';
import Vuex from 'vuex';
import axios from "axios";
import moment from "moment";

Vue.use(Vuex);

function skipTask(item, userId) {
    let totallyCompletedTask = item.value === true;
    let userCompletedThisTask = item.complete && item.complete[userId]
        ? item.complete[userId]
        : false;

    if (totallyCompletedTask || userCompletedThisTask) {
        return true;
    }

    let userIds = item.task.users.map( user => user.id );

    let isUserMentioned = userIds.indexOf(userId) !== -1;
    let isUserAuthor = item.author.id === userId;

    return  !isUserAuthor && !isUserMentioned;
}

export default new Vuex.Store(
    {
        state: {
            boards: [],
            teamMates: [],
            timetableEvents: [],
        },
        getters: {
            eventDatesForUser(state) {
                return userId => {
                    return state.timetableEvents.reduce( (dates, item) => {
                        let isTask = item.fieldType === 'task';

                        if (isTask) {
                            if (skipTask(item, userId)) {
                                return dates;
                            }

                            let taskPostponedDate = item.postponed && item.postponed[userId];
                            if (taskPostponedDate) {
                                dates.push( moment(taskPostponedDate).format('YYYY-MM-DD') );
                            }

                            let taskDates = item.task.dates.map( date => moment(date).format('YYYY-MM-DD') );
                            dates = dates.concat(taskDates);
                        }
                        else {
                            dates.push( moment(item.value).format('YYYY-MM-DD') );
                        }

                        return dates;
                    }, []);
                }
            },
            eventsByDateForUser(state) {
                return (date, userId) => {
                    let searchDate = moment(date);
                    return state.timetableEvents.filter( item => {
                        let isEvent = item.type === 'event';
                        let isTask = item.fieldType === 'task';

                        if (isEvent) {
                            return moment(item.value).isSame(searchDate, 'day');
                        }

                        if (isTask) {
                            if (skipTask(item, userId)) {
                                return false;
                            }

                            let taskPostponedDate = item.postponed && item.postponed[userId]
                                ? moment(item.postponed[userId])
                                : false;

                            if (taskPostponedDate) {
                                return searchDate.isSameOrAfter(taskPostponedDate, 'day');
                            }

                            let minDate = item.task.dates.reduce( (minDate, enumDate) => {
                                if (minDate === false) {
                                    return moment(enumDate);
                                }

                                if (moment(enumDate).isBefore(minDate)) {
                                    return moment(enumDate);
                                }

                                return minDate;
                            }, false);

                            if (!minDate) {
                                minDate = moment(item.date);
                            }

                            if (moment(item.date).isBefore(minDate)) {
                                minDate = moment(item.date);
                            }

                            return searchDate.isSameOrAfter(minDate, 'day');
                        }

                        return false;
                    });
                }
            },
            boardByCard(state) {
                return card => {
                    return state.boards.find( board => {
                        return board.id === card.boardId;
                    });
                }
            }
        },
        actions: {
            async loadTeammates({commit}, userId) {
                let response = await axios.get(`/api/user/team`, {
                    params: { userId }
                });

                commit('teammates', response.data.user);
            },
            async loadTimetableEvents({commit}, {userId, boardIds}) {
                let eventsResponse = await axios.get('/api/event/listTimetable', {
                    params: {userId, boardIds, showOutdated: 1}
                });

                commit('timetableEvents', eventsResponse.data.timetable);
            },
            async loadBoards({commit}, userId) {
                if (!userId) {
                    return;
                }

                let response = await axios.get('/api/board/list', {
                    params: {userId}
                });
                commit('boards', response.data.board);
            },
        },
        mutations: {
            teammates(state, newTeammates) {
                state.teamMates = newTeammates;
            },
            timetableEvents(state, newTimetableEvents) {
                state.timetableEvents = newTimetableEvents;
            },
            boards(state, newBoards) {
                state.boards = newBoards;
            }
        }
    }
)