import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { CreateUserRequestDto } from '@luetek/common-models';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useRef, useState } from 'react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useNavigate } from 'react-router-dom';
import Recaptcha from 'react-google-recaptcha';
import {
  GoogleOAuthProvider,
  TokenResponse,
  useGoogleLogin,
  UseGoogleLoginOptionsImplicitFlow,
  googleLogout,
} from '@react-oauth/google';

import './auth.scss';

function SignUpWithReact(props: UseGoogleLoginOptionsImplicitFlow) {
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
      Sign up with Google
    </button>
  );
}

export function SignUpPage() {
  const resolver = classValidatorResolver(CreateUserRequestDto);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserRequestDto>({
    defaultValues: new CreateUserRequestDto(),
    resolver,
  });
  const [apiError, setApiError] = useState<string>();
  const [apiMessage, setApiMessage] = useState<string>();
  const captchaRef = useRef<Recaptcha>();
  const password = watch('password');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitHandler = async (createUserDto: CreateUserRequestDto, event: any) => {
    event.preventDefault();
    if (!captchaRef.current) {
      setApiError('Captha Not available');
      return;
    }
    const recaptcha = captchaRef.current.getValue() as string;
    /*
    if (!recaptcha) {
      setApiMessage('Captcha failed');
      return;
    }
    */
    captchaRef.current.reset();
    try {
      setApiMessage('Creating User account.');
      const res = await axios.post('/api/users', createUserDto, { headers: { recaptcha } });
      if (res.status === 201) setApiMessage('User created successfully.');
      await new Promise((resolve) => {
        setTimeout(resolve, 3000);
      });
      googleLogout();
      navigate('/');
    } catch (err) {
      setApiError((err as Error).message);
    }
  };

  const onGoogleSignUpSuccess = async (credential: TokenResponse) => {
    setApiMessage('Creating User account.');
    const res = await axios.post('/api/users/google', credential);
    if (res.status === 201) setApiMessage('User created successfully.');
    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
    navigate('/');
  };

  const onGoogleSignUpFailure = async (error: Pick<TokenResponse, 'error' | 'error_description' | 'error_uri'>) => {
    setApiError(error.error_description);
  };

  return (
    <div className="create-user-page-form container">
      <GoogleOAuthProvider clientId={process.env.NX_GOOGLE_CLIENT_ID as string}>
        <SignUpWithReact onSuccess={onGoogleSignUpSuccess} onError={onGoogleSignUpFailure} />
      </GoogleOAuthProvider>
      <div className="w-100 text-center mt-2"> Or </div>
      <Form>
        <div className="row">
          <Form.Group className="mb-3 col-sm" controlId="createUser.firstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control type="text" placeholder="" {...register('firstName')} />
            {errors.firstName && <span>{errors.firstName.message}</span>}
          </Form.Group>
          <Form.Group className="mb-3 col-sm" controlId="createUser.lastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control type="text" placeholder="" {...register('lastName')} />
            {errors.lastName && <span>{errors.lastName.message}</span>}
          </Form.Group>
        </div>

        <div className="row">
          <Form.Group className="mb-3 col-sm" controlId="createUser.primaryEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" placeholder="" {...register('primaryEmail')} />
            {errors.primaryEmail && <span>{errors.primaryEmail.message}</span>}
          </Form.Group>
          <Form.Group className="mb-3 col-sm" controlId="createUser.username">
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" placeholder="" {...register('userName')} />
            {errors.userName && <span>{errors.userName.message}</span>}
          </Form.Group>
        </div>

        <div className="row">
          <Form.Group className="mb-3 col-sm" controlId="createUser.password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" {...register('password')} />
            {errors.password && <span>{errors.password.message}</span>}
          </Form.Group>

          <Form.Group className="mb-3 col-sm" controlId="createUser.repassword">
            <Form.Label>Re-enter Password</Form.Label>
            <Form.Control
              type="password"
              {...register('reenterPassword', { validate: (value) => password === value })}
            />
            {errors.reenterPassword && <span>{errors.reenterPassword.message}</span>}
          </Form.Group>
        </div>

        {apiError ? <div>{apiError}</div> : <div>{apiMessage}</div>}
        <div className="d-flex">
          <Recaptcha
            className="mb-3 mx-auto"
            sitekey={process.env.NX_GOOGLE_CAPTCHA_KEY as string}
            ref={captchaRef as React.LegacyRef<Recaptcha>}
          />
        </div>
        <Button
          className="create-user-submit-button"
          disabled={isSubmitting}
          type="submit"
          onClick={handleSubmit(submitHandler)}
        >
          Signup
        </Button>
      </Form>
    </div>
  );
}
