const User = require("../model/user");
exports.forgotPasswordUser = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    // Handle the case of missing email here if needed
    res
      .status(400)
      .json({ success: false, message: "Please provide a valid email!" });
    return;
  }

  const user = await User.findOne({ email });
  if (!user) {
    // Handle the case of user not found he re if needed
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  const token = await ResetToken.findOne({ owner: user._id });
  if (token) {
    // Handle the case where a token already exists
    res.status(400).json({
      success: false,
      message: "Token already exists. Check your email.",
    });
    return;
  }

  const randomBytes = await creatRandomBytes();
  const resetToken = new ResetToken({ owner: user._id, token: randomBytes });
  await resetToken.save();

  const url = `http://localhost:5173/PassForgotUser?token=${randomBytes}&id=${user._id}`;

  new SibApiV3Sdk.TransactionalEmailsApi()
    .sendTransacEmail({
      sender: { email: "harmonyadz@gmail.com", name: "Harmonya" },
      subject: "passwordreset",
      htmlContent: ResetPassEmail(url),
      to: [
        {
          email: user.email,
        },
      ],
    })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error(error);
    });

  res.json({
    success: true,
    message: "Password reset link is sent to your email.",
  });
};

// resetpassword user
exports.resetpassword = async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) return sendError(res, "user not found");
  const isSame = await user.comparePassword(password);
  if (isSame) return sendError(res, "New password Must be different");
  if (password.trim().length < 8 || password.trim().length > 20)
    return sendError(res, "password must be 8 to 20 caracters");
  user.password = password.trim();
  await user.save();
  await ResetToken.findOneAndDelete({ owner: user._id });
  res.status(200).json({
    success: true,
    message: "Password updated",
  });
};
