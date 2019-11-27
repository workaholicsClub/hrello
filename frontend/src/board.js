import Vue from 'vue'
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

import App from './BoardPage.vue'

Vue.config.productionTip = false;

Vue.prototype.$isDesktop = function () {
    return window.innerWidth >= this.$vuetify.breakpoint.thresholds.sm;
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
