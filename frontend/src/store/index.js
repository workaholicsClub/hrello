import Vue from 'vue';
import Vuex from 'vuex';
import axios from "axios";
import moment from "moment";

import user from './modules/user';
import card from './modules/card';

import saveChangesPlugin from './plugins/saveChanges';

Vue.use(Vuex);

function getItemData(item, fieldName, defaultValue) {
    let isComment = item.fieldType === 'smartComment';
    let dataField = isComment ? 'data' : 'task';

    let value = item[dataField] && item[dataField][fieldName]
        ? item[dataField][fieldName]
        : defaultValue;

    return value;
}

function skipItem(item, userId) {
    let totallyCompletedTask = item.value === true;
    let userCompletedThisTask = item.complete && item.complete[userId]
        ? item.complete[userId]
        : false;

    if (totallyCompletedTask || userCompletedThisTask) {
        return true;
    }

    let userIds = getItemData(item, 'users', []).map( user => user.id );

    let isUserMentioned = userIds.indexOf(userId) !== -1;
    let isUserAuthor = item.author.id === userId;

    return  !isUserAuthor && !isUserMentioned;
}

export default new Vuex.Store({
    modules: {
        user,
        card
    },
    plugins: [saveChangesPlugin],
    state: {
        boards: [],
        teamMates: [],
        timetableEvents: [],
        showFilterDrawer: false,
    },
    getters: {
        eventDatesForUser(state) {
            return userId => {
                return state.timetableEvents.reduce( (dates, item) => {
                    let isTask = item.fieldType === 'task';
                    let isComment = item.fieldType === 'smartComment';

                    if (isTask || isComment) {
                        if (skipItem(item, userId)) {
                            return dates;
                        }

                        let taskPostponedDate = item.postponed && item.postponed[userId];
                        if (taskPostponedDate) {
                            dates.push( moment(taskPostponedDate).format('YYYY-MM-DD') );
                        }

                        let taskDates = getItemData(item,'dates', []).map( date => moment(date).format('YYYY-MM-DD') );
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
                    let isComment = item.fieldType === 'smartComment';

                    if (isEvent) {
                        return moment(item.value).isSame(searchDate, 'day');
                    }

                    if (isTask || isComment) {
                        if (skipItem(item, userId)) {
                            return false;
                        }

                        let taskPostponedDate = item.postponed && item.postponed[userId]
                            ? moment(item.postponed[userId])
                            : false;

                        if (taskPostponedDate) {
                            return searchDate.isSameOrAfter(taskPostponedDate, 'day');
                        }

                        let minDate = getItemData(item, 'dates', []).reduce( (minDate, enumDate) => {
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
        },
        boardById(state) {
            return searchId => {
                return state.boards.find( board => board.id === searchId );
            }
        },
        boardIds(state) {
            return state.boards.map( board => board.id );
        }
    },
    actions: {
        async loadTeammates({commit}, userId) {
            let response = await axios.get(`/api/user/team`, {
                params: { userId }
            });

            commit('teammates', response.data.user);
        },
        async loadTimetableEvents({commit, getters}) {
            let userId = getters.userId;
            let boardIds = getters.boardIds;

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
        },
        toggleFilterDrawer(state) {
            state.showFilterDrawer = !state.showFilterDrawer;
        },
        updateBoard(state, {boardId, field, value}) {
            let board = state.boards.find( board => board.id === boardId );
            this._vm.$set(board, field, value);
        }
    }
});