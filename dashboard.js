
import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const welcome = document.getElementById("welcome");
const profile = document.getElementById("profile");
const dashboardMessage = document.getElementById("dashboardMessage");

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.replace("login.html");
        return;
    }

    try {
        const profileRef = doc(db, "teamMembers", user.uid);
        const snapshot = await getDoc(profileRef);

        if (!snapshot.exists() || snapshot.data().active !== true) {
            await signOut(auth);
            window.location.replace("login.html");
            return;
        }

        const member = snapshot.data();

        document.getElementById("memberName").textContent =
            member.name || "Team Member";

        document.getElementById("memberRole").textContent =
            member.role || "Marketing Executive";

        document.getElementById("memberArea").textContent =
            member.area || "Not assigned";

        document.getElementById("memberEmail").textContent =
            user.email || "Not linked";

        document.getElementById("memberPhone").textContent =
            user.phoneNumber || "Not linked";

        welcome.textContent = "Welcome to your personal dashboard.";
        profile.hidden = false;
    } catch (error) {
        welcome.textContent = "Unable to load your profile.";
        dashboardMessage.textContent =
            "Please check your Firebase connection and security rules.";
    }
});

document.getElementById("logoutButton").addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.replace("login.html");
    } catch (error) {
        dashboardMessage.textContent = "Logout failed. Please try again.";
    }
});
