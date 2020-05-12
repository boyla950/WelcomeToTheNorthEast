const app = require('./app')
const supertest = require('supertest')
const fs = require('fs')

describe('Testing the login service', () => {
  function validUserExample (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }

    if (jsonContent.username !== 'existing-test-user') {
      throw new Error('not the same user')
    }

    if (jsonContent.password !== 'valid-password') {
      throw new Error('not the same password')
    }
  }

  function invalidUserResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'Sorry! That user doesn\'t exist!') {
      throw new Error('unexpected response')
    }
  }

  function incorrectPasswordResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'That password is incorrect. Please enter the correct password.') {
      throw new Error('unexpected response')
    }
  }

  function noUsernameResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'Please enter a username') {
      throw new Error('unexpected response')
    }
  }

  function noPasswordResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'Please enter a password') {
      throw new Error('unexpected response')
    }
  }

  function noCredentialsResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'Please give some credentials') {
      throw new Error('unexpected response')
    }
  }

  test('GET /api/login with valid credentials is successful, and returns the correct user as a json object', () => {
    return supertest(app)
      .get('/api/login?username=existing-test-user&password=valid-password')
      .expect(200)
      .expect('Content-type', /json/)
      .expect(validUserExample)
  })

  test('GET /api/login with a username that does not exist throws correct error', () => {
    return supertest(app)
      .get('/api/login?username=not-a-user&password=password123')
      .expect(404)
      .expect('Content-type', /json/)
      .expect(invalidUserResponse)
  })

  test('GET /api/login with a valid user name but incorrect password throws correct error', () => {
    return supertest(app)
      .get('/api/login?username=existing-test-user&password=not-my-password')
      .expect(401)
      .expect('Content-type', /json/)
      .expect(incorrectPasswordResponse)
  })

  test('GET /api/login without giving a username', () => {

    return supertest(app)
      .get('/api/login?username=&password=valid-password')
      .expect(400)
      .expect('Content-type', /json/)
      .expect(noUsernameResponse)

  })

  test('GET /api/login without giving a username query parameter', () => {

    return supertest(app)
      .get('/api/login?password=valid-password')
      .expect(400)
      .expect('Content-type', /json/)
      .expect(noUsernameResponse)

  })

  test('GET /api/login without giving a password', () => {

    return supertest(app)
      .get('/api/login?username=existing-test-user&password=')
      .expect(400)
      .expect('Content-type', /json/)
      .expect(noPasswordResponse)

  })

  test('GET /api/login without giving a password query parameter', () => {

    return supertest(app)
      .get('/api/login?username=existing-test-username')
      .expect(400)
      .expect('Content-type', /json/)
      .expect(noPasswordResponse)

  })

  test('GET /api/login without giving any credentials', () => {

    return supertest(app)
      .get('/api/login?username=&password=')
      .expect(400)
      .expect('Content-type', /json/)
      .expect(noCredentialsResponse)

  })

  test('GET /api/login without giving any query parameters', () => {

    return supertest(app)
      .get('/api/login')
      .expect(400)
      .expect('Content-type', /json/)
      .expect(noCredentialsResponse)

  })

})

describe('Testing the uploads retrieval service', () => {
  function emptyRegionResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'Sorry! There havent been any images of empty-test-region uploaded yet! Why not upload one yourself?!') {
      throw new Error('unexpected response')
    }
  }

  function invalidRegionResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'Unfortunately we do not currently have a section for invalid-region at the moment. If its relevent we may add it in the future') {
      throw new Error('unexpected response')
    }
  }

  function noRegionResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'Please choose a region') {
      throw new Error('unexpected response')
    }
  }

  test('GET /api/explore with a valid region that has posts for it', () => {
    return supertest(app)
      .get('/api/explore?region=Newcastle')
      .expect(200)
      .expect('Content-type', /json/)
  })

  test('GET /api/explore with a valid region that has no posts for it yet', () => {
    return supertest(app)
      .get('/api/explore?region=empty-test-region')
      .expect(404)
      .expect('Content-type', /json/)
      .expect(emptyRegionResponse)
  })

  test('GET /api/explore with an invalid region', () => {
    return supertest(app)
      .get('/api/explore?region=invalid-region')
      .expect(404)
      .expect('Content-type', /json/)
      .expect(invalidRegionResponse)
  })

  test('GET /api/explore with no region given', () => {
    return supertest(app)
      .get('/api/explore?region=')
      .expect(400)
      .expect('Content-type', /json/)
      .expect(noRegionResponse)
  })

  test('GET /api/explore with no query parameters given', () => {
    return supertest(app)
      .get('/api/explore')
      .expect(400)
      .expect('Content-type', /json/)
      .expect(noRegionResponse)
  })
})

