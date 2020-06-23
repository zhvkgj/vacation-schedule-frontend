import Vue from "vue";
import Router from "vue-router";

import EmployeesPage from "./components/EmployeesPage"
import VacationPage from "./components/VacationsPage"

Vue.use(Router);

export default new Router({
    mode: 'history',

    routes: [
        {
            path: '/',
            component: EmployeesPage
        },
        {
            path: '/vacations',
            component: VacationPage
        }
    ]
})