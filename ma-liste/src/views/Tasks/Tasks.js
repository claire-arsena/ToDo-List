import { useContext } from 'react';
import { TodoContext } from '../../ctx/TodoContext';
import TasksItem from './TasksItem';
import './Tasks.css';

function Tasks() {
    const { getActiveSortedTasks } = useContext(TodoContext);
    const activeTasks = getActiveSortedTasks();

    return (
        <section className="tasks">
            <h1>Liste de tâches</h1>
            <menu className="tasks-list">
                {activeTasks.length > 0 ? (
                    activeTasks.map((task) => (
                        <TasksItem key={task.id} task={task} />
                    ))
                ) : (
                    <p>Aucune tâche active</p>
                )}
            </menu>
        </section>
    );
}

export default Tasks;