import axios from "axios";

export default {
    data() {
        return {
            user: false,
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
                this.finishLogin(response.data.user);
            }

            return this.user;
        },
        finishLogin(profile) {
            this.loginError = false;
            this.userChecked = true;
            this.user = profile;
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
            await this.loadUrlData();
        },
        async logout() {
            await this.$gapi.signOut();
            this.user = false;
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
    },

    computed: {
        userId() {
            if (this.user) {
                return this.user.id;
            }

            return this.loadedUserId;
        },
    }
}