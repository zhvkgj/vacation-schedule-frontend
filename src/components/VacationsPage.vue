<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <div class="content">
        <user-info></user-info>
        <div class="page-content">
            <div class="nav-bar">
                <b-nav tabs>
                    <b-nav-item href="/">Сотрудники</b-nav-item>
                    <b-nav-item href="/vacations" active>Отпуска</b-nav-item>
                </b-nav>
            </div>
            <div class="search">
                <div class="search-item">
                    <label>Табельный номер</label>
                    <b-form-input v-model="searchRequest.persNumber"></b-form-input>
                </div>
                <div class="search-item">
                    <label>Начало периода</label>
                    <b-form-input type="date" v-model="searchRequest.startDate"></b-form-input>
                </div>
                <div class="search-item">
                    <label>Конец периода</label>
                    <b-form-input type="date" v-model="searchRequest.endDate" read-only></b-form-input>
                </div>

                <div class="search-item search-button">
                    <b-button variant="primary" @click="search">Поиск</b-button>
                    <b-button class="clear-button" variant="primary" @click="clearSearchRequest">Очистить</b-button>
                    <b-form-select v-model="reportType" class="report-select">
                        <template v-slot:first>
                            <b-form-select-option :value="null" disabled>Отчет</b-form-select-option>
                        </template>
                        <b-form-select-option value="xlsx">xlsx</b-form-select-option>
                        <b-form-select-option value="pdf">pdf</b-form-select-option>
                        <b-form-select-option value="xml">xml</b-form-select-option>
                    </b-form-select>
                    <b-button class="download-button" variant="primary" @click="download"><b-icon-download></b-icon-download></b-button>
                </div>
            </div>
            <div class="table-content">
                <b-table striped hover
                         :per-page="perPage"
                         :current-page="currentPage"
                         :fields="fields"
                         :items="vacations">
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
</template>

<script>
    import axios from 'axios'
    import UserInfo from './UserInfo'

    export default {
        name: "VacationsPage",
        components: {
            UserInfo
        },

        data() {
            return {
                perPage: 5,
                currentPage: 1,

                reportType: null,

                fields: [
                    {
                        key: 'employee.persNumber',
                        sortable: true,
                        label: 'Табельный номер'
                    },
                    {
                        key: 'employee.fullName',
                        sortable: true,
                        label: 'ФИО'
                    },
                    {
                        key: 'startDate',
                        sortable: true,
                        label: 'Начало отпуска'
                    },
                    {
                        key: 'endDate',
                        label: 'Конец отпуска',
                        sortable: true
                    }
                ],

                vacations: [],

                searchRequest: {
                    startDate: null,
                    endDate: null,
                    persNumber: null
                }
            }
        },

        mounted() {
            this.search()
        },

        computed: {
            rows() {
                return this.vacations.length
            }
        },

        methods: {
            search() {
                let token = localStorage.getItem("Authorization");

                axios.post(this.serverUrl + "/vacation/search", this.searchRequest, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    }
                }).then((response) => {
                    this.vacations = response.data.map((v) => {
                        return this.convertData(v);
                    });
                })
            },

            clearSearchRequest() {
                this.searchRequest.persNumber = null;
                this.searchRequest.startDate = null;
                this.searchRequest.endDate = null;
            },

            convertData(vacation) {
                vacation.startDate = vacation.startDate.substring(0, 10);
                vacation.endDate = vacation.endDate.substring(0, 10);
                return vacation;
            },

            download() {
                if(this.reportType === null) {
                    return
                }

                let token = localStorage.getItem("Authorization");

                axios.get(this.serverUrl + "/vacation/report/" + this.reportType, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },

                    responseType: 'blob'
                }).then((response) => {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'report.' + this.reportType);
                    document.body.appendChild(link);
                    link.click();
                });
            }
        }
    }
</script>

<style scoped>
    .content {
        width: 85%;
        margin: 2% auto;
    }

    .nav-bar {
        float: left;
    }


    .search-item {
        float: left;
        margin-right: 2%;
        width: 17%;
    }

    .search {
        width: 100%;
        height: 10vh;
        clear: left;
    }

    .search-button {
        width: 35%;
        margin-top: 3.9vh;
    }

    .clear-button {
        margin-left: 3%;
    }

    .page-content {
        clear: right;
    }

    .pagination {
        margin: 0 auto;
    }

    .table-content {
        height: 40vh;
    }


    .report-select {
        width: 40%;
        margin-left: 3%;
    }

    .download-button {
        margin-left: 3%;
    }

    .report-button {
        margin-left: 1%;
        float: right;
    }

    .table-content {
        height: 50vh;
        width: 100%;
        overflow: scroll;
    }
</style>