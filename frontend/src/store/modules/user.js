export default {
    state: {
        currentUser: false,
    },
    actions: {
        logout({commit}) {
            commit('setUser', false);
        }
    },
    getters: {
        userId(state) {
            return state.currentUser ? state.currentUser.id : false;
        },
    },
    mutations: {
        setUser(state, newUser) {
            state.currentUser = newUser;
        }
    }
}