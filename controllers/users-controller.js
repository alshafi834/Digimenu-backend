const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Customer = require("../models/customer-model");
const User = require("../models/users-model");
const Order = require("../models/order-model");
const Covid = require("../models/covidentry-model");
const Covidcase = require("../models/covidcase-model");

//Get the userlist
const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await Customer.find({}, "-password");
  } catch (error) {
    const err = new HttpError("Couldnt fetch user, please try again", 500);
    return next(err);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

//Sign up functionality
const signUp = async (req, res, next) => {
  console.log("entering here");
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid input passed, please check your data", 422)
    );
  }

  const { username, address, phone, email, password } = req.body;

  let isUserExist;
  try {
    isUserExist = await Customer.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Signup failed, please try again", 500);
    return next(err);
  }
  if (isUserExist) {
    const error = new HttpError(
      "User exists already, please login instead",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    const err = new HttpError("Could not create user, please try again!", 500);
    return next(error);
  }
  const createdCustomer = new Customer({
    username,
    address,
    phone,
    email,
    password: hashedPassword,
  });

  try {
    await createdCustomer.save();
  } catch (error) {
    const err = new HttpError("Signing up failed, please try again", 500);
    return next(err);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdCustomer.id, email: createdCustomer.email },
      "supersecret_boiler",
      { expiresIn: "1h" }
    );
  } catch (error) {
    const err = new HttpError("Signing up failed, please try again!", 500);
    return next(err);
  }

  res.status(201).json({
    userId: createdCustomer.id,
    email: createdCustomer.email,
    token: token,
  });
};

//Login functionality
const login = async (req, res, next) => {
  const { email, password } = req.body;

  let isUserExist;
  try {
    isUserExist = await Customer.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Login failed, please try again", 500);
    return next(err);
  }

  if (!isUserExist) {
    const error = new HttpError("Invalid username or password, try again", 401);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, isUserExist.password);
  } catch (error) {
    const err = new HttpError(
      "Could not log in, pleas check your credentials",
      500
    );
    return next(err);
  }

  if (!isValidPassword) {
    const error = new HttpError("Invalid username or password, try again", 401);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: isUserExist.id, email: isUserExist.email },
      "supersecret_boiler",
      { expiresIn: "1h" }
    );
  } catch (error) {
    const err = new HttpError("Login failed, please try again!", 500);
    return next(err);
  }

  res.json({ userId: isUserExist.id, email: isUserExist.email, token: token });
};

const getUserProfile = async (req, res, next) => {
  const { userID } = req.body;
  let userProfileInfo;

  try {
    userProfileInfo = await Customer.findOne({ _id: userID });
  } catch (error) {
    const err = new HttpError("Could not find the user with this email", 500);
    return next(err);
  }

  //console.log(userProfileInfo);
  res.json(userProfileInfo);
};

const editRestInfo = async (req, res, next) => {
  console.log(req.body);
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid input passed, please check your data", 422)
    );
  }

  const { email, category } = req.body;

  let isUserExist;
  try {
    isUserExist = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Invalid User", 500);
    return next(err);
  }

  /* let newCat = { catName: category };

  User.findOneAndUpdate({ email: email }, { $push: { categories: newCat } }); */

  var objFriends = { catName: category };
  User.findOneAndUpdate(
    { email: email },
    { $push: { categories: objFriends } },
    { new: true },
    function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("here is the suc", success);
        res.status(201).json(success.categories);
      }
    }
  );

  /* isUserExist.username = username;
  isUserExist.age = age;
  isUserExist.height = height;
  isUserExist.weight = weight; */
  //isUserExist.categories = newCat;

  /* if (isUserExist) {
    try {
      await isUserExist.save();
    } catch (error) {
      const err = new HttpError(
        "Couldn't update the user info, try again later",
        500
      );
      return next(err);
    }
  } */

  //res.status(201).json({ msg: "userinfo updated" });
};

const addFoodItem = async (req, res, next) => {
  console.log("here is the food", req.body);
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid input passed, please check your data", 422)
    );
  }

  const { email, fooditem, category } = req.body;

  let isUserExist;
  try {
    isUserExist = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Invalid User", 500);
    return next(err);
  }

  var objFriends = {
    foodName: fooditem.foodName,
    foodPrice: fooditem.foodPrice,
    foodCategory: category,
  };
  User.findOneAndUpdate(
    { email: email },
    { $push: { fooditems: objFriends } },
    { new: true },
    function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("here is the suc", success);
        res.status(201).json(success);
      }
    }
  );
};

const editCustProfileInfo = async (req, res, next) => {
  console.log(req.body);
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid input passed, please check your data", 422)
    );
  }

  const { customerproInfo } = req.body;

  let isUserExist;
  try {
    isUserExist = await Customer.findOne({ email: customerproInfo.email });
  } catch (error) {
    const err = new HttpError("Invalid User", 500);
    return next(err);
  }

  isUserExist.username = customerproInfo.username;
  isUserExist.address = customerproInfo.address;
  isUserExist.phone = customerproInfo.phone;
  isUserExist.email = customerproInfo.email;

  if (isUserExist) {
    try {
      await isUserExist.save();
    } catch (error) {
      const err = new HttpError(
        "Couldn't update the user info, try again later",
        500
      );
      return next(err);
    }
  }

  res.status(201).json({ msg: "Profile Info Updated Successfully!" });
};

