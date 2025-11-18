import React, { useState } from "react";
import { Image } from "antd";
import { Form, Input, Button } from "antd";
import signinLogo from "../assets/signinLogo.png";
import { Link } from "react-router-dom";
import * as UserService from "~/services/UserService";
import { useMutationHook } from "~/hooks/useMutationHook";
import Loading from "~/components/Loading";
import Swal from "sweetalert2";

const RegisterPage = () => {
  const textStyle = {
    width: "100%",
    borderBottom: "1px solid rgb(224, 224, 224)",
    color: "rgb(36,36,36)",
    outline: "none",
    fontSize: "14px",
  };
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isDisabled =
    !email.length ||
    !username.length ||
    !password.length ||
    !confirmPassword.length;

  const handleOnChangeEmail = (e) => {
    setEmail(e.target.value);
  };
  const handleOnChangeUsername = (e) => {
    setUsername(e.target.value);
  };
  const handleOnChangePass = (e) => {
    setPassword(e.target.value);
  };
  const handleOnChangeConfirmPass = (e) => {
    setConfirmPassword(e.target.value);
  };
  const mutation = useMutationHook((data) => UserService.registerUser(data));
  const { data, isPending, isError, error } = mutation;

  const handleSignUp = () => {
    if (!email || !username || !password || !confirmPassword) {
      console.log("Email or password is empty");
      return;
    }
    mutation.mutate(
      { email, username, password, confirmPassword },
      {
        onSuccess: (data) => {
          console.log("Register success:", data);
          // Hiển thị thông báo thành công với SweetAlert2
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
            // Reset form sau khi đăng nhập thành công
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            // Có thể thêm redirect ở đây
            window.location.href = "/login";
          });
        },
        onError: (error) => {
          console.log("Login error:", error);
          // Có thể thêm xử lý lỗi bằng SweetAlert2 nếu muốn
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
  const getBackendErrorMessage = () => {
    // Khi có lỗi từ backend, message nằm trong error.response.data
    if (isError && error?.response?.data?.message) {
      return error.response.data.message;
    }
    return null;
  };

  const getEmailError = () => {
    const backendMessage = getBackendErrorMessage();
    if (backendMessage && backendMessage.includes("Email ko hợp lệ!")) {
      return backendMessage;
    }
    return null;
  };

  const getUsernameError = () => {
    const backendMessage = getBackendErrorMessage();
    if (backendMessage && backendMessage.includes("Username đã tồn tại!")) {
      return backendMessage;
    }
    return null;
  };

  const getPasswordError = () => {
    const backendMessage = getBackendErrorMessage();
    if (backendMessage && backendMessage.includes("Mật khẩu ko chính xác!")) {
      return backendMessage;
    }
    return null;
  };

  const getConfirmPasswordError = () => {
    const backendMessage = getBackendErrorMessage();
    if (backendMessage && backendMessage.includes("Password ko trùng nhau!")) {
      return backendMessage;
    }
    return null;
  };

  const emailError = getEmailError();
  const usernameError = getUsernameError();
  const passwordError = getPasswordError();
  const confirmPasswordError = getConfirmPasswordError();
  return (
    <div className="flex justify-center items-center bg-[rgba(0,0,0,0.53)] h-[100vh]">
      <div className="flex w-[800px] h-[445px] rounded-md, bg-white">
        {/* Left side */}
        <div
          style={{
            padding: "40px 45px 24px",
            borderRadius: "20px 0px 0px 20px",
          }}
          className="w-[500px] bg-[rgb(255,255,255)]"
        >
          <h4 className="text-2xl font-medium mb-[10px]">Xin chào,</h4>
          <p className="mb-[10px]">Đăng ký tài khoản</p>
          <Form onFinish={handleSignUp}>
            <div className="relative z-10 mb-[15px]">
              <Input
                style={textStyle}
                type="email"
                value={email}
                onChange={handleOnChangeEmail}
                placeholder="Nhập email..."
                required
                className="antd-input-custom" // Để override style nếu cần
              />
            </div>
            {emailError && (
              <span className="text-red-500 text-xs my-1 block">
                {emailError}
              </span>
            )}
            <div className="relative z-10 mb-[15px]">
              <Input
                style={textStyle}
                type="text"
                value={username}
                onChange={handleOnChangeUsername}
                placeholder="Nhập username..."
                required
                className="antd-input-custom" // Để override style nếu cần
              />
            </div>
            {usernameError && (
              <span className="text-red-500 text-xs my-1 block">
                {usernameError}
              </span>
            )}
            <div className="relative z-10 mb-[15px]">
              <Input.Password
                style={textStyle}
                value={password}
                onChange={handleOnChangePass}
                placeholder="Nhập mật khẩu..."
                required
                className="antd-input-custom"
              />
            </div>
            {passwordError && (
              <span className="text-red-500 text-xs my-1 block">
                {passwordError}
              </span>
            )}
            <div className="relative z-10 mb-[15px]">
              <Input.Password
                style={textStyle}
                value={confirmPassword}
                onChange={handleOnChangeConfirmPass}
                placeholder="Xác nhận mật khẩu..."
                required
                className="antd-input-custom"
              />
            </div>
            {confirmPasswordError && (
              <span className="text-red-500 text-xs my-1 block">
                {confirmPasswordError}
              </span>
            )}
            <Loading isPending={isPending}>
              <Button
                type="primary"
                htmlType="submit"
                disabled={isDisabled}
                size="large"
                className="h-12 w-full border-none rounded !text-white font-bold !bg-[rgb(255,57,59)] hover:!bg-[rgb(255,67,69)] disabled:!bg-[#ccc] disabled:!text-[#666]"
                style={{
                  margin: "26px 0 10px",
                }}
              >
                Đăng ký
              </Button>
            </Loading>
          </Form>
          <p
            style={{ color: "rgb(120, 120, 120)" }}
            className="text-[13px] mt-5"
          >
            Đã có tài khoản?
            <Link to="/login">
              <span
                style={{ color: "rgb(13, 92, 182)" }}
                className="inline-block ml-[5px] cursor-pointer"
              >
                Đăng nhập
              </span>
            </Link>
          </p>
        </div>
        {/* Right side */}
        <div
          style={{
            background:
              "linear-gradient(136deg, rgb(240, 248, 255) -1%, rgb(219, 238, 255) 85%)",
          }}
          className="w-[300px] flex justify-center items-center flex-col"
        >
          <Image
            width={203}
            height={203}
            src={signinLogo}
            preview="false"
            alt="Sign in logo"
          />
          <h4>Mua sắm tại Tiki</h4>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
