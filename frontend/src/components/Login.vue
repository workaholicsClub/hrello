<template>
    <v-sheet color="transparent" class="d-flex flex-column align-center">
        <v-card class="mb-4 p-4">
            <v-card-text>
                <v-form ref="form" v-model="valid">
                    <v-text-field
                            v-model="email"
                            :rules="emailRules"
                            label="Электропочта"
                            hint="Например: anna.ahmatova@mail.ru"
                            outlined
                            required
                    ></v-text-field>

                    <v-text-field
                            v-if="isRegister"
                            v-model="name"
                            :rules="nameRules"
                            label="Полное имя"
                            hint="Например: Анна Ахматова"
                            outlined
                            required
                    ></v-text-field>

                    <v-text-field
                            v-model="password"
                            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                            :rules="passwordRules"
                            :type="showPassword ? 'text' : 'password'"
                            hint="Не меньше 6 символов"
                            label="Пароль"
                            outlined
                            required
                            counter
                            @click:append="showPassword = !showPassword"
                    ></v-text-field>
                    <v-row>
                        <v-col class="d-flex align-end" v-if="isRegister">
                            <v-btn
                                    :disabled="!valid"
                                    color="success"
                                    class="mr-4"
                                    @click="sendRegisterEvent"
                            >
                                Зарегистрироваться
                            </v-btn>
                            <v-spacer></v-spacer>
                            <v-btn
                                    text
                                    x-small
                                    @click="isRegister = false"
                            >Вход</v-btn>
                        </v-col>
                        <v-col class="d-flex align-end" v-else>
                            <v-btn
                                    :disabled="!valid"
                                    color="success"
                                    class="mr-4"
                                    @click="sendLoginEvent"
                            >
                                Войти
                            </v-btn>
                            <v-spacer></v-spacer>
                            <v-btn
                                    text
                                    x-small
                                    @click="isRegister = true"
                            >Регистрация</v-btn>
                        </v-col>
                    </v-row>
                    <v-row v-if="this.error">
                        <v-alert
                                dense
                                outlined
                                type="error"
                                class="mb-0"
                        >
                            {{this.error}}
                        </v-alert>
                    </v-row>
                </v-form>
            </v-card-text>
        </v-card>
        <span class="mx-auto my-4">или</span>
        <v-btn
                class="google-button py-2"
                x-large
                dark
                @click="$emit('google')"
                v-html="(isRegister ? 'Зарегистрироваться' : 'Войти')+'<br> с помощью Google'"
        ></v-btn>
    </v-sheet>
</template>

<script>
    export default {
        name: "Login",
        props: ['error'],
        data() {
            return {
                email: null,
                password: null,
                name: null,
                valid: false,
                showPassword: false,
                emailRules: [
                    v => Boolean(v) || 'Обязательное поле',
                    v => /.+@.+\..+/.test(v) || 'Ошибка в адресе',
                ],
                passwordRules: [
                    v => Boolean(v) || 'Обязательное поле',
                    v => v.length >= 6 || 'Не меньше 6 символов',
                ],
                nameRules: [
                    v => Boolean(v) || 'Обязательное поле',
                    v => v.indexOf(' ') !== -1 || 'Укажите имя и фамилию'
                ],
                isRegister: false
            }
        },
        methods: {
            validate() {
                this.$refs.form.validate();
            },
            sendRegisterEvent() {
                this.validate();
                if (this.valid) {
                    this.$emit('register', {
                        email: this.email,
                        name: this.name,
                        password: this.password
                    });
                }
            },
            sendLoginEvent() {
                this.validate();
                if (this.valid) {
                    this.$emit('login', {
                        email: this.email,
                        password: this.password
                    });
                }
            }
        }
    }
</script>

<style scoped>
    .google-button {
        height: 64px!important;
        line-height: 24px;
    }
</style>