import Home from "./components/home/Home";
import UserProfile from "./components/user/UserProfile";

const routes = [
  {
    path: "/",
    Component: Home,
    children:[
      {
        path:"",
        Component: UserProfile
      }
    ]
  }
];

export default routes;
