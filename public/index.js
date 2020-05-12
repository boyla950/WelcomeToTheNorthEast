const socket = io.connect('http://127.0.0.1:8090')

let currentUser = {

  username: '',
  password: ''
}

//replaces the content of the main div with div containing the home page content to make it visible
function LoadHomePage () {

  const homePage = document.getElementById('home-page').innerHTML
  const main = document.getElementById('main')
  main.innerHTML = homePage
}

//replaces the content of the main div with div containing the login page content to make it visible
function LoadLoginPage () {

  const loginPage = document.getElementById('login-page').innerHTML
  const main = document.getElementById('main')
  main.innerHTML = loginPage
}

//replaces the content of the main div with div containing the register page content to make it visible
function LoadRegisterPage () {

  const registerPage = document.getElementById('register-page').innerHTML
  const main = document.getElementById('main')
  main.innerHTML = registerPage
}

//replaces the content of the main div with div containing the upload page content to make it visible
function LoadUploadPage () {

  const uploadPage = document.getElementById('upload-page').innerHTML
  const main = document.getElementById('main')
  main.innerHTML = uploadPage
}

//allows the user to 'sign out' and changes the home nav bar accordingly 
function signOut () {
  currentUser = {

    username: '',
    password: ''
  }

  document.getElementById('sign-out-menu-item').style.display = 'none'
  document.getElementById('sign-in-menu-item').style.display = 'inline'
}

//replaces the content of the main div with div containing the explore page content to make it visible
function LoadExplorePage (region) {

  const explorePage = document.getElementById('explore-page').innerHTML
  const main = document.getElementById('main')
  main.innerHTML = explorePage
}

//clears the content within the main div and the columns on the explore page
function clearContent () {

  const clear = document.getElementById('clear-content').innerHTML

  const main = document.getElementById('main')
  main.innerHTML = clear

  const lc = document.getElementById('left-column')
  lc.innerHTML = clear

  const mc = document.getElementById('middle-column')
  mc.innerHTML = clear

  const rc = document.getElementById('right-column')
  rc.innerHTML = clear
}

//sends sign in request to the server and sets their credentials to the current user if they are valid
async function AttemptSignIn () {

  if (currentUser.username !== ''){

    displayErrorAlert('You are already logged in, please sign out first!')
    return

  }

  const username = document.getElementById('username-box').value
  const password = document.getElementById('password-box').value

  const response = await fetch(`http://127.0.0.1:8090/api/login?username=${username}&password=${password}`)

  if (response.status !== 200) {
    const responseJSON = await response.text()

    const message = JSON.parse(responseJSON).message

    displayErrorAlert(message)

    return
  }

  const body = await response.text()

  currentUser = JSON.parse(body)

  document.getElementById('sign-in-menu-item').style.display = 'none'
  document.getElementById('sign-out-menu-item-link').textContent = `Sign Out - ${currentUser.username}`
  document.getElementById('sign-out-menu-item').style.display = 'inline'

  LoadHomePage()
  displayNotificationAlert(`Signed in as ${currentUser.username}`)
}

//requests a list of users who have made an upload from the server and displays them on the contributors page
async function viewContributors () {

  const response = await fetch('http://127.0.0.1:8090/api/contributors')

  const body = await response.text()
  const content = JSON.parse(body)

  const contributorsPage = document.getElementById('contributors-page').innerHTML
  const main = document.getElementById('main')
  main.innerHTML = contributorsPage

  if (!content.message){

    contributors = content

    let target = document.getElementById('left-contributors-column')
      target.innerHTML = ''

      target = document.getElementById('middle-contributors-column')
      target.innerHTML = ''

      target = document.getElementById('right-contributors-column')
      target.innerHTML = ''

    for (let i = 0; i < contributors.length; i++){    

      let contributor = `<div class="card bg-dark text-light" style=" padding:3px; width: 300px; height: 100px;">
                            <div class="card-body">
                              <p class="card-text">${contributors[i].name}</p>
                              <footer class="blockquote-footer">
                                <cite title="Source Title">${contributors[i].count} uploads</cite>
                              </footer>
                            </div>
                          </div>
                          <br>`

      const column = i % 3

      if (column === 0) {
        const target = document.getElementById('left-contributors-column')
        target.insertAdjacentHTML('beforeend', contributor)
      } else if (column === 1) {
        const target = document.getElementById('middle-contributors-column')
        target.insertAdjacentHTML('beforeend', contributor)
      } else if (column === 2) {
        const target = document.getElementById('right-contributors-column')
        target.insertAdjacentHTML('beforeend', contributor)
      }

    }
     
  } else {

    let target = document.getElementById('contributors-page-message')
    target.innerText = content.message 

  }

}

