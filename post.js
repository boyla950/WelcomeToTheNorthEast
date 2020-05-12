// this file removes any data uploaded in post requests from JEST testing
const fs = require('fs')

fs.readFile('./data/users.json', 'utf8', (err, usersJSON) => {
  if (err) {
    console.log('File read failed:', err)
  } else {
    const users = JSON.parse(usersJSON)

    for (let i = 0; i < users.length; i++) {
      if (users[i].username === 'new-test-user') {
        users.splice(i)
      }
    }
    usersJSON = JSON.stringify(users)

    fs.writeFile('./data/users.json', usersJSON, err => {
      if (err) {
        console.log('Error writing file', err)
      }
    })
  }
})

fs.readFile('./data/comments.json', 'utf8', (err, commentsJSON) => {
  if (err) {
    console.log('File read failed:', err)
  } else {
    const comments = JSON.parse(commentsJSON)

    for (let i = 0; i < comments.length; i++) {
      if (comments[i].photoId === 'test-photo') {
        comments.splice(i)
      }
    }
    commentsJSON = JSON.stringify(comments)

    fs.writeFile('./data/comments.json', commentsJSON, err => {
      if (err) {
        console.log('Error writing file', err)
      }
    })
  }
})

fs.readFile('./data/uploads.json', 'utf8', (err, uploadsJSON) => {
  if (err) {
    console.log('File read failed:', err)
  } else {
    const uploads = JSON.parse(uploadsJSON)

    for (let i = 0; i < uploads.length; i++) {
      if (uploads[i].url === 'test-image.jpg') {
        uploads.splice(i)
      }
    }

    uploadsJSON = JSON.stringify(uploads)

    fs.writeFile('./data/uploads.json', uploadsJSON, err => {
      if (err) {
        console.log('Error writing file', err)
      }
    })
  }
})
