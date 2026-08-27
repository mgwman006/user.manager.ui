import Home from "./components/home/Home";
// LogIn and Register handled by external auth-manager UI
import UserProfile from "./components/user/UserProfile";
import CreateOrganisation from "./components/organisation/CreateOrganisation";
import OrganisationList from "./components/organisation/OrganisationList";

const routes = [
  {
    path: "/",
    Component: Home,
    children:[
      {
        path:"",
        Component: UserProfile
      },
      {
        path:"organisations",
        Component: OrganisationList
      },
      {
        path:"organisation",
        Component: CreateOrganisation
      }
    ]
  }
];

export default routes;
