"use strict"

// User class has all methods required for getting users/todos
// It also has methods to render users objects and errors
// All methods/properties are static because we aren't doing updating/modifying data itself
class User {
  static users = [];

  // Request all users and return them as a promise to the caller
  static async getUsers() {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      const users = await response.json();
      await Promise.all(users.map(user => this.getTodos(user)));
      return users;
    } catch (e) {
      // throw the error to the caller so it can be handled there
      throw e;
    }
  }

  // Request all the todos for a specifi user 
  // user object needs to be passed
  // It appends the todos to the user passed
  static async getTodos(user) {
    // Passing the whole user so we can add its todos list 
    if(!user || !user.id) return false;
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${user.id}/todos`);
      const userTodos = await response.json();
      userTodos.reverse();
      user.todos = userTodos;
    } catch (e) {
      // throw the error to the caller so it can be handled there
      throw e;
    }
  }

  // Handles rendering all users to the usersContainerElement
  static async renderUsers(usersContainerElement) {
    try {
      this.users = await User.getUsers();
      let html = '';
      if (!this.users.length) {
        html = '<h2>No users were found</h2>';
      }
    
      this.users.forEach(user => html += this.createUserHTML(user));

      usersContainerElement.innerHTML = html;
    } catch(e) {
      // When errors occur, render a simple message
      usersContainerElement.innerHTML = `
        <h2 class="error-container">Failed to get data!</h2>
      `;
    }
  }

  // It renders user todos to an HTML element (todosElement)
  static renderTodos(user, todosElement) {
    const todoHTML = this.createTodosHTML(user);
    todosElement.innerHTML = todoHTML;
  }
  
  // It assembles all html needed to render a user
  // returns the html as a text
  static createUserHTML(user) {
    const html = `
      <section class="user" data-id="${user.id}">
        <div class="identity">
          <h3 class="name">${user.name} (${user.username})</h3>
          <p class="company">Company: ${user.company.name}</p>
        </div>
      </section>
      `;  
    return html;
  }

  // It assembles all html needed to render a full todo container
  // With user info at the top
  // returns the html as a text
  static createTodosHTML(user) {
    let html = this.createUserHTML(user);
    html += '<div class="todos">';
    if (!user.todos.length) {
      html += '<h3>This user has no TODO</h3>';
    }
    user.todos.forEach(todo => {
      html += `
      <div class="todo" data-todo-id="${todo.id}">
        <p class="title">${todo.id}) Title: ${todo.title}</p>
        <span class="status">${todo.completed ? "Completed" : "Uncomplete"}</span>
      </div>
    `;
    });
    html += '</div>';
    html += `<button class="add-todo-button" data-id="${user.id}">Add TODO</button>`;

    return html;
  }

  // It assembles all html needed to render an add todo form 
  // for a user (user) and, render that to the element passed (htmlElement)
  static renderTodoForm(user, htmlElement) {
    let formHTML = '';
    formHTML += this.createUserHTML(user);
    formHTML += `
      <h2>Add TODO</h2>
      <form id="add-todo-form" data-id="${user.id}">
        <div class="form-group">
          <label for="todo-title">Title: </label>
          <input type="text" id="todo-title">
        </div>
        <div class="form-group">
          <label for="todo-completed">Completed? </label>
          <input type="checkbox" id="todo-completed" value="true"><br >
        </div><br >
        <input type="submit" value="Add TODO">
      </form>
      <div class="error-container"></div>
    `;
    htmlElement.innerHTML = formHTML;
  }

  // Handles add todo form submission, it checks the values, 
  // render errors and exit (if any), or, assembles a todo object and add
  // it to the todo list of a user
  // Note: this method also calculate a todo id value by incrementing the highest 
  // id found in the todo list
  static todoFormSubmitted(e) {
    e.preventDefault();
    const errorContainer = this.parentElement.querySelector('.error-container');
    errorContainer.innerHTML = '';
    let errors = [];
    let todoTitle = this.querySelector('#todo-title').value;
    let todoCompleted = this.querySelector('#todo-completed').checked;
    const userId = Number(this.dataset.id);
    const user = User.users.filter(user => user.id === userId)[0];

    if (!todoTitle || todoTitle.trim().length < 3) {
      errors.push("Please make sure your TODO title is more than 3 characters long!");
    }
    if (!user) {
      errors.push("Unable to locate the user!");
    }
    // Any other form error checking goes here 
    
    if (errors.length) {
      User.renderErrors(errors, errorContainer);
      return;
    }
// Exporting user to use it from everywhere
// export default User;
    // This line get the highest todo id and add 1 for the new todo
    const newTodoId = Math.max.apply(Math, user.todos.map(todo => todo.id)) + 1;

    let newTodo = {
      userId: userId, 
      id: newTodoId, 
      title: todoTitle,
      completed: todoCompleted
    }
    
    user.todos.unshift(newTodo);
    User.renderTodos(user, this.parentElement);
  }

  // Loops through array of errors (errors) and render them
  // to the element passed (htmlElement)
  static renderErrors(errors, htmlElement) {
    let html = '';
    errors.forEach(error => {
      html +=  `<div class="error">${error}</div>`;
    });
    htmlElement.innerHTML = html;
  }
}
