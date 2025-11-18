import { Button, Form, Input, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Loading from "~/components/Loading";
import { useMutationHook } from "~/hooks/useMutationHook";
import { updateUserToken } from "~/services/UserService";
import { getBase64 } from "~/util";

const UserInfoPage = () => {
  const textStyle = {
    borderBottom: "1px solid rgb(224, 224, 224)",
    color: "rgb(36,36,36)",
    outline: "none",
    fontSize: "14px",
  };
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username);
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState(user.address);
  const [avatar, setAvatar] = useState(user.avatar);

  const mutation = useMutationHook(({ id, data }) => updateUserToken(id, data));
  const { data, isPending, isError, error } = mutation;

  // console.log("data: ", data);

  // Fixed onChange handlers - sử dụng e.target.value
  const handleOnChangeEmail = (e) => {
    setEmail(e.target.value);
  };
  const handleOnChangeUsername = (e) => {
    setUsername(e.target.value);
  };
  const handleOnChangePhone = (e) => {
    setPhone(e.target.value);
  };
  const handleOnChangeAddress = (e) => {
    setAddress(e.target.value);
  };

  useEffect(() => {
    setEmail(user?.email);
    setUsername(user?.username);
    setPhone(user?.phone);
    setAddress(user?.address);
    setAvatar(user?.avatar);
  }, [user]);

  const handleChangeAvatar = async ({ fileList }) => {
    const file = fileList[0];
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setAvatar(file.preview);
  };

  const handleUpdateUser = () => {
    const userId = user?.id || user?._id;
    const updateData = { email, username, phone, address, avatar };
    // console.log("Phone state:", phone);
    // console.log("Update data object:", updateData);
    mutation.mutate(
      { id: userId, data: updateData },
      {
        onSuccess: (data) => {
          console.log("Login success:", data);
          // Hiển thị thông báo thành công với SweetAlert2
          Swal.fire({
            icon: "success",
            title: data?.message,
            text: "Hoàn thành cập nhật thông tin tài khoản!",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff393b",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: true,
            allowOutsideClick: false,
          }).then(() => {
            // Có thể thêm redirect ở đây
            navigate("/user-profile");
          });
        },
      }
    );
  };

  return (
    <div className="w-[1270px] mx-auto h-[500px]">
      <h1 className="text-black text-lg text-center my-1">
        Thông tin người dùng
      </h1>
      {/* Wrapper content profile */}
      <Loading isPending={isPending}>
        <div className="flex flex-col border-[1px] border-solid border-[#ccc] w-[600px] mx-auto p-[30px] rounded-[10px] gap-[20px]">
          <Form onFinish={handleUpdateUser}>
            <div className="flex items-center gap-[20px] mb-[15px]">
              <label
                htmlFor="email"
                className="text-black w-[100px] text-left text-xs/[30px] font-semibold"
              >
                Email
              </label>
              <Input
                id="email"
                style={textStyle}
                type="email"
                value={email}
                onChange={handleOnChangeEmail}
                className="antd-input-custom w-[300px]"
              />
            </div>
            <div className="flex items-center gap-[20px] mb-[15px]">
              <label
                htmlFor="username"
                className="text-black w-[100px] text-left text-xs/[30px] font-semibold"
              >
                Username
              </label>
              <Input
                id="username"
                style={textStyle}
                type="text" // Fixed: changed from email to text
                value={username}
                onChange={handleOnChangeUsername}
                className="antd-input-custom w-[300px]"
              />
            </div>
            <div className="flex items-center gap-[20px] mb-[15px]">
              <label
                htmlFor="phone"
                className="text-black w-[100px] text-left text-xs/[30px] font-semibold"
              >
                Điện thoại
              </label>
              <Input
                id="phone"
                style={textStyle}
                type="tel" // Fixed: changed from number to tel
                value={phone}
                placeholder="Cập nhật số điện thoại..."
                onChange={handleOnChangePhone}
                className="antd-input-custom w-[300px]"
              />
            </div>
            <div className="flex items-center gap-[20px] mb-[15px]">
              <label
                htmlFor="address"
                className="text-black w-[100px] text-left text-xs/[30px] font-semibold"
              >
                Địa chỉ
              </label>
              <Input
                id="address"
                style={textStyle}
                type="text" // Fixed: changed from number to text
                value={address}
                placeholder="Cập nhật địa chỉ..."
                onChange={handleOnChangeAddress}
                className="antd-input-custom w-[300px]"
              />
            </div>
            <div className="flex items-center gap-[20px] mb-[15px]">
              <label
                htmlFor="avatar"
                className="text-black w-[100px] text-left text-xs/[30px] font-semibold"
              >
                Avatar
              </label>
              <Upload
                showUploadList={false}
                onChange={handleChangeAvatar}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Chọn tệp</Button>
              </Upload>
              {avatar && (
                <img
                  className="h-[60px] w-[60px] rounded-lg object-cover"
                  src={avatar}
                  alt="User-avatar"
                />
              )}
            </div>
            <div className="flex items-center gap-[20px] mb-[15px]">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="w-fit px-[6px] py-1 h-[30px] border-[1px] border-solid border-[rgb(26,148,255)] bg-white rounded text-[rgb(26,148,255)] text-[15px] font-bold"
              >
                Cập nhật
              </Button>
            </div>
          </Form>
        </div>
      </Loading>
    </div>
  );
};

export default UserInfoPage;
