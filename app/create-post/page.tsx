"use client"

import { useState, useEffect, useRef } from "react";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from 'aws-amplify/auth';
import { uploadData } from 'aws-amplify/storage';
import '../../configureAmplify';
import Navbar from "../components/navbar";
import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { createPost } from "../../src/graphql/mutations"
import SimpleMde from "react-simplemde-editor";
import "easymde/dist/easymde.min.css"

const initialState = { id: "", title: "", content: "", username: "", coverImage: ""};
const client = generateClient();

function CreatePost() {
    
    const [user, setUser] = useState(null);
    const [post, setPost] = useState(initialState);
    const { title, content } = post;
    const router = useRouter();
    const [image, setImage] = useState(null);
    const imageFileInput = useRef(null);
    
    useEffect(() => {
        checkUser();
    }, []);
    
    async function checkUser() {
        const user = await getCurrentUser();
        setUser(user);
    }

    function onChange(e) {
        setPost(() => ({
            ...post, [e.target.name]: e.target.value
        }))
    }

    async function createNewPost() {
        if (!title || !content) return;
        const id = uuid();
        post.id = id;
        post.username = user.username;

        if (image) {
            const filename = `public/${image.name}_${uuid()}`;
            post.coverImage = filename;
            await uploadData({
                path: filename,
                data: image
            });
        }

        await client.graphql({
            query: createPost,
            variables: {input: post},
            authMode: "userPool"
        })

        router.push('/posts/' + post.id);
    }

    async function uploadImage() {
        imageFileInput.current.click()
    }

    function handleChange(e) {
        const fileUploaded = e.target.files[0];
        if (!fileUploaded) return;
        setImage(fileUploaded);
    }

    if (!user) return null;

    return (
        <Authenticator.Provider>
          <div>
            <Navbar/>
            <h1 className="text-3xl font-semibold tracking-wide mt-6">Create New Post</h1>
            <input onChange={onChange} name="title" placeholder="Title" value={post.title} 
                className="border-b pb-2 text-lg my-4 focus:outline-none w-full font-light text-gray-500 y-2"/>
            {
                image && (
                    <img src={URL.createObjectURL(image)} className="my-4"/>
                )
            }
            <SimpleMde value={post.content} onChange={(value) => setPost({...post, content: value})}/>
            <input type="file" ref={imageFileInput} className="absolute w-0 h-0" onChange={handleChange}/>
            <button type="button" className="bg-green-600 text-white font-semibold px-8 py-2 rounded-lg mr-2"
                    onClick={uploadImage}>
                Upload Cover Image
            </button>
            {" "}
            <button type="button" className="mb-4 bg-blue-600 text-white font-semibold px-8 py-2 rounded-lg"
                    onClick={createNewPost}>
                Create Post
            </button>
          </div>
        </Authenticator.Provider>
    );
}

export default withAuthenticator(CreatePost)