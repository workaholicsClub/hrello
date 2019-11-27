<template>

  <v-app id="hrello" v-resize="watchResize" >
    <Sidebar :drawer="drawer" :is-desktop="isDesktop" @drawer="setDrawerState"></Sidebar>
    <Header @drawer="toggleDrawer" :is-desktop="isDesktop"></Header>
    <Board class="mt-2"></Board>
  </v-app>

</template>

<script>
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import Board from './components/Board.vue'

export default {
    name: 'BoardPage',
    components: {
        Header,
        Sidebar,
        Board
    },
    data() {
        return {
            drawer: this.$isDesktop(),
            mini: this.$isDesktop(),
            isDesktop: this.$isDesktop()
        }
    },
    methods: {
        toggleDrawer() {
            this.drawer = !this.drawer;
        },
        setDrawerState(newState) {
            this.drawer = newState;
        },
        setDrawerStateOnResizeToDesktop() {
            this.drawer = true;
        },
        setDrawerStateOnResizeToMobile() {
            this.drawer = false;
        },
        watchResize() {
            let scaleChanged = this.isDesktop !== this.$isDesktop();
            if (scaleChanged) {
                this.isDesktop = this.$isDesktop();

                if (this.isDesktop) {
                    this.setDrawerStateOnResizeToDesktop();
                }
                else {
                    this.setDrawerStateOnResizeToMobile();
                }
            }
        }
    },
    computed: {
    }
}
</script>

<style>
    #hrello {
        background-color: #e7f2f5;
    }
</style>
