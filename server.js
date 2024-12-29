import express from 'express'
import bodyParser from 'body-parser'
import { firstPost, post } from './index.js'

const app = express()
const port = 4000

app.use(bodyParser.json())

app.post('/firstPost', firstPost)

app.post('/post', post)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
