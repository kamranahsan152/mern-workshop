const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ msg: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hash,
    });

    res
      .cookie("token", signToken(user), cookieOptions)
      .status(201)
      .json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) return res.status(400).json({ msg: "Invalid credentials" });

    res
      .cookie("token", signToken(user), cookieOptions)
      .status(200)
      .json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
