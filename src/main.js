import Vue from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'


Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

Vue.prototype.serverUrl = "http://" + window.location.hostname + ":8080";
// Vue.prototype.serverUrl = "http://192.168.0.104:8080";

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
