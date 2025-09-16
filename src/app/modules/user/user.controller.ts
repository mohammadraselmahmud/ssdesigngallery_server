import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { userService } from './user.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User created successfully',
    data: { user: result },
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.login(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User login successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.geUserById(req?.user?.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'profile fetched successfully',
    data: result,
  });
});
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.forgotPassword(req?.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Forget password OTP send successfully!',
    data: result,
  });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.verifyOtp(req.query, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP verify successfully!',
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.updateUser(req.user.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

const updatePassword = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.updatePassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password updated successfully',
    data: result,
  });
});
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.changePassword(req.body, req.user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password change successfully',
    data: result,
  });
});

const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getAllUser(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users fetched successfully',
    data: result,
  });
});

// const getUserById = catchAsync(async (req: Request, res: Response) => {
//   const result = await userService.geUserById(req.params.id);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'User fetched successfully',
//     data: result,
//   });
// });

export const userController = {
  createUser,
  login,
  getMyProfile,
  forgotPassword,
  verifyOtp,
  updateUser,
  updatePassword,
  changePassword,

  getAllUser,
  // getUserById,
};
