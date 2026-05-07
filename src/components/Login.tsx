import React, { useState } from 'react';
import { loginAccessTokenApiV1LoginAccessTokenPost, registerUserApiV1LoginSignupPost } from '../client';
import { auth } from '../lib/auth';

interface LoginProps {
    onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        
        auth.clearToken();

        try {
            if (isSignUp) {
                const { error: apiError } = await registerUserApiV1LoginSignupPost({
                    body: { email: username, password }
                });
                if (apiError) {
                    console.error('Signup API Error:', apiError);
                    const detail = (apiError as any).body?.detail;
                    setError(detail || 'Signup failed. Please try again.');
                } else {
                    alert('Signup successful! Please sign in.');
                    setIsSignUp(false);
                }
            } else {
                const { data, error: apiError } = await loginAccessTokenApiV1LoginAccessTokenPost({
                    body: { username, password },
                });

                if (apiError) {
                    const detail = (apiError as any).body?.detail;
                    if (detail === "Inactive user") {
                        setError('Your account is inactive. Please contact your Administrator.');
                    } else {
                        setError(detail || 'Login failed. Please check your credentials.');
                    }
                } else if (data?.access_token) {
                    auth.setToken(data.access_token);
                    onLoginSuccess();
                }
            }
        } catch (err) {
            setError('A network error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-[var(--bg)] p-10 rounded-xl border border-[var(--border)] shadow-[var(--shadow)]">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--text-h)]">
                        {isSignUp ? 'Create an account' : 'Sign in to your account'}
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[var(--border)] bg-[var(--bg)] placeholder-gray-500 text-[var(--text-h)] rounded-t-md focus:outline-none focus:ring-[var(--accent)] focus:border-[var(--accent)] focus:z-10 sm:text-sm"
                                placeholder="Username / Email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[var(--border)] bg-[var(--bg)] placeholder-gray-500 text-[var(--text-h)] rounded-b-md focus:outline-none focus:ring-[var(--accent)] focus:border-[var(--accent)] focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? 'opacity-50 cursor-not-allowed' : 'bg-[var(--accent)] hover:opacity-90'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] transition-all`}
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                isSignUp ? 'Sign up' : 'Sign in'
                            )}
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <button 
                            type="button" 
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-[var(--accent)] hover:underline"
                        >
                            {isSignUp ? 'Already have an account? Sign in' : 'Don\'t have an account? Sign up'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
