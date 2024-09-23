"use client"

import { useState, useEffect, useRef } from "react";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from 'aws-amplify/auth';
import { getUrl, uploadData } from 'aws-amplify/storage';
import '../../../configureAmplify';
import Navbar from "../../components/navbar";
import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';
import { useRouter } from "next/navigation";
import { getPost } from "../../../src/graphql/queries"
import { updatePost } from "../../../src/graphql/mutations"
import SimpleMde from "react-simplemde-editor";
import "easymde/dist/easymde.min.css"
import { v4 as uuid } from "uuid";

const client = generateClient();

function EditPost({ params: { id } }) {
    
    const [user, setUser] = useState(null);
    const [post, setPost] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [localImage, setLocalImage] = useState(null);
    const fileInput = useRef(null);
    const router = useRouter();
    
    useEffect(() => {
        checkUser();
        fetchPost();
    }, [id]);
        
    async function checkUser() {
        const user = await getCurrentUser();
        setUser(user);
    }

    async function fetchPost() {
        if (!id) return
        const postData = await client.graphql({
            query: getPost,
            variables: { id }
        })
        if ('data' in postData) {
            setPost(postData.data.getPost);
            if (postData.data.getPost.coverImage) {
                updateCoverImage(postData.data.getPost.coverImage)
            }
        }
    }
    
    async function updateCoverImage(coverImage) {        
        const linkToImage = await getUrl({ path: coverImage });
        setCoverImage(linkToImage);
    }
    async function uploadImage() {
        fileInput.current.click();
    }

    function handleChange(e) {
        const fileUploaded = e.target.files[0];
        if (!fileUploaded) return;
        setCoverImage(fileUploaded);
        setLocalImage(URL.createObjectURL(fileUploaded));
    }

    if (!post) return

    function onChange(e) {
        setPost(() => ({
            ...post, [e.target.name]: e.target.value
        }))
    }

    const { title, content} = post

    async function updateCurrentPost() {
        if (!title || !content) return;

        const updatedPost = {
            id, 
            content,
            title,
            coverImage: ""
        }

        if (coverImage && localImage) {
            const filename = `public/${coverImage.name}_${uuid()}`;
            updatedPost.coverImage = filename;
            await uploadData({
                path: filename,
                data: coverImage
            });
        }
        await client.graphql({
            query: updatePost,
            variables: {input: updatedPost},
            authMode: "userPool"
        })

        router.push('/my-posts/');
    }

    if (!user) return null;

    return (
        <Authenticator.Provider>
          <div>
            <Navbar/>
            <h1 className="text-3xl font-semibold tracking-wide mt-6 mb-2">Create New Post</h1>
            {
              coverImage && (
                <img src={localImage ? localImage : coverImage.url.toString()}
                  className="w-36 h-36 bg-contain bg-center rounded-full sm:mx-0 sm:shring-0"/>
              )
            }
            <input onChange={onChange} name="title" placeholder="Title" value={post.title} 
                className="border-b pb-2 text-lg my-4 focus:outline-none w-full font-light text-gray-500 y-2"/>
            <SimpleMde value={post.content} onChange={(value) => setPost({...post, content: value})}/>
            <input type="file" ref={fileInput} className="absolute w-0 h-0" onChange={handleChange}/>
            <button type="button" className="bg-green-600 text-white font-semibold px-8 py-2 rounded-lg mr-2"
                    onClick={uploadImage}>
                Upload Cover Image
            </button>
            {" "}
            <button type="button" className="mb-4 bg-blue-600 text-white font-semibold px-8 py-2 rounded-lg"
                    onClick={updateCurrentPost}>
                Update Post
            </button>
          </div>
        </Authenticator.Provider>
    );
}

export default withAuthenticator(EditPost)