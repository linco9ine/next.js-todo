import styles from './Spinner.module.css';

export default function Spinner() {
	return (
		<div className={styles.container}>
		      <div className={styles.spinnerContainer}>
                <div className={styles.spinner}></div>
                <p className={styles.waitMessage}>Please wait...</p>
		      </div>
		</div>
	);
}
