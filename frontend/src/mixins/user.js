import axios from "axios";

export default {
    data() {
        return {
            loginError: false,
            userChecked: false,
            loadedUserId: false,
        }
    },

    methods: {
        async getGoogleUserProfile() {
            let googleProfile = await this.$gapi.currentUser();

            return googleProfile ? {
                googleId: googleProfile.id,
                fullName: googleProfile.name,
                firstName: googleProfile.firstname,
                familyName: googleProfile.lastname,
                imageUrl: googleProfile.image,
                email: googleProfile.email
            }
            : false;
        },
        checkAndLoadAuthorizedLocalUser() {
            let savedUserData = localStorage.getItem('authorizedUser');
            if (!savedUserData) {
                return false;
            }

            let userProfile = JSON.parse(savedUserData);

            if (!userProfile) {
                return false;
            }

            if (userProfile.googleId) {
                return false;
            }

            return userProfile;
        },
        async checkAndLoadAuthorizedGoogleUser() {
            let isSignedIn = null;

            try {
                isSignedIn = await this.$gapi.isSignedIn();
            }
            catch (exception) {
                isSignedIn = false;
                this.appError = 'Ошибка подключения к сервисам Google';
            }

            if (isSignedIn) {
                await this.loadGoogleUserProfileAndUpdateLocalData();
            }

            this.userChecked = true;
            return isSignedIn;
        },
        async loadGoogleUserProfileAndUpdateLocalData() {
            let profile = await this.getGoogleUserProfile();

            if (profile) {
                let response = await axios.post('/api/user/googleLogin', profile);
                await this.finishLogin(response.data.user);
            }

            return this.user;
        },
        async finishLogin(profile) {
            this.loginError = false;
            this.userChecked = true;
            await this.$store.commit('setUser', profile);
            localStorage.setItem('authorizedUser', JSON.stringify(this.user));
        },
        async login(userData) {
            let response = await axios.post('/api/user/login', userData);
            if (response.data.user) {
                this.finishLogin(response.data.user);
                this.afterLogin();
            }
            else {
                this.loginError = response.data.error || 'Ошибка входа';
                return false;
            }
        },
        async register(userData) {
            let response = await axios.post('/api/user/register', userData);
            if (response.data.user) {
                this.finishLogin(response.data.user);
                this.afterLogin();
            }
            else {
                this.loginError = response.data.error || 'Ошибка регистрации';
                return false;
            }
        },
        async googleLogin() {
            let result = await this.$gapi.signIn();
            let isOk = !result.error;

            if (isOk) {
                await this.loadGoogleUserProfileAndUpdateLocalData();
                await this.afterLogin();
            }
        },
        async afterCardLogin() {
            if (this.user.googleId) {
                await this.getGoogleToken();
            }

            if (this.isInvitation) {
                await this.processInvitation();
            }

            await this.loadUrlData();
        },
        async afterLogin() {
            if (this.onlyCardMode) {
                return this.afterCardLogin();
            }

            if (this.user.googleId) {
                await this.getGoogleToken();
            }

            if (this.isInvitation) {
                await this.processInvitation();
            }

            await this.loadBoards();
            await this.loadCards();
            await this.loadUrlData();
            await this.loadTeammates();
        },
        async logout() {
            await this.$gapi.signOut();
            this.$store.dispatch('logout');
            localStorage.removeItem('authorizedUser');

            if (!this.onlyCardMode) {
                this.resetBoards();
            }
        },
        async processInvitation() {
            let [,, inviteType, targetId] = location.hash.split('/');
            await axios.post(`/api/invite/${inviteType}`, {userId: this.user.id, targetId: targetId});
            await this.changeUrlAndAvoidResetByVue('!/'+targetId);
        },
        async loadTeammates() {
            if (!this.user) {
                return false;
            }

            return this.$store.dispatch('loadTeammates', this.user.id);
        },
    },

    computed: {
        user() {
            return this.$store.state.user.currentUser;
        },
        userId() {
            if (this.user) {
                return this.$store.getters.userId;
            }

            return this.loadedUserId;
        },
    }
}