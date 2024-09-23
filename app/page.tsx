"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { listPosts } from './../src/graphql/queries';
import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';
import { getUrl } from 'aws-amplify/storage';
import Navbar from './components/navbar';
import '../configureAmplify';
import Link from "next/link";

const client = generateClient();

function Home() {

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  },[]);
  
  async function fetchPosts() {
    const postData = await client.graphql({
      query: listPosts
    });
    if ('data' in postData) {
      const { items } = postData.data.listPosts;
      const postsWithImages = await Promise.all(
        items.map(async (post) => {
          console.log(post);
          if (post.coverImage) {
            post.coverImage = await getUrl({ path: post.coverImage });
          }
          console.log(post);
          return post;
        })
      )
      setPosts(postsWithImages);
    }
  }

  return (
    <Authenticator.Provider>
        <main className="flex min-h-screen flex-col p-24">
          <Navbar/>
          <h1 className="text-3xl font-semibold tracking-wide mt-6 mb-8">
            All Posts
          </h1>
          {
            posts.map((post, index) => (
              <Link href={`/posts/${post.id}`} key={index}>
                <div className="my-6 pb-6 border-b border-gray-300">
                  {
                    post.coverImage && (
                      <img src={post.coverImage.url.toString()} className="w-36 h-36 bg-contain bg-center rounded-full sm:mx-0 sm:shring-0"/>
                    )
                  }
                  <div className="cursor-pointer mt-2">
                    <h2 className="text-xl font-semibold" key={index}>{post.title}</h2>
                    <p className="text-gray-500 mt-2">Author: {post.username}</p>
                    {
                      post.comments.items.length > 0 && 
                      post.comments.items.map((comment, index) => (
                        <div key={index} className="py-8 px-8 max-w-xl mx-auto bg-white shadow-lg space-y-2 sm:py-1 sm:flex my-6 mx-12
                            sm:items-center sm:space-y-0 sm:space-x-6 mb-2">
                          <div>
                          <p className="text-gray-500 mt-2">
                              {comment.message}
                            </p>
                            <p className="text-gray-200 mt-1">
                              {comment.createdBy}
                            </p>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </Link>
            ))
          }
        </main>
    </Authenticator.Provider>
  );
}

export default withAuthenticator(Home);