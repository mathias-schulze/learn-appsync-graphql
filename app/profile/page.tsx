"use client"

import { useState, useEffect } from "react";
import { getCurrentUser } from 'aws-amplify/auth';
import '../../configureAmplify';
import Navbar from "../components/navbar";
import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';

function Profile() {
    
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        checkUser();
    }, []);
    
    async function checkUser() {
        const user = await getCurrentUser();
        setUser(user);
    }

    if (!user) return null;

    return (
        <Authenticator.Provider>
          <div>
            <Navbar/>
            <h1 className="text-3xl font-semibold tracking-wide mt-6">Profile</h1>
            <h1 className="font-medium text-gray-500 my-2">{user.username}</h1>
            <p className="text-sm text-gray-500 mb-6">test</p>
          </div>
        </Authenticator.Provider>
    );
}

export default withAuthenticator(Profile)