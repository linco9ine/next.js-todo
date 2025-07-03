import {useState, useEffect} from 'react';
import styles from './AddTaskModal.module.css';
import Spinner from './Spinner.jsx';

export default function TaskAddModal({onClose, onTaskAdded, addTaskFailureMessage}) {
	const [newTitle, setNewTitle] = useState('');
	const [newDescription, setNewDescription] = useState('');
	const [showError, setShowError] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [showSpinner, setShowSpinner] = useState(false);

	useEffect(() => {
		if (addTaskFailureMessage) {
			setShowError(true);
			setErrorMessage(addTaskFailureMessage);
		}

	}, [addTaskFailureMessage]);
	

	const onSubmit = async (e) => {
		e.preventDefault();
		setShowSpinner(true);
		await onTaskAdded({
			title: newTitle,
			description: newDescription,
		});
		setShowSpinner(false);
	};

	return (
		<div className={styles.modalOverlay} onClick={onClose}>
		  {showSpinner && (<Spinner />)}
		  <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
		    <h3 className={styles.heading}>Add New Task</h3>

		    <form onSubmit={onSubmit} className={styles.form}>
		      {showError && (<div className={styles.errorDisplay}>{errorMessage}</div>)}
		      <input
		        type="text"
		        placeholder="Enter task title..."
		        value={newTitle}
		        onChange={(e) => setNewTitle(e.target.value)}
		        required
		      />

		      <textarea placeholder="Enter task description..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} required>
		      </textarea>

		      <div className={styles.buttonRow}>
		        <button type="button" onClick={onClose} className={styles.cancel}>Cancel</button>
		        <button type="submit" className={styles.add} onClick={onSubmit}>Add</button>
		      </div>

		    </form>
		  </div>
		</div>
	);
}
