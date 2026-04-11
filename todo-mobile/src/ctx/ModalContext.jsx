import React, { createContext, useState } from 'react';

export const ModalContext = createContext();

export function ModalContextProvider({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('task');
  const [modalData, setModalData] = useState(null);

  const openModal = (type = 'task', data = null) => {
    setModalType(type);
    setModalData(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const value = { isModalOpen, modalType, modalData, openModal, closeModal };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}
