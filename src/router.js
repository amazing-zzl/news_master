import Vue from "vue";
import Router from "vue-router";

import Login from "./pages/login";
import Home from "./pages/home";
import Welcome from "./pages/welcome";
import Users from "./pages/users";
import News from "./pages/newsList.vue";
import Category from "./pages/category.vue";
import AddNews from "./pages/addNews.vue";

Vue.use(Router);

export default new Router({
  routes: [
    { path: "/", redirect: "/login" },
    { path: "/login", component: Login },
    {
      path: "/home",
      component: Home,
      redirect: "/welcome",
      children: [
        { path: "/welcome", component: Welcome },
        { path: "/users", component: Users },
        { path: "/newsList", component: News },
        { path: "/newsList/add", component: AddNews },
        { path: "/category", component: Category }
      ]
    }
  ]
});
