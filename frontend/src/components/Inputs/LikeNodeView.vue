<template>
    <emojis :field="field" @change="updateNodeValue"></emojis>
</template>

<script>
    import Emojis from "../Fields/View/Emojis";

    export default {
        name: "LikeNodeView",
        props: ['node', 'updateAttrs', 'view', 'selected', 'getPos'],
        components: {Emojis},
        computed: {
            field() {
                return {
                    value: this.node.attrs.value
                }
            }
        },
        methods: {
            updateNodeValue(newValue) {
                this.updateAttrs({
                    value: newValue,
                });
            }
        }
    }
</script>

<style scoped>

</style>