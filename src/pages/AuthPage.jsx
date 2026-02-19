import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "../lib/firebase";
import { applyAuthUser } from "../store/slices/authSlice";

export default function AuthPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const prefillEmail = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState(prefillEmail);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successText, setSuccessText] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (mode === "signup" && !name)) return;
    if (!isFirebaseConfigured) {
      setError("Firebase config missing. Add VITE_FIREBASE_* keys in .env.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessText("");

    try {
      const auth = getFirebaseAuth();

      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(cred.user, { displayName: name.trim() });
        }
        dispatch(applyAuthUser(cred.user));
        setSuccessText(`Account created. Logged in as ${cred.user.email || email}`);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        dispatch(applyAuthUser(cred.user));
        setSuccessText(`Login successful. Welcome back ${cred.user.email || email}`);
      }

      setSubmitted(true);
    } catch (err) {
      const msg = err?.message || "Authentication failed. Try again.";
      setError(msg.replace("Firebase: ", "").replace(/\(auth\/[a-z-]+\)\.?/g, "").trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4 py-lg-5 auth-page-wrap">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <section className="bg-white border rounded-0 shadow-sm reveal auth-card">
            <div className="row g-0">
              <div className="col-12 col-lg-5 border-end auth-side-panel p-3 p-lg-4">
                <div className="mb-3">
                  <Link to="/" className="btn btn-sm btn-outline-secondary rounded-0">
                    Back
                  </Link>
                </div>
                <div className="small text-uppercase text-secondary mb-2">Newsroom Access</div>
                <h1 className="fw-bold mb-2">Account Access</h1>
                <p className="text-secondary mb-3">
                  Login or create account for personalized briefings, saved topics, and faster reading flow.
                </p>
                <ul className="list-unstyled mb-0 small text-secondary d-grid gap-2">
                  <li>Live news alerts and updates</li>
                  <li>Saved stories and custom interests</li>
                  <li>One account across all sections</li>
                </ul>
              </div>

              <div className="col-12 col-lg-7 p-3 p-lg-4">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                  <div className="fw-semibold">Continue to your account</div>
                  <div className="btn-group">
                    <button
                      type="button"
                      className={`btn btn-sm rounded-0 ${mode === "signup" ? "btn-primary" : "btn-outline-secondary"}`}
                      onClick={() => setMode("signup")}
                    >
                      Sign Up
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm rounded-0 ${mode === "login" ? "btn-primary" : "btn-outline-secondary"}`}
                      onClick={() => setMode("login")}
                    >
                      Login
                    </button>
                  </div>
                </div>

                {submitted ? (
                  <div className="alert alert-success rounded-0 mb-0">
                    <div className="fw-semibold">Success</div>
                    <div className="small">{successText || `Logged in as ${email}`}</div>
                    <Link to="/" className="btn btn-sm btn-outline-secondary rounded-0 mt-2">
                      Back to Home
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="d-grid gap-3">
                    {error ? (
                      <div className="alert alert-danger rounded-0 py-2 mb-0" role="alert">
                        {error}
                      </div>
                    ) : null}

                    {!isFirebaseConfigured ? (
                      <div className="alert alert-warning rounded-0 py-2 mb-0" role="alert">
                        Firebase config missing in `.env`. Add `VITE_FIREBASE_*` values first.
                      </div>
                    ) : null}

                    {mode === "signup" ? (
                      <div>
                        <label className="form-label" htmlFor="auth-full-name">Full Name</label>
                        <input
                          id="auth-full-name"
                          name="fullName"
                          type="text"
                          className="form-control rounded-0"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                          required
                        />
                      </div>
                    ) : null}

                    <div>
                      <label className="form-label" htmlFor="auth-email">Email</label>
                      <input
                        id="auth-email"
                        name="email"
                        type="email"
                        className="form-control rounded-0"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@gmail.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label" htmlFor="auth-password">Password</label>
                      <input
                        id="auth-password"
                        name="password"
                        type="password"
                        className="form-control rounded-0"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        minLength={6}
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-primary fw-semibold rounded-0" disabled={submitting}>
                      {submitting ? "Please wait..." : mode === "signup" ? "Create Account" : "Login"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
