<template>
    <div class="login-div">
        <div v-if="checkAuth">
            <b-avatar class="mr-3"></b-avatar>
            <span class="mr-auto">{{getUserName}}</span><br>
            <span class="mr-auto logout logout-link"><a @click="logout">Выйти</a></span>
        </div>
        <span class="mr-auto" v-else><b-button @click="showLoginForm = true" size="sm" variant="info">Войти</b-button></span>
        <b-modal v-model="showLoginForm"
                 title="Вход"
                 @ok="doLogin"
                 @show="reset"
                 @hidden="reset"
        >
            <form>
                <div class="form-item">
                    <label>Логин</label>
                    <b-form-input v-model="userToLogin.login"
                    ></b-form-input>
                </div>
                <div class="form-item">
                    <label>Пароль</label>
                    <b-form-input type="password" v-model="userToLogin.password"
                    ></b-form-input>
                </div>
                <div class="login-error" v-show="showLoginError">
                    Неверный логин или пароль
                </div>
            </form>
        </b-modal>
    </div>
</template>

<script>
    import axios from 'axios'

    export default {
        name: "LoginForm",

        data() {
            return {
                showLoginError: false,
                showLoginForm: false,
                userToLogin: {
                    login: '',
                    password: ''
                }
            }
        },

        computed: {
            checkAuth() {
                console.log(localStorage.getItem("Authorization"));
                return localStorage.getItem("Authorization") !== null;
            },

            getUserName() {
                return localStorage.getItem("userFullName")
            }
        },

        methods: {
            doLogin(bvModalEvt) {
                bvModalEvt.preventDefault();

                axios.post(this.serverUrl + "/login?login=" + this.userToLogin.login +
                    "&password=" + this.userToLogin.password, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then((response) => {
                    localStorage.setItem("Authorization", response.headers.authorization);
                    this.loadUser();
                    this.showLoginForm = false;
                }).catch(() => {
                    this.showLoginError = true;
                    return;
                })
            },

            loadUser() {
                let token = localStorage.getItem("Authorization");
                axios.get(this.serverUrl + "/auth/current", {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    }
                })
                    .then((response) => {
                        localStorage.setItem("roles", response.data.roles);
                        localStorage.setItem("userFullName", response.data.fullName);
                        location.reload()
                    })
            },

            reset() {
                this.showLoginError = false;
                this.userToLogin.login = null;
                this.userToLogin.password = null;
            },

            logout() {
                localStorage.removeItem("Authorization");
                localStorage.removeItem("userFullName");
                localStorage.removeItem("roles");
                location.reload()
            },
        }
    }
</script>

<style scoped>
    .login-div {
        float: right;
        margin-bottom: 5%;
    }

    .logout {
        float: right;
    }

    .login-error {
        color: red;
        size: 0.5em;
    }

    .logout-link:hover {
        text-decoration: underline;
        color: blue;
        cursor: pointer;
    }
</style>