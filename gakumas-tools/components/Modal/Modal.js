import { memo, useContext } from "react";
import { FaXmark } from "react-icons/fa6";
import ModalContext from "@/contexts/ModalContext";
import styles from "./Modal.module.scss";

function Modal({ children, closable = true }) {
  const { closeModal } = useContext(ModalContext);

  return (
    <div className={styles.overlay} onClick={closable ? closeModal : undefined}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {closable && 
          <button className={styles.close} onClick={closeModal}>
            <FaXmark />
          </button>
        }
        {children}
      </div>
    </div>
  );
}

export default memo(Modal);
