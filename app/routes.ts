import Home from "./components/home/Home";
import HomeOverview from "./components/home/HomeOverview";
import Settings from "./components/home/Settings";
import UserProfile from "./components/user/UserProfile";
import OrganisationsPage from "./components/organisation/OrganisationsPage";
import InvitationsPage from "./components/organisation/InvitationsPage";

const routes = [
  {
    path: "/",
    Component: Home,
    children: [
      { path: "", Component: HomeOverview },
      { path: "profile", Component: UserProfile },
      { path: "organisations", Component: OrganisationsPage },
      { path: "invitations", Component: InvitationsPage },
      { path: "settings", Component: Settings },
    ],
  }
];

export default routes;
