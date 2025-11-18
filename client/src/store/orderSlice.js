import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orderItems: [],
  orderItemsSelected: [],
  shippingAddress: {},
  paymentMethod: "",
  itemsPrice: 0,
  shippingPrice: 0,
  taxPrice: 0,
  totalPrice: 0,
  user: "",
  isPaid: false,
  paidAt: "",
  isDelivered: false,
  deliveredAt: "",
  isErrorOrder: false,
  isSuccessOrder: false,
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    addOrderProduct: (state, action) => {
      const { orderItem } = action.payload;
      const itemOrder = state?.orderItems?.find(
        (item) => item?.product === orderItem.product
      );
      if (itemOrder) {
        // số lg đặt hàng <= tồn kho => Vẫn đh đc
        if (itemOrder.amount <= itemOrder.countInStock) {
          itemOrder.amount += orderItem.amount;
          state.isSuccessOrder = true;
          state.isErrorOrder = false;
        }
      } else {
        state.orderItems.push(orderItem);
        state.isSuccessOrder = true;
        state.isErrorOrder = false;
      }
    },
    increaseAmount: (state, action) => {
      const { idPro } = action.payload;
      const itemOrder = state?.orderItems?.find(
        (item) => item?.product === idPro
      );
      const itemOrderSelected = state?.orderItemsSelected?.find(
        (item) => item?.product === idPro
      );
      itemOrder.amount++;
      if (itemOrderSelected) {
        itemOrderSelected.amount++;
      }
    },
    decreaseAmount: (state, action) => {
      const { idPro } = action.payload;
      const itemOrder = state?.orderItems?.find(
        (item) => item?.product === idPro
      );
      const itemOrderSelected = state?.orderItemsSelected?.find(
        (item) => item?.product === idPro
      );
      itemOrder.amount--;
      if (itemOrderSelected) {
        itemOrderSelected.amount--;
      }
    },
    removeOrderProduct: (state, action) => {
      const { idPro } = action.payload;
      const itemOrder = state?.orderItems?.filter(
        (item) => item.product !== idPro
      );
      const itemOrderSelected = state?.orderItemsSelected?.filter(
        (item) => item?.product !== idPro
      );
      state.orderItems = itemOrder;
      state.orderItemsSelected = itemOrderSelected;
    },
    removeAllOrderProduct: (state, action) => {
      const { listChecked } = action.payload;
      const itemOrders = state?.orderItems?.filter(
        (item) => !listChecked.includes(item?.product)
      );
      const itemOrderSelected = state?.orderItemsSelected?.filter(
        (item) => !listChecked.includes(item?.product)
      );
      state.orderItems = itemOrders;
      state.orderItems = itemOrderSelected;
    },
    selectedOrder: (state, action) => {
      const { listChecked } = action.payload;
      const orderSelected = [];
      state.orderItems.forEach((item) => {
        if (listChecked.includes(item?.product)) {
          orderSelected.push(item);
        }
      });
      state.orderItemsSelected = orderSelected;
    },
    resetOrder: (state) => {
      state.isSuccessOrder = false;
    },
    clearOrder: (state) => {
      state.orderItems = [];
      state.orderItemsSelected = [];
      state.shippingAddress = {};
      state.paymentMethod = "";
      state.itemsPrice = 0;
      state.shippingPrice = 0;
      state.taxPrice = 0;
      state.totalPrice = 0;
      state.user = "";
      state.isPaid = false;
      state.paidAt = "";
      state.isDelivered = false;
      state.deliveredAt = "";
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  addOrderProduct,
  removeOrderProduct,
  removeAllOrderProduct,
  increaseAmount,
  decreaseAmount,
  selectedOrder,
  clearOrder,
  resetOrder,
} = orderSlice.actions;

export default orderSlice.reducer;
