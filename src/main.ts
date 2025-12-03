import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from '@/stores/userStore'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Bootstrap user session if token exists
const userStore = useUserStore()
if (userStore.token) {
  // Fetch user data before mounting app
  await userStore.fetchCurrentUser()
}

app.mount('#app')

