import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const normalizeUser = (raw) => {
    if (!raw) return null;
    return {
      userId: raw.userId ?? raw.user_id,
      firstName: raw.firstName ?? raw.first_name,
      lastName: raw.lastName ?? raw.last_name,
      email: raw.email,
      role: raw.role
    };
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authService.verifyToken();
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: normalizeUser(response.user),
              token: token
            }
          });
        } catch (error) {
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { ...response, user: normalizeUser(response.user) }
      });
      return { success: true };
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      const validationErrors = error?.response?.data?.errors;
      const combined = validationErrors && Array.isArray(validationErrors)
        ? validationErrors.map(e => e.msg).join(', ')
        : undefined;
      return { success: false, error: apiMessage || combined || error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      localStorage.setItem('token', response.token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { ...response, user: normalizeUser(response.user) }
      });
      return { success: true };
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      const validationErrors = error?.response?.data?.errors;
      const combined = validationErrors && Array.isArray(validationErrors)
        ? validationErrors.map(e => e.msg).join(', ')
        : undefined;
      return { success: false, error: apiMessage || combined || error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
