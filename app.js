const express = require('express')
const app = express()
const fs = require('fs')
app.use(express.static('public'))
app.use(express.json())

app.get('/api/login', (req, res) => {
  if (!req.query.username && !req.query.password) {
    res.status(400).json({ message: 'Please give some credentials' })
  } else if (!req.query.username) {
    res.status(400).json({ message: 'Please enter a username' })
  } else if (!req.query.password) {
    res.status(400).json({ message: 'Please enter a password' })
  } else {
    fs.readFile('./data/users.json', 'utf8', (err, usersJSON) => {
      if (err) {
        console.log('File read failed:', err)
        res.status(500).json({ message: 'Server Error: Can\'t login at this time. Please try again later.' })
      } else {
        const users = JSON.parse(usersJSON)

        const user = users.find(u => u.username === req.query.username)

        if (!user) {
          res.status(404).json({ message: 'Sorry! That user doesn\'t exist!' })
        } else if (user.password === req.query.password) {
          res.status(200).json(user)
        } else if (user.password !== req.query.password) {
          res.status(401).json({ message: 'That password is incorrect. Please enter the correct password.' })
        }
      }
    })
  }
})

app.get('/api/contributors', (req, res) => {
  fs.readFile('./data/users.json', 'utf8', (err, usersJSON) => {
    if (err) {
      console.log('File read failed:', err)
      res.status(500).json({ message: "Server Error: Can't access contributors at this time. Please try again later." })
    } else {
      const contributors = JSON.parse(usersJSON)
      const contributorsList = []

      if (contributors.length === 0) {
        res.status(404).json({ message: 'Sadly, no one has contributed to our site yet :( Why not make yourself the first?!' })
      } else {
        fs.readFile('./data/uploads.json', 'utf8', (err, uploadsJSON) => {
          if (err) {
            console.log('File read failed:', err)
            res.status(500).json({ message: "Server Error: Can't access contributors at this time. Please try again later." })
          } else {
            const uploads = JSON.parse(uploadsJSON)

            for (let i = 0; i < contributors.length; i++) {
              let uploadsCount = 0
              const currentUsername = contributors[i].username

              for (let j = 0; j < uploads.length; j++) {
                if (currentUsername === uploads[j].user) {
                  uploadsCount += 1
                }
              }

              if (uploadsCount > 0) {
                contributorsList.push({ name: currentUsername, count: uploadsCount })
              }
            }

            contributorsList.sort()

            res.status(200).json(contributorsList)
          }
        })
      }
    }
  })
})

app.post('/api/register', (req, res) => {
  fs.readFile('./data/users.json', 'utf8', (err, usersJSON) => {
    if (err) {
      console.log('File read failed:', err)
      res.status(500).json({ message: "Server Error: Can't register at this time. Please try again later." })
    } else {
      const users = JSON.parse(usersJSON)

      const newUser = {
        username: req.body.username,
        password: req.body.password
      }

      if (req.body.username === '') {
        res.status(400).json({ message: 'Please enter a username!' })
      } else if (req.body.username === '') {
        res.status(400).json({ message: 'Please enter a password!' })
      } else if (users.some(u => u.username === req.body.username)) {
        res.status(400).json({ message: 'Sorry! That username already exists!' })
      } else if (newUser.password.length <= 5) {
        res.status(400).json({ message: 'Sorry! Your password is too short! It must be at least 6 characters' })
      } else {
        users.push(newUser)

        usersJSON = JSON.stringify(users)

        fs.writeFile('./data/users.json', usersJSON, err => {
          if (err) {
            console.log('Error writing file', err)
            res.status(500).json({ message: 'Server Error: Can\'t register at this time. Please try again later.' })
          } else {
            res.sendStatus(200)
          }
        })
      }
    }
  })
})

app.get('/api/explore', (req, res) => {
  let valid = false

  const validRegions = ['Newcastle', 'Gateshead', 'Durham', 'North Tyneside', 'South Tyneside', 'Sunderland', 'Northumberland', 'empty-test-region']
  try {
    for (let i = 0; i < validRegions.length; i++) {
      if (req.query.region.includes(validRegions[i])) {
        valid = true
      }
    }
  } catch (err) {
  }
  if (!req.query.region) {
    res.status(400).json({ message: 'Please choose a region' })
  } else if (valid === false) {
    res.status(404).json({ message: `Unfortunately we do not currently have a section for ${req.query.region} at the moment. If its relevent we may add it in the future` })
  } else {
    fs.readFile('./data/uploads.json', 'utf8', (err, uploadsJSON) => {
      if (err) {
        console.log('File read failed:', err)
        res.status(500).json({ message: `Server Error: Can't get images for ${req.query.region} at this time. Please try again later.` })
      } else {
        const imageList = []

        const uploads = JSON.parse(uploadsJSON)

        for (let i = 0; i < uploads.length; i++) {
          if (uploads[i].region === req.query.region) {
            imageList.push(uploads[i])
          }
        }

        if (imageList.length === 0) {
          res.status(404).json({ message: `Sorry! There havent been any images of ${req.query.region} uploaded yet! Why not upload one yourself?!` })
        } else {
          res.status(200).json(JSON.stringify(imageList))
        }
      }
    })
  }
})

