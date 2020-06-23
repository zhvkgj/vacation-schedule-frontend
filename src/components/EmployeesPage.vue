<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <div>
        <div class="content">
            <login-form ref="LoginForm"></login-form>
            <div class="page-content">
                <div class="nav-bar">
                    <b-nav tabs>
                        <b-nav-item href="/" active>Сотрудники</b-nav-item>
                        <b-nav-item href="/vacations">Отпуска</b-nav-item>
                    </b-nav>
                </div>
                <div class="addEmployeeButton" v-show="checkManagerRole">
                    <b-button @click="employeeModalShow = !employeeModalShow" size="sm">Добавить сотрудника</b-button>
                </div>
                <div class="table-content">
                    <b-table striped hover
                             :items="employees"
                             :fields="fields"
                             :per-page="perPage"
                             :current-page="currentPage">
                        <template v-slot:cell(show_details)="row">
                            <b-button size="sm" @click="row.toggleDetails" class="mr-2">
                                {{ row.detailsShowing ? 'Скрыть' : 'Показать'}} отпуска
                            </b-button>
                            <b-button size="sm"
                                      v-show="checkManagerRole"
                                      class="mr-2"
                                      @click="showEditEmployeeModal(row.item)">
                                Изменить
                            </b-button>
                            <b-button variant="danger"
                                      v-show="checkManagerRole"
                                      size="sm"
                                      class="mr-2"
                                      @click="deleteEmployee(row.item.id)"
                            >
                                Удалить
                            </b-button>
                        </template>

                        <template v-slot:row-details="row">
                            <b-card>
                                <b-table striped hover
                                         :fields="vacationFields"
                                         :items="row.item.vacationsList">
                                </b-table>
                                <b-button v-show="checkManagerRole"
                                          variant="primary"
                                          @click="showVacationAddModal(row.item.id)">Добавить отпуск
                                </b-button>
                            </b-card>
                        </template>
                    </b-table>
                </div>
                <div class="pagination">
                    <b-pagination
                            v-model="currentPage"
                            :total-rows="rows"
                            :per-page="perPage"
                            aria-controls="my-table"
                    ></b-pagination>
                </div>
            </div>
        </div>
        <b-modal v-model="employeeModalShow"
                 :title="isEditModal ? editMode : createMode"
                 @ok="handleOk"
                 @hidden="resetModal"
        >
            <form ref="form"
                  @submit.stop.prevent="handleEmployeeSubmit"
            >
                <div class="form-item">
                    <b-form-input v-model="employeeToSave.login"
                                  placeholder="Логин"
                                  autocomplete="false"
                                  ref="loginInput"
                                  required
                                  :state="employeeState.loginState">
                    </b-form-input>
                    <div class="error" v-show="!upsertFormIsValid.isLoginValid">
                        Сотрудник с таким логином уже существует
                    </div>
                </div>
                <div class="form-item">
                    <b-form-input v-model="employeeToSave.password"
                                  type="password"
                                  ref="passwordInput"
                                  placeholder="Пароль"
                                  autocomplete="false"
                                  required
                                  :state="employeeState.passwordState">
                    </b-form-input>
                </div>
                <div class="form-item">
                    <b-form-input v-model="employeeToSave.fullName"
                                  placeholder="ФИО"
                                  ref="fullNameInput"
                                  required
                                  :state="employeeState.fullNameState">
                    </b-form-input>
                </div>
                <div class="form-item">
                    <b-form-input v-model="employeeToSave.persNumber"
                                  ref="persNumberInput"
                                  required
                                  :state="employeeState.persNumberState"
                                  placeholder="Табельный номер">
                    </b-form-input>
                    <div class="error" v-show="!upsertFormIsValid.isPersNumberValid">
                        Запись с таким номером уже существует
                    </div>
                </div>
                <div class="form-item">
                    <b-form-select v-model="employeeToSave.position"
                                   :options="positions"
                                   ref="positionInput"
                                   :state="employeeState.positionState"
                                   invalid-feedback="Name is required"
                    ></b-form-select>
                </div>
                <div class="form-item">
                    <b-form-input v-model="employeeToSave.birthday"
                                  type="date"
                                  ref="birthdayInput"
                                  placeholder="Дата рождения"
                                  required
                                  :state="employeeState.birthdayState"
                    ></b-form-input>
                </div>
            </form>
        </b-modal>
        <b-modal v-model="isAddVacationModal"
                 title="Добавить отпуск"
                 @ok="handleVacationOk"
                 @hidden="resetVacationModal"
        >
            <form rel="employeeFrom">
                <div class="form-item">
                    <label>Дата начала отпуска</label>
                    <b-form-input v-model="vacationToSave.startDate" type="date"
                    ></b-form-input>
                </div>
                <div class="form-item">
                    <label>Дата окончания отпуска</label>
                    <b-form-input v-model="vacationToSave.endDate" type="date"
                    ></b-form-input>
                </div>
            </form>
        </b-modal>
    </div>
