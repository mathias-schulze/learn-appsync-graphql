"use client"

import Link from "next/link";
import React from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';

const Navbar = () => {
    const { user, signOut } = useAuthenticator((context) => [context.user]);

    return (
        <nav className="flex justify-center pt-3 pb-3 space-x-4 border-b bg-cyan-500 border-gray-300">
            {[
                ["Home", "/"],
                ["Create Post", "/create-post"],
                ["My Posts", "/my-posts"],
                ["Profile", "/profile"]
            ].map(([title, url], index) => (
                <Link href={url} key={index} className="rounded-lg px-3 py-2 text-slate-700 font-medium hover:bg-slate-100 hover:text-slate-900">
                    {title}
                </Link>
            )
            )}
            <h1 className="rounded-lg px-3 py-2 text-slate-700 font-medium hover:bg-slate-100 hover:text-slate-900">{user?.username}</h1>
            <button onClick={signOut} className="rounded-lg px-3 py-2 text-slate-700 font-medium hover:bg-slate-100 hover:text-slate-900">Sign out</button>
        </nav>
    )
}

export default Navbar;