describe('Testing comment retreval service', () => {
  function noCommentsResponse (res) {
    const jsonContent = res.body

    if (jsonContent !== '[]') {
      throw new Error('unexpected response')
    }
  }

  function noPhotoResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'Please select a photo') {
      throw new Error('unexpected response')
    }
  }

  test('GET /api/comments/read with a valid photo id that has comments', () => {
    return supertest(app)
      .get('/api/comments/read?photoId=commented-test-photo')
      .expect(200)
      .expect('Content-type', /json/)
  })

  test('GET /api/comments/read with a valid photo id but does not yet have any comments', () => {
    return supertest(app)
      .get('/api/comments/read?photoId=uncommented-test-photo')
      .expect(404)
      .expect('Content-type', /json/)
      .expect(noCommentsResponse)
  })

  test('GET /api/comments/read with a valid photo id but does not yet have any comments', () => {
    return supertest(app)
      .get('/api/comments/read?photoId=not-a-photo')
      .expect(404)
      .expect('Content-type', /json/)
      .expect(noCommentsResponse)
  })

  test('GET /api/comments/read with no photo id given', () => {
    return supertest(app)
      .get('/api/comments/read?photoId=')
      .expect(400)
      .expect('Content-type', /json/)
      .expect(noPhotoResponse)
  })

  test('GET /api/comments/read with no query parameters given', () => {
    return supertest(app)
      .get('/api/comments/read')
      .expect(400)
      .expect('Content-type', /json/)
      .expect(noPhotoResponse)
  })

})

describe('Tests the registering service', () => {
  function responseStatusCheck (res) {
    const status = res.status

    if (status !== 200) {
      throw new Error('user may aleady exist from previous test runs, please delete the entry from ./data/users.json')
    }
  }

  function takenUserResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'Sorry! That username already exists!') {
      throw new Error('unexpected response')
    }
  }

  function shortPassswordResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'Sorry! Your password is too short! It must be at least 6 characters') {
      throw new Error('unexpected response')
    }
  }

  test('POST /api/register with a valid example of a new user', () => {
    return supertest(app)
      .post('/api/register')
      .send({ username: 'new-test-user', password: 'valid-password' })
      .expect(responseStatusCheck)
  })

  test('POST /api/register with a user name that is already taken', () => {
    return supertest(app)
      .post('/api/register')
      .send({ username: 'existing-test-user', password: 'validPassword' })
      .expect(400)
      .expect('Content-type', /json/)
      .expect(takenUserResponse)
  })

  test('POST /api/register with a valid username but a password that is too short', () => {
    return supertest(app)
      .post('/api/register')
      .send({ username: 'short-password-user', password: 'short' })
      .expect(400)
      .expect('Content-type', /json/)
      .expect(shortPassswordResponse)
  })
})

describe('Tests the uploading service', () => {
  function noUserResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'You must be logged in to upload') {
      throw new Error('unexpected response')
    }
  }

  function noRegionResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'Please choose a region to upload to') {
      throw new Error('unexpected response')
    }
  }

  function invalidRegionResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'Unfortunately we do not currently have a section for not-region at the moment. If its relevent we may add it in the future') {
      throw new Error('unexpected response')
    }
  }

  function noUrlResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'Please enter a URL for the photo before you upload') {
      throw new Error('unexpected response')
    }
  }

  function noDescResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'Please describe the photo before you upload') {
      throw new Error('unexpected response')
    }
  }

  function invalidUrlResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'Sorry! file must be of type jpeg, jpg or png!') {
      throw new Error('unexpected response')
    }
  }

  test('POST /api/upload with valid request', () => {
    return supertest(app)
      .post('/api/upload')
      .send({ user: 'test-user', region: 'test-region', desc: 'test-description', url: 'test-image.jpg' })
      .expect(200)
  })

  test('POST /api/upload when there is no user logged in', () => {
    return supertest(app)
      .post('/api/upload')
      .send({ user: '', region: 'test-region', desc: 'test-description', url: 'test-image.jpg' })
      .expect(401)
      .expect('Content-type', /json/)
      .expect(noUserResponse)
  })

  test('POST /api/upload when there is no region is given at all', () => {
    return supertest(app)
      .post('/api/upload')
      .send({ user: 'test-user', region: '', desc: 'test-description', url: 'test-image.jpg' })
      .expect(400)
      .expect('Content-type', /json/)
      .expect(noRegionResponse)
  })

  test('POST /api/upload when there is no region selected', () => {
    return supertest(app)
      .post('/api/upload')
      .send({ user: 'test-user', region: 'Select...', desc: 'test-description', url: 'test-image.jpg' })
      .expect(400)
      .expect('Content-type', /json/)
      .expect(noRegionResponse)
  })

  test('POST /api/upload when an invalid region is selected', () => {
    return supertest(app)
      .post('/api/upload')
      .send({ user: 'test-user', region: 'not-region', desc: 'test-description', url: 'test-image.jpg' })
      .expect(400)
      .expect('Content-type', /json/)
      .expect(invalidRegionResponse)
  })

  test('POST /api/upload when no url is given', () => {
    return supertest(app)
      .post('/api/upload')
      .send({ user: 'test-user', region: 'test-region', desc: 'test-description', url: '' })
      .expect(400)
      .expect('Content-type', /json/)
      .expect(noUrlResponse)
  })

  test('POST /api/upload when no description is given', () => {
    return supertest(app)
      .post('/api/upload')
      .send({ user: 'test-user', region: 'test-region', desc: '', url: 'test-image.jpg' })
      .expect(400)
      .expect('Content-type', /json/)
      .expect(noDescResponse)
  })

  test('POST /api/upload when an invalid url extension is used', () => {
    return supertest(app)
      .post('/api/upload')
      .send({ user: 'test-user', region: 'test-region', desc: 'test-description', url: 'test-image.pdf' })
      .expect(400)
      .expect('Content-type', /json/)
      .expect(invalidUrlResponse)
  })
})

