import { useEffect } from 'react';
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

// 1️⃣ Zustand store to manage todos and isPending state
const useTodos = create((set, get) => ({
  todos: [],
  isPending: false,
  getTodos: async () => {
    const todos = await fetchTodos();
    set({ todos })
  },
  postTodo: async (text) => {
    const originalTodos = get().todos;

    // 2️⃣ Optimistically update the todos state and set isPending to true
    set({
      isPending: true,
      todos: [
        ...get().todos,
        { id: Math.random().toString(36).slice(2), text }
      ],
    })

    try {
      await addTodo(text);
      // 3️⃣ Fetch the updated todos from the server and set isPending to false
      set({ isPending: false, todos: await fetchTodos() });
    } catch (error) {
      console.log(error);
      // 4️⃣ Revert to the original todos state and set isPending to false in case of an error
      set({ isPending: false, todos: originalTodos });
    }
  }
}))

function App() {

  const { isPending, todos, postTodo } = useTodos();

  useEffect(() => {
    useTodos.getState().getTodos();
  }, [])

  return (
    <>
      <ul>
        {todos.map(todo => <li key={todo.id}>{todo.text}</li>)}
      </ul>
      <div>
        {/* 
          5️⃣ Input for adding new todo 
          - Use `onKeyUp` to add a new todo when `Enter` is pressed
          - Use `disabled` to disable the input if `isPending` is true
        */}
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