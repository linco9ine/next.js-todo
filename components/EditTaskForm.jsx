import {useState, useEffect} from 'react';
import styles from './EditTaskForm.module.css';

export default function EditTaskForm({closeEditTaskForm, onTaskEdited, task}) {
	const [newTitle, setNewTitle] = useState(task.title);
	const [newDescription, setNewDescription] = useState(task.description);

	  useEffect(() => {
		  setNewTitle(task.title);
		  setNewDescription(task.description);
	  }, [task]);

	const onSubmit = (e) => {
		e.preventDefault();
		onTaskEdited(newTitle, newDescription);
		closeEditTaskForm();
	};

	return (
		<div className={styles.modalOverlay} onClick={closeEditTaskForm}>
		  <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
		    <h3 className={styles.heading}>Edit Task</h3>
		    <form onSubmit={onSubmit} className={styles.form}>
		      <input
		        type="text"
		        value={newTitle}
		        onChange={(e) => setNewTitle(e.target.value)}
		        required
		      />

		      <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} required>
		      </textarea>

		      <div className={styles.buttonRow}>
		        <button type="button" onClick={closeEditTaskForm} className={styles.cancel}>Cancel</button>
		        <button type="submit" className={styles.edit} onClick={onSubmit}>Edit</button>
		      </div>

		    </form>
		  </div>
		</div>
	);
}
