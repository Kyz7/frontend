const ModalConfirm = ({ message, onConfirm, onCancel }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded shadow-lg w-80">
          <p className="mb-4">{message}</p>
          <div className="flex justify-end space-x-4">
            <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">Batal</button>
            <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded">Hapus</button>
          </div>
        </div>
      </div>
    );
  };
  
  export default ModalConfirm;