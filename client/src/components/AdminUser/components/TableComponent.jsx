import React, { useRef, useState } from "react";
import { Table, Button } from "antd";
import Loading from "~/components/Loading";
import { DownloadTableExcel } from "react-export-table-to-excel";

const TableComponent = ({
  selectionType = "checkbox",
  data = [],
  isPending = false,
  columns = [],
  handleDeleteMany,
}) => {
  const [rowSelectedKey, setRowSelectedKey] = useState([]);
  const tableRef = useRef(null);

  // rowSelection object indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setRowSelectedKey(selectedRowKeys);
    },
  };

  const handleDeleteAll = () => {
    handleDeleteMany(rowSelectedKey);
  };

  return (
    <Loading isPending={isPending}>
      {rowSelectedKey.length > 0 && (
        <div
          style={{
            background: "#1d1ddd",
            color: "#fff",
            fontWeight: "bold",
            padding: "10px",
            cursor: "pointer",
          }}
          onClick={handleDeleteAll}
        >
          Xóa tất cả
        </div>
      )}

      {/* Nút xuất Excel */}
      <DownloadTableExcel
        filename="users-table"
        sheet="users"
        currentTableRef={tableRef.current}
      >
        <Button type="primary" style={{ marginBottom: "10px" }}>
          Xuất file Excel
        </Button>
      </DownloadTableExcel>

      {/* Bọc Table bằng ref để xuất Excel */}
      <div ref={tableRef}>
        <Table
          rowSelection={Object.assign({ type: selectionType }, rowSelection)}
          columns={columns}
          dataSource={data}
          pagination={false}
        />
      </div>
    </Loading>
  );
};

export default TableComponent;
