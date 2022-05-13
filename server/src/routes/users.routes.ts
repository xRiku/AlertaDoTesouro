import { Router } from 'express';
import { sign, verify } from 'jsonwebtoken';
import CreateUserService from '../services/CreateUserService';
import UpdateUserService from '../services/UpdateUserService';
import DeleteUserService from '../services/DeleteUserService';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import Queue from '../services/Queue';
import SendConfirmAccountMail from '../jobs/SendConfirmAccountMail';
import SendResetPasswordMail from '../jobs/SendResetPasswordMail';
import authConfig from '../config/auth';
import { getRepository } from 'typeorm';
import User from '../models/User';

const usersRouter = Router();

/**
 * Repositories - business rules
 * Services - database
 */

// Reset password endpoint
usersRouter.post('/reset-password', async (request, response) => {
  try {
    const { email } = request.body;

    const usersRepository = getRepository(User);

    const checkIfUserExist = await usersRepository.findOne({
      where: { email },
    });

    if (checkIfUserExist) {
      // Create confirmation token so the user can confirm their account
      const EMAIL_SECRET = authConfig.jwt.secret;
      const emailToken = sign(
        {
          checkIfUserExist,
        },
        EMAIL_SECRET as string,
        {
          expiresIn: '1d', // TODO: maybe use env variable
        },
      );

      // Send reset password email
      await Queue.add(SendResetPasswordMail.key, {
        token: emailToken,
        user: checkIfUserExist,
      });

      // return response with status 200 and success message
      return response.status(200).json({
        message: 'Reset password email sent.',
      });
  } else {
      // return response with status 200 and success message
      return response.status(400).json({
        message: `User with email '${email}' not found.`,
      });
  }
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
});

// Create users endpoint
usersRouter.post('/', async (request, response, next) => {
  try {
    const { email, password } = request.body;

    const createUser = new CreateUserService();

    const user = await createUser.execute({ email, password });

    // Create confirmation token so the user can confirm their account
    const EMAIL_SECRET = authConfig.jwt.secret;
    const emailToken = sign(
      {
        user,
      },
      EMAIL_SECRET as string,
      {
        expiresIn: authConfig.jwt.expiresIn,
      },
    );

    // Send confirmation email
    await Queue.add(SendConfirmAccountMail.key, {
      token: emailToken,
      user: user,
    });

    return response.json(user);
  } catch (err) {
    if (err instanceof Error) {
      return response.status(400).json({ error: err.message });
    }
    next(err);
  }
});

usersRouter.use(ensureAuthenticated); // All user editing routes (below) require authentication

// Update user endpoint
usersRouter.put('/', async (request, response, next) => {
  try {
    const user_id = request.user.id;

    const {
      oldPassword,
      newPassword,
      newPasswordConfirmation,
      notify,
      notifyByEmail,
      notifyByBrowser,
    } = request.body;

    const updateUser = new UpdateUserService();

    const updated = await updateUser.execute(
      user_id,
      oldPassword,
      newPassword,
      newPasswordConfirmation,
      notify,
      notifyByEmail,
      notifyByBrowser,
    );
    return response.json({ ok: 'User was updated', updated });
  } catch (err) {
    if (err instanceof Error) {
      return response.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// Delete user endpoint
usersRouter.delete('/', async (request, response, next) => {
  try {
    // Delete the user who sent the request
    const user_id = request.user.id;

    const deleteUser = new DeleteUserService();

    const deleted = await deleteUser.execute(user_id);
    return response.json({ ok: 'User was deleted', deleted });
  } catch (err) {
    if (err instanceof Error) {
      return response.status(400).json({ error: err.message });
    }
    next(err);
  }
});

export default usersRouter;
