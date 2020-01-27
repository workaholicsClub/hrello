import Vue from 'vue'
import Vuetify from 'vuetify/lib';
import DatetimePicker from 'vuetify-datetime-picker'
import VueGoogleApi from 'vue-google-api'

const gapiConfig = {
    apiKey: 'AIzaSyBIY2q5KrLo7I-W8iREDq2zeqnfq3Xno0Y',
    clientId: '401657247398-upt85a2i2spf4f61sfff5g6405cus68m.apps.googleusercontent.com',
    scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive',
    discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
        "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
    ]
};


Vue.use(Vuetify);
Vue.use(DatetimePicker);
Vue.use(VueGoogleApi, gapiConfig);

import App from './BoardPage.vue'

Vue.config.productionTip = false;

Vue.prototype.$isDesktop = function () {
    let desktopMobileBreakpoint = this.$vuetify.breakpoint.thresholds.sm
    return window.innerWidth >= desktopMobileBreakpoint;
};

Vue.prototype.$isMobile = function () {
    return !this.$isDesktop;
};

new Vue({
    vuetify: new Vuetify({
        theme: {
            options: {
                customProperties: true,
            },
        }
    }),
    render: h => h(App),
}).$mount('#app');
