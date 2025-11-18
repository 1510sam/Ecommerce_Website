import AddCircleIcon from "@mui/icons-material/AddCircleOutline";
import React, { useEffect, useRef, useState } from "react";
import TableComponent from "../AdminUser/components/TableComponent";
import { Button, Form, Input, Modal, Select, Space, Upload } from "antd";
import { getBase64, renderOptions } from "~/util";
import * as ProductService from "~/services/ProductService";
import { useMutationHook } from "~/hooks/useMutationHook";
import Loading from "../Loading";
import Swal from "sweetalert2";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { DeleteOutlined, EditOutlined } from "@mui/icons-material";
import { SearchOutlined } from "@ant-design/icons";
import Drawer from "../Drawer/Drawer";
import { useSelector } from "react-redux";
import ModalComponent from "../Modal/ModalComponent";

const AdminProduct = () => {
  const queryClient = useQueryClient();
  // Place for set state
  const [openModal, setOpenModal] = useState(false);
  const [rowSelected, setRowSelected] = useState("");
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isPendingUpdate, setIsPendingUpdate] = useState(false);
  const [stateProduct, setStateProduct] = useState({
    productName: "",
    type: "",
    price: "",
    countInStock: "",
    description: "",
    image: "",
    rating: "",
    discount: "",
  });
  const [stateProductDetails, setStateProductDetails] = useState({
    name: "",
    type: "",
    price: "",
    countInStock: "",
    description: "",
    image: "",
    rating: "",
    discount: "",
  });
  const [typeSelect, setTypeSelect] = useState("");

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const user = useSelector((state) => state?.user);

  const [addForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  const mutation = useMutationHook(({ data }) => {
    const token = localStorage.getItem("access_token");
    return ProductService.createProduct(data, token);
  });

  const mutationUpdate = useMutationHook((updateData) => {
    console.log("Data mutate: ", updateData);
    const { id, token, ...rests } = updateData;
    // const token = localStorage.getItem("access_token");
    const res = ProductService.updateProduct(id, token, rests);
    return res;
  });

  const getAllProducts = async () => {
    const res = await ProductService.getAllProducts();
    return res;
  };

  const fetchAllTypeProduct = async () => {
    const res = await ProductService.getAllTypeProduct();
    //console.log(">>fetchAllTypeProduct: ", res.productData);
    return res?.productData;
  };

  // Lấy thông tin sp chi tiết
  const fetchGetDetailsProduct = async (rowSelected) => {
    const res = await ProductService.getProductById(rowSelected);
    console.log("res data: ", res?.productData);

    if (res?.productData) {
      setStateProductDetails({
        name: res?.productData.name,
        type: res?.productData.type,
        price: res?.productData.price,
        countInStock: res?.productData.countInStock,
        description: res?.productData.description,
        image: res?.productData.image,
        rating: res?.productData.rating,
        discount: res?.productData.discount,
      });
    }
    setIsPendingUpdate(false);
  };

  useEffect(() => {
    updateForm.setFieldsValue(stateProductDetails);
  }, [updateForm, stateProductDetails]);

  useEffect(() => {
    if (rowSelected) {
      fetchGetDetailsProduct(rowSelected);
    }
  }, [rowSelected]);

  //console.log(">>State product detail: ", stateProductDetails);
  const { data, isPending, isError, error } = mutation;
  const {
    data: dataUpdated,
    isPending: isPendingUpdated,
    isError: isErrorUpdated,
    error: errorUpdated,
  } = mutationUpdate;

  // const mutationDelete = useMutationHook(({ id, token }) =>
  //   ProductService.deleteProduct(id, token)
  // );
  const mutationDelete = useMutationHook(({ id, token }) => {
    return ProductService.deleteProduct(id, token);
  });

  const mutationDeleteMany = useMutationHook(({ token, ...ids }) => {
    return ProductService.deleteManyProducts(token, ids);
  });

  //console.log("accessToken in FE:", user?.accessToken);

  //console.log("mutationDeleteMany: ", mutationDeleteMany);

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
  //console.log("Data deleted: ", dataDeleted);
  //console.log("Data delete many: ", dataDeletedMany);

  const handleDetailsProduct = (productId) => {
    setRowSelected(productId); // Cập nhật rowSelected
    setIsPendingUpdate(true);
    fetchGetDetailsProduct(productId);
    setIsOpenDrawer(true);
  };

  const renderAction = (text, record) => {
    return (
      <div>
        <DeleteOutlined
          className="text-3xl text-red-500 cursor-pointer hover:opacity-70"
          onClick={() => onDeleteProduct(record._id)}
        />
        <EditOutlined
          className="text-3xl text-red-500 cursor-pointer hover:opacity-70"
          onClick={() => handleDetailsProduct(record._id)}
        />
      </div>
    );
  };

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => {
    setOpenModal(false);
  };

  const queryProduct = useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });

  const typeProduct = useQuery({
    queryKey: ["type-product"],
    queryFn: fetchAllTypeProduct,
  });

  //console.log("typeProduct: ", typeProduct);

  const { isPending: isPendingProduct, data: products } = queryProduct;

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
    // render: (text) =>
    //   searchedColumn === dataIndex ? (
    //     <Highlighter
    //       highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
    //       searchWords={[searchText]}
    //       autoEscape
    //       textToHighlight={text ? text.toString() : ""}
    //     />
    //   ) : (
    //     text
    //   ),
  });

  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.name.length - b.name.length,
      ...getColumnSearchProps("name"),
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      sorter: (a, b) => a.price - b.price,
      filters: [
        {
          text: ">= 10000000",
          value: ">=",
        },
        {
          text: "<= 10000000",
          value: "<=",
        },
      ],
      onFilter: (value, record) => {
        console.log(">>Value: ", { value, record });
        if (value === ">=") {
          return record.price >= 10000000;
        } else {
          return record.price <= 10000000;
        }
      },
    },
    {
      title: "Danh mục",
      dataIndex: "type",
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      sorter: (a, b) => a.rating - b.rating,
      filters: [
        {
          text: ">= 3",
          value: ">=",
        },
        {
          text: "<= 3",
          value: "<=",
        },
      ],
      onFilter: (value, record) => {
        console.log(">>Value: ", { value, record });
        if (value === ">=") {
          return record.rating >= 3;
        } else {
          return record.rating <= 3;
        }
      },
    },
    {
      title: "Tác vụ",
      dataIndex: "action",
      render: renderAction,
    },
  ];
  const dataTable = Array.isArray(products?.data)
    ? products.data.map((product) => ({
        ...product,
        key: product._id,
      }))
    : [];

  // Add product action
  const onFinish = (values) => {
    const productData = {
      name: values.productName, // map đúng key
      type: values.type,
      price: Number(values.price),
      countInStock: Number(values.countInStock),
      rating: Number(values.rating),
      discount: Number(values.discount),
      description: values.description,
      image: stateProduct.image,
    };
    mutation.mutate(
      { data: productData },
      {
        onSuccess: (data) => {
          Swal.fire({
            icon: "success",
            title: data?.message,
            text: "Đã thêm sản phẩm mới!",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff393b",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: true,
            allowOutsideClick: false,
          }).then(() => {
            addForm.resetFields();
            setStateProduct({
              productName: "",
              type: "",
              price: "",
              countInStock: "",
              description: "",
              image: "",
              rating: "",
              discount: "",
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

  // Update product action
  const onUpdateProduct = () => {
    mutationUpdate.mutate(
      {
        id: rowSelected,
        token: user?.accessToken,
        ...stateProductDetails,
      },
      {
        onSettled: () => {
          queryProduct.refetch();
        },
        onSuccess: (data) => {
          Swal.fire({
            icon: "success",
            title: data?.message || "Cập nhật thành công",
            text: "Thông tin sản phẩm đã được cập nhật!",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff393b",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: true,
            allowOutsideClick: false,
          }).then(() => {
            setIsOpenDrawer(false);
            queryClient.invalidateQueries(["products"]);
          });
        },
        onError: (error) => {
          Swal.fire({
            icon: "error",
            title: error.response?.data?.message || "Cập nhật thất bại",
            text: "Đã xảy ra lỗi khi cập nhật sản phẩm",
            confirmButtonColor: "#ff393b",
          });
        },
      }
    );
  };

  // Delete product action
  const onDeleteProduct = (productId) => {
    Swal.fire({
      title: "Bạn có chắc muốn xóa sản phẩm này?",
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
            id: productId,
            token: user?.accessToken,
          },
          {
            onSuccess: (data) => {
              Swal.fire({
                icon: "success",
                title: "Đã xóa!",
                text: data?.message || "Sản phẩm đã được xóa thành công!",
                timer: 2000,
                timerProgressBar: true,
                confirmButtonColor: "#ff393b",
              });
              queryProduct.refetch();
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
  const onDeleteManyProduct = (ids) => {
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
            text: data?.message || "Sản phẩm đã được xóa thành công!",
            timer: 2000,
            timerProgressBar: true,
            confirmButtonColor: "#ff393b",
          });
          queryProduct.refetch();
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
    setStateProduct({
      ...stateProduct,
      [name]: value,
    });
  };

  const handleOnChangeDetails = (e) => {
    const { name, value } = e.target;
    setStateProductDetails({
      ...stateProductDetails,
      [name]: value,
    });
  };
  const handleChangeAvatar = async ({ fileList }) => {
    const file = fileList[0];
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setStateProduct({
      ...stateProduct,
      image: file.preview,
    });
  };

  const handleChangeAvatarDetails = async ({ fileList }) => {
    const file = fileList[0];
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setStateProductDetails({
      ...stateProductDetails,
      image: file.preview,
    });
  };

  const handleChangeSelect = (value) => {
    setTypeSelect(value);
    if (value !== "add_type") {
      setStateProduct({
        ...stateProduct,
        type: value,
      });
    } else {
      setTypeSelect(value);
    }
  };

  return (
    <header>
      <h1 className="text-black text-[14px]">Quản lý sản phẩm</h1>
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
          handleDeleteMany={onDeleteManyProduct}
          columns={columns}
          isPending={isPendingProduct}
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

      {/* Thêm sản phẩm */}
      <ModalComponent
        title="Thêm mới sản phẩm"
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
              label="Tên sản phẩm"
              name="productName"
              rules={[{ required: true, message: "Nhập tên sản phẩm!" }]}
            >
              <Input
                name="productName"
                value={stateProduct.productName}
                onChange={handleOnChange}
              />
            </Form.Item>

            <Form.Item
              label="Danh mục"
              name="type"
              rules={[{ required: true, message: "Nhập danh mục sản phẩm!" }]}
            >
              <Select
                name="type"
                value={stateProduct.type}
                onChange={handleChangeSelect}
                options={renderOptions(typeProduct?.data)}
              />
              {typeSelect === "add_type" && (
                <Input
                  name="type"
                  value={stateProduct.type}
                  onChange={handleOnChange}
                />
              )}
            </Form.Item>

            <Form.Item
              label="Giá tiền"
              name="price"
              rules={[{ required: true, message: "Nhập giá tiền!" }]}
            >
              <Input
                name="price"
                value={stateProduct.price}
                onChange={handleOnChange}
              />
            </Form.Item>

            <Form.Item
              label="Mô tả"
              name="description"
              rules={[{ required: true, message: "Nhập mô tả sản phẩm!" }]}
            >
              <Input
                name="description"
                value={stateProduct.description}
                onChange={handleOnChange}
              />
            </Form.Item>

            <Form.Item
              label="Lượng tồn kho"
              name="countInStock"
              rules={[
                { required: true, message: "Nhập lượng tồn kho sản phẩm!" },
              ]}
            >
              <Input
                name="countInStock"
                value={stateProduct.countInStock}
                onChange={handleOnChange}
              />
            </Form.Item>

            <Form.Item label="Đánh giá" name="rating">
              <Input
                name="rating"
                value={stateProduct.rating}
                onChange={handleOnChange}
              />
            </Form.Item>

            <Form.Item label="Giảm giá" name="discount">
              <Input
                name="discount"
                value={stateProduct.discount}
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

                {stateProduct?.image && (
                  <img
                    className="h-[60px] w-[60px] ml-[10px] rounded-lg object-cover"
                    src={stateProduct?.image}
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
        title="Chi tiết sản phẩm"
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
            onFinish={onUpdateProduct}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label="Tên sản phẩm"
              name="name"
              rules={[{ required: true, message: "Nhập tên sản phẩm!" }]}
            >
              <Input
                name="name"
                value={stateProductDetails.name}
                onChange={handleOnChangeDetails}
              />
            </Form.Item>

            <Form.Item
              label="Danh mục"
              name="type"
              rules={[{ required: true, message: "Nhập danh mục sản phẩm!" }]}
            >
              <Input
                name="type"
                value={stateProductDetails.type}
                onChange={handleOnChangeDetails}
              />
            </Form.Item>

            <Form.Item
              label="Giá tiền"
              name="price"
              rules={[{ required: true, message: "Nhập giá tiền!" }]}
            >
              <Input
                name="price"
                value={stateProductDetails.price}
                onChange={handleOnChangeDetails}
              />
            </Form.Item>

            <Form.Item
              label="Mô tả"
              name="description"
              rules={[{ required: true, message: "Nhập mô tả sản phẩm!" }]}
            >
              <Input
                name="description"
                value={stateProductDetails.description}
                onChange={handleOnChangeDetails}
              />
            </Form.Item>

            <Form.Item
              label="Lượng tồn kho"
              name="countInStock"
              rules={[
                { required: true, message: "Nhập lượng tồn kho sản phẩm!" },
              ]}
            >
              <Input
                name="countInStock"
                value={stateProductDetails.countInStock}
                onChange={handleOnChangeDetails}
              />
            </Form.Item>

            <Form.Item label="Đánh giá" name="rating">
              <Input
                name="rating"
                value={stateProductDetails.rating}
                onChange={handleOnChangeDetails}
              />
            </Form.Item>

            <Form.Item label="Giảm giá" name="discount">
              <Input
                name="discount"
                value={stateProductDetails.discount}
                onChange={handleOnChangeDetails}
              />
            </Form.Item>

            <Form.Item label="Avatar" name="image">
              <div className="flex items-center gap-4">
                <Upload
                  showUploadList={false}
                  onChange={handleChangeAvatarDetails}
                  maxCount={1}
                >
                  <Button>Chọn tệp</Button>
                </Upload>

                {stateProductDetails?.image && (
                  <img
                    className="h-[60px] w-[60px] ml-[10px] rounded-lg object-cover"
                    src={stateProductDetails?.image}
                    alt="Product img"
                  />
                )}
              </div>
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

export default AdminProduct;
