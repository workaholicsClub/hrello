import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuetify from 'vuetify/lib';
import VueGoogleApi from 'vue-google-api';
import Rollbar from 'vue-rollbar';
import Sticky from 'vue-sticky-directive';
import ShortKey from 'vue-shortkey';

import store from './store';
import routes from './routes';

import BoardPage from './BoardPage.vue';

const useGoogleServices = false;
const isProduction = /localhost|127\.0\.0/.test(location.href) || false;

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

let vueInstance = false;

Vue.use(ShortKey);
Vue.use(Vuetify);
Vue.use(VueRouter);
Vue.use(VueGoogleApi, gapiConfig);
Vue.use(Sticky);
Vue.use(Rollbar, {
    accessToken: '62e0891d2c9d41e6971d135094781b74',
    captureUncaught: true,
    captureUnhandledRejections: true,
    enabled: true,
    environment: isProduction ? 'production' : 'development',
    payload: {
        client: {
            javascript: {
                code_version: '1.0',
                source_map_enabled: false,
                guess_uncaught_frames: false
            }
        }
    }
});

Vue.config.productionTip = false;

Vue.config.errorHandler = function (err) {
    Vue.rollbar.error(err);
    if (vueInstance) {
        vueInstance.$store.commit('setAppError', err);
    }
    let c = console;
    c.error(err);
};

Vue.prototype.$isDesktop = function () {
    let desktopMobileBreakpoint = this.$vuetify.breakpoint.thresholds.sm;
    return window.innerWidth >= desktopMobileBreakpoint;
};

Vue.prototype.$isMobile = function () {
    return !this.$isDesktop;
};


const router = new VueRouter({
    routes
});

vueInstance = new Vue({
    vuetify: new Vuetify({
        theme: {
            options: {
                customProperties: true,
            },
        }
    }),
    router,
    store,
    propsData: {
        useGoogleServices
    },
    render(createElement) {
        return createElement(BoardPage, {
            props: {
                'use-google-services': useGoogleServices
            }
        });
    }
}).$mount('#app');
