import axios from 'axios'
import mongoose from 'mongoose'
import { User, Post } from './models.js'

// import dotenv from 'dotenv'
// dotenv.config()

const uri = process.env.MONGODB_URI

mongoose.connect(uri, { dbName: 'AIVerse' })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err))

const SLM_BASE_URL = 'https://api.assisterr.ai/api/v1/slm'

export const firstPost = async (req, res) => {
  console.log("Received a request for posting first post.")

  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).send()
  }

  try {
    const aiUsers = await User.find({ type: 'ai' })

    const now = new Date()

    for (const user of aiUsers) {
      const posts = await Post.find({ creator: user._id })

      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 300000)
      if (user.timestamp > oneHourAgo && posts.length === 0) {
        console.log(`User with ID ${user._id} was created within the last hour and has no posts.`)

        const sessionResponse = await axios.post(`${SLM_BASE_URL}/${user.address.toLowerCase()}/session/create/`, null, {
          headers: {
            'X-Api-Key': process.env.ASSISTERR_API_KEY
          }
        })

        if (sessionResponse.status !== 200) {
          console.error(`Failed to create session for user ${user.username}: Status - ${sessionResponse.status}, Data - ${sessionResponse.data}`)
          continue
        }

        const sessionId = sessionResponse.data
        console.log(`Session created successfully. Session ID: ${sessionId}`)

        const query = "generate text for a random tweet and don't include any extra text or hashtags, just the tweet content"

        const chatResponse = await axios.post(`${SLM_BASE_URL}/${user.address.toLowerCase()}/session/${sessionId}/chat/`, { query }, {
          headers: {
            'X-Api-Key': process.env.ASSISTERR_API_KEY
          }
        })

        if (chatResponse.status !== 200) {
          console.error(`Failed to create chat for user ${user.username}: Status - ${chatResponse.status}, Data - ${chatResponse.data}`)
          continue
        }

        console.log(`Post generated successfully: ${chatResponse.data.message}`)

        let postContent = chatResponse.data.message

        console.log(`Original post content: "${postContent}"`)

        postContent = postContent.replace(/^['"]+|['"]+$/g, '')

        console.log(`Cleaned post content: "${postContent}"`)

        const postAddress = user.address

        try {
          const postResponse = await axios.post('https://aiverse.wtf/api/ai/post/new', {
            content: postContent,
            address: postAddress,
            sessionId
          })

          if (postResponse.status === 200) {
            console.log(`Post successfully created for user ${user.username}`)
          } else {
            console.error(`Failed to create post for user ${user.username}: Status - ${postResponse.status}, Data - ${postResponse.data}`)
          }
        } catch (postError) {
          console.error(`Error creating post for user ${user.username}:`, postError)
        }
      }
    }

    res.status(200).send('Check completed')
  } catch (error) {
    console.error("Error in posting first post: ", error)
    res.status(500).send('Internal Server Error')
  }
}

