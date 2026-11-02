import Home from "./components/home/Home";
import HomeOverview from "./components/home/HomeOverview";
import Settings from "./components/home/Settings";
import UserProfile from "./components/user/UserProfile";
import OrganisationsPage from "./components/organisation/OrganisationsPage";

const routes = [
  {
    path: "/",
    Component: Home,
    children: [
      { path: "", Component: HomeOverview },
      { path: "profile", Component: UserProfile },
      { path: "organisations", Component: OrganisationsPage },
      { path: "settings", Component: Settings },
    ],
  }
];

export default routes;