//makes a post request to the server containing the credentials of a new user to be stored
async function AttemptRegister () {

  if (currentUser.username !== ''){

    displayErrorAlert('You are already logged in, please sign out first!')
    return

  }
 
  const newUsername = document.getElementById('create-username-box').value
  const newPassword = document.getElementById('create-password-box').value
  const passwordCheck = document.getElementById('check-password-box').value

  if (newPassword === passwordCheck) {
    const newUser = {

      username: newUsername,
      password: newPassword

    }

    const request = await fetch('http://127.0.0.1:8090/api/register/', {

      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser)
    })

    if (request.status !== 200) {
      const responseJSON = await request.text()

      const message = JSON.parse(responseJSON).message

      displayErrorAlert(message)

      return
    }

    currentUser.username = newUser.username
    currentUser.password = newUser.password


    document.getElementById('sign-in-menu-item').style.display = 'none'
    document.getElementById('sign-out-menu-item-link').textContent = `Sign Out - ${currentUser.username}`
    document.getElementById('sign-out-menu-item').style.display = 'inline'

    LoadHomePage()
    displayNotificationAlert(`Signed in as ${currentUser.username}`)
  } else {
    displayErrorAlert('Passwords do not match!')
  }
}

//sends a post request to the server containing the details of a new post
async function AttemptUpload () {

  const user = currentUser.username
  const region = document.getElementById('region-selector').value
  const desc = document.getElementById('description-box').value
  const url = document.getElementById('url-box').value

  const newUpload = {

    user: user,
    region: region,
    desc: desc,
    url: url

  }

  const request = await fetch('http://127.0.0.1:8090/api/upload/', {

    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newUpload)
  })

  if (request.status !== 200) {
    const responseJSON = await request.text()

    const message = JSON.parse(responseJSON).message

    displayErrorAlert(message)

    return
  }

  displayNotificationAlert('Yay! Your image has been uploaded!')
}

//retrieves from the server all the posts regarding a particular region and displays each one in its own card within a grid with three columns
async function exploreRegion (region) {

  const response = await fetch(`http://127.0.0.1:8090/api/explore?region=${region}`)

  if (response.status !== 200) {
    const responseJSON = await response.text()

    const message = JSON.parse(responseJSON).message

    displayErrorAlert(message)
  } else {

    const body = await response.json()

    const regionPhotos = JSON.parse(body)

    LoadExplorePage(region)

    let target = document.getElementById('left-column')
    target.innerHTML = ''

    target = document.getElementById('middle-column')
    target.innerHTML = ''

    target = document.getElementById('right-column')
    target.innerHTML = ''

    document.getElementById('explore-header').innerHTML = `This is ${region}`

    for (let i = 0; i < regionPhotos.length; i++) {
      const imageCard = `<div class="card" style=" padding:3px; width: 300px; height: 400px;"> 
                                <img src="${regionPhotos[i].url}" onclick = "expandImage('${regionPhotos[i].id}')" class="card-img-top" alt="${regionPhotos[i].url}" style = 'max-height: 170px'>
                                <div class="card-body">
                                    <p class="card-text">${regionPhotos[i].desc}</p>
                                    <footer class="blockquote-footer">Image shared by <cite title="Source Title">${regionPhotos[i].user}</cite></footer>
                                </div>
                                <button type='button' class='btn btn-dark' onclick='displayComments("${regionPhotos[i].id}");'>View Comments</button>
                            </div>

                            <br>`

      const column = i % 3

      if (column === 0) {
        const target = document.getElementById('left-column')
        target.insertAdjacentHTML('beforeend', imageCard)
      } else if (column === 1) {
        const target = document.getElementById('middle-column')
        target.insertAdjacentHTML('beforeend', imageCard)
      } else if (column === 2) {
        const target = document.getElementById('right-column')
        target.insertAdjacentHTML('beforeend', imageCard)
      }
    }
  }
}

