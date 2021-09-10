import { Link } from "react-router-dom";
import {useUsersQuery} from "../generated/graphql";

export const Home = () => {
    const {data, } = useUsersQuery({fetchPolicy: 'network-only'});

    if (!data) {
        return <div>loading</div>;
    }

    return (
      <div>
          <div>users:</div>
          <ul>
              {data.users.map(user => {
                  return <li key={user.id}>{user.email}, {user.id}</li>
              })}
          </ul>
      </div>
    );
};
