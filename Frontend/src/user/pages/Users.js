import React, { useEffect, useState } from "react";
import UsersList from "../components/UsersList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";

const Users = () => {

    const [loadedUsers, setLoadedUsers] = useState();
    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    useEffect(() => {
        const fetchUsers = async () => {
            sendRequest('http://Hashirdevops12-env.eba-ca3dkfje.us-east-1.elasticbeanstalk.com/api/users').then(async response => {


                setLoadedUsers(response.users);

            }).catch(e => { });

            // setIsLoading(false);
            // setError(e.message);

        }
        fetchUsers();
    }, [sendRequest]);


    return (
        <>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && (
                <div className="center">
                    <LoadingSpinner />
                </div>
            )}
            {!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
        </>
    );
}

export default Users;