import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './RegisterForm.module.css';
import InternalServerError from './InternalServerError.jsx';
import Spinner from './Spinner.jsx';

export default function RegisterForm() {
	const [uname, setUsername] = useState('');
	const [passwd, setPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [showError, setShowError] = useState(false);
	const [showServerError, setShowServerError] = useState(false);
	const [showSpinner, setShowSpinner] = useState(false);

	const router = useRouter();

	useEffect(() => {
		if (showServerError) {
			document.title = "500 Internal Server Error";
		}
	}, [showServerError]);

	useEffect(() => {
		document.title = "Create new account";
	}, []);

	if (showServerError) {
		return <InternalServerError />;
	}

	const handleSubmit = async (e) => {
		e.preventDefault();

		const data = { username: uname, password: passwd };
	
		try {
			setShowSpinner(true);
			const res = await axios.post('/api/register', data);
			setShowSpinner(false);
			console.log(res.data.message);
			console.log(res.status);
			router.push("/login");
		} catch (error) {
			if (error?.response?.status === 500) {
				setShowServerError(true);
			} else if (error?.response?.status === 409) {
				setErrorMessage(error?.response?.data?.message);
				setShowError(true);
			} else if (error?.response?.status === 400) {
				setErrorMessage(error?.response?.data?.message);
				setShowError(true);
			} else {
				setErrorMessage("Someting went wrong. please try again.");
				setShowError(true);
			}

			setShowSpinner(false);
			console.error(error);
		}
	};

	return (
		<div className={styles.container}>

		{showSpinner && (<Spinner />)}
		<form onSubmit={handleSubmit} className={styles['login-form']} autoComplete="off">
		  <img src="icon.svg" className={styles['todo-logo']} />

		  {showError && (<div className={styles.errorDisplay}>{errorMessage}</div>)}
		  
		  <label for="uname">Username</label>
		  <input type="text"
		         value={uname}
		         onChange={(e) => setUsername(e.target.value)}
		         placeholder="Enter username..."
		         name="user[email]"
		         autoComplete="off"
		         autoFocus
		         required
		  />

		  <label for="passwd">Password</label>
		  <input type="password"
		         value={passwd}
		         onChange={(e) => setPassword(e.target.value)}
		         placeholder="Enter password..." 
		         name="user[password]"
		         autoComplete="off"
		         required
		  />
		  <button type="submit" className={styles['register-button']} onClick={handleSubmit}>Sign Up</button>
		  <hr />
		  <Link href="/login" className={styles.Link}>Already have an account?</Link>
		</form>
		</div>
	);
}
