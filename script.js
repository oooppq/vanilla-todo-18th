// ############################## init ##############################
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

// in memory에 저장된 todo list를 view에 display
for (const todo of TODOS) {
  addNewTodoLi(todo);
}

// 추가 버튼 click event handler 등록
const addBtn = document.querySelector('.addBtn');
addBtn.addEventListener('click', handleClickAddBtn);

// 오늘 이전의 date은 선택하지 못하도록 제한
const utc = Date.now();
const timeOff = new Date().getTimezoneOffset() * 60000;
const today = new Date(utc - timeOff).toISOString().split('T')[0];
const dateInputs = document
  .querySelectorAll('.dateInput')
  .forEach((dateInput) => {
    dateInput.setAttribute('min', today);
  });

// 시작일 설정에 change event handler 등록
const fromDate = document.querySelector('.from');
fromDate.addEventListener('change', handleChangeFromDate);

// ############################## core functions ##############################
// view update
function updateView() {
  while (ul.hasChildNodes()) {
    // 기존에 추가됐든 li 삭제
    ul.removeChild(ul.firstChild);
  }
  for (const todo of TODOS) {
    // 업데이트된 todo list 추가
    addNewTodoLi(todo);
  }
}

// ul에 list들을 삽입
function addNewTodoLi(todo) {
  // li에 필요한 element들 선언
  const newLi = document.createElement('li');
  const contentDiv = document.createElement('div');
  const fromDateDiv = document.createElement('div');
  const betweenDiv = document.createElement('div');
  const toDateDiv = document.createElement('div');
  const doneBtn = document.createElement('button');
  const deleteBtn = document.createElement('button');

  // elements의 내용 추가
  contentDiv.innerHTML = todo.content;
  contentDiv.className = 'content';
  fromDateDiv.innerHTML = convertDate(todo.fromDate);
  fromDateDiv.className = 'fromDate';
  betweenDiv.innerHTML = '-';
  betweenDiv.className = 'betweenDate';
  toDateDiv.innerHTML = convertDate(todo.toDate);
  toDateDiv.className = 'toDate';
  doneBtn.innerHTML = todo.isDone ? '↪' : '✓';
  doneBtn.className = 'doneBtn';
  deleteBtn.innerHTML = '-';
  deleteBtn.className = 'deleteBtn';

  // event listener 추가
  doneBtn.addEventListener('click', handleClickDoneBtn);
  deleteBtn.addEventListener('click', handleClickDeleteBtn);

  // li에 child node들 추가
  newLi.appendChild(contentDiv);
  newLi.appendChild(fromDateDiv);
  newLi.appendChild(betweenDiv);
  newLi.appendChild(toDateDiv);
  newLi.appendChild(doneBtn);
  newLi.appendChild(deleteBtn);

  newLi.id = todo.idx; // 정렬을 위한 id 추가
  // 각종 className 추가
  newLi.classList.add('todoLi'); 
  if (todo.priority === 3) newLi.classList.add('high');
  else if (todo.priority === 2) newLi.classList.add('mid');
  else newLi.classList.add('low');

  if (todo.isDone) newLi.classList.add('done');
  ul.appendChild(newLi);
}

// 기준에 따라 정렬되어 memory에 저장되도록 push, push할 때만 정렬하면 따로 정렬과정 거치지 않아도 됨
function pushTodo(todo) {
  if (todo.isDone) { // 완료한 todo는 맨 뒤에 위치
    TODOS.splice(TODOS.length, 0, todo);
    return;
  }
  let i = 0;
  for (; i < TODOS.length; i++) {
    if (TODOS[i].isDone) break; // 완료한 todo보다 무조건 앞에 위치
    if (TODOS[i].priority < todo.priority) break; // priority가 더 높으면 그 앞에 위치
    else if (TODOS[i].priority === todo.priority) { // priority가 같다면
      if (TODOS[i].fromDate >= todo.fromDate) break; // 시작일이 빠른 todo가 더 낲에 위치
    }
  }
  TODOS.splice(i, 0, todo);
}

// Date를 적절하게 display 하도록 convert
function convertDate(date) {
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

// ############################## click handlers ##############################
// done button click event handler
function handleClickDoneBtn(e) {
  const idx = e.currentTarget.parentNode.id;
  const clickedLi = document.getElementById(idx);
  // class 추가/제거
  if (clickedLi.classList.contains('done')) clickedLi.classList.remove('done');
  else clickedLi.classList.add('done');

  // TODOS에 저장된 todo 객체 수정
  let i;
  for (i = 0; i < TODOS.length; i++) {
    if (TODOS[i].idx == idx) {
      TODOS[i].isDone = !TODOS[i].isDone;
      break;
    }
  }
  const todo = TODOS[i];

  TODOS.splice(i, 1); // 해당 todo를 삭제한 후
  pushTodo(todo); // 새롭게 추가(정렬을 위해)
  updateView(); // 화면 업데이트
  localStorage.setItem('todos', JSON.stringify(TODOS));
}

// delete button click event handler
function handleClickDeleteBtn(e) {
  const idx = e.currentTarget.parentNode.id;
  const clickedLi = document.getElementById(idx);
  ul.removeChild(clickedLi); // 클릭한 todo 삭제

  let i;
  for (i = 0; i < TODOS.length; i++) {
    if (TODOS[i].idx == idx) break;
  }
  TODOS.splice(i, 1); // TODOS 에서도 삭제

  localStorage.setItem('todos', JSON.stringify(TODOS));
}

// add button click event handler
function handleClickAddBtn() {
  const newTodo = {};
  // 각종 input element들 참조
  const content = document.querySelector('.contentInput');
  const priorities = document.querySelectorAll("input[name='priority']");
  const fromDate = document.querySelector('.from');
  const toDate = document.querySelector('.to');

  // input들의 value값을 newTodo에 저장
  if (!content.value) return;
  newTodo.idx = nextIdx++;
  newTodo.content = content.value;
  priorities.forEach((priority) => {
    if (priority.checked) {
      newTodo.priority = Number(priority.value); // radio box에서 체크된 priority를 선택
      return;
    }
  });
  // 에러가 발생하지 않도록 삼항연산자로 분기
  newTodo.fromDate = fromDate.value ? new Date(fromDate.value) : new Date();
  newTodo.toDate = toDate.value ? new Date(toDate.value) : new Date();
  newTodo.isDone = false;

  pushTodo(newTodo);
  updateView();
  localStorage.setItem('todos', JSON.stringify(TODOS));

  // input value들을 초기화
  content.value = null;
  priorities[0].checked = true;
  fromDate.value = null;
  toDate.value = null;
}

// 종료일이 시작일보다 빠를 수 없도록한 change event handler
function handleChangeFromDate(e) {
  if (e.currentTarget.value) {
    let utc = new Date(e.currentTarget.value).getTime();
    let timeOff = new Date().getTimezoneOffset() * 60000;
    let today = new Date(utc - timeOff).toISOString().split('T')[0];
    document.querySelector('.to').setAttribute('min', today);
    document.querySelector('.to').setAttribute('value', e.currentTarget.value);
  }
}
