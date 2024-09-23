"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getUrl } from 'aws-amplify/storage';
import { postsByUsername } from '../../src/graphql/queries';
import { deletePost as deletePostMutation } from '../../src/graphql/mutations';
import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';
import Navbar from '../components/navbar';
import '../../configureAmplify';
import Link from "next/link";
import { getCurrentUser } from "aws-amplify/auth";
import Moment from "moment";

const client = generateClient();

function MyPosts() {

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  },[]);

  async function fetchPosts() {
    const user = await getCurrentUser();
    setUser(user);
    const { username } = user;

    const postData = await client.graphql({
      query: postsByUsername,
      variables: { username }
    });

    if ('data' in postData) {
      const { items } = postData.data.postsByUsername;
      const postsWithImages = await Promise.all(
        items.map(async (post) => {
          if (post.coverImage) {
            post.coverImage = await getUrl({ path: post.coverImage });
          }
          return post;
        })
      )
      setPosts(postsWithImages);
    }
  }

  async function deletePost(id:string) {
    await client.graphql({
      query: deletePostMutation,
      variables: { input: { id } },
      authMode: "userPool"
    });
    fetchPosts();
  }

  return (
    <Authenticator.Provider>
      <div>
        <Navbar/>
        {posts.map((post, index) => (
            <div className="py-8 px-8 max-w-xxl mx-auto bg-white sm:items-center sm:space-y-0 sm:space-x-6 mb-2" key={index}>
            {
              post.coverImage && (
                <img src={post.coverImage.url.toString()} className="w-36 h-36 bg-contain bg-center rounded-full sm:mx-0 sm:shring-0"/>
              )
            }
            <div className="cursor-pointer border-b border-gray-300 mt-8 pb-4">
              <h2 className="text-xl font-semibold" key={index}>{post.title}</h2>
              <p className="text-gray-500 mt-2">Author: {post.username}</p>
              <p className="text-gray-500 mt-2">Created: {Moment(post.createdAt).format("DD.MM.yyyy")}</p>
              <p className="px-4 py-1 text-sm text-purple-600 font-semibold
                  hover:text-white hover:bg-purple-600 hover:border-transparant 
                  focus:ring-2 focus:ring-purple-600 focus:ring-offset-2">
                <Link href={`/edit-post/${post.id}`}>Edit Post</Link>
              </p>
              <p className="px-4 py-1 text-sm text-purple-600 font-semibold
                  hover:text-white hover:bg-purple-600 hover:border-transparant 
                  focus:ring-2 focus:ring-purple-600 focus:ring-offset-2">
                <Link href={`/posts/${post.id}`}>View Post</Link>
              </p>
              <button className="px-4 py-1 text-sm text-purple-600 font-semibold
                  hover:text-white hover:bg-purple-600 hover:border-transparant 
                  focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
                  onClick={() => deletePost(post.id)}>
                    Delete Post
              </button>
            </div>
          </div>
        ))}
      </div>
    </Authenticator.Provider>
  );
}

export default withAuthenticator(MyPosts);