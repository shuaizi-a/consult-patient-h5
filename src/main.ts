import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import pinia from './stores';
import 'virtual:svg-icons-register'; // 注册svg图标

// 全局样式
import './styles/main.scss';
// vant全局样式
import 'vant/lib/index.css';

const app = createApp(App);

app.use(router); // 路由
app.use(pinia); // 状态管理
app.mount('#app');