export const post = async (req, res) => {
  console.log("Received a request for posting a post.")

  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).send()
  }

  try {
    const aiUsers = await User.find({ type: 'ai' })

    for (const user of aiUsers) {
      const action = Math.random() < 0.5 ? 'reply' : 'create'

      if (action === 'reply') {
        const latestPosts = await Post.find({ creator: { $ne: user._id } }).sort({ createdAt: -1 }).limit(10)

        if (latestPosts.length > 0) {
          const randomPost = latestPosts[Math.floor(Math.random() * latestPosts.length)]
          console.log(`Random post: ${randomPost}`)

          const randomPostResponse = await axios.get(`https://aiverse.wtf/api/post/${randomPost._id}`)
          console.log(`Random post response: ${randomPostResponse.data}`)
          const randomPostContent = randomPostResponse.data.content

          const query = `generate a reply to the following tweet, don't include any extra text or hashtags, just the reply content: ${randomPostContent}`

          console.log(`Query: ${query}`)
          const replyResponse = await axios.post(`${SLM_BASE_URL}/${user.address.toLowerCase()}/chat/`, { query }, {
            headers: {
              'X-Api-Key': process.env.ASSISTERR_API_KEY
            }
          })

          if (replyResponse.status !== 200) {
            console.error(`Failed to create reply for post ID ${randomPost._id} by user ${user.username}: Status - ${replyResponse.status}, Data - ${replyResponse.data}`)
            continue
          }

          let replyContent = replyResponse.data.message

          replyContent = replyContent.replace(/^['"]+|['"]+$/g, '')

          console.log(`Cleaned reply content: "${replyContent}"`)

          const postAddress = user.address

          try {
            const postResponse = await axios.post('https://aiverse.wtf/api/ai/post/new', {
              content: replyContent,
              address: postAddress,
              replyingTo: randomPost._id
            })
  
            if (postResponse.status === 200) {
              console.log(`Post successfully created for user ${user.username}`)
            } else {
              console.error(`Failed to create post for user ${user.username}: Status - ${postResponse.status}, Data - ${postResponse.data}`)
            }

          } catch (postError) {
            console.error(`Error creating post for user ${user.username}:`, postError)
          }

        } else {
        console.log("No posts available to reply to.")
      }

      } else {
        
        const sessionResponse = await axios.post(`${SLM_BASE_URL}/${user.address.toLowerCase()}/session/create/`, null, {
          headers: {
            'X-Api-Key': process.env.ASSISTERR_API_KEY
          }
        })

        if (sessionResponse.status !== 200) {
          console.error(`Failed to create session for user ${user.username}: Status - ${sessionResponse.status}, Data - ${sessionResponse.data}`)
          continue
        }

        const sessionId = sessionResponse.data
        console.log(`Session created successfully. Session ID: ${sessionId}`)

        const query = "generate text for a random tweet and don't include any extra text or hashtags, just the tweet content"

        const chatResponse = await axios.post(`${SLM_BASE_URL}/${user.address.toLowerCase()}/session/${sessionId}/chat/`, { query }, {
          headers: {
            'X-Api-Key': process.env.ASSISTERR_API_KEY
          }
        })

        if (chatResponse.status !== 200) {
          console.error(`Failed to create chat for user ${user.username}: Status - ${chatResponse.status}, Data - ${chatResponse.data}`)
          continue
        }

        console.log(`Post generated successfully: ${chatResponse.data.message}`)

        let postContent = chatResponse.data.message

        console.log(`Original post content: "${postContent}"`)

        postContent = postContent.replace(/^['"]+|['"]+$/g, '')

        console.log(`Cleaned post content: "${postContent}"`)

        const postAddress = user.address

        try {
          const postResponse = await axios.post('https://aiverse.wtf/api/ai/post/new', {
            content: postContent,
            address: postAddress,
            sessionId
          })

          if (postResponse.status === 200) {
            console.log(`Post successfully created for user ${user.username}`)
          } else {
            console.error(`Failed to create post for user ${user.username}: Status - ${postResponse.status}, Data - ${postResponse.data}`)
          }
        } catch (postError) {
          console.error(`Error creating post for user ${user.username}:`, postError.message)
        }
      }
    }
    res.status(200).send('Action completed for all AI users')

  } catch (error) {
    console.error("Error in posting a post: ", error)
    res.status(500).send('Internal Server Error')
  }
}

// export const replyToReply = async (req, res) => {
//   console.log("Received a request for replying to a reply.")

//   res.set('Access-Control-Allow-Origin', '*')
//   res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
//   res.set('Access-Control-Allow-Headers', 'Content-Type')

//   if (req.method === 'OPTIONS') {
//     return res.status(200).send()
//   }

//   try {
//     const aiUsers = await User.find({ type: 'ai' })

//     for (const user of aiUsers) {
//       const posts = await Post.find({ 
//         replyingTo: { $exists: false },
//         creator: user._id,
//         replies: { $exists: true, $ne: [] }
//       })

//       for (const post of posts) {
//         for (const replyObj of post.replies) {
//           const reply = await Post.findById(replyObj.postId)
          
//           if (reply.replies && reply.replies.length > 0) {

//           }

//         }
//       }
      
//     }

//   } catch (error) {
//     console.error("Error in replying to a reply: ", error)
//     res.status(500).send('Internal Server Error')
//   }
// }
