router.post("/passforgot", AuthUserController.forgotPasswordUser);
router.post(
  "/resetpass",
  isResetTokenValidUser,
  AuthUserController.resetpassword
);
