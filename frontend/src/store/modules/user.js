export default {
    state: {
        currentUser: false,
    },
    actions: {
        logout({commit}) {
            commit('setUser', false);
        },
        updateUserFields({commit, state}, newFields) {
            let updatedUser = Object.assign(state.currentUser, newFields);
            commit('updateUser', updatedUser);
        }
    },
    getters: {
        userId(state) {
            return state.currentUser ? state.currentUser.id : false;
        },
        savedFilter(state) {
            return groupId => {
                let userHasGroups = state.currentUser && state.currentUser.savedGroups && state.currentUser.savedGroups.length > 0;

                if (!userHasGroups) {
                    return {};
                }

                let group = state.currentUser.savedGroups.find( savedGroup => savedGroup.id === groupId );

                if (!group) {
                    return {};
                }

                if (!group.filter) {
                    return {};
                }

                let clonedFilter = Object.assign({}, group.filter);

                return clonedFilter;
            }
        },
        group(state) {
            return groupId => {
                let userHasGroups = state.currentUser && state.currentUser.savedGroups && state.currentUser.savedGroups.length > 0;
                if (userHasGroups) {
                    return state.currentUser.savedGroups.find(group => group.id === groupId);
                }

                return false;
            }
        },
        savedGroups(state) {
            let userHasGroups = state.currentUser && state.currentUser.savedGroups && state.currentUser.savedGroups.length > 0;
            if (userHasGroups) {
                return state.currentUser.savedGroups;
            }

            return [];
        }
    },
    mutations: {
        setUser(state, newUser) {
            state.currentUser = newUser;
        },

        updateUser(state, updatedUser) {
            state.currentUser = updatedUser;
            localStorage.setItem('authorizedUser', JSON.stringify(updatedUser));
        },
    }
}