</template>

<script>
    import axios from 'axios'
    import LoginForm from './UserInfo'

    export default {
        name: "EmployeesPage",

        components: {
            LoginForm
        },

        data() {
            return {
                perPage: 6,
                currentPage: 1,

                employeeModalShow: false,
                isAddVacationModal: false,
                showLoginForm: false,
                isEditModal: false,
                editMode: "Редактирование сотрудника",
                createMode: 'Новый сотрудник',
                fields: [
                    {
                        key: 'persNumber',
                        sortable: true,
                        label: 'Табельный номер'
                    },
                    {
                        key: 'fullName',
                        label: 'ФИО',
                        sortable: true
                    },
                    {
                        key: 'position',
                        label: 'Должность',
                        sortable: false
                    },
                    {
                        key: 'birthday',
                        label: 'Дата рождения',
                        sortable: true
                    },
                    {
                        key: 'show_details',
                        label: ''
                    }
                ],

                vacationFields: [
                    {
                        key: 'startDate',
                        sortable: true,
                        label: 'Начало отпуска'
                    },
                    {
                        key: 'endDate',
                        label: 'Конец отпуска',
                        sortable: true
                    },
                ],

                employees: [],

                employeeToSave: {
                    fullName: '',
                    oldLogin: '',
                    birthday: '',
                    position: null,
                    login: '',
                    password: '',
                    persNumber: '',
                    oldPersNumber: '',
                    id: ''
                },

                vacationToSave: {
                    employeeId: '',
                    startDate: null,
                    endDate: null,
                },

                positions: [],

                employeeState: {
                    loginState: null,
                    passwordState: null,
                    fullNameState: null,
                    persNumberState: null,
                    birthdayState: null,
                    positionState: null
                },

                upsertFormIsValid: {
                    isLoginValid: true,
                    isPersNumberValid: true
                }
            }
        },

        mounted() {
            let token = localStorage.getItem("Authorization");
            axios.defaults.headers = {
                "Content-Type": "application/json",
                "Authorization": token
            };

            this.getAllEmployees();
            this.getAllPositions();
        },

        computed: {
            rows() {
                return this.employees.length
            },

            checkManagerRole() {
                return localStorage.getItem("roles") !== null && localStorage.getItem("roles").includes("MANAGER");
            }
        },

        methods: {
            getAllEmployees() {
                axios.get(this.serverUrl + "/employee/")
                    .then((response) => {
                        this.employees = response.data.map((employee) => {
                            return this.convertDate(employee)
                        });
                    });
            },

            getAllPositions() {
                axios.get(this.serverUrl + "/employee/positions")
                    .then((response) => {
                        this.positions = response.data;
                    });
            },

            resetModal() {
                this.isEditModal = false;

                this.employeeToSave.birthday = null;
                this.employeeToSave.login = null;
                this.employeeToSave.password = null;
                this.employeeToSave.persNumber = null;
                this.employeeToSave.fullName = null;
                this.employeeToSave.oldLogin = null;
                this.employeeToSave.oldPersNumber = null;
                this.employeeToSave.position = null;

                this.employeeState.loginState = null;
                this.employeeState.passwordState = null;
                this.employeeState.fullNameState = null;
                this.employeeState.persNumberState = null;
                this.employeeState.birthdayState = null;
                this.employeeState.positionState = null;

                this.upsertFormIsValid.isLoginValid = true;
                this.upsertFormIsValid.isPersNumberValid = true;
            },

            resetVacationModal() {
                this.vacationToSave.employeeId = null;
                this.vacationToSave.startDate = null;
                this.vacationToSave.endDate = null;
            },

            handleOk(bvModalEvt) {
                bvModalEvt.preventDefault();
                this.handleEmployeeSubmit()
            },


            handleVacationOk() {
                axios.post(this.serverUrl + "/employee/add/vacation/" + this.vacationToSave.employeeId, this.vacationToSave)
                    .then(() => {
                        location.reload()
                    });
            },

            showVacationAddModal(employeeId) {
                this.vacationToSave.employeeId = employeeId;
                this.isAddVacationModal = true;
            },

            showEditEmployeeModal(employee) {
                this.employeeModalShow = true;
                this.isEditModal = true;

                this.employeeToSave.id = employee.id;
                this.employeeToSave.birthday = employee.birthday;
                this.employeeToSave.login = employee.login;
                this.employeeToSave.password = employee.password;
                this.employeeToSave.persNumber = employee.persNumber;
                this.employeeToSave.fullName = employee.fullName;
                this.employeeToSave.position = employee.position;
                this.employeeToSave.oldLogin = employee.login;
                this.employeeToSave.oldPersNumber = employee.persNumber;
            },

            checkFormValidity: async function () {
                this.upsertFormIsValid.isLoginValid = true;
                this.upsertFormIsValid.isPersNumberValid = true;

                let isLoginAvailable;
                let isPerNumberAvailable;
                if (this.isEditModal === true && this.employeeToSave.oldLogin === this.employeeToSave.login) {
                    isLoginAvailable = true;
                } else {
                    await this.checkLogin();
                    isLoginAvailable = this.upsertFormIsValid.isLoginValid;
                }

                if (this.isEditModal === true && this.employeeToSave.oldPersNumber === this.employeeToSave.persNumber) {
                    isPerNumberAvailable = true;
                } else {
                    await this.checkPersNumber();
                    isPerNumberAvailable = this.upsertFormIsValid.isPersNumberValid;
                }

                const loginValid = this.$refs.loginInput.checkValidity() && isLoginAvailable;

                let passwordValid = this.$refs.passwordInput.checkValidity();

                if (this.isEditModal) {
                    passwordValid = true;
                }

                const fullNameValid = this.$refs.fullNameInput.checkValidity();
                const birthdayValid = this.$refs.birthdayInput.checkValidity();
                const persNumberValid = this.$refs.persNumberInput.checkValidity() && isPerNumberAvailable;
                const positionValid = this.employeeToSave.position !== null;

                this.employeeState.loginState = loginValid;
                this.employeeState.passwordState = passwordValid;
                this.employeeState.fullNameState = fullNameValid;
                this.employeeState.persNumberState = persNumberValid;
                this.employeeState.birthdayState = birthdayValid;
                this.employeeState.positionState = positionValid;
                return loginValid && passwordValid && fullNameValid && birthdayValid && persNumberValid;
            },

            handleEmployeeSubmit: async function () {
                let flag = await this.checkFormValidity();

                if (!flag) {
                    return
                }
                if (!this.isEditModal) {
                    axios.post(this.serverUrl + "/employee/", this.employeeToSave)
                        .then(() => {
                            location.reload()
                        });
                } else {
                    axios.put(this.serverUrl + "/employee/" + this.employeeToSave.id, this.employeeToSave)
                        .then(() => {
                            location.reload()
                        });
                }

                this.$nextTick(() => {
                    this.$bvModal.hide('modal-prevent-closing')
                })
            },

            deleteEmployee(id) {
                axios.delete(this.serverUrl + "/employee/" + id)
                    .then(() => {
                        location.reload()
                    })
            },

            convertDate(employee) {
                employee.birthday = employee.birthday.substring(0, 10);
                employee.vacationsList.forEach((vacation) => {
                    vacation.startDate = vacation.startDate.substring(0, 10);
                    vacation.endDate = vacation.endDate.substring(0, 10)
                });
                return employee
            },

            checkLogin() {
                return axios.get(this.serverUrl + "/employee/check/login", {
                    params: {
                        login: this.employeeToSave.login
                    }
                }).then((response) => {
                    this.upsertFormIsValid.isLoginValid = !response.data;
                });
            },

            checkPersNumber() {
                return axios.get(this.serverUrl + "/employee/check/personal/number", {
                    params: {
                        persNumber: this.employeeToSave.persNumber
                    }
                }).then((response) => {
                    this.upsertFormIsValid.isPersNumberValid = !response.data;
                })
            }
        }
    }
</script>

<style scoped>
    .content {
        width: 85%;
        margin: 2% auto;
    }

    .form-item {
        margin-top: 2%;
    }

    .addEmployeeButton {
        float: right;
    }

    .nav-bar {
        float: left;
    }

    .pagination {
        margin: 0 auto;
    }

    .page-content {
        clear: right;
    }

    .table-content {
        height: 60vh;
        width: 100%;
        overflow: scroll;
    }

    .error {
        color: red;
        font-size: 0.8em;
    }

</style>