import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import './auth.scss';
import { PasswordAuthRequestDto } from '@luetek/common-models';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useNavigate } from 'react-router-dom';
import {
  GoogleOAuthProvider,
  TokenResponse,
  UseGoogleLoginOptionsImplicitFlow,
  useGoogleLogin,
} from '@react-oauth/google';
import { useAppDispatch } from '../store';
import { loginGoogleThunk, loginThunk } from './user-slice';

function LoginWithGoogle(props: UseGoogleLoginOptionsImplicitFlow) {
  const login = useGoogleLogin(props);

  return (
    <button
      className="btn btn-primary w-100"
      type="button"
      onClick={(event) => {
        event.preventDefault();
        login();
      }}
    >
      Login with Google
    </button>
  );
}

export function LoginPage() {
  const resolver = classValidatorResolver(PasswordAuthRequestDto);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordAuthRequestDto>({
    defaultValues: new PasswordAuthRequestDto(),
    resolver,
  });
  const [apiError, setApiError] = useState<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitHandler = async (passwordDto: PasswordAuthRequestDto, event: any) => {
    event.preventDefault();
    try {
      await dispatch(loginThunk(passwordDto)).unwrap();
      navigate('/');
    } catch (err) {
      setApiError((err as Error).message);
      reset();
    }
  };

  const onGoogleSignUpSuccess = async (credential: TokenResponse) => {
    try {
      await dispatch(loginGoogleThunk(credential)).unwrap();
      navigate('/');
    } catch (err) {
      setApiError((err as Error).message);
      reset();
    }
  };

  const onGoogleSignUpFailure = async (error: Pick<TokenResponse, 'error' | 'error_description' | 'error_uri'>) => {
    setApiError(error.error_description);
  };

  return (
    <div className="login-page-form">
      <div className="login-page-heading">Login</div>

      <GoogleOAuthProvider clientId={process.env.NX_GOOGLE_CLIENT_ID as string}>
        <LoginWithGoogle onSuccess={onGoogleSignUpSuccess} onError={onGoogleSignUpFailure} />
      </GoogleOAuthProvider>
      <Form>
        <Form.Group className="mb-3" controlId="login.username">
          <Form.Label>Username</Form.Label>
          <Form.Control type="text" placeholder="" {...register('username')} />
          {errors.username && <span>{errors.username.message}</span>}
        </Form.Group>
        <Form.Group className="mb-3" controlId="login.password">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" {...register('password')} />
          {errors.password && <span>{errors.password.message}</span>}
        </Form.Group>
        {apiError}
        <Button className="login-button" disabled={isSubmitting} type="submit" onClick={handleSubmit(submitHandler)}>
          Login
        </Button>
      </Form>
    </div>
  );
}
