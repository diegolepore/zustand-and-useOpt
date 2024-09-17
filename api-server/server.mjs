import express from 'express';
import cors from 'cors';

const todos = [
    {
        id: 1,
        text: 'Learn React',
        completed: false
    },
    {
        id: 2,
        text: 'Learn Node',
        completed: true
    },
    {
        id: 3,
        text: 'Learn Express',
        completed: false
    }
];

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/todos', (req, res) => {
    res.send(todos);
});

app.post('/api/todos', (req, res) => {
    setTimeout(() => {
        const body = req.body || {};
        if(body?.text !== 'error') {
            const newTodo = {
                id: todos.length + 1,
                text: body.text ?? "",
                completed: false
            };
            todos.push(newTodo);
            res.send(newTodo);
        } else {
            res.status(400).json({ error: 'Failed to add todo' });
        }
    }, 3000);
});

app.listen(8080, () => console.log('Server started on port 8080'));