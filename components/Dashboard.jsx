import styles from './Dashboard.module.css';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal.jsx';
import DeleteTaskAlert from './DeleteTaskAlert.jsx';
import EditTaskForm from './EditTaskForm.jsx';
import InternalServerError from './InternalServerError.jsx';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Spinner from './Spinner';

export default function Dashboard() {
	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [showForm, setShowForm] = useState(false);
	const [showDeleteAlert, setShowDeleteAlert] = useState(false);
	const [taskIdToDelete, setTaskIdToDelete] = useState(null);
	const [taskIdToEdit, setTaskIdToEdit] = useState(null);
	const [showEditForm, setShowEditForm]= useState(false);
	const [taskBeingEdited, setTaskBeingEdited] = useState(null);
	const [addTaskFailureMessage, setAddTaskFailureMessage] = useState('');
	const [showServerError, setShowServerError] = useState(false);

	const router = useRouter();

	useEffect(() => {
		async function fetchTask() {
			try {
				setLoading(true);
				const res = await axios.get('/api/tasks', { withCredentials: true });
				setTasks(res.data);
			} catch (err) {
				if (err?.response?.status === 500) {
					setShowServerError(true);
				} else if (err?.response?.status === 404) {
					setErrorMessage("404 Not Found");
				} else if (err?.response?.status === 401) {
					router.push("/login");
				} else {
					setErrorMessage("Something unexpected happened. please try again.");
				}
			} finally {
				setLoading(false);
			}
		}

		document.title = "Dashboard";
		fetchTask();
	}, []);

	useEffect(() => {
		if (showServerError) document.title = "500 Internal Server Error";
	}, [showServerError]);

	const handleTaskAdded = async (newTask) => {
		try {
			const res = await axios.post('/api/tasks', newTask, {withCredentials: true});
			setTasks(prev => [...prev, res.data]);
			setShowForm(false);
			setAddTaskFailureMessage('');
		} catch (err) {
			if (err?.response?.status === 400) {
				setAddTaskFailureMessage(err.response.data.message);
				setShowForm(true);
			} else if (err?.response?.status === 500) {
				setShowServerError(true);
			} else {
				setShowForm(false);
			}
			console.log("$$$$$$$$$$$$$$", err);
		}
	};

	if (showServerError) {
		return <InternalServerError route="/login"/>
	}

	const onTaskEdited = async (newTitle, newDescription) => {
		const edited = {title: newTitle, description: newDescription};
		try {
			await axios.put(`/api/tasks/${taskIdToEdit}`, edited, {withCredentials: true});
			setTasks(prev => prev.map(task => task.id === taskIdToEdit ? {...task, title: newTitle, description: newDescription} : task));
		} catch(err) {
			console.log(err);
		}
	};

	const closeEditTaskForm = () => {
		setShowEditForm(false);
		setTaskIdToEdit(null);
		setTaskBeingEdited(null)
	}

	const onDelete = (id) => {
		setTaskIdToDelete(id);
		setShowDeleteAlert(true);
	};

	const onEdit = (task) => {
		setTaskBeingEdited(task)
		setTaskIdToEdit(task.id);
		setShowEditForm(true);
	};

	const onConfirm = async () => {
		try {
			await axios.delete(`/api/tasks/${taskIdToDelete}`, {withCredentials: true});
			setTasks(prev => prev.filter(task => task.id !== taskIdToDelete));
			setTaskIdToDelete(null);
			setShowDeleteAlert(false);
		} catch (err) {
			setShowDeleteAlert(false);
			console.log(err);
		}
	};


	const onCancel = () => {
		setShowDeleteAlert(false);
		setTaskIdToDelete(null);
	};

	return (
		<div className={styles.container}>

		<header className={styles.header}>
		  <Link href="/" className={styles.Link}>
		    <img src="icon.svg" className={styles.logo} />
		  </Link>
		  <h2 className={styles.slogan}>Productivity Starts Here</h2>
		</header>
		<hr className='hr'/>
		<div className={styles.nav}>
		  <button className={styles.addTask} onClick={() => setShowForm(true)}>Add Task</button>
		</div>

		{showForm && (
			<AddTaskModal
			  onClose={() => {setShowForm(false); setAddTaskFailureMessage('');}}
			  onTaskAdded={handleTaskAdded}
			  addTaskFailureMessage={addTaskFailureMessage}
			/>
		)}

		<div className={styles.tasks}>

		  {loading ? 
			  (<></>) :
			  errorMessage ? (<p className={styles.errorMessage}>{errorMessage}</p>) :
			  tasks.map(task => (
				  <TaskCard 
				    key={task.id}
				    task={task}
				    onDelete={() => onDelete(task.id)}
				    onEdit={() => onEdit(task)}
				  />
			  ))
		  }
		</div>

		{tasks.length === 0 && !showForm && !loading && (
			<div style={{ textAlign: "center", marginTop: "2rem", fontSize: "1.2rem", color: "#666" }}>
				<p>No task added yet!</p>
				<div className={styles["bounce-hint"]}>⬆️ Click "Add Task" to get started!</div>
			</div>
		)};

		{showEditForm && (
			<EditTaskForm
			  closeEditTaskForm={closeEditTaskForm}
			  onTaskEdited={onTaskEdited}
			  task={taskBeingEdited}
			/>
		)}

		{showDeleteAlert && (
			<DeleteTaskAlert onConfirm={onConfirm} onCancel={onCancel}/>
		)}

		<footer className={styles.footer}>
			<p style={{ color: "#fff", textAlign: "center", margin: 0, padding: "1rem" }}>
				&copy; {new Date().getFullYear()} Simple TODO. All rights reserved.
			</p>
		</footer>
		</div>
	);
}
