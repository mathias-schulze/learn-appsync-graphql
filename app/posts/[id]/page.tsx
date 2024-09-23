"use client"

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import '../../../configureAmplify';
import Navbar from "../../components/navbar";
import ReactMarkDown from 'react-markdown'
import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';
import { getPost } from "../../../src/graphql/queries"
import { getUrl } from 'aws-amplify/storage';
import { createComment } from "../../../src/graphql/mutations";
import { v4 as uuid } from "uuid"
import { useRouter } from "next/navigation";
import SimpleMde from "react-simplemde-editor";
import "easymde/dist/easymde.min.css"

const initialState = { id: "", title: "", content: "", username: "", coverImage: ""};
const initialStateComment = { id: "", message: "", postID: "" }
const client = generateClient();

function Post({ params: { id } }) {
  
    const [post, setPost] = useState(initialState);
    const [coverImage, setCoverImage] = useState(null);
    const [comment, setComment] = useState(initialStateComment);
    const [showNewComment, setShowNewComment] = useState(false);
    const router = useRouter();
    const { message } = comment;

    useEffect(() => {
        fetchPost();
    }, []);

    useEffect(() => {
      downloadImage();
    }, [post])
        
    async function fetchPost() {
        const postData = await client.graphql({
            query: getPost,
            variables: { id }
        })
        if ('data' in postData) {
          setPost(postData.data.getPost);
        }
    }

    async function downloadImage() {
        if (post.coverImage) {
          const linkToImage = await getUrl({ path: post.coverImage });
          setCoverImage(linkToImage);
        }
    }

    function toggleNewComment() {
      setShowNewComment(!showNewComment);
    }

    async function createNewComment() {
      if (!message) return;
      const id = uuid();
      comment.id = id;

      try {
        await client.graphql({
          query: createComment,
          variables: { input: comment },
          authMode: "userPool"
      })
      } catch(error) {
        console.log(error);
      }
      router.push('/my-posts/');
    }

    return (
        <Authenticator.Provider>
          <div>
            <Navbar/>
            <h1 className="text-5xl mt-4 font-semibold tracking-wide">{post.title}</h1>
            { coverImage && (<img src={coverImage.url.toString()} className="mt-4"/>) }
            <p className="border-b pb-2 text-lg my-4 focus:outline-none w-full font-light text-gray-500 ">Author: {post.username}</p>
            <div className="mt-8">
              <ReactMarkDown className="prose" children={post.content}/>
            </div>
            <div>
              <button type="button" className="mb-4 bg-green-600 text-white font-semibold px-8 py-2 rounded-lg"
                onClick={toggleNewComment}>Write a Comment</button>
              {
                <div style={{display: showNewComment ? "block" : "none"}}>
                  <SimpleMde value={comment.message} onChange={(value) => setComment({...comment, message: value, postID: post.id})}/>
                  <button type="button" className="mb-4 bg-blue-600 text-white font-semibold px-8 py-2 rounded-lg"
                    onClick={createNewComment}>
                      Add Comment
                  </button>
                </div>
              }
            </div>
          </div>
          </Authenticator.Provider>
        );
}

export default withAuthenticator(Post)