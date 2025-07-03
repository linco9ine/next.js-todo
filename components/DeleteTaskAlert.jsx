import styles from './DeleteTaskAlert.module.css';

export default function DeleteTaskAlert({onConfirm, onCancel}) {
    return (
        <div className={styles.modalOverlay} onClick={onCancel}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.heading}>Confirm Delete</h3>
		    <p className={styles.text}>Remove task permanently?</p>

              <div className={styles.buttonRow}>
                <button type="button" onClick={onCancel} className={styles.no}>No</button>
                <button type="button" className={styles.yes} onClick={onConfirm}>Yes</button>
              </div>

          </div>
        </div>
    );
}