describe('Tests the commenting service', () => {
  function noUserResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'You must be signed in to comment!') {
      throw new Error('unexpected response')
    }
  }

  function noCommentResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'Please enter a valid comment') {
      throw new Error('unexpected response')
    }
  }

  function noPhotoIdResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'Please choose a photo to comment on') {
      throw new Error('unexpected response')
    }
  }

  test('POST /api/comments/new with a valid comment upload', () => {
    return supertest(app)
      .post('/api/comments/new')
      .send({ photoId: 'test-photo', comment: 'new-test-comment', commentUser: 'test-user' })
      .expect(200)
  })

  test('POST /api/comments/new with no user logged in', () => {
    return supertest(app)
      .post('/api/comments/new')
      .send({ photoId: 'test-photo', comment: 'new-test-comment', commentUser: '' })
      .expect(401)
      .expect('Content-type', /json/)
      .expect(noUserResponse)
  })

  test('POST /api/comments/new without giving a comment', () => {
    return supertest(app)
      .post('/api/comments/new')
      .send({ photoId: 'test-photo', comment: '', commentUser: 'test-user' })
      .expect(400)
      .expect('Content-type', /json/)
      .expect(noCommentResponse)
  })

  test('POST /api/comments/new without giving a photo to comment on', () => {
    return supertest(app)
      .post('/api/comments/new')
      .send({ photoId: '', comment: 'test-comment', commentUser: 'test-user' })
      .expect(400)
      .expect('Content-type', /json/)
      .expect(noPhotoIdResponse)
  })

})

describe('Tests the single image retrieval service', () => {

  function noImageResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== 'Please choose an image') {
      throw new Error('unexpected response')
    }
  }

  function invalidImageResponse (res) {
    const jsonContent = res.body
    if (typeof jsonContent !== 'object') {
      throw new Error('not an object')
    }
    if (jsonContent.message !== "This photo doesn't exist") {
      throw new Error('unexpected response')
    }
  }

  test('GET /api/image/ with a valid request', () => {
    return supertest(app)
      .get('/api/image?photoId=test-image-id')
      .expect(200)
      .expect('Content-type', /json/)

  })

  test('GET /api/image/ with no image specified', () => {
    return supertest(app)
      .get('/api/image?photoId=')
      .expect(400)
      .expect('Content-type', /json/)
      .expect(noImageResponse)

  })

  test('GET /api/image/ with no query parameters given', () => {
    return supertest(app)
      .get('/api/image')
      .expect(400)
      .expect('Content-type', /json/)
      .expect(noImageResponse)

  })

  test('GET /api/image/ with an invalid image given', () => {
    return supertest(app)
      .get('/api/image?photoId=does-not-exist')
      .expect(404)
      .expect('Content-type', /json/)
      .expect(invalidImageResponse)

  })

})

describe('Tests the contributors retrieval service', () => {

  test('GET /api/contributors when there are users who have contributed', () => {
    return supertest(app)
      .get('/api/contributors')
      .expect(200)
      .expect('Content-type', /json/)
  })

})



