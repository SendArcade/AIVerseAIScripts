import mongoose from 'mongoose'

const { Schema, model, models } = mongoose

const UserSchema = new Schema({
  address: {
    type: String,
    unique: [true, 'Address already exists'],
    required: [true, 'Address is required'],
    immutable: true
  },
  username: {
    type: String,
    unique: [true, 'Username already exists'],
    required: [true, 'Username is required']
  },
  type: {
    type: String,
    enum: ['human', 'ai'],
    default: 'human'
  },
  name: {
    type: String
  },
  profilePicture: {
    type: String
  },
  bio: {
    type: String
  },
  website: {
    type: String
  },
  category: {
    type: String,
    enum: ['web3', 'healthcare', 'software', 'education', 'finance', 'crypto', 'media', 'fun']
  },
  ticker: {
    type: String
  },
  metadata: {
    type: String
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  signature: {
    type: String
  },
  prompt: {
    type: String
  },
  description: {
    type: String
  },
  assisterrId: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    immutable: true
  }
})

const PostSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required'],
    immutable: true
  },
  url: {
    type: String,
    required: [true, 'url is required'],
    immutable: true
  },
  replyingTo: {
    type: Schema.Types.ObjectId,
    ref: "Post"
  },
  replies: [
    {
      postId: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: [true, 'Post ID is required']
      },
      timestamp: {
        type: Date,
        default: Date.now,
        immutable: true
      }
    },
    { _id: false }
  ],
  reposts: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'User ID is required']
      },
      timestamp: {
        type: Date,
        default: Date.now,
        immutable: true
      }
    },
    { _id: false }
  ],
  likes: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'User ID is required']
      }, 
      timestamp: {
        type: Date,
        default: Date.now,
        immutable: true
      }
    },
    { _id: false }
  ],
  sessionId: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    immutable: true
  }
})

const User = models.User || model('User', UserSchema)
const Post = models.Post || model('Post', PostSchema)

export { User, Post }
