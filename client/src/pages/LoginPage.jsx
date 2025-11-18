import { Image } from "antd";
import React, { useState } from "react";
import { Form, Input, Button } from "antd";
import signinLogo from "../assets/signinLogo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as UserService from "~/services/UserService";
import { useMutationHook } from "~/hooks/useMutationHook";
import Loading from "~/components/Loading";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { updateUser } from "~/store/userSlice";

const LoginPage = () => {
  const textStyle = {
    width: "100%",
    borderBottom: "1px solid rgb(224, 224, 224)",
    color: "rgb(36,36,36)",
    outline: "none",
    fontSize: "14px",
  };

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isDisabled = !email.length || !password.length;
  const dispatch = useDispatch();
  const location = useLocation();

  const mutation = useMutationHook((data) => UserService.loginUser(data));
  const { data, isPending, isError, error } = mutation;

  const handleOnChangeEmail = (e) => setEmail(e.target.value);
  const handleOnChangePass = (e) => setPassword(e.target.value);

  const handleSignIn = () => {
    if (!email || !password) return;
    mutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          Swal.fire({
            icon: "success",
            title: data?.message,
            text: "Chào mừng bạn quay trở lại!",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff393b",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: true,
            allowOutsideClick: false,
          }).then(() => {
            setEmail("");
            setPassword("");

            //console.log("location: ", location);
            if (location?.state) {
              navigate(location?.state);
            } else {
              navigate("/");
            }
            localStorage.setItem("access_token", data?.accessToken);
            if (data?.accessToken) {
              const decoded = jwtDecode(data?.accessToken);
              if (decoded?.userId) {
                handleGetDetailUser(decoded?.userId, data?.accessToken);
              }
            }
          });
        },
        onError: (error) => {
          Swal.fire({
            icon: "error",
            title: error.response?.data?.message,
            text: "Có lỗi xảy ra",
            confirmButtonColor: "#ff393b",
          });
        },
      }
    );
  };

  const handleGetDetailUser = async (userId, token) => {
    const res = await UserService.getDetailUser(userId, token);
    dispatch(updateUser({ ...res?.data, accessToken: token }));
  };

  const getBackendErrorMessage = () =>
    isError && error?.response?.data?.message
      ? error.response.data.message
      : null;

  const getEmailError = () => {
    const msg = getBackendErrorMessage();
    return msg?.includes("Email ko tồn tại!") ? msg : null;
  };

  const getPasswordError = () => {
    const msg = getBackendErrorMessage();
    return msg?.includes("Mật khẩu ko chính xác!") ? msg : null;
  };

  const emailError = getEmailError();
  const passwordError = getPasswordError();

  return (
    <div className="flex justify-center items-center bg-[rgba(0,0,0,0.53)] min-h-screen px-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl rounded-lg overflow-hidden shadow-lg bg-white">
        {/* Left Side */}
        <div className="w-full md:w-3/5 p-6 md:p-10 bg-white">
          <h4 className="text-2xl font-semibold mb-3">Xin chào,</h4>
          <p className="mb-4 text-gray-600">Đăng nhập tài khoản</p>
          <Form onFinish={handleSignIn}>
            <div className="mb-3">
              <Input
                style={textStyle}
                type="email"
                value={email}
                onChange={handleOnChangeEmail}
                placeholder="Nhập email..."
                required
              />
              {emailError && (
                <span className="text-red-500 text-xs block mt-1">
                  {emailError}
                </span>
              )}
            </div>

            <div className="mb-3">
              <Input.Password
                style={textStyle}
                value={password}
                onChange={handleOnChangePass}
                placeholder="Nhập mật khẩu..."
                required
              />
              {passwordError && (
                <span className="text-red-500 text-xs block mt-1">
                  {passwordError}
                </span>
              )}
            </div>

            <Loading isPending={isPending}>
              <Button
                type="primary"
                htmlType="submit"
                disabled={isDisabled}
                className="h-11 w-full border-none rounded !text-white font-bold !bg-[rgb(255,57,59)] hover:!bg-[rgb(255,67,69)] disabled:!bg-[#ccc] disabled:!text-[#666] mt-6"
              >
                Đăng nhập
              </Button>
            </Loading>
          </Form>

          <p className="text-[13px] mt-5 text-blue-600 cursor-pointer">
            Quên mật khẩu
          </p>
          <p className="text-[13px] mt-5 text-gray-600">
            Chưa có tài khoản?
            <Link to="/register">
              <span className="ml-1 text-blue-600 cursor-pointer">
                Tạo tài khoản
              </span>
            </Link>
          </p>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-2/5 bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-6">
          <Image
            width={160}
            height={160}
            src={signinLogo}
            preview={false}
            alt="Sign in logo"
          />
          <h4 className="mt-4 text-lg font-medium">Mua sắm tại Tiki</h4>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
