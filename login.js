
import { auth, db } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    sendPasswordResetEmail,
    signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const emailForm = document.getElementById("emailForm");
const phoneForm = document.getElementById("phoneForm");
const message = document.getElementById("message");
const emailTab = document.getElementById("emailTab");
const phoneTab = document.getElementById("phoneTab");

let verifier = null;
let confirmation = null;

function showMessage(text, success = false) {
    message.textContent = text;
    message.style.color = success ? "#087f45" : "#b42318";
}

emailTab.addEventListener("click", () => {
    emailForm.hidden = false;
    phoneForm.hidden = true;
    emailTab.classList.add("active");
    phoneTab.classList.remove("active");
    showMessage("");
});

phoneTab.addEventListener("click", () => {
    emailForm.hidden = true;
    phoneForm.hidden = false;
    phoneTab.classList.add("active");
    emailTab.classList.remove("active");
    showMessage("");
});

async function checkMember(user) {
    const profileRef = doc(db, "teamMembers", user.uid);
    const snapshot = await getDoc(profileRef);

    if (!snapshot.exists() || snapshot.data().active !== true) {
        await signOut(auth);
        throw new Error(
            "Your account is not approved. Please contact the administrator."
        );
    }

    window.location.replace("dashboard.html");
}

emailForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = emailForm.querySelector('button[type="submit"]');
    button.disabled = true;
    showMessage("Checking your account...", true);

    try {
        const result = await signInWithEmailAndPassword(
            auth,
            document.getElementById("email").value.trim(),
            document.getElementById("password").value
        );

        await checkMember(result.user);
    } catch (error) {
        showMessage(error.code === "permission-denied"
            ? "Profile access denied. Check your Firestore rules."
            : error.message || "Login failed.");
    } finally {
        button.disabled = false;
    }
});

document.getElementById("resetButton").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();

    if (!email) {
        showMessage("Enter your registered email address first.");
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        showMessage(
            "If this account is eligible, a password reset email will be sent.",
            true
        );
    } catch (error) {
        showMessage("Unable to request a reset. Check your settings and try again.");
    }
});

document.getElementById("sendOtp").addEventListener("click", async (event) => {
    event.preventDefault();

    const phone = document.getElementById("phone").value.trim();
    const button = document.getElementById("sendOtp");

    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
        showMessage("Enter a valid international mobile number, such as +919876543210.");
        return;
    }

    button.disabled = true;

    try {
        if (verifier) {
            await verifier.clear();
            verifier = null;
        }

        verifier = new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {}
        );

        await verifier.render();

        confirmation = await signInWithPhoneNumber(auth, phone, verifier);

        document.getElementById("otpSection").hidden = false;
        showMessage("OTP sent. Check your mobile phone.", true);
    } catch (error) {
        showMessage(
            "OTP could not be sent. Check the authorized domain, reCAPTCHA and Firebase phone settings."
        );

        if (verifier) {
            await verifier.clear().catch(() => {});
            verifier = null;
        }
    } finally {
        button.disabled = false;
    }
});

document.getElementById("verifyOtp").addEventListener("click", async () => {
    const otp = document.getElementById("otp").value.trim();

    if (!confirmation || !/^\d{6}$/.test(otp)) {
        showMessage("Enter the six-digit verification code.");
        return;
    }

    try {
        showMessage("Verifying your number...", true);
        const result = await confirmation.confirm(otp);
        await checkMember(result.user);
    } catch (error) {
        showMessage(
            error.code === "permission-denied"
                ? "Profile access denied. Check your Firestore rules."
                : error.message || "OTP verification failed."
        );
    }
});
