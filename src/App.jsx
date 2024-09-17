import { useState, useEffect, useOptimistic, useRef } from 'react'

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

function App() {

  const [todos, setTodos] = useState([]);

  const formRef = useRef();

  useEffect(() => {
    fetchTodos().then(setTodos)
  }, [])

  const [optimisticTodos, simplifiedAddTodo] = useOptimistic(todos, 
    (state, text) => {
      return [...state, { id: Math.random().toString(36).slice(2), text }]
    }
  );

  async function addNewTodo(formData) {
    const newTodo = formData.get('text');
    simplifiedAddTodo(newTodo);
    try {
      await addTodo(newTodo);
      setTodos(await fetchTodos());
    } catch (error) {
      console.log(error);
    } finally {
      formRef.current.reset();
    }
  }

  return (
    <>
      <ul>
        {optimisticTodos.map(todo => <li key={todo.id}>{todo.text}</li>)}
      </ul>
      <div>
        <form action={addNewTodo} ref={formRef}>
          <input
            type='text'
            name='text'
          />
        </form>
      </div>
    </>
  )
}

export default App
