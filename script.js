// localStorage에서 todo elements 가져오기
const unparsedTODOS = localStorage.getItem('todos');
const TODOS = unparsedTODOS
  ? JSON.parse(unparsedTODOS).map((todo, idx) => ({
      ...todo,
      idx,
      fromDate: new Date(todo.fromDate),
      toDate: new Date(todo.toDate),
    }))
  : [];

let nextIdx = TODOS.length; // idx값을 중복되지 않게 설정하도록 초기값 지정
const ul = document.querySelector('.todoList'); // child node를 추가/제거 하기 위해 변수에 저장

// view update
const updateView = () => {
  while (ul.hasChildNodes()) {
    ul.removeChild(ul.firstChild);
  }
  for (const todo of TODOS) {
    addNewTodoLi(todo);
  }
};

const addNewTodoLi = (todo) => {
  const newLi = document.createElement('li');
  const contentDiv = document.createElement('div');
  const fromDateDiv = document.createElement('div');
  const toDateDiv = document.createElement('div');
  const doneBtn = document.createElement('button');
  const deleteBtn = document.createElement('button');

  contentDiv.innerHTML = todo.content;
  contentDiv.className = 'content';
  fromDateDiv.innerHTML = todo.fromDate;
  fromDateDiv.className = 'fromDate';
  toDateDiv.innerHTML = todo.toDate;
  toDateDiv.className = 'toDate';
  doneBtn.innerHTML = 'done';
  doneBtn.className = 'doneBtn';
  deleteBtn.innerHTML = 'delete';
  deleteBtn.className = 'deleteBtn';

  newLi.appendChild(contentDiv);
  newLi.appendChild(fromDateDiv);
  newLi.appendChild(toDateDiv);
  newLi.appendChild(doneBtn);
  newLi.appendChild(deleteBtn);

  doneBtn.addEventListener('click', (e) => {
    const idx = e.currentTarget.parentNode.id;
    const clickedLi = document.getElementById(idx);
    if (clickedLi.classList.contains('done'))
      clickedLi.classList.remove('done');
    else clickedLi.classList.add('done');

    let i;
    for (i = 0; i < TODOS.length; i++) {
      if (TODOS[i].idx == idx) {
        TODOS[i].isDone = !TODOS[i].isDone;
        break;
      }
    }
    const todo = TODOS[i];
    TODOS.splice(i, 1);

    pushTodo(todo);
    updateView();
    localStorage.setItem('todos', JSON.stringify(TODOS));
  });

  deleteBtn.addEventListener('click', (e) => {
    const idx = e.currentTarget.parentNode.id;
    const clickedLi = document.getElementById(idx);
    ul.removeChild(clickedLi);

    let i;
    for (i = 0; i < TODOS.length; i++) {
      if (TODOS[i].idx == idx) break;
    }
    TODOS.splice(i, 1);

    localStorage.setItem('todos', JSON.stringify(TODOS));
  });

  newLi.id = todo.idx;
  if (todo.priority === 3) newLi.classList.add('high');
  else if (todo.priority === 2) newLi.classList.add('mid');
  else newLi.classList.add('low');

  if (todo.isDone) newLi.classList.add('done');
  ul.appendChild(newLi);
};

for (const todo of TODOS) {
  addNewTodoLi(todo);
}

const addBtn = document.querySelector('.addBtn');
addBtn.addEventListener('click', () => {
  const newTodo = {};
  const content = document.querySelector('.content');
  const priorities = document.querySelectorAll("input[name='priority']");
  const fromDate = document.querySelector('.from');
  const toDate = document.querySelector('.to');

  newTodo.idx = nextIdx++;
  newTodo.content = content.value;
  priorities.forEach((priority) => {
    if (priority.checked) {
      newTodo.priority = Number(priority.value);
      return;
    }
  });
  newTodo.fromDate = new Date(fromDate.value);
  newTodo.toDate = new Date(toDate.value);
  newTodo.isDone = false;

  pushTodo(newTodo);
  localStorage.setItem('todos', JSON.stringify(TODOS));
  updateView();

  content.value = null;
  priorities[0].checked = true;
  fromDate.value = null;
  toDate.value = null;
});

const pushTodo = (todo) => {
  if (todo.isDone) {
    TODOS.splice(TODOS.length, 0, todo);
    return;
  }
  let i = 0;
  for (; i < TODOS.length; i++) {
    if (TODOS[i].isDone) break;
    if (TODOS[i].priority < todo.priority) break;
    else if (TODOS[i].priority === todo.priority) {
      if (TODOS[i].fromDate >= todo.fromDate) break;
    }
  }
  TODOS.splice(i, 0, todo);
};
