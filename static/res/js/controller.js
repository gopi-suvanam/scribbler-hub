import { fetchSubmittedRepos, saveUserProfileToFirestore, submitRepoForm,firebaseDB,firebaseSignout, firebaseSignin, firebaseAuth} from './firebase-auth.js'; // Import the fetchSubmittedRepos function
import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'; // Import Vue 3 from a CDN

// Import functions from libs.js
import { fetchUserProfile, fetchRepos, populateRepoDropdown } from './libs.js';




// Vue component
const app = createApp({
  data() {
    return {
      repos: [], // Array to store repositories with rank > 0
    };
  },
  async mounted() {
    // Fetch repositories with rank > 0 when the page loads
    await this.fetchRepos();
  },
  methods: {
    async fetchRepos() {
      try {
        // Use the fetchSubmittedRepos function to get the repositories
        this.repos = await fetchSubmittedRepos(firebaseDB);
      } catch (error) {
        console.error('Error fetching repositories:', error);
      }
    },
  },
});

// Mount the Vue app
app.mount('#app');


// Sign Out
document.getElementById('signOut').addEventListener('click', () => {
  
  firebaseSignout()
    .then(() => {
      console.log('User signed out');

      // Remove GitHub token from localStorage
      localStorage.removeItem('githubToken');

      // Hide sign-out button and clear repos
      document.getElementById('signOut').style.display = 'none';
	  document.getElementById('githubSignIn').style.display = 'block';
    })
    .catch((error) => {
      console.error('Error signing out:', error.message);
    });
});


// Sign In with GitHub
document.getElementById('githubSignIn').addEventListener('click', async () => {
	try{
		const authResult=await firebaseSignin() ;
		console.log('User signed in:', authResult.user);
		
		// Extract GitHub OAuth token from the credential

		const githubToken=authResult.githubToken;

		// Store the token in localStorage
		localStorage.setItem('githubToken', githubToken);
		console.log('GitHub token stored in localStorage:', githubToken);
		await populateRepoDropdown(githubToken);
	
		// Fetch user profile
		const profile=await fetchUserProfile(githubToken);
		const userId = firebaseAuth.currentUser.uid; // Firebase user ID
		const username = profile.login+'@github.com'; // GitHub username
		// Handle form submission
		await submitRepoForm(firebaseDB, userId,  profile.login);	
		
		const name = profile.name;
		const email = profile.email;
		// Save user profile to Firestore
		await saveUserProfileToFirestore(firebaseDB,userId, username, name, email);
		console.log('User profile saved successfully');
		

	}catch(error){console.error(error)};
});
