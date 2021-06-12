"use strict"
/**
 * This script handles the initial request of users and add event listeners
 * It has the generic functionality of initializing the app
 */

// This script uses ES6 import/exports so a server is needed to load the project
import User from './user.class.js'

const usersContainerElement = document.querySelector('.users');
const popupContainer = document.querySelector('.popup-box .container');

// request users to be rendered and attach click event to them
async function initUsers() {
  showLoadingProgress(usersContainerElement);
  await User.renderUsers(usersContainerElement);

  usersContainerElement.addEventListener('click', checkUserClicked);
  popupContainer.parentElement.addEventListener('click', checkPopupClicked);
}

// Checks the user container is clicked and get user id, 
// and request thier todos to be renderd on a popup box element
function checkUserClicked(e) {
  // If not user element clicked, exit
  const userElement = e.target.closest('.user');
  if (!userElement) return;
  const userId = userElement.dataset.id;
  let user = User.users.filter(user => user.id === Number(userId));
  if (user.length) User.renderTodos(user[0], popupContainer);
  togglePopup();
  
}

// Handles checking user click on the popup container 
// if click on the outside wrapper, hide the popup box
// if click on add todo button, render the add todo form and 
// attach submit event on the form
function checkPopupClicked(e) {
  if (e.target.classList.contains('popup-box')) {
    togglePopup();
    popupContainer.innerHTML = '';
  };
  if (e.target.classList.contains('add-todo-button')) {
    const user = User.users.filter(user => user.id === Number(e.target.dataset.id));
    if (!user.length) return;
    User.renderTodoForm(user[0], popupContainer);
    document.querySelector('#add-todo-form').addEventListener('submit', User.todoFormSubmitted)
  }
}

// Show/hide popup box
function togglePopup() {
  if (popupContainer.parentElement.classList.contains('hidden')) 
    popupContainer.parentElement.classList.remove('hidden');
  else 
    popupContainer.parentElement.classList.add('hidden');
}

// Show a loading progress 
// Currently, it outputs a simple text but more advance loading can be handled here
function showLoadingProgress(element) {
  element.innerHTML = '<h2>Loading data...</h2>';
}

initUsers();