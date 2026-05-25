
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { UserRole } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import Logo from './common/Logo';

const SignUpScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const { signUp } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phoneNumber && role && password) {
      signUp(name, phoneNumber, role, password);
      alert('Sign up successful! Your account is pending verification by a Reporting Authority. Please check back later.');
      navigate('/login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-900">
      <Card className="w-full max-w-md">
        <Logo className="w-20 h-20 mx-auto mb-4 text-2xl" />
        <h2 className="text-3xl font-bold text-center text-white mb-2">Create New Account</h2>
        <p className="text-center text-gray-400 mb-6">Join CIL VC Connect</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
            <input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              required
              className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label htmlFor="role-signup" className="block text-sm font-medium text-gray-300 mb-2">Select Role</label>
            <select
              id="role-signup"
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              required
              className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="" disabled>-- Select a role --</option>
              {Object.values(UserRole).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={!name || !phoneNumber || !role || !password}>
            Sign Up
          </Button>
        </form>
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-cyan-400 hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default SignUpScreen;