app.get('/api/image', (req, res) => {
  if (!req.query.photoId) {
    res.status(400).json({ message: 'Please choose an image' })
  } else {
    fs.readFile('./data/uploads.json', 'utf8', (err, uploadsJSON) => {
      if (err) {
        console.log('File read failed:', err)
        res.status(500).json({ message: `Server Error: Can't find the image ${req.query.photoId} at this time. Please try again later.` })
      } else {
        let response = null

        const uploads = JSON.parse(uploadsJSON)

        for (let i = 0; i < uploads.length; i++) {
          if (uploads[i].id === req.query.photoId) {
            response = JSON.stringify(uploads[i])
          }
        }

        if (response === null) {
          res.status(404).json({ message: "This photo doesn't exist" })
        } else {
          res.status(200).json(response)
        }
      }
    })
  }
})

app.post('/api/upload', (req, res) => {
  let valid = false

  const validRegions = ['Newcastle', 'Gateshead', 'Durham', 'North Tyneside', 'South Tyneside', 'Sunderland', 'Northumberland', 'test-region']

  for (let i = 0; i < validRegions.length; i++) {
    if (req.body.region.includes(validRegions[i])) {
      valid = true
    }
  }
  if (req.body.user === '') {
    res.status(401).json({ message: 'You must be logged in to upload' })
  } else if (req.body.region === '' || req.body.region === 'Select...') {
    res.status(400).json({ message: 'Please choose a region to upload to' })
  } else if (valid === false) {
    res.status(400).json({ message: `Unfortunately we do not currently have a section for ${req.body.region} at the moment. If its relevent we may add it in the future` })
  } else {
    fs.readFile('./data/uploads.json', 'utf8', (err, uploadsJSON) => {
      if (err) {
        console.log('File read failed:', err)
        res.status(500).json({ message: 'Server Error: Can\'t upload image at this time. Please try again later.' })
      } else if (req.body.url === '') {
        res.status(400).json({ message: 'Please enter a URL for the photo before you upload' })
      } else if (req.body.desc === '') {
        res.status(400).json({ message: 'Please describe the photo before you upload' })
      } else {
        const uploads = JSON.parse(uploadsJSON)

        const newUpload = {

          id: req.body.user + Date.now(),
          user: req.body.user,
          region: req.body.region,
          desc: req.body.desc,
          url: req.body.url

        }

        let valid = false

        const validExtensions = ['.jpeg', '.jpg', '.png']

        for (let i = 0; i < validExtensions.length; i++) {
          if (newUpload.url.includes(validExtensions[i])) {
            valid = true
          }
        }

        if (valid === false) {
          res.status(400).json({ message: 'Sorry! file must be of type jpeg, jpg or png!' })
        } else {
          uploads.push(newUpload)

          uploadsJSON = JSON.stringify(uploads)

          fs.writeFile('./data/uploads.json', uploadsJSON, err => {
            if (err) {
              console.log('Error writing file', err)
              res.status(500).json({ message: 'Server Error: Can\'t upload image at this time. Please try again later.' })
            } else {
              res.sendStatus(200)
            }
          })
        }
      }
    })
  }
})

app.get('/api/comments/read', (req, res) => {
  if (!req.query.photoId) {
    res.status(400).json({ message: 'Please select a photo' })
  } else {
    fs.readFile('./data/comments.json', 'utf8', (err, commentsJSON) => {
      if (err) {
        console.log('File read failed:', err)
        res.status(500).json({ message: 'Server Error: Can\'t find comments at this time. Please try again later.' })
      } else {
        const commentsList = []

        const comments = JSON.parse(commentsJSON)

        for (let i = 0; i < comments.length; i++) {
          if (comments[i].photoId === req.query.photoId) {
            commentsList.push(comments[i])
          }
        }

        if (commentsList.length === 0) {
          res.status(404).json(JSON.stringify(commentsList))
        } else {
          res.status(200).json(JSON.stringify(commentsList))
        }
      }
    })
  }
})

app.post('/api/comments/new', (req, res) => {
  if (!req.body.commentUser) {
    res.status(401).json({ message: 'You must be signed in to comment!' })
  } else if (!req.body.comment) {
    res.status(400).json({ message: 'Please enter a valid comment' })
  } else if (!req.body.photoId) {
    res.status(400).json({ message: 'Please choose a photo to comment on' })
  } else {
    fs.readFile('./data/comments.json', 'utf8', (err, commentsJSON) => {
      if (err) {
        console.log('File read failed:', err)
        res.status(500).json({ message: 'Server Error: Can\'t upload comment at this time. Please try again later.' })
      } else {
        const comments = JSON.parse(commentsJSON)

        const newComment = {

          photoId: req.body.photoId,
          comment: req.body.comment,
          commentUser: req.body.commentUser

        }

        comments.push(newComment)

        commentsJSON = JSON.stringify(comments)

        fs.writeFile('./data/comments.json', commentsJSON, err => {
          if (err) {
            console.log('Error writing file', err)
            res.status(500).json({ message: 'Server Error: Can\'t upload comment at this time. Please try again later.' })
          } else {
            res.sendStatus(200)
          }
        })
      }
    })
  }
})

module.exports = app
