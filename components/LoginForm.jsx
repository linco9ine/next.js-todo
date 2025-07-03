import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './LoginForm.module.css';
import InternalServerError from './InternalServerError.jsx';
import Spinner from './Spinner.jsx';

export default function LoginForm() {
	const [uname, setUsername] = useState('');
	const [passwd, setPassword] = useState('');
	const [showError, setShowError] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [showServerError, setShowServerError] = useState(false);
	const [showSpinner, setShowSpinner] = useState(false);

	const router = useRouter();

	useEffect(() => {
		document.title = "Login";
	});

	useEffect(() => {
		if (showServerError) document.title = "500 Internal Server Error";
	}, [showServerError]);

	if (showServerError) {
		return <InternalServerError />;
	}

	const handleSubmit = async (e) => {
		e.preventDefault();

		const data = { username: uname, password: passwd };

		try {
			setShowSpinner(true);
			await axios.post('/api/login', data, {withCredentials: true});
			setShowSpinner(false);
			router.push('/');
		

		} catch (error) {
			if (error?.response?.status === 500) {
				setShowServerError(true);
			} else if (error?.response?.status === 401) {
				setErrorMessage("Invalid username or password");
				setShowError(true);
			} else if (error?.response?.status === 400) {
				setErrorMessage("Invalid request");
				setShowError(true);
			} else {
				setErrorMessage("Something went wrong, please try again");
				setShowError(true);
			}

			setShowSpinner(false);
			console.error(error);
		}
	};

	return (
		<div className={styles.container}>
		
		{showSpinner && (<Spinner />)}

		<form onSubmit={handleSubmit} className={styles['login-form']}>
		<img src="icon.svg" className={styles['todo-logo']} />
		
		  {showError && (<div className={styles.errorDisplay}>{errorMessage}</div>)}

		  <label>Username</label>
		  <input type="text"
		         value={uname}
		         onChange={(e) => setUsername(e.target.value)}
		         placeholder="Enter username..."
		         name="user[email]"
		         autoComplete="off"
		         autoFocus
		         required
		  />
		  
		  <label>Password</label>
		  <input type="password"
		         value={passwd}
		         onChange={(e) => setPassword(e.target.value)}
		         placeholder="Enter password..."
		         name="user[password]"
		         autoComplete="off"
		         required
		  />
		  <button type="submit" className={styles['login-button']} onClick={handleSubmit}>Log In</button>
		  <hr />
		  <Link href="/register" className={styles.Link}>Create new account</Link>
		</form>
		</div>
	);
}
