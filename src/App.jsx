import { create } from 'zustand';

async function fetchTodos() {
  const response = await fetch('http://localhost:8080/api/todos')
  const todos = await response.json()
  return todos
}

async function addTodo(text) {
  const response = await fetch('http://localhost:8080/api/todos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })

  if(!response.ok) {
    throw new Error('Failed to add todo')
  }

  const todo = await response.json()
  return todo
}

const useTodos = create((set, get) => ({
  todos: [],
  isPending: false,
  getTodos: async () => {
    const todos = await fetchTodos();
    set({ todos })
  },
  postTodo: async (text) => {
    const originalTodos = get().todos;

    set({
      isPending: true,
      todos: [
        ...get().todos,
        { id: Math.random().toString(36).slice(2), text }
      ],
    })

    try {
      await addTodo(text);
      set({ isPending: false, todos: await fetchTodos() });
    } catch (error) {
      console.log(error);
      set({ isPending: false, todos: originalTodos });
    }
  }
}))

useTodos.getState().getTodos();


function App() {

  const { isPending, todos, postTodo } = useTodos();

  return (
    <>
      <ul>
        {todos.map(todo => <li key={todo.id}>{todo.text}</li>)}
      </ul>
      <div>
          <input
            type='text'
            name='text'
            disabled={isPending}
            onKeyUp={event => {
              if(event.key === 'Enter') {
                postTodo(event.target.value)
                event.target.value = ''
              }
            }}
          />
      </div>
    </>
  )
}

export default App
