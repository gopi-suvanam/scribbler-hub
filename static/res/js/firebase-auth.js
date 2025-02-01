// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GithubAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDocs , setDoc, getDoc, collection, query, where  } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"; // Import Firestore modules


// Import functions from libs.js
import { fetchUserProfile, fetchRepos, populateRepoDropdown } from './libs.js';


// Your Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCjy_jdFEEbxtDWtyyrz4IrqNjdoSxreNM",
    authDomain: "scribbler-hub.firebaseapp.com",
    projectId: "scribbler-hub",
    storageBucket: "scribbler-hub.firebasestorage.app",
    messagingSenderId: "129391602559",
    appId: "1:129391602559:web:cec81af1e325381ed8c84a",
    measurementId: "G-Z2Q7M0T5K2"
  };



// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDB = getFirestore(firebaseApp); // Initialize Firestore
// GitHub Provider
const provider = new GithubAuthProvider();
//provider.addScope('public_repo'); // Read-only access to public repositories
provider.addScope('read:user');   // Access to read user profile data (name)
provider.addScope('user:email');  // Access to read user email addresses



// Function to save user profile to Firestore
export async function saveUserProfileToFirestore(db, userId, username, name, email) {
  // Create a reference to the document using the username as the document ID
  const userRef = doc(db, 'users', username);


    // Check if the document already exists
	try{
		const docSnap = await getDoc(userRef);
		if (docSnap.exists()) {
			throw new Error('Username already exists');
		} else {
		  // Save the user profile
		  console.log("test",{
			userId,
			name,
			email,
			username,
		  });
		  await setDoc(userRef, {
			userId,
			name,
			email,
			username,
		  });
		  console.log('User profile saved to Firestore');
		}
	
	}catch(err){
		console.log("test",{
			userId,
			name,
			email,
			username,
		  });
		  await setDoc(userRef, {
			userId,
			name,
			email,
			username,
		  });
		  console.log('User profile saved to Firestore');
	}
    /**/

}

// Submit the form to Firestore using AJAX
 export async function submitRepoForm(db, userId, githubUsername) {
  const form = document.getElementById('repo-form');
  const dropdown = document.getElementById('repo-dropdown');
  const messageDiv = document.getElementById('message');

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    const repoName = dropdown.value;
    if (!repoName) {
      messageDiv.textContent = 'Please select a repository';
      messageDiv.style.color = 'red';
      return;
    }

    try {
      // Prepare the data to be submitted
      const repoData = {
        userId,
        githubUsername,
        repoName,
		rank: 0, // Set rank to 0 by default
        timestamp: new Date(),
      };

      // Save the repository to Firestore
      const repoRef = doc(db, 'submittedRepos', `${githubUsername}_${repoName}`); // Use a unique document ID
      await setDoc(repoRef, repoData);

      // Display success message
      messageDiv.textContent = 'Repository submitted successfully!';
      messageDiv.style.color = 'green';

      // Clear the dropdown selection (optional)
      dropdown.value = '';
    } catch (error) {
      // Display error message
      messageDiv.textContent = `Error submitting repository: ${error.message}`;
      messageDiv.style.color = 'red';
    }
  });
}


export async function fetchSubmittedRepos(db){
	 try {
		// Query Firestore for repositories with rank > 0
		const reposRef = collection(db, 'submittedRepos');
		const q = query(reposRef, where('rank', '>', 0));
		const querySnapshot = await getDocs(q);

		// Map the query results to the repos array
		const repos = querySnapshot.docs.map((doc) => doc.data());
		return repos;
	  } catch (error) {
		console.error('Error fetching repositories:', error);
	  }
}


export async function firebaseSignout(){
	return signOut(firebaseAuth);
}
export async function firebaseSignin(){
	const authResult=await signInWithPopup(firebaseAuth, provider);
	const user= authResult.user;
	const credential = GithubAuthProvider.credentialFromResult(authResult);
	const githubToken = credential.accessToken;
	return {user, githubToken};
}
// Track Authentication State
onAuthStateChanged(firebaseAuth, (user) => {
  if (user) {
    console.log('User is logged in:', user);

    // Retrieve GitHub token from localStorage
    const githubToken = localStorage.getItem('githubToken');
    if (githubToken) {
      console.log('GitHub token retrieved from localStorage:', githubToken);
		
      // Fetch and display user's public repositories
      populateRepoDropdown(githubToken);
	  // Handle form submission
	  const userId = firebaseAuth.currentUser.uid;
	  // Fetch user profile
		fetchUserProfile(githubToken).then(profile=> submitRepoForm(firebaseDB, userId, profile.login));
    }

    // Show sign-out button
    document.getElementById('signOut').style.display = 'block';
	document.getElementById('githubSignIn').style.display = 'none';
	
  } else {
    console.log('User is logged out');

    // Hide sign-out button and clear repos
    document.getElementById('signOut').style.display = 'none';
	document.getElementById('githubSignIn').style.display = 'block';
  }
});

