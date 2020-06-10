<template>
    <div>
        <i v-for="emoji in emojiIcons" :class="emojiClasses(emoji)" :key="emoji.icon"></i>
    </div>
</template>

<script>
    //https://emoji-css.afeld.me/
    import "../../../assets/emoji.css";

    export default {
        name: "Emoji",
        props: ['field'],
        data() {
            return {
                emojiIcons: [
                    {icon: 'em--1', value: -2},
                    {icon: 'em-thinking_face', value: -1},
                    {icon: 'em-neutral_face', value: 0},
                    {icon: 'em-ok_hand', value: 1},
                    {icon: 'em---1', value: 2},
                ],
            }
        },
        methods: {
            emojiClasses(emoji) {
                let classes = {
                    'em': true,
                    'acive': this.field.value === emoji.value
                }

                classes[emoji.icon] = true;
                return classes;
            }
        }
    }
</script>

<style scoped>
    .em {
        opacity: 0.5;
        margin-right: 0.5em;
    }

    .em.active {
        opacity: 1;
    }
</style>