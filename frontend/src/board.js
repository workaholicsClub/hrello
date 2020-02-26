import Vue from 'vue'
import Vuetify from 'vuetify/lib';
import DatetimePicker from 'vuetify-datetime-picker'
import VueGoogleApi from 'vue-google-api'

const useGoogleServices = false;

const gapiConfig = useGoogleServices
    ? {
        apiKey: 'AIzaSyBIY2q5KrLo7I-W8iREDq2zeqnfq3Xno0Y',
        clientId: '401657247398-upt85a2i2spf4f61sfff5g6405cus68m.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive',
        discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
            "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
        ]
    }
    : {
        apiKey: 'AIzaSyBIY2q5KrLo7I-W8iREDq2zeqnfq3Xno0Y',
        clientId: '401657247398-upt85a2i2spf4f61sfff5g6405cus68m.apps.googleusercontent.com',
    };


Vue.use(Vuetify);
Vue.use(DatetimePicker);
Vue.use(VueGoogleApi, gapiConfig);

import BoardPage from './BoardPage.vue'

Vue.config.productionTip = false;

Vue.prototype.$isDesktop = function () {
    let desktopMobileBreakpoint = this.$vuetify.breakpoint.thresholds.sm;
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
    propsData: {
        useGoogleServices: useGoogleServices
    },
    render: createElement => createElement(BoardPage, {
                props: {
                    'use-google-services': useGoogleServices
                }
            }),
}).$mount('#app');
