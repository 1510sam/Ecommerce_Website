import AddCircleIcon from "@mui/icons-material/AddCircleOutline";
import React, { useEffect, useRef, useState } from "react";
import TableComponent from "../AdminUser/components/TableComponent";
import ModalComponent from "../Modal/ModalComponent";
import { Button, Form, Input, Modal, Space, Upload } from "antd";
import Loading from "../Loading";
import Swal from "sweetalert2";
import * as UserService from "~/services/UserService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useMutationHook } from "~/hooks/useMutationHook";
import Drawer from "../Drawer/Drawer";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import { getBase64 } from "~/util";

const AdminUser = () => {
  const queryClient = useQueryClient();
  // Place for set state
  const [openModal, setOpenModal] = useState(false);
  const [rowSelected, setRowSelected] = useState("");
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isPendingUpdate, setIsPendingUpdate] = useState(false);
  const [stateUser, setStateUser] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    isAdmin: false,
  });
  const [stateUserDetails, setStateUserDetails] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    isAdmin: false,
  });

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const user = useSelector((state) => state?.user);

  const [addForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  const mutation = useMutationHook(({ data }) => {
    const token = localStorage.getItem("access_token");
    return UserService.registerUser(data, token);
  });

  const mutationUpdate = useMutationHook((updateData) => {
    //console.log("Data mutate: ", updateData);
    const { id, token, ...rests } = updateData;
    // const token = localStorage.getItem("access_token");
    const res = UserService.updateUser(id, token, rests);
    return res;
  });

  const mutationDeleteMany = useMutationHook(({ token, ...ids }) => {
    return UserService.deleteManyUsers(token, ids);
  });

  const getAllUsers = async () => {
    const token = user?.accessToken;
    const res = await UserService.getAllUsers(token);
    return res;
  };

  // Lấy thông tin sp chi tiết
  const fetchGetDetailsUser = async (rowSelected) => {
    const res = await UserService.getDetailUser(rowSelected);
    console.log("res data: ", res?.userData);

    if (res?.userData) {
      setStateUserDetails({
        username: res?.userData.username,
        email: res?.userData.email,
        phone: res?.userData.phone,
        address: res?.userData.address,
        isAdmin: res?.userData.isAdmin,
      });
    }
    setIsPendingUpdate(false);
  };

  useEffect(() => {
    updateForm.setFieldsValue(stateUserDetails);
  }, [updateForm, stateUserDetails]);

  useEffect(() => {
    if (rowSelected) {
      fetchGetDetailsUser(rowSelected);
    }
  }, [rowSelected]);

  //console.log(">>State product detail: ", stateUserDetails);
  const { data, isPending, isError, error } = mutation;
  const {
    data: dataUpdated,
    isPending: isPendingUpdated,
    isError: isErrorUpdated,
    error: errorUpdated,
  } = mutationUpdate;

  const mutationDelete = useMutationHook(({ id, token }) => {
    return UserService.deleteUser(id, token);
  });
  const {
    data: dataDeleted,
    isPending: isPendingDeleted,
    isError: isErrorDeleted,
    error: errorDeleted,
  } = mutationDelete;

  const {
    data: dataDeletedMany,
    isPending: isPendingDeletedMany,
    isError: isErrorDeletedMany,
    error: errorDeletedMany,
  } = mutationDeleteMany;

  //console.log("Data updated: ", dataDeleted);
  console.log("Data deleted: ", dataDeleted);
  console.log("Data deleted many user: ", dataDeletedMany);

  const handleDetailsUser = () => {
    if (rowSelected) {
      setIsPendingUpdate(true);
      fetchGetDetailsUser(rowSelected);
    }
    setIsOpenDrawer(true);
    //console.log(">>Get detail product: ", rowSelected);
  };

  const renderAction = (text, record) => {
    return (
      <div>
        <DeleteOutlined
          className="text-3xl text-red-500 cursor-pointer hover:opacity-70"
          onClick={() => onDeleteUser(record._id)}
        />
        <EditOutlined
          className="text-3xl text-red-500 cursor-pointer hover:opacity-70"
          onClick={handleDetailsUser}
        />
      </div>
    );
  };

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => {
    setOpenModal(false);
  };

  const queryUser = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });
  const { isPending: isPendingUser, data: users } = queryUser;

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => {
            var _a;
            return (_a = searchInput.current) === null || _a === void 0
              ? void 0
              : _a.select();
          }, 100);
        }
      },
    },
  });

  const columns = [
    {
      title: "Tên người dùng",
      dataIndex: "username",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.username.length - b.username.length,
      ...getColumnSearchProps("username"),
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.email.length - b.email.length,
      ...getColumnSearchProps("email"),
    },
    {
      title: "Số điện thoại liên hệ",
      dataIndex: "phone",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.phone - b.phone,
      ...getColumnSearchProps("phone"),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.address - b.address,
      ...getColumnSearchProps("address"),
    },
    {
      title: "Phân quyền",
      dataIndex: "isAdmin",
      filters: [
        {
          text: "True",
          value: true,
        },
        {
          text: "False",
          value: false,
        },
      ],
    },
    {
      title: "Tác vụ",
      dataIndex: "action",
      render: renderAction,
    },
  ];
  const dataTable = Array.isArray(users?.data)
    ? users.data.map((user) => ({
        ...user,
        key: user._id,
        isAdmin: user.isAdmin ? "ADMIN" : "USER",
      }))
    : [];

  // Add user action
  const onFinish = (values) => {
    const userData = {
      username: values.username, // map đúng key
      email: values.email,
      phone: Number(values.phone),
      address: values.address,
      isAdmin: values.isAdmin,
    };
    mutation.mutate(
      { data: userData },
      {
        onSuccess: (data) => {
          Swal.fire({
            icon: "success",
            title: data?.message,
            text: "Đã thêm người dùng mới!",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff393b",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: true,
            allowOutsideClick: false,
          }).then(() => {
            addForm.resetFields();
            setStateUser({
              username: "",
              email: "",
              phone: "",
              address: "",
              isAdmin: "",
            });
            handleClose();
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

  // Update user action
  const onUpdateUser = () => {
    mutationUpdate.mutate(
      {
        id: rowSelected,
        token: user?.accessToken,
        ...stateUserDetails,
      },
      {
        onSettled: () => {
          queryUser.refetch();
        },
        onSuccess: (data) => {
          Swal.fire({
            icon: "success",
            title: data?.message || "Cập nhật thành công",
            text: "Thông tin người dùng đã được cập nhật!",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff393b",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: true,
            allowOutsideClick: false,
          }).then(() => {
            setIsOpenDrawer(false);
            queryClient.invalidateQueries(["users"]);
          });
        },
        onError: (error) => {
          Swal.fire({
            icon: "error",
            title: error.response?.data?.message || "Cập nhật thất bại",
            text: "Đã xảy ra lỗi khi cập nhật người dùng",
            confirmButtonColor: "#ff393b",
          });
        },
      }
    );
  };

  // Delete user action
  const onDeleteUser = (userId) => {
    Swal.fire({
      title: "Bạn có chắc muốn xóa user này?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        mutationDelete.mutate(
          {
            id: userId,
            token: user?.accessToken,
          },
          {
            onSuccess: (data) => {
              Swal.fire({
                icon: "success",
                title: "Đã xóa!",
                text: data?.message || "User đã được xóa thành công!",
                timer: 2000,
                timerProgressBar: true,
                confirmButtonColor: "#ff393b",
              });
              queryUser.refetch();
            },
            onError: (error) => {
              Swal.fire({
                icon: "error",
                title: "Xóa thất bại",
                text: error.response?.data?.message || "Đã xảy ra lỗi khi xóa!",
                confirmButtonColor: "#ff393b",
              });
            },
          }
        );
      }
    });
  };

  // Delete many product action
  const onDeleteManyUser = (ids) => {
    mutationDeleteMany.mutate(
      {
        ids: ids,
        token: user?.accessToken,
      },
      {
        onSuccess: (data) => {
          Swal.fire({
            icon: "success",
            title: "Đã xóa!",
            text: data?.message || "Tài khoản đã được xóa thành công!",
            timer: 2000,
            timerProgressBar: true,
            confirmButtonColor: "#ff393b",
          });
          queryUser.refetch();
        },
        onError: (error) => {
          Swal.fire({
            icon: "error",
            title: "Xóa thất bại",
            text: error.response?.data?.message || "Đã xảy ra lỗi khi xóa!",
            confirmButtonColor: "#ff393b",
          });
        },
      }
    );
  };

  const handleAdd = () => {
    addForm.submit();
  };

  const handleUpdate = () => {
    updateForm.submit();
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setStateUser({
      ...stateUser,
      [name]: value,
    });
  };

  const handleOnChangeDetails = (e) => {
    const { name, value } = e.target;
    setStateUserDetails({
      ...stateUserDetails,
      [name]: value,
    });
  };
  const handleChangeAvatar = async ({ fileList }) => {
    const file = fileList[0];
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setStateUser({
      ...stateUser,
      image: file.preview,
    });
  };

  const handleChangeAvatarDetails = async ({ fileList }) => {
    const file = fileList[0];
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setStateUserDetails({
      ...stateUserDetails,
      image: file.preview,
    });
  };
  return (
    <header>
      <h1 className="text-black text-[14px]">Quản lý người dùng</h1>
      <div className="mt-[10px]">
        <Button
          onClick={handleOpen}
          style={{
            height: 150,
            width: 150,
            borderRadius: 2,
            border: "2px dashed #eee",
          }}
        >
          <AddCircleIcon className="text-black" fontSize="large" />
        </Button>
      </div>

      <div className="mt-4">
        <TableComponent
          handleDeleteMany={onDeleteManyUser}
          columns={columns}
          isPending={isPendingUser}
          data={dataTable}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                setRowSelected(record._id);
              }, // click row
            };
          }}
        />
      </div>

      {/* Thêm người dùng */}
      <ModalComponent
        title="Thêm mới người dùng"
        closable={{ "aria-label": "Custom Close Button" }}
        open={openModal}
        onCancel={handleClose}
        footer={null}
      >
        {/* Content */}
        <Loading isPending={isPending}>
          <Form
            form={addForm}
            name="basic"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="Tên người dùng"
              name="username"
              rules={[{ required: true, message: "Nhập tên người dùng!" }]}
            >
              <Input
                name="username"
                value={stateUser.username}
                onChange={handleOnChange}
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Nhập email!" }]}
            >
              <Input
                name="email"
                value={stateUser.email}
                onChange={handleOnChange}
              />
            </Form.Item>

            <Form.Item
              label="Số điện thoại liên hệ"
              name="phone"
              rules={[{ required: true, message: "Nhập số liên hệ!" }]}
            >
              <Input
                name="phone"
                value={stateUser.phone}
                onChange={handleOnChange}
              />
            </Form.Item>

            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: "Nhập địa chỉ người dùng!" }]}
            >
              <Input
                name="address"
                value={stateUser.address}
                onChange={handleOnChange}
              />
            </Form.Item>

            <Form.Item label="Phân quyền" name="isAdmin">
              <Input
                name="isAdmin"
                value={stateUser.isAdmin}
                onChange={handleOnChange}
              />
            </Form.Item>

            <Form.Item label="Avatar" name="image">
              <div className="flex items-center gap-4">
                <Upload
                  showUploadList={false}
                  onChange={handleChangeAvatar}
                  maxCount={1}
                >
                  <Button>Chọn tệp</Button>
                </Upload>

                {stateUser?.image && (
                  <img
                    className="h-[60px] w-[60px] ml-[10px] rounded-lg object-cover"
                    src={stateUser?.image}
                    alt="Product img"
                  />
                )}
              </div>
            </Form.Item>

            <Form.Item wrapperCol={{ span: 24 }}>
              <div className="flex justify-end">
                <Button type="primary" onClick={handleAdd}>
                  Thêm mới
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Loading>
      </ModalComponent>

      <Drawer
        title="Chi tiết người dùng"
        placement="right"
        isOpen={isOpenDrawer}
        onClose={() => setIsOpenDrawer(false)}
      >
        <Loading isPending={isPendingUpdate || isPendingUpdated}>
          <Form
            form={updateForm}
            name="basic"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onUpdateUser}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label="Tên người dùng"
              name="username"
              rules={[{ required: true, message: "Nhập tên người dùng!" }]}
            >
              <Input
                name="username"
                value={stateUserDetails.username}
                onChange={handleOnChangeDetails}
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Nhập email!" }]}
            >
              <Input
                name="email"
                value={stateUserDetails.email}
                onChange={handleOnChangeDetails}
              />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[{ required: true, message: "Nhập số điện thoại" }]}
            >
              <Input
                name="phone"
                value={stateUserDetails.phone}
                onChange={handleOnChangeDetails}
              />
            </Form.Item>

            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: "Nhập địa chỉ!" }]}
            >
              <Input
                name="address"
                value={stateUserDetails.address}
                onChange={handleOnChangeDetails}
              />
            </Form.Item>
            <Form.Item wrapperCol={{ span: 24 }}>
              <div className="flex justify-end">
                <Button type="primary" onClick={handleUpdate}>
                  Cập nhật
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Loading>
      </Drawer>
    </header>
  );
};

export default AdminUser;
