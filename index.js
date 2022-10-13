// Import stylesheets
import './style.css';

// Firebase Imports
import 'firebase/compat/auth';
import firebase from 'firebase/compat/app';
import firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, addDoc, collection } from 'firebase/firestore';

// Document elements
const authStartButton = document.getElementById('auth-button');
const calendlyWidget = document.getElementById('calendly-widget');
const kycForm = document.getElementById('kyc-form');
const userName = document.getElementById('username');
const email = document.getElementById('email');
const address = document.getElementById('address');
const petname = document.getElementById('petname');
const complaint = document.getElementById('summary');
const formSubmitButton = document.getElementById('form-submit-btn');
const meetNowButton = document.getElementById('meet-now-btn');
const scheduleMeetButton = document.getElementById('meet-later-btn');

// Constants
// Your Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAHAUSF2UXi2PDuSO8RfJV-6aU9tXNM9ls',
  authDomain: 'fir-web-codelab-53937.firebaseapp.com',
  projectId: 'fir-web-codelab-53937',
  storageBucket: 'fir-web-codelab-53937.appspot.com',
  messagingSenderId: '935405943851',
  appId: '1:935405943851:web:34005ae4f6888895a4fe6e',
};

async function main() {
  const app = firebase.initializeApp(firebaseConfig);
  // Firebase DB setup, depends on firebase initializeApp call above.
  const db = getFirestore();

  const auth = firebase.auth();
  // To apply the default browser preference instead of explicitly setting it.
  auth.useDeviceLanguage();
  auth.settings.appVerificationDisabledForTesting = true; // Testing: // Turn off phone auth app verification.

  // FirebaseUI config
  const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [
      {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        recaptchaParameters: {
          type: 'image', // 'audio'
          size: 'normal', // 'invisible' or 'compact'
          badge: 'bottomleft', //' bottomright' or 'inline' applies to invisible.
        },
      },
      {
        provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        recaptchaParameters: {
          type: 'image', // 'audio'
          size: 'normal', // 'invisible' or 'compact'
          badge: 'bottomleft', //' bottomright' or 'inline' applies to invisible.
        },
        defaultCountry: 'IN', // Set default country to the India (+91).
        defaultNationalNumber: '1234567890',
        loginHint: '+911234567890',
      },
    ],
    callbacks: {
      signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        // Handle sign-in.
        kycForm.style.display = 'block';
        return false; // Return false to avoid redirect.
      },
      uiShown: function () {
        // The widget is rendered.
        console.log('FirebaseUI was shown');
      },
    },
    signInFlow: 'popup', // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    // signInSuccessUrl: '<url-to-redirect-to-on-success>',
    tosUrl: '<your-tos-url>', // Terms of service url.
    privacyPolicyUrl: '<your-privacy-policy-url>', // Privacy policy url.
  };

  // Initialize the FirebaseUI Widget using Firebase.
  const ui =
    firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
  authStartButton.addEventListener('click', () => {
    if (auth.currentUser) {
      // User is signed in; allows user to sign out
      signOut(auth)
        .then(() => {
          console.log('Sign-Out Success');
        })
        .catch((error) => {
          console.log('Sign-Out Error!');
          console.log(error);
        });
    } else {
      // No user is signed in; so allow user to sign in; Start FirebaseUI
      ui.start('#firebaseui-auth-container', uiConfig);
    }
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      authStartButton.textContent = 'LOGOUT';
    } else {
      authStartButton.textContent = 'LOGIN';
      calendlyWidget.style.display = 'none';
      // kycForm.style.display = 'none';
    }
  });

  // Listen to the form submission
  formSubmitButton.addEventListener('click', function (e) {
    e.preventDefault(); // Prevent the default form redirect

    // let username = auth.currentUser.displayName;
    // if (!username && username.length == 0) {
    //   username = userName.value;
    // }
    scheduleMeetButton.style.display = 'block';
    meetNowButton.style.display = 'block';

    // Write a new message to the database collection "customer-book"
    addDoc(collection(db, 'customer-book'), {
      userId: auth.currentUser.uid,
      name: userName.value,
      email: email.value,
      address: address.value,
      petname: petname.value,
      complaint: complaint.value,
      timestamp: Date.now(),
    })
      .then((docRef) => {
        console.log('Document succesfully Added');
      })
      .catch((err) => console.log(err));

    console.log('User name:', userName.value);
    console.log('Email:', email.value);
    createCalendlyWidget(calendlyWidget, userName.value, email.value);

    return false; // Return false to avoid redirect
  });

  window.addEventListener('message', async (e) => {
    if (isCalendlyEvent(e)) {
      /* Example to get the name of the event */
      console.log('Event name:', e.data.event);
      if (e.data.event === 'calendly.event_scheduled') {
        console.log('Custom:', e.data.event);
      }
      /* Example to get the payload of the event */
      console.log('Event details:', e.data.payload);
    }
  });

  meetNowButton.addEventListener('click', async (e) => {
    console.log('Meet now button clicked');

    // pul zoom create and start meeting link here
    // put razorpay offline button here
  });
  scheduleMeetButton.addEventListener('click', async (e) => {
    console.log('Schedule button clicked');
    // pul zoom create and start meeting link here
    calendlyWidget.style.display = 'block';
  });
}

function createCalendlyWidget(parent, username, email) {
  Calendly.initInlineWidget({
    url: 'https://calendly.com/peeyush-sharma-254/30min?hide_gdpr_banner=1',
    parentElement: parent,
    prefill: { name: username, email: email },
  });
}

function isCalendlyEvent(e) {
  return (
    e.origin === 'https://calendly.com' &&
    e.data.event &&
    e.data.event.indexOf('calendly.') === 0
  );
}

main();

// document.addEventListener('DOMContentLoaded', function () {
//   // kycForm.style.display = 'none';
//   calendlyWidget.style.display = 'none';
//   authStartButton.textContent = 'LOGIN';
// });
