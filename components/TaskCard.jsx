import styles from './TaskCard.module.css';
import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useState } from 'react';
import axios from 'axios';

dayjs.extend(relativeTime);

const TaskCard = ({ task, onDelete, onEdit }) => {
  const { id, title, description, status: initialStatus, createdAt } = task;
  
  const [status, setStatus] = useState(initialStatus);
  
  const toggelStatus = async () => {
	  try {
		  await axios.put(`/api/tasks/${task.id}`, {status: !status}, {withCredentials: true});
		  setStatus(prev => !prev);
	  } catch (err) {
		  console.log(err);
	  }
  };

  return (
	  <div className={`${styles.card} ${status ? styles['task-completed'] : ''}`}>
	    <div className={styles['img-title']}>
	      <img src={status ? "completedLogo.svg" : 'timerLogo.svg'} className={styles.progressImage}/>
	      <h2 className={styles.title}>{title}</h2>
	    </div>

	    <p className={styles.description}>{description}</p>

	    <div className={styles['status-time']}>
	      <span className={styles[status]}>{ status ? 'Completed' : 'In Progress' }</span>
	      <span>Created <span className={styles.createdTime}>{dayjs(createdAt).fromNow()}</span></span>
	    </div>

	    <div className={styles['buttons']}>
	      <button className={styles.edit} onClick={onEdit}>Edit</button>
	      <button className={styles.delete} onClick={onDelete}>Delete</button>
	      <button className={styles[status ? 'undo' : 'done']} onClick={toggelStatus}>{status ? 'Undo' : 'Done'}</button>
	    </div>
	    
	  </div>
  );
};

export default TaskCard;

