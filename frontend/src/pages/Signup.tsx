import { createUserWithEmailAndPassword } from "firebase/auth";
import { sendEmailVerification } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import LinkButton from "../components/common/LinkButton";

export default function Signup() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (
      !firstName ||
      !lastName ||
      !dob ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const account = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await sendEmailVerification(account.user);

      await setDoc(doc(db, "accounts", account.user.uid), {
        uid: account.user.uid,
        firstName,
        lastName,
        dob,
        email,
        createdAt: serverTimestamp(),
      });

      setSuccessMsg(
        "New account created successfully. \n " +
          "Check your email and click the verification link to authenticate your account. \n" +
          "You will be directed to Login page shortly...",
      );

      setTimeout(() => {
        navigate("/auth/login");
      }, 5000);
    } catch (err: any) {
      setError(err?.message ?? "Signup failed.");
    }
  }

  return (
    <div>
      <h1>Signup</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>First name</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
          />
        </div>

        <div>
          <label>Last name</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
          />
        </div>

        <div>
          <label>Date of birth</label>
          <input
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            type="date"
          />
        </div>

        <div>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
          />
        </div>

        <div>
          <label>Confirm your password</label>
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            placeholder="Confirm password"
          />
        </div>

        {successMsg && <p>{successMsg}</p>}
        {error && <p>{error}</p>}

        {/* clicking this triggers onSubmit automatically */}
        <Button name="Sign up" type="submit" onClick={() => {}} />
      </form>

      <Button
        name="Return to Homepage"
        type="button"
        onClick={() => navigate("/")}
      />

      <LinkButton
        text="Already have an account?"
        onClick={() => navigate("/auth/login")}
      />
    </div>
  );
}
