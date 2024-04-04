import { UpdateUserRequestDto, UserDto } from '@luetek/common-models';
import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useForm } from 'react-hook-form';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useSelector } from 'react-redux';
import { useAppDispatch, type RootState } from '../store';
import { getMe, updateMe } from './user-slice';

interface UserProfileViewProps {
  user: UserDto;
}

function ProfileView(props: UserProfileViewProps) {
  const { user } = props;
  if (!user) return 'Loading...';
  return (
    <div>
      <div className="container">
        <div className="row">
          <div className="col">Username</div>
          <div className="col text-end">{user?.userPassword?.userName || ''}</div>
        </div>
        <div className="row">
          <div className="col">Name</div>
          <div className="col text-end">
            {user.firstName} {user.lastName}
          </div>
        </div>
        <div className="row">
          <div className="col">Email</div>
          <div className="col text-end">{user.primaryEmail}</div>
        </div>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const userAccessToken = useSelector((state: RootState) => state.user);
  const user = userAccessToken.user as UserDto;
  const resolver = classValidatorResolver(UpdateUserRequestDto);
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserRequestDto>({
    resolver,
  });
  const [apiError, setApiError] = useState<string>();
  const [apiMessage, setApiMessage] = useState<string>();
  const [editable, setEditable] = useState<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitHandler = async (updateUserDto: UpdateUserRequestDto, event: any) => {
    event.preventDefault();
    setApiError(undefined);
    if (updateUserDto.password !== updateUserDto.renterPassword) {
      setApiError('Passwords dont match');
      return;
    }

    if (updateUserDto.password && updateUserDto.username === '') {
      setApiError('Username cannot be empty');
      return;
    }

    try {
      setApiMessage('Updating User account.');
      await dispatch(updateMe(updateUserDto)).unwrap();
      await new Promise((resolve) => {
        setTimeout(resolve, 3000);
      });
      setApiMessage('');
      setEditable(false);
      reset(user);
    } catch (err) {
      setApiError((err as Error).message);
    }
  };

  // Reload the user data once
  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);
  // Update the form every time user changes
  useEffect(() => {
    reset({ username: user.userPassword.userName, firstName: user.firstName, lastName: user.lastName });
  }, [user, reset]);

  if (!user) return 'Loading...';

  return (
    <div className="profile-page-form">
      <div className="profile-page-form-heading d-flex flex-row justify-content-between">
        <h1> Profile </h1>
        <button type="button" className="btn btn-link" onClick={() => setEditable(!editable)}>
          Edit Password
        </button>
      </div>
      <ProfileView user={user} />
      {editable && (
        <Form>
          <Form.Group className="mb-3" controlId="updateUser.username">
            <Form.Label>Password</Form.Label>
            <Form.Control type="text" {...register('username')} />
            {errors.username && <span>{errors.username.message}</span>}
          </Form.Group>
          <Form.Group className="mb-3" controlId="updateUser.password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" {...register('password')} />
            {errors.password && <span>{errors.password.message}</span>}
          </Form.Group>
          <Form.Group className="mb-3" controlId="updateUser.renterPassword">
            <Form.Label>Re-enter password</Form.Label>
            <Form.Control
              type="text"
              {...register('renterPassword', {
                validate: { passwordMatch: (pass) => getValues().password === pass || 'Password should match' },
              })}
            />
            {errors.renterPassword && <span>{errors.renterPassword.message}</span>}
          </Form.Group>
          {apiError ? <div>{apiError}</div> : <div>{apiMessage}</div>}
          <Button
            className="update-user-save-button"
            disabled={isSubmitting || !editable}
            type="submit"
            onClick={handleSubmit(submitHandler)}
          >
            Save
          </Button>
        </Form>
      )}
    </div>
  );
}
