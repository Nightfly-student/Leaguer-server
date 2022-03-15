import express from "express";
import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { generateToken, isAdmin, isAuth } from "../utils.js";
import e from "express";

const userRouter = express.Router();

//GetUser//
userRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res, next) => {
    try {
      if (req.params.id === req.user._id) {
        const user = await User.findById(req.params.id);
        if (user) {
          res.status(200).send({
            name: user.name,
            email: user.email,
          });
        } else {
          res.status(404).send({ message: "No User Found" });
        }
      } else {
        res.status(401).send({ message: "Invalid User" });
      }
    } catch (err) {
      next(err);
    }
  })
);

//Login//
userRouter.post(
  "/login",
  expressAsyncHandler(async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        if (bcrypt.compareSync(req.body.password, user.password)) {
          res.status(200).send({
            _id: user._id,
            isAdmin: user.isAdmin,
            token: generateToken(user),
          });
        } else {
          res.status(409).send({ message: "Invalid email or password" });
        }
      } else {
        res.status(409).send({ message: "Invalid email or password" });
      }
    } catch (err) {
      next(err);
    }
  })
);

//Register User//
userRouter.post(
  "/register",
  expressAsyncHandler(async (req, res, next) => {
    try {
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
      });
      const createdUser = await user.save();

      res.status(201).send(true);
    } catch (err) {
      if (err.code && err.code == 11000) {
        const field = Object.keys(err.keyValue);
        return res
          .status(409)
          .send({ message: `An account with that ${field} already exists.` });
      }
      next(err);
    }
  })
);

//update password//
userRouter.put(
  "/:id/password",
  isAuth,
  expressAsyncHandler(async (req, res, next) => {
    try {
      if (req.user._id === req.params.id) {
        const user = await User.findById(req.params.id);
        if (user) {
          const matched = await bcrypt.compare(req.body.oldPass, user.password);
          const matchedNew = await bcrypt.compare(
            req.body.newPass,
            user.password
          );
          if (matched) {
            if (!matchedNew) {
              user.password = req.body.newPass
                ? bcrypt.hashSync(req.body.newPass)
                : user.password;
              await user.save();
              res.status(200).send({ message: "Updated Password" });
            } else {
              res
                .status(409)
                .send({ message: "New Password is same as Old Password" });
            }
          } else {
            res.status(409).send({ message: "Old Password is incorrect" });
          }
        } else {
          res.status(404).send({ message: "No User Found" });
        }
      } else {
        res.status(401).send({ message: "Invalid User" });
      }
    } catch (err) {
      next(err);
    }
  })
);
//update username//
userRouter.put(
  "/:id/username",
  isAuth,
  expressAsyncHandler(async (req, res, next) => {
    try {
      if (req.user._id === req.params.id) {
        const user = await User.findById(req.params.id);
        if (user) {
          if (user.name != req.body.name) {
            user.name = req.body.name;
            await user.save();
            res.status(200).send({ message: "Updated Username" });
          } else {
            res
              .status(409)
              .send({ message: "New And Old Username Are The Same" });
          }
        } else {
          res.status(404).send({ message: "No User Found" });
        }
      } else {
        res.status(401).send({ message: "Invalid User" });
      }
    } catch (err) {
      if (err.code && err.code == 11000) {
        const field = Object.keys(err.keyValue);
        return res
          .status(409)
          .send({ message: `An account with that ${field} already exists.` });
      }
      next(err);
    }
  })
);

//update email//
userRouter.put(
  "/:id/email",
  isAuth,
  expressAsyncHandler(async (req, res, next) => {
    try {
      if (req.user._id === req.params.id) {
        const user = await User.findById(req.params.id);
        if (user) {
          if (user.email != req.body.email) {
            user.email = req.body.email;
            await user.save();
            res.status(200).send({ message: "Updated Email" });
          } else {
            res.status(409).send({ message: "New And Old Email Are The Same" });
          }
        } else {
          res.status(404).send({ message: "No User Found" });
        }
      } else {
        res.status(401).send({ message: "Invalid User" });
      }
    } catch (err) {
      if (err.code && err.code == 11000) {
        const field = Object.keys(err.keyValue);
        return res
          .status(409)
          .send({ message: `An account with that ${field} already exists.` });
      }
      next(err);
    }
  })
);

//secure delete user//
userRouter.delete(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res, next) => {
    try {
      if (req.user._id === req.params.id) {
        const user = await User.findByIdAndDelete(req.params.id);
        if (user) {
          res.status(200).send({ message: "Successfully Deleted Account" });
        } else {
          res.status(409).send({ message: "Invalid Account" });
        }
      } else {
        res.status(401).send({ message: "Invalid User" });
      }
    } catch (err) {
      next(err);
    }
  })
);

//get all users//
userRouter.get(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res, next) => {
    try {
      const users = await User.find({});
      if (users) {
        res.status(200).send(users);
      } else {
        res.status(404).send({ message: "No Users Found" });
      }
    } catch (err) {
      next(err);
    }
  })
);

// delete admin route //
userRouter.delete(
  "/:id/admin",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res, next) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (user) {
        res.status(200).send({ message: "Deleted Account" });
      } else {
        res.status(404).send({ message: "Account Not Found" });
      }
    } catch (err) {
      next(err);
    }
  })
);

// Update Role User //
userRouter.put(
  "/:id/admin",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (user) {
        user.isAdmin = req.body.state;
        const updatedUser = user.save();
        res.status(200).send({ message: "Updated Role" });
      } else {
        res.status(404).send({ message: "Can't Find user" });
      }
    } catch (err) {
      next(err);
    }
  })
);

export default userRouter;
