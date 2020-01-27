import axios from "axios";

export default {
    data() {
        return {
            user: false,
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

        async checkAndLoadAuthorizedUser() {
            let isSignedIn = await this.$gapi.isSignedIn();

            if (isSignedIn) {
                await this.loadUserProfileAndUpdateLocalData();
            }

            this.userChecked = true;
            return isSignedIn;
        },
        async loadUserProfileAndUpdateLocalData() {
            let profile = await this.getGoogleUserProfile();

            if (profile) {
                let response = await axios.post('/api/user/login', profile);
                this.user = response.data.user;
                localStorage.setItem('authorizedUser', JSON.stringify(this.user));
            }

            return this.user;
        },
        async login() {
            let result = await this.$gapi.signIn();
            let isOk = !result.error;

            if (isOk) {
                this.loadUserProfileAndUpdateLocalData();
                this.resetBoards();
            }
        },
        async logout() {
            await this.$gapi.signOut();
            this.user = false;
            localStorage.removeItem('authorizedUser');

            this.resetBoards();
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