const deleteCategory = async (req, res, next) => {
  const { email } = req.body;
  const catID = req.params.id;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid input passed, please check your data", 422)
    );
  }

  //var objFriends = { catName: category };
  User.findOneAndUpdate(
    { email: email },
    { $pull: { categories: { _id: catID } } },
    { new: true },
    function (error, success) {
      if (error) {
        console.log(error);
      } else {
        res.status(201).json(success.categories);
      }
    }
  );
};

const deleteFood = async (req, res, next) => {
  const { email } = req.body;
  const foodID = req.params.id;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid input passed, please check your data", 422)
    );
  }

  //var objFriends = { catName: category };
  User.findOneAndUpdate(
    { email: email },
    { $pull: { fooditems: { _id: foodID } } },
    { new: true },
    function (error, success) {
      if (error) {
        console.log(error);
      } else {
        res.status(201).json(success.fooditems);
      }
    }
  );
};

//------------------------------------------------------backend
const getFoodMenu = async (req, res, next) => {
  //const { userID } = req.body;
  const restId = req.params.restid;
  let restProfileInfo;

  try {
    restProfileInfo = await User.findOne({ _id: restId });
  } catch (error) {
    const err = new HttpError("Could not find the user with this email", 500);
    return next(err);
  }
  res.json(restProfileInfo);
};

const createOrder = async (req, res, next) => {
  console.log("here is the order", req.body);
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid input passed, please check your data", 422)
    );
  }

  const { fooditem, totalprice, userID, restId, orderDate } = req.body;

  /* let isUserExist;
  try {
    isUserExist = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Invalid User", 500);
    return next(err);
  } */

  /* var foodobj = {
    foodName: fooditem.foodName,
    foodPrice: fooditem.foodPrice,
    foodImage: fooditem.foodImage,
    foodCategory: fooditem.foodCategory,
    quantity: fooditem.quantity,
    qPrice: fooditem.qPrice,
  }; */
  const createdOrder = new Order({
    fooditems: fooditem,
    totalprice: totalprice,
    creator: userID,
    createdfor: restId,
    orderdate: orderDate,
    status: 0,
  });
  console.log("here is the created order", createdOrder);
  try {
    await createdOrder.save();
  } catch (error) {
    const err = new HttpError("Order creation failed, please try again", 500);
    return next(err);
  }

  res.status(201).json(createdOrder);
};

const getMyOrders = async (req, res, next) => {
  const userId = req.params.userid;
  let userOrders;

  try {
    userOrders = await Order.find({
      $and: [{ creator: userId }, { status: { $ne: 3 } }],
    }).sort([["orderdate", -1]]);
    //userOrders = await Order.find({ creator: userId });
  } catch (error) {
    const err = new HttpError("Could not find the user with this email", 500);
    return next(err);
  }
  res.json(userOrders);
};

const getMyCompletedOrders = async (req, res, next) => {
  const userId = req.params.userid;
  let userOrders;

  try {
    userOrders = await Order.find({
      $and: [{ creator: userId }, { status: { $eq: 3 } }],
    });
    //userOrders = await Order.find({ creator: userId });
  } catch (error) {
    const err = new HttpError("Could not find the user with this email", 500);
    return next(err);
  }
  res.json(userOrders);
};

const storeCovidData = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid input passed, please check your data", 422)
    );
  }

  const { name, email, phone, userid, restid, entrytime, leavingtime } =
    req.body;

  const createdEntry = new Covid({
    name: name,
    email: email,
    phone: phone,
    userid: userid,
    restid: restid,
    entrytime: entrytime,
    leavingtime: leavingtime,
  });
  console.log("here is the created order", createdEntry);
  try {
    await createdEntry.save();
  } catch (error) {
    const err = new HttpError("Order creation failed, please try again", 500);
    return next(err);
  }

  res.status(201).json(createdEntry);
};

const reportCovid = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid input passed, please check your data", 422)
    );
  }

  const { date, userID } = req.body;

  const createdCase = new Covidcase({
    date: date,
    userid: userID,
  });

  try {
    await createdCase.save();
  } catch (error) {
    const err = new HttpError("Order creation failed, please try again", 500);
    return next(err);
  }

  res.status(201).json({
    msg: "We are really sorry that you tested positive for COVID-19. Thanks for reporting the COVID case! We will notify others who are at the risk of getting virus!",
  });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
exports.getUserProfile = getUserProfile;
exports.editRestInfo = editRestInfo;
exports.addFoodItem = addFoodItem;
exports.editCustProfileInfo = editCustProfileInfo;
exports.deleteCategory = deleteCategory;
exports.deleteFood = deleteFood;
exports.getFoodMenu = getFoodMenu;
exports.createOrder = createOrder;
exports.getMyOrders = getMyOrders;
exports.getMyCompletedOrders = getMyCompletedOrders;
exports.storeCovidData = storeCovidData;
exports.reportCovid = reportCovid;