// retrieves all the comments for a particular image and displays them in a modal
async function displayComments (photo) {
  const response = await fetch(`http://127.0.0.1:8090/api/comments/read?photoId=${photo}`)
  
  if (response.status !== 200 && response.status ==! 404) {
      const responseJSON = await response.text()

      const message = JSON.parse(responseJSON).message

      displayCommentErrorAlert(message) 
  }

  const body = await response.json()

  const photoComments = JSON.parse(body)

  let modalContent = ''

  for (let i = 0; i < photoComments.length; i++) {
    modalContent = modalContent + `<p> ${photoComments[i].comment} <cite title="Source Title"> - ${photoComments[i].commentUser}</cite></p>`
  }

  if (photoComments.length === 0) {
    modalContent = '<p>No comments yet, why not leave one?!</p>'
  }

  const commentBox = `<div class="modal fade show d-block" id="comments-modal" tabindex="-1" role="dialog">
                        <div class="modal-dialog modal-dialog-scrollable" role="document">
                        <div class="modal-content">
                            <div class="modal-header" id = "modal-header">
                            <h5 class="modal-title">Comments</h5>
                            <button type="button" class="close" data-dismiss="modal" onclick = "closeCommentsModal();">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            </div>
                            <div class="modal-body">
                            ${modalContent}
                            </div>
                            <div class="modal-footer">
                            <div class='input-group mb-3' style = 'max-width: 300px;'>
                                    <input id = 'comment-box' type='text' class='form-control' placeholder='Write a comment...'>
                                </div>
                            <button type="button" class="btn btn-dark" onclick = 'uploadNewComment("${photo}");'>Add Comment</button>
                            </div>
                        </div>
                        </div>
                    </div>`

  const main = document.getElementById('main')
  main.insertAdjacentHTML('beforeend', commentBox)
}

//removes the comments modal 
function closeCommentsModal () {
  const modal = document.getElementById('comments-modal')
  modal.parentNode.removeChild(modal)
}

//sends a post request to the server to upload a new comment on a specific photo and then reloads the comments to display it
async function uploadNewComment (photo) {
  const photoId = photo
  const comment = document.getElementById('comment-box').value
  const commentUser = currentUser.username

  const newComment = {

    photoId: photoId,
    comment: comment,
    commentUser: commentUser
  }

  const response = await fetch('http://127.0.0.1:8090/api/comments/new', {

    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newComment)
  })

  if (response.status !== 200) {
    const responseJSON = await response.text()

    const message = JSON.parse(responseJSON).message

    displayCommentErrorAlert(message)

    return
  }

  await displayComments(photo)
}

//displays a selected image within its own modal to expand it
async function expandImage (id) {

  const response = await fetch(`http://127.0.0.1:8090/api/image?photoId=${id}`)

  const body = await response.json()
  const image = JSON.parse(body)

  const imageModal =
    `<div id = 'image-modal' class="modal fade show d-inline bd-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                <h5 class="modal-title">${image.desc}</h5>
                <button type="button" class="close" data-dismiss="modal" onclick = "closeImageModal();">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="modal-body">
                <img src = '${image.url}' style = 'width: 80vw; max-width:750px;'>
                </div>
                <div class="modal-footer">
                <cite title="Source Title">${image.user}</cite>
                </div>
            </div>
        </div>    
    </div>
  </div>`

  const main = document.getElementById('main')
  main.insertAdjacentHTML('beforeend', imageModal)
}

//removes the image modal
function closeImageModal () {
  const modal = document.getElementById('image-modal')
  modal.parentNode.removeChild(modal)
}

//displays an error alert on the top of the screen 
function displayErrorAlert (message) {
  const errorAlert = document.getElementById('error-alert').innerHTML
  const main = document.getElementById('main')
  main.insertAdjacentHTML('afterbegin', errorAlert)

  const errorMessage = document.getElementById('error-text')
  errorMessage.innerHTML = message
}

//displays an error at the top of the comments modal 
function displayCommentErrorAlert (message) {
  const errorAlert = document.getElementById('error-alert').innerHTML
  const target = document.getElementById('modal-header')
  target.insertAdjacentHTML('afterend', errorAlert)

  const errorMessage = document.getElementById('error-text')
  errorMessage.innerHTML = message
}

//displays a notification at the top of the page
function displayNotificationAlert (message) {
  const notificationAlert = document.getElementById('notification-alert').innerHTML
  const main = document.getElementById('main')
  main.insertAdjacentHTML('afterbegin', notificationAlert)

  const notificationMessage = document.getElementById('notification-text')
  notificationMessage.innerHTML = message
}

//displays home page when the webpage loads
document.addEventListener('DOMConentLoaded', LoadHomePage())

//displays an error message if the server disconnects
socket.on('connect_error', () => {
  displayErrorAlert('Sorry! Looks like we\'ve lost connection to our server')

  socket.close()
})
